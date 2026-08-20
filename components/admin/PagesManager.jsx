'use client';

import { useState } from 'react';
import { supabase } from '@/lib/supabaseClient';
import AdminCard from './AdminCard';
import { FileTextIcon, SaveIcon } from './icons';

const inputClass =
  'w-full rounded-[10px] border border-aline bg-[#FCFAF6] px-3.5 py-3 text-[0.93rem] text-aink outline-none transition focus:border-atl2 focus:ring-[3px] focus:ring-atl2/10';
const labelClass = 'mb-1.5 block text-[0.85rem] font-semibold text-aink';

const PAGE_LINKS = {
  'about-us': '/about-us',
  'privacy-policy': '/privacy-policy',
  disclaimer: '/disclaimer',
  'terms-and-conditions': '/terms-and-conditions',
};

function PageEditor({ page }) {
  const [form, setForm] = useState({ title: page.title || '', content: page.content || '' });
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');

  async function handleSave(e) {
    e.preventDefault();
    setSaving(true);
    setMessage('');

    // .select() confirms the row was actually written — see notes elsewhere
    // in this project on why this check matters (silent RLS-blocked saves).
    const { data, error } = await supabase
      .from('site_pages')
      .update({ title: form.title, content: form.content, updated_at: new Date().toISOString() })
      .eq('id', page.id)
      .select();

    setSaving(false);
    if (error) {
      setMessage(`Error: ${error.message}`);
      return;
    }
    if (!data || data.length === 0) {
      setMessage('Error: Save did not go through — your admin session may have expired. Please log out and back in, then try again.');
      return;
    }
    setMessage('Saved successfully.');
  }

  return (
    <details className="group rounded-xl border border-aline bg-white open:shadow-sm" open={page._defaultOpen}>
      <summary className="flex cursor-pointer list-none items-center justify-between gap-3 px-4 py-3.5">
        <div className="min-w-0">
          <p className="font-semibold text-aink">{form.title || page.title}</p>
          <a
            href={PAGE_LINKS[page.slug] || '#'}
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs text-atl2 hover:underline"
          >
            {PAGE_LINKS[page.slug] || `/${page.slug}`} ↗
          </a>
        </div>
        <span className="flex-shrink-0 text-xs font-semibold text-amuted transition group-open:rotate-180">▾</span>
      </summary>

      <form onSubmit={handleSave} className="flex flex-col gap-3.5 border-t border-aline p-4">
        <label className="block">
          <span className={labelClass}>Page Title</span>
          <input value={form.title} onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))} className={inputClass} />
        </label>

        <label className="block">
          <span className={labelClass}>Content</span>
          <textarea
            value={form.content}
            onChange={(e) => setForm((f) => ({ ...f, content: e.target.value }))}
            rows={8}
            className={inputClass}
          />
        </label>

        <div className="flex flex-wrap items-center gap-3">
          <button
            type="submit"
            disabled={saving}
            className="inline-flex items-center gap-2 rounded-full px-5 py-2.5 text-sm font-semibold text-white shadow-[0_6px_18px_-6px_rgba(242,120,92,0.5)] transition hover:-translate-y-0.5 disabled:opacity-60"
            style={{ background: 'linear-gradient(135deg, #E8A33D, #F2785C)' }}
          >
            <SaveIcon className="h-4 w-4" />
            {saving ? 'Saving...' : 'Save Page'}
          </button>
          {message && (
            <span className={`text-sm ${message.startsWith('Error') ? 'text-rose-600' : 'text-emerald-600'}`}>
              {message}
            </span>
          )}
        </div>
      </form>
    </details>
  );
}

// Editor for the fixed set of static/legal pages (About Us, Privacy Policy,
// Disclaimer, Terms & Conditions). Rows are seeded by the SQL schema, so
// there's no add/delete here — just edit-and-save per page.
export default function PagesManager({ initialRows = [] }) {
  return (
    <AdminCard
      title="Pages (About / Legal)"
      description="Edit the content shown on About Us, Privacy Policy, Disclaimer and Terms & Conditions."
      icon={FileTextIcon}
    >
      {initialRows.length === 0 ? (
        <p className="py-6 text-center text-sm text-amuted">
          No pages found. Run the latest sql/schema.sql in Supabase to seed them.
        </p>
      ) : (
        <div className="flex flex-col gap-3">
          {initialRows.map((page, i) => (
            <PageEditor key={page.id} page={{ ...page, _defaultOpen: i === 0 }} />
          ))}
        </div>
      )}
    </AdminCard>
  );
}
