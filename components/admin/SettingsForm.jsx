'use client';

import { useState } from 'react';
import { supabase } from '@/lib/supabaseClient';
import AdminCard from './AdminCard';
import ImageUploadField from './ImageUploadField';
import { SettingsIcon, SaveIcon } from './icons';

const inputClass =
  'w-full rounded-[10px] border border-aline bg-[#FCFAF6] px-3.5 py-3 text-[0.93rem] text-aink outline-none transition focus:border-atl2 focus:ring-[3px] focus:ring-atl2/10';
const labelClass = 'mb-1.5 block text-[0.85rem] font-semibold text-aink';

export default function SettingsForm({ settings }) {
  const [form, setForm] = useState({
    id: settings?.id,
    site_name: settings?.site_name || '',
    logo_url: settings?.logo_url || '',
    main_heading: settings?.main_heading || '',
    sub_heading: settings?.sub_heading || '',
    hero_slide_speed: settings?.hero_slide_speed || '1x',
    scrolling_news: settings?.scrolling_news || '',
    stats_jobs_boost: settings?.stats_jobs_boost ?? 0,
    stats_notes_boost: settings?.stats_notes_boost ?? 0,
    stats_scholarships_boost: settings?.stats_scholarships_boost ?? 0,
    stats_results_boost: settings?.stats_results_boost ?? 0,
  });
  const [saving, setSaving] = useState(false);
  const [logoUploading, setLogoUploading] = useState(false);
  const [message, setMessage] = useState('');

  function update(field, value) {
    setForm((f) => ({ ...f, [field]: value }));
  }

  async function handleSave(e) {
    e.preventDefault();
    if (logoUploading) {
      setMessage('Error: Logo is still uploading — please wait for it to finish, then Save.');
      return;
    }
    setSaving(true);
    setMessage('');

    const payload = { ...form, updated_at: new Date().toISOString() };

    // Re-check for an existing row right before saving, instead of trusting
    // whatever id this form happened to load with. This is what actually
    // prevents the "settings reset after refresh" bug: if a stray extra row
    // ever ends up in this single-row config table, saves would keep
    // inserting yet another row instead of updating the one real row, and a
    // later page load could pick a different (older) row than the one just
    // saved. Always resolving the current row's id here keeps every save
    // hitting the same, single row.
    let targetId = form.id;
    if (!targetId) {
      const { data: existing } = await supabase
        .from('site_settings')
        .select('id')
        .order('updated_at', { ascending: false, nullsFirst: false })
        .limit(1)
        .maybeSingle();
      targetId = existing?.id;
    }

    // .select() confirms the row was actually written. Without it, an update
    // blocked by RLS (e.g. an expired admin session) still reports success
    // with 0 rows touched, showing "Saved successfully" even though nothing
    // changed in the database.
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
    if (!form.id && data[0]?.id) update('id', data[0].id);
    setMessage('Saved successfully.');
  }

  return (
    <AdminCard
      title="Website Settings"
      description="Controls the header, hero banner, and news ticker on the home page."
      icon={SettingsIcon}
    >
      <form onSubmit={handleSave} className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <label className="block">
          <span className={labelClass}>Website Name</span>
          <input value={form.site_name} onChange={(e) => update('site_name', e.target.value)} className={inputClass} />
        </label>

        <ImageUploadField
          folder="logo"
          label="Logo"
          shape="circle"
          previewSize={72}
          imageUrl={form.logo_url}
          onUploaded={(url) => update('logo_url', url)}
          onError={(msg) => setMessage(`Error: ${msg}`)}
          onUploadingChange={setLogoUploading}
        />

        <label className="block sm:col-span-2">
          <span className={labelClass}>Main Heading</span>
          <input
            value={form.main_heading}
            onChange={(e) => update('main_heading', e.target.value)}
            className={inputClass}
          />
        </label>

        <label className="block sm:col-span-2">
          <span className={labelClass}>Sub-Heading</span>
          <input
            value={form.sub_heading}
            onChange={(e) => update('sub_heading', e.target.value)}
            className={inputClass}
          />
        </label>

        <label className="block">
          <span className={labelClass}>Hero Slide Speed</span>
          <select
            value={form.hero_slide_speed}
            onChange={(e) => update('hero_slide_speed', e.target.value)}
            className={inputClass}
          >
            <option value="-3x">-3x (Slowest)</option>
            <option value="-2x">-2x (Slower)</option>
            <option value="1x">1x (Normal)</option>
            <option value="2x">2x (Fast)</option>
            <option value="3x">3x (Faster)</option>
            <option value="4x">4x (Fastest)</option>
          </select>
        </label>

        <label className="block sm:col-span-2">
          <span className={labelClass}>Scrolling News</span>
          <textarea
            value={form.scrolling_news}
            onChange={(e) => update('scrolling_news', e.target.value)}
            rows={2}
            className={inputClass}
          />
        </label>

        <div className="sm:col-span-2">
          <p className={labelClass}>Homepage Stats — Boost Numbers</p>
          <p className="mb-3 -mt-1 text-xs text-amuted">
            Each stat on the homepage shows your real live count plus this boost, e.g. 9 live jobs + 40 boost = "49+
            Jobs Posted". A category still at 0 after the boost is hidden automatically instead of showing "0".
          </p>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            <label className="block">
              <span className="mb-1 block text-xs text-amuted">Jobs Posted</span>
              <input
                type="number"
                min="0"
                value={form.stats_jobs_boost}
                onChange={(e) => update('stats_jobs_boost', Math.max(0, parseInt(e.target.value, 10) || 0))}
                className={inputClass}
              />
            </label>
            <label className="block">
              <span className="mb-1 block text-xs text-amuted">Notes & Papers</span>
              <input
                type="number"
                min="0"
                value={form.stats_notes_boost}
                onChange={(e) => update('stats_notes_boost', Math.max(0, parseInt(e.target.value, 10) || 0))}
                className={inputClass}
              />
            </label>
            <label className="block">
              <span className="mb-1 block text-xs text-amuted">Scholarships</span>
              <input
                type="number"
                min="0"
                value={form.stats_scholarships_boost}
                onChange={(e) => update('stats_scholarships_boost', Math.max(0, parseInt(e.target.value, 10) || 0))}
                className={inputClass}
              />
            </label>
            <label className="block">
              <span className="mb-1 block text-xs text-amuted">Results</span>
              <input
                type="number"
                min="0"
                value={form.stats_results_boost}
                onChange={(e) => update('stats_results_boost', Math.max(0, parseInt(e.target.value, 10) || 0))}
                className={inputClass}
              />
            </label>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-3 sm:col-span-2">
          <button
            type="submit"
            disabled={saving || logoUploading}
            className="inline-flex items-center gap-2 rounded-full px-6 py-2.5 text-sm font-semibold text-white shadow-[0_6px_18px_-6px_rgba(30,132,73,0.5)] transition hover:-translate-y-0.5 disabled:opacity-60"
            style={{ background: 'linear-gradient(135deg, #1E8449, #2E5AAC)' }}
          >
            <SaveIcon className="h-4 w-4" />
            {saving ? 'Saving...' : logoUploading ? 'Uploading logo...' : 'Save Settings'}
          </button>
          {message && (
            <span className={`text-sm ${message.startsWith('Error') ? 'text-red-600' : 'text-brand-600'}`}>
              {message}
            </span>
          )}
        </div>
      </form>
    </AdminCard>
  );
}
