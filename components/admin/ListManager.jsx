'use client';

import { useState } from 'react';
import { supabase } from '@/lib/supabaseClient';
import AdminCard from './AdminCard';

/**
 * Generic "add a row / list rows / delete a row" manager.
 *
 * @param {string} title - Card heading, e.g. "Hero Slides"
 * @param {string} description - Card subheading
 * @param {string} table - Supabase table name
 * @param {Array} initialRows - Rows fetched server-side
 * @param {Array} fields - [{ name, label, type: 'text'|'date'|'number'|'textarea', placeholder? }]
 * @param {Function} renderRow - (row) => JSX for how to display a row's summary
 * @param {string} orderBy - column to order rows by when re-fetching (default 'created_at')
 */
export default function ListManager({
  title,
  description,
  table,
  initialRows = [],
  fields,
  renderRow,
  orderBy = 'created_at',
}) {
  const [rows, setRows] = useState(initialRows);
  const emptyForm = Object.fromEntries(fields.map((f) => [f.name, '']));
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  function update(name, value) {
    setForm((f) => ({ ...f, [name]: value }));
  }

  async function handleAdd(e) {
    e.preventDefault();
    setSaving(true);
    setError('');

    // Convert numeric fields before sending
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
    const { error } = await supabase.from(table).delete().eq('id', id);
    if (error) {
      setError(error.message);
      return;
    }
    setRows((prev) => prev.filter((r) => r.id !== id));
  }

  return (
    <AdminCard title={title} description={description}>
      {error && <p className="mb-3 rounded-md bg-red-50 px-3 py-2 text-sm text-red-600">{error}</p>}

      {/* Add form */}
      <form onSubmit={handleAdd} className="mb-6 grid grid-cols-1 gap-3 md:grid-cols-2">
        {fields.map((f) => (
          <label key={f.name} className={f.type === 'textarea' ? 'block md:col-span-2' : 'block'}>
            <span className="mb-1 block text-xs font-semibold text-gray-600">{f.label}</span>
            {f.type === 'textarea' ? (
              <textarea
                required={f.required}
                value={form[f.name]}
                onChange={(e) => update(f.name, e.target.value)}
                placeholder={f.placeholder}
                rows={2}
                className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500"
              />
            ) : (
              <input
                type={f.type || 'text'}
                required={f.required}
                value={form[f.name]}
                onChange={(e) => update(f.name, e.target.value)}
                placeholder={f.placeholder}
                className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500"
              />
            )}
          </label>
        ))}

        <div className="md:col-span-2">
          <button
            type="submit"
            disabled={saving}
            className="rounded-md bg-brand-600 px-5 py-2 text-sm font-semibold text-white transition hover:bg-brand-700 disabled:opacity-60"
          >
            {saving ? 'Adding...' : '+ Add'}
          </button>
        </div>
      </form>

      {/* Rows list */}
      {rows.length === 0 ? (
        <p className="py-4 text-center text-sm text-gray-500">No entries yet.</p>
      ) : (
        <ul className="divide-y divide-gray-100">
          {rows.map((row) => (
            <li key={row.id} className="flex items-center justify-between gap-3 py-3">
              <div className="min-w-0 text-sm text-gray-700">{renderRow(row)}</div>
              <button
                onClick={() => handleDelete(row.id)}
                className="flex-shrink-0 rounded-md bg-red-50 px-3 py-1.5 text-xs font-semibold text-red-600 transition hover:bg-red-100"
              >
                Delete
              </button>
            </li>
          ))}
        </ul>
      )}
    </AdminCard>
  );
}
