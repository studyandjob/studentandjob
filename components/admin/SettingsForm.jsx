'use client';

import { useState } from 'react';
import { supabase } from '@/lib/supabaseClient';
import AdminCard from './AdminCard';

export default function SettingsForm({ settings }) {
  const [form, setForm] = useState({
    id: settings?.id,
    site_name: settings?.site_name || '',
    logo_url: settings?.logo_url || '',
    main_heading: settings?.main_heading || '',
    sub_heading: settings?.sub_heading || '',
    scrolling_news: settings?.scrolling_news || '',
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

    const { error } = form.id
      ? await supabase.from('site_settings').update(payload).eq('id', form.id)
      : await supabase.from('site_settings').insert(payload);

    setSaving(false);
    setMessage(error ? `Error: ${error.message}` : 'Saved successfully.');
  }

  return (
    <AdminCard title="Website Settings" description="Controls the header, hero banner, and news ticker on the home page.">
      <form onSubmit={handleSave} className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <label className="block">
          <span className="mb-1 block text-xs font-semibold text-gray-600">Website Name</span>
          <input
            value={form.site_name}
            onChange={(e) => update('site_name', e.target.value)}
            className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500"
          />
        </label>

        <label className="block">
          <span className="mb-1 block text-xs font-semibold text-gray-600">Logo URL</span>
          <input
            value={form.logo_url}
            onChange={(e) => update('logo_url', e.target.value)}
            placeholder="https://..."
            className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500"
          />
        </label>

        <label className="block md:col-span-2">
          <span className="mb-1 block text-xs font-semibold text-gray-600">Main Heading</span>
          <input
            value={form.main_heading}
            onChange={(e) => update('main_heading', e.target.value)}
            className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500"
          />
        </label>

        <label className="block md:col-span-2">
          <span className="mb-1 block text-xs font-semibold text-gray-600">Sub-Heading</span>
          <input
            value={form.sub_heading}
            onChange={(e) => update('sub_heading', e.target.value)}
            className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500"
          />
        </label>

        <label className="block md:col-span-2">
          <span className="mb-1 block text-xs font-semibold text-gray-600">Scrolling News</span>
          <textarea
            value={form.scrolling_news}
            onChange={(e) => update('scrolling_news', e.target.value)}
            rows={2}
            className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500"
          />
        </label>

        <div className="flex items-center gap-3 md:col-span-2">
          <button
            type="submit"
            disabled={saving}
            className="rounded-md bg-brand-600 px-5 py-2 text-sm font-semibold text-white transition hover:bg-brand-700 disabled:opacity-60"
          >
            {saving ? 'Saving...' : 'Save Settings'}
          </button>
          {message && (
            <span className={`text-sm ${message.startsWith('Error') ? 'text-red-600' : 'text-green-600'}`}>
              {message}
            </span>
          )}
        </div>
      </form>
    </AdminCard>
  );
}
