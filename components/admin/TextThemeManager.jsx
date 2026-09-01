'use client';

import { useState } from 'react';
import { supabase } from '@/lib/supabaseClient';
import AdminCard from './AdminCard';
import { PaletteIcon, SaveIcon } from './icons';
import { TEXT_THEMES } from '@/lib/textThemes';

function ThemeSwatch({ theme, isActive, onSelect }) {
  return (
    <button
      type="button"
      onClick={() => onSelect(theme.id)}
      className={`flex flex-col items-center gap-2 rounded-[14px] border-2 bg-white p-3.5 transition ${
        isActive ? 'border-atl2 shadow-[0_0_0_3px_rgba(30,122,115,0.12)]' : 'border-aline hover:border-atl2/40'
      }`}
    >
      <span
        className="flex h-11 w-11 items-center justify-center rounded-full border border-black/10 text-lg font-serif font-bold text-white"
        style={{ backgroundColor: theme.swatch }}
      >
        Aa
      </span>
      <span className="text-center text-[0.78rem] font-semibold text-aink">{theme.name}</span>
      {isActive && (
        <span className="rounded-full bg-atl2/15 px-2.5 py-0.5 text-xs font-bold tracking-wide text-atl2">
          ACTIVE
        </span>
      )}
    </button>
  );
}

export default function TextThemeManager({ settings }) {
  const [selectedId, setSelectedId] = useState(settings?.text_theme || 'black');
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');

  async function handleSave() {
    setSaving(true);
    setMessage('');

    let targetId = settings?.id;
    if (!targetId) {
      const { data: existing } = await supabase
        .from('site_settings')
        .select('id')
        .order('updated_at', { ascending: false, nullsFirst: false })
        .limit(1)
        .maybeSingle();
      targetId = existing?.id;
    }

    const payload = { text_theme: selectedId, updated_at: new Date().toISOString() };
    const { data, error } = targetId
      ? await supabase.from('site_settings').update(payload).eq('id', targetId).select()
      : await supabase.from('site_settings').insert(payload).select();

    setSaving(false);
    if (error) {
      setMessage(`Error: ${error.message}`);
      return;
    }
    if (!data || data.length === 0) {
      setMessage('Error: Save did not go through — your admin session may have expired. Please log out and back in, then try again.');
      return;
    }
    if (typeof window !== 'undefined') window.localStorage.setItem('psj-text-theme', selectedId);
    setMessage('Saved — this is now the text color every visitor sees on the public website.');
  }

  return (
    <AdminCard
      title="Text Theme"
      description="Choose the color for the site's general text and headings (buttons, badges, and the green/blue/red used for status stay the same in every theme). Pick a theme below, then Save."
      icon={PaletteIcon}
    >
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {TEXT_THEMES.map((theme) => (
          <ThemeSwatch key={theme.id} theme={theme} isActive={theme.id === selectedId} onSelect={setSelectedId} />
        ))}
      </div>

      <div className="mt-6 flex flex-wrap items-center gap-3 border-t border-aline pt-5">
        <button
          type="button"
          onClick={handleSave}
          disabled={saving}
          className="inline-flex items-center gap-2 rounded-full px-6 py-2.5 text-sm font-semibold text-white shadow-[0_6px_18px_-6px_rgba(30,132,73,0.5)] transition hover:-translate-y-0.5 disabled:opacity-60"
          style={{ background: 'linear-gradient(135deg, #1E8449, #2E5AAC)' }}
        >
          <SaveIcon className="h-4 w-4" />
          {saving ? 'Saving...' : 'Save Text Theme'}
        </button>
        {message && (
          <span className={`text-sm ${message.startsWith('Error') ? 'text-red-600' : 'text-brand-600'}`}>
            {message}
          </span>
        )}
      </div>
    </AdminCard>
  );
}
