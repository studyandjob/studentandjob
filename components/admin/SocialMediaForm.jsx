'use client';

import { useState } from 'react';
import { supabase } from '@/lib/supabaseClient';
import AdminCard from './AdminCard';
import { Share2Icon, SaveIcon } from './icons';
import {
  FacebookIcon3D,
  WhatsappIcon3D,
  InstagramIcon3D,
  YoutubeIcon3D,
  TiktokIcon3D,
  XIcon3D,
  LinkedinIcon3D,
} from '../Icons3D';

const inputClass =
  'w-full rounded-[10px] border border-aline bg-[#FCFAF6] px-3.5 py-3 text-[0.93rem] text-aink outline-none transition focus:border-atl2 focus:ring-[3px] focus:ring-atl2/10';
const labelClass = 'mb-1.5 flex items-center gap-2 text-[0.85rem] font-semibold text-aink';

// One row per platform. `icon` is the 3D badge shown on the public footer;
// `field` is the site_settings column it saves to (see sql/add_social_media.sql).
const PLATFORMS = [
  { field: 'facebook_url', label: 'Facebook Page', icon: FacebookIcon3D, placeholder: 'https://facebook.com/yourpage' },
  { field: 'whatsapp_channel_url', label: 'WhatsApp Channel / Group', icon: WhatsappIcon3D, placeholder: 'https://wa.me/... or chat.whatsapp.com/...' },
  { field: 'instagram_url', label: 'Instagram', icon: InstagramIcon3D, placeholder: 'https://instagram.com/yourpage' },
  { field: 'youtube_url', label: 'YouTube', icon: YoutubeIcon3D, placeholder: 'https://youtube.com/@yourchannel' },
  { field: 'tiktok_url', label: 'TikTok', icon: TiktokIcon3D, placeholder: 'https://tiktok.com/@yourpage' },
  { field: 'twitter_url', label: 'X (Twitter)', icon: XIcon3D, placeholder: 'https://x.com/yourpage' },
  { field: 'linkedin_url', label: 'LinkedIn', icon: LinkedinIcon3D, placeholder: 'https://linkedin.com/company/yourpage' },
];

export default function SocialMediaForm({ settings }) {
  const [form, setForm] = useState(() => {
    const initial = { id: settings?.id };
    PLATFORMS.forEach((p) => {
      initial[p.field] = settings?.[p.field] || '';
    });
    return initial;
  });
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');

  function update(field, value) {
    setForm((f) => ({ ...f, [field]: value }));
  }

  async function handleSave(e) {
    e.preventDefault();
    setSaving(true);
    setMessage('');

    const payload = { ...form, updated_at: new Date().toISOString() };

    // Same "resolve the real single row right before saving" approach as
    // SettingsForm — site_settings is a single-row config table.
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
      title="Social Media Links"
      description="Add your page/channel links. Any link left blank simply won't show its icon on the public site footer."
      icon={Share2Icon}
    >
      <form onSubmit={handleSave} className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        {PLATFORMS.map(({ field, label, icon: PlatformIcon, placeholder }) => (
          <label key={field} className="block">
            <span className={labelClass}>
              <PlatformIcon className="h-6 w-6 flex-shrink-0" />
              {label}
            </span>
            <input
              type="url"
              value={form[field]}
              onChange={(e) => update(field, e.target.value)}
              placeholder={placeholder}
              className={inputClass}
            />
          </label>
        ))}

        <div className="flex flex-wrap items-center gap-3 sm:col-span-2">
          <button
            type="submit"
            disabled={saving}
            className="inline-flex items-center gap-2 rounded-full px-6 py-2.5 text-sm font-semibold text-white shadow-[0_6px_18px_-6px_rgba(242,120,92,0.5)] transition hover:-translate-y-0.5 disabled:opacity-60"
            style={{ background: 'linear-gradient(135deg, #E8A33D, #F2785C)' }}
          >
            <SaveIcon className="h-4 w-4" />
            {saving ? 'Saving...' : 'Save Social Links'}
          </button>
          {message && (
            <span className={`text-sm ${message.startsWith('Error') ? 'text-rose-600' : 'text-emerald-600'}`}>
              {message}
            </span>
          )}
        </div>
      </form>
    </AdminCard>
  );
}
