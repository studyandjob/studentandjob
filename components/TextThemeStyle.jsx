'use client';

// Mounted once in the root layout (see app/layout.js). Applies the public
// site's active "text theme" (see lib/textThemes.js) as CSS variables on
// <html>, which tailwind.config.js's gray-400..900 scale reads via var().
//
// Two-layered, same pattern the old ThemeContext used:
//  - localStorage: instant on repeat visits, no flash of the wrong color.
//  - site_settings.text_theme (Supabase): the site-wide default every new
//    visitor gets, set by the admin in Site Settings → Text Theme.
import { useEffect } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { DEFAULT_TEXT_THEME_ID, getTextThemeById } from '@/lib/textThemes';

const STORAGE_KEY = 'psj-text-theme';

function applyTextTheme(themeId) {
  if (typeof document === 'undefined') return;
  const theme = getTextThemeById(themeId);
  const root = document.documentElement;
  Object.entries(theme.shades).forEach(([step, hex]) => root.style.setProperty(`--text-${step}`, hex));
  root.dataset.textTheme = theme.id;
}

export default function TextThemeStyle() {
  useEffect(() => {
    let cancelled = false;

    const stored = typeof window !== 'undefined' ? window.localStorage.getItem(STORAGE_KEY) : null;
    if (stored) applyTextTheme(stored);

    supabase
      .from('site_settings')
      .select('text_theme')
      .order('updated_at', { ascending: false, nullsFirst: false })
      .limit(1)
      .maybeSingle()
      .then(({ data }) => {
        if (cancelled) return;
        const serverThemeId = data?.text_theme || DEFAULT_TEXT_THEME_ID;
        applyTextTheme(serverThemeId);
        if (typeof window !== 'undefined') window.localStorage.setItem(STORAGE_KEY, serverThemeId);
      });

    return () => {
      cancelled = true;
    };
  }, []);

  return null;
}
