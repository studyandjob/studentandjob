'use client';

import { useState } from 'react';
import { supabase } from '@/lib/supabaseClient';
import AdminCard from './AdminCard';
import { SettingsIcon, SaveIcon } from './icons';
import { PAGE_DEFS, resolveVisibility } from '@/lib/pages';

const inputClass =
  'w-full rounded-[10px] border border-aline bg-[#FCFAF6] px-3.5 py-3 text-[0.93rem] text-aink outline-none transition focus:border-atl2 focus:ring-[3px] focus:ring-atl2/10';
const codeClass = `${inputClass} min-h-[110px] font-mono text-[0.8rem]`;
const labelClass = 'mb-1.5 block text-[0.85rem] font-semibold text-aink';
const hintClass = 'mt-1 text-xs text-amuted';

const CODE_FIELDS = [
  { field: 'ad_head_code', label: 'Site-wide ad script (loads once on every page)', hint: 'Example: the AdSense library <script> line, or auto-ads code. Paste it here once — not in the slots below.' },
  { field: 'ad_code_top', label: 'Job page — top ad', hint: 'Shown above the job details.' },
  { field: 'ad_code_middle', label: 'Job page — middle ad', hint: 'Shown inside the job details, before the buttons.' },
  { field: 'ad_code_bottom', label: 'Job page — bottom ad', hint: 'Shown below the job, above similar jobs.' },
  { field: 'ad_code_list', label: 'Home & Jobs list — ad', hint: 'Shown on the home page and above the jobs list.' },
];

