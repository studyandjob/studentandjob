'use client';

import { useState } from 'react';
import { supabase } from '@/lib/supabaseClient';
import AdminCard from './AdminCard';
import ImageUploadField from './ImageUploadField';
import { PlusIcon, TrashIcon } from './icons';

const inputClass =
  'w-full rounded-[10px] border border-aline bg-[#FCFAF6] px-3.5 py-3 text-[0.93rem] text-aink outline-none transition focus:border-atl2 focus:ring-[3px] focus:ring-atl2/10';
const labelClass = 'mb-1.5 block text-[0.85rem] font-semibold text-aink';

/**
 * Generic "add a row / list rows / delete a row" manager, styled to match
 * the card-list pattern from the reference admin dashboard.
 *
 * @param {string} title - Card heading
 * @param {string} description - Card subheading
 * @param {object} icon - Icon component for the card header
 * @param {string} table - Supabase table name
 * @param {Array} initialRows - Rows fetched server-side
 * @param {Array} fields - [{ name, label, type: 'text'|'date'|'number'|'textarea'|'image', placeholder?, imageFolder? }]
 *   type: 'image' renders an upload-a-file control (via ImageUploadField)
 *   instead of a URL text box; imageFolder sets the storage subfolder
 *   (defaults to the field name).
 * @param {Function} renderRow - (row) => JSX for how to display a row's summary
 */
export default function ListManager({ title, description, icon, table, initialRows = [], fields, renderRow }) {
  const [rows, setRows] = useState(initialRows);
  const emptyForm = Object.fromEntries(fields.map((f) => [f.name, '']));
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);
  const [uploadingFields, setUploadingFields] = useState({});
  const [error, setError] = useState('');

  const anyUploading = Object.values(uploadingFields).some(Boolean);

  function update(name, value) {
    setForm((f) => ({ ...f, [name]: value }));
  }

  function setFieldUploading(name, value) {
    setUploadingFields((u) => ({ ...u, [name]: value }));
  }

  async function handleAdd(e) {
    e.preventDefault();
    if (anyUploading) {
      setError('An image is still uploading — please wait for it to finish before adding.');
      return;
    }
    const missingImage = fields.find((f) => f.type === 'image' && f.required && !form[f.name]);
    if (missingImage) {
      setError(`Please upload ${missingImage.label} before adding.`);
      return;
    }
    setSaving(true);
    setError('');

    const payload = {};
    fields.forEach((f) => {
      const raw = form[f.name];
      payload[f.name] = f.type === 'number' ? Number(raw) || 0 : raw;
    });

    const { data, error } = await supabase.from(table).insert(payload).select();

    setSaving(false);
    if (error) {
      setError(error.message);
      return;
    }
    setRows((prev) => [...(data || []), ...prev]);
    setForm(emptyForm);
  }

  async function handleDelete(id) {
    if (!confirm('Delete this item? This cannot be undone.')) return;
    // .select() confirms which row(s) were actually deleted. Without it, a
    // delete blocked by RLS (e.g. an expired admin session) still reports
    // success with 0 rows touched — the item would vanish from this list
    // but stay in the database and keep showing on the live website.
    const { data, error } = await supabase.from(table).delete().eq('id', id).select();
    if (error) {
      setError(error.message);
      return;
    }
    if (!data || data.length === 0) {
      setError(
        'Delete did not go through — the item is still in the database. Your admin session may have expired; please log out and log back in, then try again.'
      );
      return;
    }
    setRows((prev) => prev.filter((r) => r.id !== id));
  }

  return (
    <AdminCard title={title} description={description} icon={icon}>
      {error && <p className="mb-4 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-600">{error}</p>}

      {/* Add form */}
      <form onSubmit={handleAdd} className="mb-6 grid grid-cols-1 gap-3.5 rounded-xl bg-[#F5F9F8] p-4 sm:grid-cols-2">
        {fields.map((f) =>
          f.type === 'image' ? (
            <ImageUploadField
              key={f.name}
              folder={f.imageFolder || f.name}
              label={f.label}
              imageUrl={form[f.name]}
              onUploaded={(url) => update(f.name, url)}
              onError={setError}
              onUploadingChange={(v) => setFieldUploading(f.name, v)}
            />
          ) : (
            <label key={f.name} className={f.type === 'textarea' ? 'block sm:col-span-2' : 'block'}>
              <span className={labelClass}>{f.label}</span>
              {f.type === 'textarea' ? (
                <textarea
                  required={f.required}
                  value={form[f.name]}
                  onChange={(e) => update(f.name, e.target.value)}
                  placeholder={f.placeholder}
                  rows={2}
                  className={inputClass}
                />
              ) : (
                <input
                  type={f.type || 'text'}
                  required={f.required}
                  value={form[f.name]}
                  onChange={(e) => update(f.name, e.target.value)}
                  placeholder={f.placeholder}
                  className={inputClass}
                />
              )}
            </label>
          )
        )}

        <div className="sm:col-span-2">
          <button
            type="submit"
            disabled={saving || anyUploading}
            className="inline-flex items-center gap-2 rounded-full px-6 py-2.5 text-sm font-semibold text-white shadow-[0_6px_18px_-6px_rgba(30,132,73,0.5)] transition hover:-translate-y-0.5 disabled:opacity-60"
            style={{ background: 'linear-gradient(135deg, #1E8449, #2E5AAC)' }}
          >
            <PlusIcon className="h-4 w-4" />
            {saving ? 'Adding...' : anyUploading ? 'Uploading image...' : 'Add'}
          </button>
        </div>
      </form>

      {/* Rows list — card style, stacks cleanly on mobile */}
      {rows.length === 0 ? (
        <p className="py-6 text-center text-sm text-amuted">No entries yet.</p>
      ) : (
        <ul className="flex flex-col gap-2.5">
          {rows.map((row) => (
            <li
              key={row.id}
              className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-aline bg-white px-4 py-3 transition hover:border-brand-200 hover:shadow-sm"
            >
              <div className="min-w-0 flex-1 text-sm text-aink">{renderRow(row)}</div>
              <button
                onClick={() => handleDelete(row.id)}
                className="flex flex-shrink-0 items-center gap-1.5 rounded-full border border-red-200 bg-red-50 px-3.5 py-1.5 text-xs font-semibold text-red-600 transition hover:bg-red-600 hover:text-white"
              >
                <TrashIcon className="h-3.5 w-3.5" />
                Delete
              </button>
            </li>
          ))}
        </ul>
      )}
    </AdminCard>
  );
}
