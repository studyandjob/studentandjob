'use client';

import { useMemo, useState } from 'react';
import { supabase } from '@/lib/supabaseClient';
import AdminCard from './AdminCard';
import { BriefcaseIcon, PlusIcon, TrashIcon, PencilIcon, SaveIcon, CloseIcon } from './icons';
import { PROVINCES, slugify } from '@/lib/directory';

const inputClass =
  'w-full rounded-[10px] border border-aline bg-[#FCFAF6] px-3.5 py-3 text-[0.93rem] text-aink outline-none transition focus:border-atl2 focus:ring-[3px] focus:ring-atl2/10';
const labelClass = 'mb-1.5 block text-[0.85rem] font-semibold text-aink';
const smallBtn = 'flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-semibold transition';

const EMPTY = { name: '', slug: '', province: PROVINCES[0], latitude: '', longitude: '', display_order: '', is_popular: false, is_active: true };

// Admin → Business Directory → Cities & Areas.
export default function DirectoryCitiesManager({ cities, setCities, areas, setAreas }) {
  const [form, setForm] = useState(EMPTY);
  const [editingId, setEditingId] = useState(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [filter, setFilter] = useState('');
  const [openCityId, setOpenCityId] = useState(null);
  const [newArea, setNewArea] = useState('');

  function update(name, value) {
    setForm((f) => ({ ...f, [name]: value }));
  }

  function startEdit(row) {
    setEditingId(row.id);
    setForm({
      name: row.name,
      slug: row.slug,
      province: row.province || PROVINCES[0],
      latitude: row.latitude ?? '',
      longitude: row.longitude ?? '',
      display_order: row.display_order ?? '',
      is_popular: row.is_popular,
      is_active: row.is_active,
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
    const slug = slugify(form.slug || form.name);
    if (!slug) return setError('Slug nahi ban saka. Neeche Slug mein English huroof likhein.');
    if (['pakistan', 'business'].includes(slug)) return setError('Yeh slug system ke liye reserved hai — koi aur likhein.');
    const hasLat = String(form.latitude).trim() !== '';
    const hasLng = String(form.longitude).trim() !== '';
    if (hasLat !== hasLng) return setError('Latitude aur Longitude dono bharein, ya dono khali chhorein.');
    const lat = hasLat ? Number(form.latitude) : null;
    const lng = hasLng ? Number(form.longitude) : null;
    if (hasLat && (Number.isNaN(lat) || lat < -90 || lat > 90)) return setError('Latitude -90 se 90 ke beech hona chahiye.');
    if (hasLng && (Number.isNaN(lng) || lng < -180 || lng > 180)) return setError('Longitude -180 se 180 ke beech hona chahiye.');

    setSaving(true);
    setError('');
    const payload = {
      name: form.name.trim(),
      slug,
      province: form.province,
      latitude: lat,
      longitude: lng,
      display_order: Number(form.display_order) || 0,
      is_popular: form.is_popular,
      is_active: form.is_active,
    };
    const dupMsg = 'Yeh slug pehle se maujood hai — koi aur slug likhein.';

    if (editingId) {
      const { data, error: err } = await supabase.from('directory_cities').update(payload).eq('id', editingId).select();
      setSaving(false);
      if (err) return setError(err.message.includes('duplicate') ? dupMsg : err.message);
      if (!data?.length) return setError('Save nahi hua — logout karke dobara login karein.');
      setCities((prev) => prev.map((c) => (c.id === editingId ? data[0] : c)));
      cancelEdit();
    } else {
      const { data, error: err } = await supabase.from('directory_cities').insert(payload).select();
      setSaving(false);
      if (err) return setError(err.message.includes('duplicate') ? dupMsg : err.message);
      setCities((prev) => [...prev, ...(data || [])]);
      setForm(EMPTY);
    }
  }

  async function togglePopular(row) {
    const { data, error: err } = await supabase.from('directory_cities').update({ is_popular: !row.is_popular }).eq('id', row.id).select();
    if (err) return setError(err.message);
    if (!data?.length) return setError('Change nahi hua — logout karke dobara login karein.');
    setCities((prev) => prev.map((c) => (c.id === row.id ? data[0] : c)));
  }

  async function toggleActive(row) {
    const { data, error: err } = await supabase.from('directory_cities').update({ is_active: !row.is_active }).eq('id', row.id).select();
    if (err) return setError(err.message);
    if (!data?.length) return setError('Change nahi hua — logout karke dobara login karein.');
    setCities((prev) => prev.map((c) => (c.id === row.id ? data[0] : c)));
  }

  async function handleDelete(row) {
    if (!confirm(`"${row.name}" delete karna hai? Is ke areas bhi delete honge. Businesses delete nahi honge, bas unka shehar khali ho jayega.`)) return;
    const { data, error: err } = await supabase.from('directory_cities').delete().eq('id', row.id).select();
    if (err) return setError(err.message);
    if (!data?.length) return setError('Delete nahi hua — logout karke dobara login karein.');
    setCities((prev) => prev.filter((c) => c.id !== row.id));
    setAreas((prev) => prev.filter((a) => a.city_id !== row.id));
    if (editingId === row.id) cancelEdit();
  }

  async function addArea(cityId) {
    const name = newArea.trim();
    if (!name) return;
    setError('');
    const cityAreas = areas.filter((a) => a.city_id === cityId);
    const order = cityAreas.reduce((m, a) => Math.max(m, a.display_order ?? 0), 0) + 10;
    const { data, error: err } = await supabase.from('directory_areas').insert({ city_id: cityId, name, display_order: order }).select();
    if (err) return setError(err.message.includes('duplicate') ? 'Yeh area is shehar mein pehle se hai.' : err.message);
    setAreas((prev) => [...prev, ...(data || [])]);
    setNewArea('');
  }

  async function deleteArea(area) {
    if (!confirm(`Area "${area.name}" delete karna hai?`)) return;
    const { data, error: err } = await supabase.from('directory_areas').delete().eq('id', area.id).select();
    if (err) return setError(err.message);
    if (!data?.length) return setError('Delete nahi hua — logout karke dobara login karein.');
    setAreas((prev) => prev.filter((a) => a.id !== area.id));
  }

  const visible = useMemo(() => {
    const q = filter.trim().toLowerCase();
    const sorted = [...cities].sort((a, b) => (a.display_order ?? 0) - (b.display_order ?? 0) || a.name.localeCompare(b.name));
    return q ? sorted.filter((c) => `${c.name} ${c.province || ''}`.toLowerCase().includes(q)) : sorted;
  }, [cities, filter]);

  return (
    <AdminCard title="Cities & Areas" description="Pakistan ke shehar aur un ke areas. Latitude/Longitude 'Mere qareeb' aur 'Within X KM' ke liye istemal hoti hai." icon={BriefcaseIcon}>
      {error && <p className="mb-4 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-600">{error}</p>}

      <form onSubmit={handleSubmit} className="mb-6 grid grid-cols-1 gap-3.5 rounded-xl bg-[#F5F9F8] p-4 sm:grid-cols-2">
        {editingId && <p className="rounded-lg bg-amber-50 px-3 py-2 text-sm font-semibold text-amber-800 sm:col-span-2">Edit mode: &quot;{form.name}&quot;</p>}
        <label className="block">
          <span className={labelClass}>Shehar ka naam *</span>
          <input required value={form.name} onChange={(e) => update('name', e.target.value)} className={inputClass} />
        </label>
        <label className="block">
          <span className={labelClass}>Slug (URL) — khali ho to naam se ban jata hai</span>
          <input value={form.slug} onChange={(e) => update('slug', e.target.value)} className={inputClass} />
        </label>
        <label className="block">
          <span className={labelClass}>Province</span>
          <select value={form.province} onChange={(e) => update('province', e.target.value)} className={inputClass}>
            {PROVINCES.map((p) => (
              <option key={p}>{p}</option>
            ))}
          </select>
        </label>
        <label className="block">
          <span className={labelClass}>Display Order</span>
          <input type="number" value={form.display_order} onChange={(e) => update('display_order', e.target.value)} placeholder="0" className={inputClass} />
        </label>
        <label className="block">
          <span className={labelClass}>Latitude</span>
          <input value={form.latitude} onChange={(e) => update('latitude', e.target.value)} inputMode="decimal" placeholder="29.3956" className={inputClass} />
        </label>
        <label className="block">
          <span className={labelClass}>Longitude</span>
          <input value={form.longitude} onChange={(e) => update('longitude', e.target.value)} inputMode="decimal" placeholder="71.6836" className={inputClass} />
        </label>
        <div className="flex flex-col gap-2.5 sm:col-span-2 sm:flex-row sm:gap-6">
          <label className="flex items-center gap-2.5 text-sm font-medium text-aink">
            <input type="checkbox" checked={form.is_popular} onChange={(e) => update('is_popular', e.target.checked)} className="h-4 w-4 accent-[#1E8449]" />
            Popular (directory home par dikhe)
          </label>
          <label className="flex items-center gap-2.5 text-sm font-medium text-aink">
            <input type="checkbox" checked={form.is_active} onChange={(e) => update('is_active', e.target.checked)} className="h-4 w-4 accent-[#1E8449]" />
            Website par nazar aaye
          </label>
        </div>
        <div className="flex flex-wrap gap-2.5 sm:col-span-2">
          <button type="submit" disabled={saving} className="inline-flex items-center gap-2 rounded-full px-6 py-2.5 text-sm font-semibold text-white transition hover:-translate-y-0.5 disabled:opacity-60" style={{ background: 'linear-gradient(135deg, #1E8449, #2E5AAC)' }}>
            {editingId ? <SaveIcon className="h-4 w-4" /> : <PlusIcon className="h-4 w-4" />}
            {saving ? 'Saving...' : editingId ? 'Save Changes' : 'Add City'}
          </button>
          {editingId && (
            <button type="button" onClick={cancelEdit} className="inline-flex items-center gap-2 rounded-full border border-aline bg-white px-6 py-2.5 text-sm font-semibold text-aink hover:bg-acream">
              <CloseIcon className="h-4 w-4" /> Cancel
            </button>
          )}
        </div>
      </form>

      <div className="mb-3 flex flex-wrap items-center justify-between gap-3">
        <p className="text-sm font-semibold text-aink">{cities.length} cities</p>
        <input type="search" value={filter} onChange={(e) => setFilter(e.target.value)} placeholder="Shehar ya province dhundein..." className={`${inputClass} sm:max-w-xs`} />
      </div>

      {visible.length === 0 ? (
        <p className="py-6 text-center text-sm text-amuted">{cities.length === 0 ? 'Abhi koi shehar nahi. SQL (add_directory_phase1.sql) run kiya hai?' : 'Koi match nahi mila.'}</p>
      ) : (
        <ul className="flex flex-col gap-2">
          {visible.map((row) => {
            const cityAreas = areas.filter((a) => a.city_id === row.id);
            const open = openCityId === row.id;
            return (
              <li key={row.id} className={`rounded-xl border bg-white px-3.5 py-2.5 ${editingId === row.id ? 'border-atl2' : 'border-aline'} ${row.is_active ? '' : 'opacity-60'}`}>
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="min-w-0 text-sm text-aink">
                    <p className="truncate font-semibold">
                      {row.name}
                      {row.is_popular && <span className="ml-2 rounded-full bg-amber-100 px-2 py-0.5 text-[10px] font-bold text-amber-800">POPULAR</span>}
                      {!row.is_active && <span className="ml-2 rounded-full bg-gray-200 px-2 py-0.5 text-[10px] font-bold text-gray-600">HIDDEN</span>}
                    </p>
                    <p className="truncate text-xs text-amuted">
                      {row.province} · /{row.slug}
                      {row.latitude == null ? ' · 📍 coordinates nahi' : ''}
                    </p>
                  </div>
                  <div className="flex flex-wrap items-center gap-1.5">
                    <button type="button" onClick={() => setOpenCityId(open ? null : row.id)} className={`${smallBtn} border-atl2/30 bg-atl2/10 text-atl2`}>
                      Areas ({cityAreas.length})
                    </button>
                    <button type="button" onClick={() => togglePopular(row)} className={`${smallBtn} ${row.is_popular ? 'border-amber-300 bg-amber-50 text-amber-800' : 'border-aline bg-white text-amuted'}`}>
                      {row.is_popular ? '★ Popular' : '☆ Popular'}
                    </button>
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
                </div>

                {open && (
                  <div className="mt-3 rounded-lg bg-[#F5F9F8] p-3">
                    <div className="mb-2.5 flex flex-wrap gap-2">
                      {cityAreas.length === 0 && <span className="text-xs text-amuted">Abhi koi area nahi.</span>}
                      {cityAreas.map((a) => (
                        <span key={a.id} className="inline-flex items-center gap-1.5 rounded-full border border-aline bg-white px-3 py-1 text-xs font-medium text-aink">
                          {a.name}
                          <button type="button" onClick={() => deleteArea(a)} aria-label={`${a.name} delete`} className="text-red-500 hover:text-red-700">
                            ×
                          </button>
                        </span>
                      ))}
                    </div>
                    <div className="flex gap-2">
                      <input
                        value={newArea}
                        onChange={(e) => setNewArea(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') {
                            e.preventDefault();
                            addArea(row.id);
                          }
                        }}
                        placeholder="Naya area, e.g. Model Town"
                        className={inputClass}
                      />
                      <button type="button" onClick={() => addArea(row.id)} className="flex-shrink-0 rounded-full bg-atl2 px-5 py-2 text-xs font-semibold text-white hover:opacity-90">
                        Add
                      </button>
                    </div>
                  </div>
                )}
              </li>
            );
          })}
        </ul>
      )}
    </AdminCard>
  );
}