export default function PagesAdsManager({ settings }) {
  const [visibility, setVisibility] = useState(() => resolveVisibility(settings));
  const [ads, setAds] = useState({
    ad_gate_enabled: Boolean(settings?.ad_gate_enabled),
    ad_gate_seconds: settings?.ad_gate_seconds ?? 5,
    ad_gate_max_per_session: settings?.ad_gate_max_per_session ?? 0,
    ad_gate_code: settings?.ad_gate_code || '',
    ad_head_code: settings?.ad_head_code || '',
    ad_code_top: settings?.ad_code_top || '',
    ad_code_middle: settings?.ad_code_middle || '',
    ad_code_bottom: settings?.ad_code_bottom || '',
    ad_code_list: settings?.ad_code_list || '',
    ads_txt: settings?.ads_txt || '',
  });
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');

  function setAd(field, value) {
    setAds((a) => ({ ...a, [field]: value }));
  }

  async function handleSave(e) {
    e.preventDefault();
    setSaving(true);
    setMessage('');

    // Only the switchable pages are stored; locked ones are always on.
    const stored = {};
    for (const def of PAGE_DEFS) if (!def.locked) stored[def.key] = Boolean(visibility[def.key]);

    const payload = {
      page_visibility: stored,
      ...ads,
      ad_gate_seconds: Math.max(0, Math.min(30, Number(ads.ad_gate_seconds) || 0)),
      ad_gate_max_per_session: Math.max(0, Number(ads.ad_gate_max_per_session) || 0),
      updated_at: new Date().toISOString(),
    };

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

    const { data, error } = targetId
      ? await supabase.from('site_settings').update(payload).eq('id', targetId).select()
      : await supabase.from('site_settings').insert(payload).select();

    setSaving(false);
    if (error) {
      setMessage(
        `Error: ${error.message}. If it mentions a missing column, run sql/add_pages_and_ads.sql in the Supabase SQL Editor first.`
      );
      return;
    }
    if (!data || data.length === 0) {
      setMessage('Error: Save did not go through — your admin session may have expired. Log out and back in, then try again.');
      return;
    }
    setMessage('Saved. The public site picks this up within about a minute.');
  }

  return (
    <form onSubmit={handleSave} className="flex flex-col gap-5">
      <AdminCard
        title="Show these pages to the public"
        description="Tick a page to show it on the website (menu, footer and sitemap). Unticked pages are hidden and visitors are sent to Jobs — nothing is deleted."
        icon={SettingsIcon}
      >
        <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2">
          {PAGE_DEFS.map((def) => (
            <label
              key={def.key}
              className={`flex items-center gap-3 rounded-[10px] border border-aline px-3.5 py-3 ${
                def.locked ? 'bg-[#F4F1EA]/60' : 'bg-white'
              }`}
            >
              <input
                type="checkbox"
                checked={Boolean(visibility[def.key])}
                disabled={def.locked}
                onChange={(e) => setVisibility((v) => ({ ...v, [def.key]: e.target.checked }))}
                className="h-4 w-4 accent-[#0F766E]"
              />
              <span className="text-sm font-semibold text-aink">{def.label}</span>
              {def.locked && <span className="ml-auto text-xs text-amuted">always on</span>}
            </label>
          ))}
        </div>
      </AdminCard>

      <AdminCard
        title="Ad before job details"
        description="When a visitor taps View Details, show an ad page first, then the job."
        icon={SettingsIcon}
      >
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <label className="flex items-center gap-3 sm:col-span-2">
            <input
              type="checkbox"
              checked={ads.ad_gate_enabled}
              onChange={(e) => setAd('ad_gate_enabled', e.target.checked)}
              className="h-4 w-4 accent-[#0F766E]"
            />
            <span className="text-sm font-semibold text-aink">Turn on the ad page before job details</span>
          </label>
          <label className="block">
            <span className={labelClass}>Wait time before “Continue” (seconds)</span>
            <input
              type="number"
              min="0"
              max="30"
              value={ads.ad_gate_seconds}
              onChange={(e) => setAd('ad_gate_seconds', e.target.value)}
              className={inputClass}
            />
          </label>
          <label className="block">
            <span className={labelClass}>Max ad pages per visitor per visit</span>
            <input
              type="number"
              min="0"
              value={ads.ad_gate_max_per_session}
              onChange={(e) => setAd('ad_gate_max_per_session', e.target.value)}
              className={inputClass}
            />
            <p className={hintClass}>0 = on every job click. A limit like 3 keeps visitors happier.</p>
          </label>
          <label className="block sm:col-span-2">
            <span className={labelClass}>Ad code for the ad page</span>
            <textarea
              value={ads.ad_gate_code}
              onChange={(e) => setAd('ad_gate_code', e.target.value)}
              className={codeClass}
              placeholder="Paste the banner / native ad code from your ad network"
            />
            <p className={hintClass}>The gate only works when this box has code in it.</p>
          </label>
        </div>
      </AdminCard>

      <AdminCard
        title="Ads inside pages"
        description="Paste the code your ad network gives you. A slot with no code shows nothing."
        icon={SettingsIcon}
      >
        <div className="flex flex-col gap-4">
          {CODE_FIELDS.map(({ field, label, hint }) => (
            <label key={field} className="block">
              <span className={labelClass}>{label}</span>
              <textarea value={ads[field]} onChange={(e) => setAd(field, e.target.value)} className={codeClass} />
              <p className={hintClass}>{hint}</p>
            </label>
          ))}
          <label className="block">
            <span className={labelClass}>ads.txt (served at /ads.txt)</span>
            <textarea
              value={ads.ads_txt}
              onChange={(e) => setAd('ads_txt', e.target.value)}
              className={codeClass}
              placeholder="google.com, pub-0000000000000000, DIRECT, f08c47fec0942fa0"
            />
            <p className={hintClass}>Your ad network shows you the exact line(s) to paste here.</p>
          </label>
        </div>
      </AdminCard>

      <div className="flex items-center gap-3">
        <button
          type="submit"
          disabled={saving}
          className="inline-flex items-center gap-2 rounded-[10px] bg-atl px-5 py-3 text-sm font-bold text-white transition hover:opacity-90 disabled:opacity-60"
        >
          <SaveIcon className="h-4 w-4" />
          {saving ? 'Saving…' : 'Save changes'}
        </button>
        {message && (
          <p className={`text-sm ${message.startsWith('Error') ? 'text-red-600' : 'text-emerald-700'}`}>{message}</p>
        )}
      </div>
    </form>
  );
}
