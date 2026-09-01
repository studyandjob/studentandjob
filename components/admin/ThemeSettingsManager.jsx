'use client';

import { useState } from 'react';
import AdminCard from './AdminCard';
import { useTheme } from '@/contexts/ThemeContext';
import { PaletteIcon, SaveIcon } from './icons';

// Small labeled color chip used inside each theme card to preview a role
// (Primary / Accent / Background / Text) from that theme's palette.
function Swatch({ label, hex }) {
  return (
    <div className="flex flex-1 flex-col items-center gap-1.5">
      <div
        className="h-9 w-full rounded-lg border border-black/10 shadow-inner"
        style={{ backgroundColor: hex }}
        title={hex}
      />
      <span className="text-xs font-medium text-amuted">{label}</span>
      <span className="font-mono text-xs text-amuted/80">{hex}</span>
    </div>
  );
}

function ThemeCard({ theme, isActive, isServerSaved, onApply }) {
  return (
    <div
      className={`flex flex-col gap-4 rounded-[14px] border-2 bg-white p-4 transition ${
        isActive ? 'border-atl2 shadow-[0_0_0_3px_rgba(30,122,115,0.12)]' : 'border-aline hover:border-atl2/40'
      }`}
    >
      <div className="flex items-start justify-between gap-2">
        <div>
          <p className="font-serif text-[0.98rem] font-bold text-aink">{theme.name}</p>
          {theme.isDefault && <p className="text-xs text-amuted">Default theme</p>}
        </div>
        {isActive && (
          <span className="flex-shrink-0 rounded-full bg-atl2/15 px-2.5 py-1 text-xs font-bold tracking-wide text-atl2">
            [ ACTIVE ]
          </span>
        )}
      </div>

      <div className="flex gap-2">
        <Swatch label="Primary" hex={theme.primary} />
        <Swatch label={theme.secondaryLabel} hex={theme.accent} />
        <Swatch label="Background" hex={theme.background} />
        <Swatch label="Text" hex={theme.text} />
      </div>

      <button
        type="button"
        onClick={() => onApply(theme.id)}
        disabled={isActive}
        className={`w-full rounded-[10px] px-4 py-2.5 text-sm font-semibold transition ${
          isActive
            ? 'cursor-default bg-atl2/10 text-atl2'
            : 'bg-atl text-white hover:bg-atl2'
        }`}
      >
        {isActive ? 'Currently Applied' : '[ Apply This Theme ]'}
      </button>

      {isServerSaved && (
        <p className="-mt-2 text-center text-xs text-amuted">Live site-wide default</p>
      )}
    </div>
  );
}

export default function ThemeSettingsManager() {
  const { themes, activeThemeId, savedThemeId, applyTheme, saveThemeToServer, saving } = useTheme();
  const [message, setMessage] = useState('');

  async function handleSavePreferences() {
    setMessage('');
    const result = await saveThemeToServer(activeThemeId);
    setMessage(
      result.ok
        ? 'Saved — this theme is now the site-wide default for every visitor.'
        : `Error: ${result.error}`
    );
  }

  return (
    <AdminCard
      title="Theme Settings / Appearance"
      description="Pick a color theme for the public website. Applying a theme previews it instantly in this browser; Save Theme Preferences makes it the default for every visitor."
      icon={PaletteIcon}
    >
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {themes.map((theme) => (
          <ThemeCard
            key={theme.id}
            theme={theme}
            isActive={theme.id === activeThemeId}
            isServerSaved={theme.id === savedThemeId}
            onApply={applyTheme}
          />
        ))}
      </div>

      <div className="mt-6 flex flex-wrap items-center gap-3 border-t border-aline pt-5">
        <button
          type="button"
          onClick={handleSavePreferences}
          disabled={saving}
          className="inline-flex items-center gap-2 rounded-full px-6 py-2.5 text-sm font-semibold text-white shadow-[0_6px_18px_-6px_rgba(30,132,73,0.5)] transition hover:-translate-y-0.5 disabled:opacity-60"
          style={{ background: 'linear-gradient(135deg, #1E8449, #2E5AAC)' }}
        >
          <SaveIcon className="h-4 w-4" />
          {saving ? 'Saving...' : '💾 Save Theme Preferences'}
        </button>
        {message && (
          <span className={`text-sm ${message.startsWith('Error') ? 'text-red-600' : 'text-atl2'}`}>{message}</span>
        )}
      </div>
    </AdminCard>
  );
}
