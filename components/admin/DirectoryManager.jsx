'use client';

import { useMemo, useState } from 'react';
import { supabase } from '@/lib/supabaseClient';
import AdminCard from './AdminCard';
import ImageUploadField from './ImageUploadField';
import { BriefcaseIcon, PlusIcon, TrashIcon, PencilIcon, EyeIcon, SaveIcon, CloseIcon } from './icons';
import { DIRECTORY_CATEGORIES, DIRECTORY_AREAS } from '@/lib/directory';

const inputClass =
  'w-full rounded-[10px] border border-aline bg-[#FCFAF6] px-3.5 py-3 text-[0.93rem] text-aink outline-none transition focus:border-atl2 focus:ring-[3px] focus:ring-atl2/10';
const labelClass = 'mb-1.5 block text-[0.85rem] font-semibold text-aink';

const EMPTY = {
  name: '',
  category: DIRECTORY_CATEGORIES[0],
  area: DIRECTORY_AREAS[0],
  address: '',
  phone: '',
  whatsapp: '',
  timing: '',
  description: '',
  services: '',
  map_link: '',
  photo_url: '',
  display_order: '',
  is_featured: false,
  is_active: true,
};

// Admin → Business Directory. Add / edit / delete listings, switch Featured
// and Visible on or off. Photos upload to the existing 'site-images' bucket.
export default function DirectoryManager({ initialRows = [] }) {
  const [rows, setRows] = useState(initialRows);
  const [form, setForm] = useState(EMPTY);
  const [editingId, setEditingId] = useState(null);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');
  const [filter, setFilter] = useState('');

  function update(name, value) {
    setForm((f) => ({ ...f, [name]: value }));
  }

  function startEdit(row) {
    setEditingId(row.id);
    setForm({
      ...EMPTY,
      ...Object.fromEntries(Object.keys(EMPTY).map((k) => [k, row[k] ?? EMPTY[k]])),
      display_order: row.display_order ?? '',
    });
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
    if (uploading) {
      setError('Photo abhi upload ho rahi hai — khatam hone ka intezar karein.');
      return;
    }
    setSaving(true);
    setError('');

    const payload = {
      name: form.name.trim(),
      category: form.category,
      area: form.area,
      address: form.address.trim() || null,
      phone: form.phone.trim() || null,
      whatsapp: form.whatsapp.trim() || null,
      timing: form.timing.trim() || null,
      description: form.description.trim() || null,
      services: form.services.trim() || null,
      map_link: form.map_link.trim() || null,
      photo_url: form.photo_url || null,
      display_order: Number(form.display_order) || 0,
      is_featured: Boolean(form.is_featured),
      is_active: Boolean(form.is_active),
    };

    if (editingId) {
      const { data, error: err } = await supabase.from('businesses_table').update(payload).eq('id', editingId).select();
      setSaving(false);
      if (err) return setError(err.message);
      if (!data || data.length === 0) {
        return setError('Save nahi hua — admin session expire ho gaya ho sakta hai. Logout karke dobara login karein.');
      }
      setRows((prev) => prev.map((r) => (r.id === editingId ? data[0] : r)));
      cancelEdit();
    } else {
      const { data, error: err } = await supabase.from('businesses_table').insert(payload).select();
      setSaving(false);
      if (err) return setError(err.message);
      setRows((prev) => [...(data || []), ...prev]);
      setForm(EMPTY);
    }
  }

  async function toggle(row, field) {
    setError('');
    const { data, error: err } = await supabase
      .from('businesses_table')
      .update({ [field]: !row[field] })
      .eq('id', row.id)
      .select();
    if (err) return setError(err.message);
    if (!data || data.length === 0) {
      return setError('Change nahi hua — admin session expire ho gaya ho sakta hai. Logout karke dobara login karein.');
    }
    setRows((prev) => prev.map((r) => (r.id === row.id ? data[0] : r)));
  }

  async function handleDelete(id) {
    if (!confirm('Is business ko delete karna hai? Yeh wapis nahi ho sakta.')) return;
    // .select() confirms the row was really deleted (RLS can block silently).
    const { data, error: err } = await supabase.from('businesses_table').delete().eq('id', id).select();
    if (err) return setError(err.message);
    if (!data || data.length === 0) {
      return setError('Delete nahi hua — admin session expire ho gaya ho sakta hai. Logout karke dobara login karein.');
    }
    setRows((prev) => prev.filter((r) => r.id !== id));
    if (editingId === id) cancelEdit();
  }

  const visibleRows = useMemo(() => {
    const q = filter.trim().toLowerCase();
    if (!q) return rows;
    return rows.filter((r) => [r.name, r.category, r.area, r.phone].filter(Boolean).some((v) => String(v).toLowerCase().includes(q)));
  }, [rows, filter]);

  const smallBtn = 'flex items-center gap-1.5 rounded-full border px-3.5 py-1.5 text-xs font-semibold transition';

  return (
    <AdminCard
      title="Business Directory"
      description="Bahawalpur Local Business Directory — yahan se businesses add, edit, hide ya featured karein. Public page: /directory"
      icon={BriefcaseIcon}
    >
      {error && <p className="mb-4 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-600">{error}</p>}

      <form onSubmit={handleSubmit} className="mb-6 grid grid-cols-1 gap-3.5 rounded-xl bg-[#F5F9F8] p-4 sm:grid-cols-2">
        {editingId && (
          <p className="rounded-lg bg-amber-50 px-3 py-2 text-sm font-semibold text-amber-800 sm:col-span-2">
            Edit mode: &quot;{form.name || 'business'}&quot; ki listing badal rahe hain.
          </p>
        )}

        <label className="block sm:col-span-2">
          <span className={labelClass}>Business ka naam *</span>
          <input required value={form.name} onChange={(e) => update('name', e.target.value)} placeholder="e.g. Al-Shifa Clinic" className={inputClass} />
        </label>

        <label className="block">
          <span className={labelClass}>Category</span>
          <select value={form.category} onChange={(e) => update('category', e.target.value)} className={inputClass}>
            {DIRECTORY_CATEGORIES.map((c) => (
              <option key={c}>{c}</option>
            ))}
          </select>
        </label>

        <label className="block">
          <span className={labelClass}>Area</span>
          <select value={form.area} onChange={(e) => update('area', e.target.value)} className={inputClass}>
            {DIRECTORY_AREAS.map((a) => (
              <option key={a}>{a}</option>
            ))}
          </select>
        </label>

        <label className="block sm:col-span-2">
          <span className={labelClass}>Address</span>
          <input value={form.address} onChange={(e) => update('address', e.target.value)} placeholder="Shop #, bazaar / road, shehar" className={inputClass} />
        </label>

        <label className="block">
          <span className={labelClass}>Phone (Call button)</span>
          <input value={form.phone} onChange={(e) => update('phone', e.target.value)} placeholder="0300 1234567" className={inputClass} />
        </label>

        <label className="block">
          <span className={labelClass}>WhatsApp number (Order button)</span>
          <input value={form.whatsapp} onChange={(e) => update('whatsapp', e.target.value)} placeholder="0300 1234567 (khali ho to Phone use hoga)" className={inputClass} />
        </label>

        <label className="block">
          <span className={labelClass}>Timing</span>
          <input value={form.timing} onChange={(e) => update('timing', e.target.value)} placeholder="Mon-Sat, 9am - 9pm" className={inputClass} />
        </label>

        <label className="block">
          <span className={labelClass}>Google Maps link</span>
          <input value={form.map_link} onChange={(e) => update('map_link', e.target.value)} placeholder="https://maps.google.com/..." className={inputClass} />
        </label>

        <label className="block sm:col-span-2">
          <span className={labelClass}>Description</span>
          <textarea value={form.description} onChange={(e) => update('description', e.target.value)} rows={3} placeholder="Business ke bare mein chhota sa taaruf" className={inputClass} />
        </label>

        <label className="block sm:col-span-2">
          <span className={labelClass}>Services / Menu (ek line = ek item)</span>
          <textarea value={form.services} onChange={(e) => update('services', e.target.value)} rows={4} placeholder={'General checkup\nBlood test\nHome visit'} className={inputClass} />
        </label>

        <ImageUploadField
          folder="directory"
          label="Business Photo"
          imageUrl={form.photo_url}
          onUploaded={(url) => update('photo_url', url)}
          onError={setError}
          onUploadingChange={setUploading}
        />

        <label className="block">
          <span className={labelClass}>Display Order (chhota number pehle)</span>
          <input type="number" value={form.display_order} onChange={(e) => update('display_order', e.target.value)} placeholder="0" className={inputClass} />
        </label>

        <div className="flex flex-col justify-end gap-2.5">
          <label className="flex items-center gap-2.5 text-sm font-medium text-aink">
            <input type="checkbox" checked={form.is_featured} onChange={(e) => update('is_featured', e.target.checked)} className="h-4 w-4 accent-[#1E8449]" />
            Featured (list mein sab se upar)
          </label>
          <label className="flex items-center gap-2.5 text-sm font-medium text-aink">
            <input type="checkbox" checked={form.is_active} onChange={(e) => update('is_active', e.target.checked)} className="h-4 w-4 accent-[#1E8449]" />
            Website par nazar aaye
          </label>
        </div>

        <div className="flex flex-wrap gap-2.5 sm:col-span-2">
          <button
            type="submit"
            disabled={saving || uploading}
            className="inline-flex items-center gap-2 rounded-full px-6 py-2.5 text-sm font-semibold text-white shadow-[0_6px_18px_-6px_rgba(30,132,73,0.5)] transition hover:-translate-y-0.5 disabled:opacity-60"
            style={{ background: 'linear-gradient(135deg, #1E8449, #2E5AAC)' }}
          >
            {editingId ? <SaveIcon className="h-4 w-4" /> : <PlusIcon className="h-4 w-4" />}
            {saving ? 'Saving...' : uploading ? 'Uploading...' : editingId ? 'Save Changes' : 'Add Business'}
          </button>
          {editingId && (
            <button
              type="button"
              onClick={cancelEdit}
              className="inline-flex items-center gap-2 rounded-full border border-aline bg-white px-6 py-2.5 text-sm font-semibold text-aink transition hover:bg-acream"
            >
              <CloseIcon className="h-4 w-4" />
              Cancel
            </button>
          )}
        </div>
      </form>

      <div className="mb-3 flex flex-wrap items-center justify-between gap-3">
        <p className="text-sm font-semibold text-aink">
          {rows.length} business{rows.length === 1 ? '' : 'es'}
        </p>
        <input
          type="search"
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
          placeholder="Naam / category / area se dhundein..."
          className={`${inputClass} sm:max-w-xs`}
        />
      </div>

      {visibleRows.length === 0 ? (
        <p className="py-6 text-center text-sm text-amuted">{rows.length === 0 ? 'Abhi koi business nahi.' : 'Koi match nahi mila.'}</p>
      ) : (
        <ul className="flex flex-col gap-2.5">
          {visibleRows.map((row) => (
            <li
              key={row.id}
              className={`flex flex-wrap items-center justify-between gap-3 rounded-xl border bg-white px-4 py-3 transition hover:shadow-sm ${
                editingId === row.id ? 'border-atl2' : 'border-aline hover:border-brand-200'
              } ${row.is_active ? '' : 'opacity-60'}`}
            >
              <div className="flex min-w-0 flex-1 items-center gap-3 text-sm text-aink">
                {row.photo_url ? (
                  <img src={row.photo_url} alt="" className="h-12 w-12 flex-shrink-0 rounded-lg border border-aline object-cover" />
                ) : (
                  <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-lg bg-atl2/10 text-atl2">
                    <BriefcaseIcon className="h-5 w-5" />
                  </div>
                )}
                <div className="min-w-0">
                  <p className="truncate font-semibold">
                    {row.name}
                    {row.is_featured && <span className="ml-2 rounded-full bg-amber-100 px-2 py-0.5 text-[10px] font-bold text-amber-800">★ FEATURED</span>}
                    {!row.is_active && <span className="ml-2 rounded-full bg-gray-200 px-2 py-0.5 text-[10px] font-bold text-gray-600">HIDDEN</span>}
                  </p>
                  <p className="truncate text-xs text-amuted">
                    {row.category} · {row.area}
                    {row.phone ? ` · ${row.phone}` : ''}
                  </p>
                </div>
              </div>

              <div className="flex flex-shrink-0 flex-wrap items-center gap-2">
                <button
                  onClick={() => toggle(row, 'is_featured')}
                  className={`${smallBtn} ${row.is_featured ? 'border-amber-300 bg-amber-50 text-amber-800' : 'border-aline bg-white text-amuted hover:bg-acream'}`}
                >
                  {row.is_featured ? '★ Featured' : '☆ Feature'}
                </button>
                <button
                  onClick={() => toggle(row, 'is_active')}
                  className={`${smallBtn} ${row.is_active ? 'border-atl2/30 bg-atl2/10 text-atl2' : 'border-aline bg-white text-amuted hover:bg-acream'}`}
                >
                  {row.is_active ? 'Visible' : 'Hidden'}
                </button>
                {row.is_active && (
                  <a
                    href={`/directory/${row.id}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={`${smallBtn} border-atl2/30 bg-atl2/10 text-atl2 hover:bg-atl2 hover:text-white`}
                  >
                    <EyeIcon className="h-3.5 w-3.5" />
                    View
                  </a>
                )}
                <button onClick={() => startEdit(row)} className={`${smallBtn} border-aline bg-white text-aink hover:bg-acream`}>
                  <PencilIcon className="h-3.5 w-3.5" />
                  Edit
                </button>
                <button onClick={() => handleDelete(row.id)} className={`${smallBtn} border-red-200 bg-red-50 text-red-600 hover:bg-red-600 hover:text-white`}>
                  <TrashIcon className="h-3.5 w-3.5" />
                  Delete
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </AdminCard>
  );
}
