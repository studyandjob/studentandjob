'use client';

import { useMemo, useState } from 'react';
import { supabase } from '@/lib/supabaseClient';
import AdminCard from './AdminCard';
import { BriefcaseIcon, PlusIcon, TrashIcon, PencilIcon, SaveIcon, CloseIcon } from './icons';
import HomeIcon from '../HomeIcons';
import { CATEGORY_ICONS, buildCategoryTree, slugify } from '@/lib/directory';

const inputClass =
  'w-full rounded-[10px] border border-aline bg-[#FCFAF6] px-3.5 py-3 text-[0.93rem] text-aink outline-none transition focus:border-atl2 focus:ring-[3px] focus:ring-atl2/10';
const labelClass = 'mb-1.5 block text-[0.85rem] font-semibold text-aink';
const smallBtn = 'flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-semibold transition';

const EMPTY = { name: '', slug: '', parent_id: '', icon: 'briefcase', is_active: true };

// Admin → Business Directory → Categories. Unlimited categories and
// subcategories, reorderable, no code changes needed.
export default function DirectoryCategoriesManager({ categories, setCategories }) {
  const [form, setForm] = useState(EMPTY);
  const [editingId, setEditingId] = useState(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  // The admin sees inactive ones too, so build the tree from the full list.
  const tree = useMemo(() => buildCategoryTree(categories), [categories]);
  const tops = tree;

  function update(name, value) {
    setForm((f) => ({ ...f, [name]: value }));
  }

  function startEdit(row) {
    setEditingId(row.id);
    setForm({ name: row.name, slug: row.slug, parent_id: row.parent_id || '', icon: row.icon || 'briefcase', is_active: row.is_active });
    setError('');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  function cancelEdit() {
    setEditingId(null);
    setForm(EMPTY);
    setError('');
  }

  async function handleSubmit(e) {
    e.preventDefault();
    const name = form.name.trim();
    const slug = slugify(form.slug || name);
    if (!slug) return setError('Slug nahi ban saka (Urdu naam?). Neeche Slug mein English huroof likhein, e.g. "hospitals".');
    if (editingId && form.parent_id === editingId) return setError('Category apni hi subcategory nahi ban sakti.');

    setSaving(true);
    setError('');
    const siblings = categories.filter((c) => (c.parent_id || '') === form.parent_id);
    const payload = {
      name,
      slug,
      parent_id: form.parent_id || null,
      icon: form.icon,
      is_active: form.is_active,
    };

    if (editingId) {
      const { data, error: err } = await supabase.from('directory_categories').update(payload).eq('id', editingId).select();
      setSaving(false);
      if (err) return setError(err.message.includes('duplicate') ? 'Yeh slug pehle se maujood hai — koi aur slug likhein.' : err.message);
      if (!data?.length) return setError('Save nahi hua — logout karke dobara login karein.');
      setCategories((prev) => prev.map((c) => (c.id === editingId ? data[0] : c)));
      cancelEdit();
    } else {
      const nextOrder = siblings.reduce((m, c) => Math.max(m, c.display_order ?? 0), 0) + 10;
      const { data, error: err } = await supabase.from('directory_categories').insert({ ...payload, display_order: nextOrder }).select();
      setSaving(false);
      if (err) return setError(err.message.includes('duplicate') ? 'Yeh slug pehle se maujood hai — koi aur slug likhein.' : err.message);
      setCategories((prev) => [...prev, ...(data || [])]);
      setForm({ ...EMPTY, parent_id: form.parent_id });
    }
  }

  async function toggleActive(row) {
    setError('');
    const { data, error: err } = await supabase.from('directory_categories').update({ is_active: !row.is_active }).eq('id', row.id).select();
    if (err) return setError(err.message);
    if (!data?.length) return setError('Change nahi hua — logout karke dobara login karein.');
    setCategories((prev) => prev.map((c) => (c.id === row.id ? data[0] : c)));
  }

  async function move(row, dir) {
    setError('');
    const siblings = categories
      .filter((c) => (c.parent_id || '') === (row.parent_id || ''))
      .sort((a, b) => (a.display_order ?? 0) - (b.display_order ?? 0) || String(a.name).localeCompare(String(b.name)));
    const i = siblings.findIndex((c) => c.id === row.id);
    const j = i + dir;
    if (j < 0 || j >= siblings.length) return;
    [siblings[i], siblings[j]] = [siblings[j], siblings[i]];
    const updates = siblings.map((c, idx) => ({ id: c.id, display_order: (idx + 1) * 10 }));
    const results = await Promise.all(updates.map((u) => supabase.from('directory_categories').update({ display_order: u.display_order }).eq('id', u.id).select()));
    const failed = results.find((r) => r.error || !r.data?.length);
    if (failed) return setError(failed.error?.message || 'Order save nahi hua — logout karke dobara login karein.');
    const orderById = Object.fromEntries(updates.map((u) => [u.id, u.display_order]));
    setCategories((prev) => prev.map((c) => (orderById[c.id] != null ? { ...c, display_order: orderById[c.id] } : c)));
  }

  async function handleDelete(row) {
    const kids = categories.filter((c) => c.parent_id === row.id).length;
    const msg = kids
      ? `"${row.name}" aur is ki ${kids} subcategories delete ho jayengi. In categories ke businesses delete nahi honge, bas unki category khali ho jayegi. Jaari rakhein?`
      : `"${row.name}" delete karni hai? Is ke businesses delete nahi honge, bas unki category khali ho jayegi.`;
    if (!confirm(msg)) return;
    const { data, error: err } = await supabase.from('directory_categories').delete().eq('id', row.id).select();
    if (err) return setError(err.message);
    if (!data?.length) return setError('Delete nahi hua — logout karke dobara login karein.');
    setCategories((prev) => prev.filter((c) => c.id !== row.id && c.parent_id !== row.id));
    if (editingId === row.id) cancelEdit();
  }

  function Row({ row, indent = false }) {
    return (
      <li className={`flex flex-wrap items-center justify-between gap-2 rounded-xl border border-aline bg-white px-3.5 py-2.5 ${indent ? 'ml-6 sm:ml-10' : ''} ${row.is_active ? '' : 'opacity-60'}`}>
        <div className="flex min-w-0 items-center gap-2.5 text-sm text-aink">
          {!indent && (
            <span className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-atl2/10 text-atl2">
              <HomeIcon name={row.icon || 'briefcase'} className="h-4 w-4" />
            </span>
          )}
          <div className="min-w-0">
            <p className="truncate font-semibold">
              {row.name}
              {!row.is_active && <span className="ml-2 rounded-full bg-gray-200 px-2 py-0.5 text-[10px] font-bold text-gray-600">HIDDEN</span>}
            </p>
            <p className="truncate text-xs text-amuted">/{row.slug}</p>
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-1.5">
          <button type="button" onClick={() => move(row, -1)} aria-label="Upar" className={`${smallBtn} border-aline bg-white text-aink hover:bg-acream`}>↑</button>
          <button type="button" onClick={() => move(row, 1)} aria-label="Neeche" className={`${smallBtn} border-aline bg-white text-aink hover:bg-acream`}>↓</button>
          <button type="button" onClick={() => toggleActive(row)} className={`${smallBtn} ${row.is_active ? 'border-atl2/30 bg-atl2/10 text-atl2' : 'border-aline bg-white text-amuted'}`}>
            {row.is_active ? 'Visible' : 'Hidden'}
          </button>
          <button type="button" onClick={() => startEdit(row)} className={`${smallBtn} border-aline bg-white text-aink hover:bg-acream`}>
            <PencilIcon className="h-3.5 w-3.5" /> Edit
          </button>
          <button type="button" onClick={() => handleDelete(row)} className={`${smallBtn} border-red-200 bg-red-50 text-red-600 hover:bg-red-600 hover:text-white`}>
            <TrashIcon className="h-3.5 w-3.5" /> Delete
          </button>
        </div>
      </li>
    );
  }

  return (
    <AdminCard title="Categories & Subcategories" description="Unlimited categories aur subcategories — add, edit, hide, upar/neeche karein. Code badalne ki zaroorat nahi." icon={BriefcaseIcon}>
      {error && <p className="mb-4 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-600">{error}</p>}

      <form onSubmit={handleSubmit} className="mb-6 grid grid-cols-1 gap-3.5 rounded-xl bg-[#F5F9F8] p-4 sm:grid-cols-2">
        {editingId && <p className="rounded-lg bg-amber-50 px-3 py-2 text-sm font-semibold text-amber-800 sm:col-span-2">Edit mode: &quot;{form.name}&quot;</p>}
        <label className="block">
          <span className={labelClass}>Naam *</span>
          <input required value={form.name} onChange={(e) => update('name', e.target.value)} placeholder="e.g. Pharmacies" className={inputClass} />
        </label>
        <label className="block">
          <span className={labelClass}>Slug (URL) — khali ho to naam se ban jata hai</span>
          <input value={form.slug} onChange={(e) => update('slug', e.target.value)} placeholder="pharmacies" className={inputClass} />
        </label>
        <label className="block">
          <span className={labelClass}>Parent category</span>
          <select value={form.parent_id} onChange={(e) => update('parent_id', e.target.value)} className={inputClass}>
            <option value="">— Top-level category —</option>
            {tops.filter((t) => t.id !== editingId).map((t) => (
              <option key={t.id} value={t.id}>
                {t.name}
              </option>
            ))}
          </select>
        </label>
        <label className="block">
          <span className={labelClass}>Icon (top-level ke liye)</span>
          <select value={form.icon} onChange={(e) => update('icon', e.target.value)} className={inputClass}>
            {CATEGORY_ICONS.map((i) => (
              <option key={i}>{i}</option>
            ))}
          </select>
        </label>
        <label className="flex items-center gap-2.5 text-sm font-medium text-aink sm:col-span-2">
          <input type="checkbox" checked={form.is_active} onChange={(e) => update('is_active', e.target.checked)} className="h-4 w-4 accent-[#1E8449]" />
          Website par nazar aaye
        </label>
        <div className="flex flex-wrap gap-2.5 sm:col-span-2">
          <button type="submit" disabled={saving} className="inline-flex items-center gap-2 rounded-full px-6 py-2.5 text-sm font-semibold text-white transition hover:-translate-y-0.5 disabled:opacity-60" style={{ background: 'linear-gradient(135deg, #1E8449, #2E5AAC)' }}>
            {editingId ? <SaveIcon className="h-4 w-4" /> : <PlusIcon className="h-4 w-4" />}
            {saving ? 'Saving...' : editingId ? 'Save Changes' : 'Add Category'}
          </button>
          {editingId && (
            <button type="button" onClick={cancelEdit} className="inline-flex items-center gap-2 rounded-full border border-aline bg-white px-6 py-2.5 text-sm font-semibold text-aink hover:bg-acream">
              <CloseIcon className="h-4 w-4" /> Cancel
            </button>
          )}
        </div>
      </form>

      {tree.length === 0 ? (
        <p className="py-6 text-center text-sm text-amuted">Abhi koi category nahi. SQL (add_directory_phase1.sql) run kiya hai?</p>
      ) : (
        <ul className="flex flex-col gap-2">
          {tree.map((top) => (
            <li key={top.id} className="list-none">
              <ul className="flex flex-col gap-2">
                <Row row={top} />
                {top.children.map((c) => (
                  <Row key={c.id} row={c} indent />
                ))}
              </ul>
            </li>
          ))}
        </ul>
      )}
    </AdminCard>
  );
}
