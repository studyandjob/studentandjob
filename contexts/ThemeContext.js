'use client';

// Global theme engine for the public site.
//
// How it works: each theme only defines 4 hex colors (primary, accent,
// background, text). On apply, we expand `primary`/`accent` into full
// 50-900 Tailwind-style shade ramps and write them as CSS custom properties
// on <html> (e.g. --brand-600, --accent-500). tailwind.config.js's `brand`
// and `accent` color scales resolve to `var(--brand-600, <fallback>)`, so
// every existing `bg-brand-600` / `text-accent-700` / `border-brand-900/10`
// class already used across the site picks up the new colors instantly —
// no component needs to change.
//
// Persistence is two-layered:
//  - localStorage: instant, per-browser, works even if Supabase is slow/down.
//  - site_settings.active_theme (Supabase): the site-wide default every
//    visitor gets, written only when the admin clicks "Save Theme
//    Preferences".

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { DEFAULT_THEME_ID, THEMES, buildAccentScale, buildShadeScale, getThemeById, hexToRgbTriplet } from '@/lib/themes';

const STORAGE_KEY = 'psj-active-theme';

const ThemeContext = createContext({
  activeThemeId: DEFAULT_THEME_ID,
  activeTheme: getThemeById(DEFAULT_THEME_ID),
  themes: THEMES,
  applyTheme: () => {},
  saveThemeToServer: async () => {},
  saving: false,
  savedThemeId: DEFAULT_THEME_ID,
});

function applyThemeVars(theme) {
  if (typeof document === 'undefined') return;
  const root = document.documentElement;
  const brandScale = buildShadeScale(theme.primary);
  const accentScale = buildAccentScale(theme.accent);

  Object.entries(brandScale).forEach(([step, hex]) => root.style.setProperty(`--brand-${step}`, hexToRgbTriplet(hex)));
  Object.entries(accentScale).forEach(([step, hex]) => root.style.setProperty(`--accent-${step}`, hexToRgbTriplet(hex)));
  root.style.setProperty('--color-bg', theme.background);
  root.style.setProperty('--color-text', theme.text);
  root.dataset.theme = theme.id;
}

export function ThemeProvider({ children }) {
  const [activeThemeId, setActiveThemeId] = useState(DEFAULT_THEME_ID);
  // The theme actually persisted in Supabase (site-wide default) — used by
  // the admin UI to know what "Save" would currently be overwriting / what
  // every other visitor is seeing.
  const [savedThemeId, setSavedThemeId] = useState(DEFAULT_THEME_ID);
  const [saving, setSaving] = useState(false);

  // Initial load: localStorage wins (instant, this browser's last choice);
  // otherwise fall back to whatever the admin last saved to Supabase.
  useEffect(() => {
    let cancelled = false;

    async function init() {
      const stored = typeof window !== 'undefined' ? window.localStorage.getItem(STORAGE_KEY) : null;
      if (stored) {
        const theme = getThemeById(stored);
        applyThemeVars(theme);
        setActiveThemeId(theme.id);
      }

      const { data } = await supabase
        .from('site_settings')
        .select('active_theme')
        .order('updated_at', { ascending: false, nullsFirst: false })
        .limit(1)
        .maybeSingle();

      if (cancelled) return;

      if (data?.active_theme) {
        setSavedThemeId(data.active_theme);
        if (!stored) {
          const theme = getThemeById(data.active_theme);
          applyThemeVars(theme);
          setActiveThemeId(theme.id);
        }
      } else if (!stored) {
        applyThemeVars(getThemeById(DEFAULT_THEME_ID));
      }
    }

    init();
    return () => {
      cancelled = true;
    };
  }, []);

  // Instantly applies a theme in this browser and remembers it locally.
  const applyTheme = useCallback((themeId) => {
    const theme = getThemeById(themeId);
    applyThemeVars(theme);
    setActiveThemeId(theme.id);
    if (typeof window !== 'undefined') {
      window.localStorage.setItem(STORAGE_KEY, theme.id);
    }
  }, []);

  // Persists the currently-applied theme to Supabase so it becomes the
  // site-wide default for every visitor (new visits with no localStorage
  // value yet will pick this up).
  const saveThemeToServer = useCallback(async (themeId) => {
    setSaving(true);
    try {
      const { data: existing } = await supabase
        .from('site_settings')
        .select('id')
        .order('updated_at', { ascending: false, nullsFirst: false })
        .limit(1)
        .maybeSingle();

      const payload = { active_theme: themeId, updated_at: new Date().toISOString() };

      const { error } = existing?.id
        ? await supabase.from('site_settings').update(payload).eq('id', existing.id)
        : await supabase.from('site_settings').insert(payload);

      if (error) throw error;
      setSavedThemeId(themeId);
      return { ok: true };
    } catch (err) {
      return { ok: false, error: err?.message || 'Could not save theme.' };
    } finally {
      setSaving(false);
    }
  }, []);

  const value = useMemo(
    () => ({
      activeThemeId,
      activeTheme: getThemeById(activeThemeId),
      themes: THEMES,
      applyTheme,
      saveThemeToServer,
      saving,
      savedThemeId,
    }),
    [activeThemeId, applyTheme, saveThemeToServer, saving, savedThemeId]
  );

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useTheme() {
  return useContext(ThemeContext);
}
