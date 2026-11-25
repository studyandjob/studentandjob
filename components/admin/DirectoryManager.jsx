'use client';

import { useMemo, useState } from 'react';
import { supabase } from '@/lib/supabaseClient';
import AdminCard from './AdminCard';
import ImageUploadField from './ImageUploadField';
import { BriefcaseIcon, PlusIcon, TrashIcon, PencilIcon, EyeIcon, SaveIcon, CloseIcon } from './icons';
import { VERIFICATION_STATUSES, buildCategoryTree, parseMapLink } from '@/lib/directory';

const inputClass =
  'w-full rounded-[10px] border border-aline bg-[#FCFAF6] px-3.5 py-3 text-[0.93rem] text-aink outline-none transition focus:border-atl2 focus:ring-[3px] focus:ring-atl2/10';
const labelClass = 'mb-1.5 block text-[0.85rem] font-semibold text-aink';

const EMPTY = {
  name: '',
  category_id: '',
  subcategory_id: '',
  city_id: '',
  area_id: '',
  short_description: '',
  description: '',
  services: '',
  address: '',
  phone: '',
  whatsapp: '',
  timing: '',
  map_link: '',
  latitude: '',
  longitude: '',
  photo_url: '',
  verification_status: 'unverified',
  verified_until: '',
  display_order: '',
  is_featured: false,
  is_active: true,
};

const STATUS_STYLE = {
  verified: 'bg-emerald-100 text-emerald-800',
  pending: 'bg-blue-100 text-blue-800',
  rejected: 'bg-red-100 text-red-700',
  suspended: 'bg-red-100 text-red-700',
};

// Admin → Business Directory → Businesses.
export default function DirectoryManager({ initialRows = [], categories = [], cities = [], areas = [] }) {
  const [rows, setRows] = useState(initialRows);
  const [form, setForm] = useState(EMPTY);
  const [editingId, setEditingId] = useState(null);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [locating, setLocating] = useState(false);
  const [error, setError] = useState('');
  const [note, setNote] = useState('');
  const [filter, setFilter] = useState('');

  const tree = useMemo(() => buildCategoryTree(categories), [categories]);
  const subOptions = tree.find((t) => t.id === form.category_id)?.children || [];
  const areaOptions = areas.filter((a) => a.city_id === form.city_id);
  const catName = (id) => categories.find((c) => c.id === id)?.name || '';
  const cityName = (id) => cities.find((c) => c.id === id)?.name || '';

  function update(name, value) {
    setForm((f) => ({ ...f, [name]: value }));
  }

  function startEdit(row) {
    setEditingId(row.id);
    setForm({
      ...EMPTY,
      ...Object.fromEntries(Object.keys(EMPTY).map((k) => [k, row[k] ?? EMPTY[k]])),
      display_order: row.display_order ?? '',
      verified_until: row.verified_until ? String(row.verified_until).slice(0, 10) : '',
    });
    setError('');
    setNote('');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  function cancelEdit() {
    setEditingId(null);
    setForm(EMPTY);
    setError('');
    setNote('');
  }

  function fillFromMapLink() {
    const found = parseMapLink(form.map_link);
    if (!found) {
      setNote('');
      return setError('Is link mein coordinates nahi mile. Google Maps ka poora link (jis mein @lat,lng ho) paste karein, ya neeche khud likhein.');
    }
    setError('');
    setNote(`Coordinates mil gaye: ${found.lat}, ${found.lng}`);
    setForm((f) => ({ ...f, latitude: String(found.lat), longitude: String(found.lng) }));
  }

  function useMyLocation() {
    if (!('geolocation' in navigator)) return setError('Is browser mein location support nahi hai.');
    setLocating(true);
    setError('');
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setLocating(false);
        setNote('Aap ki current location bhar di gayi — yeh tab theek hai jab aap business ki jagah par hon.');
        setForm((f) => ({ ...f, latitude: pos.coords.latitude.toFixed(6), longitude: pos.coords.longitude.toFixed(6) }));
      },
      () => {
        setLocating(false);
        setError('Location nahi mil saki. Browser mein location allow karein ya Maps link use karein.');
      },
      { enableHighAccuracy: true, timeout: 12000 }
    );
  }

  async function handleSubmit(e) {
    e.preventDefault();
    if (uploading) return setError('Photo abhi upload ho rahi hai — khatam hone ka intezar karein.');
    if (!form.category_id) return setError('Category chunein.');
    if (!form.city_id) return setError('Shehar chunein.');

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
      category_id: form.category_id,
      subcategory_id: form.subcategory_id || null,
      city_id: form.city_id,
      area_id: form.area_id || null,
      // Purane text columns bhi sath sath bhare jate hain (compatibility)
      category: catName(form.category_id) || null,
      area: cityName(form.city_id) || null,
      short_description: form.short_description.trim() || null,
      description: form.description.trim() || null,
      services: form.services.trim() || null,
      address: form.address.trim() || null,
      phone: form.phone.trim() || null,
      whatsapp: form.whatsapp.trim() || null,
      timing: form.timing.trim() || null,
      map_link: form.map_link.trim() || null,
      latitude: lat,
      longitude: lng,
      photo_url: form.photo_url || null,
      verification_status: form.verification_status,
      verified_until: form.verification_status === 'verified' && form.verified_until ? new Date(`${form.verified_until}T23:59:59`).toISOString() : null,
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
      setNote('Business add ho gaya.');
    }
  }

  async function toggle(row, field) {
    setError('');
    const { data, error: err } = await supabase.from('businesses_table').update({ [field]: !row[field] }).eq('id', row.id).select();
    if (err) return setError(err.message);
    if (!data || data.length === 0) {
      return setError('Change nahi hua — admin session expire ho gaya ho sakta hai. Logout karke dobara login karein.');
    }
    setRows((prev) => prev.map((r) => (r.id === row.id ? data[0] : r)));
  }

  async function handleDelete(id) {
    if (!confirm('Is business ko delete karna hai? Yeh wapis nahi ho sakta.')) return;
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
    return rows.filter((r) =>
      [r.name, catName(r.category_id) || r.category, cityName(r.city_id) || r.area, r.phone]
        .filter(Boolean)
        .some((v) => String(v).toLowerCase().includes(q))
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [rows, filter, categories, cities]);

  const smallBtn = 'flex items-center gap-1.5 rounded-full border px-3.5 py-1.5 text-xs font-semibold transition';

  return (
    <AdminCard
      title="Business Directory — Businesses"
      description="Businesses add, edit, hide, verify ya featured karein. Public page: /directory"
      icon={BriefcaseIcon}
    >
      {error && <p className="mb-4 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-600">{error}</p>}
      {note && !error && <p className="mb-4 rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm text-emerald-700">{note}</p>}

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
          <span className={labelClass}>Category *</span>
          <select
            value={form.category_id}
            onChange={(e) => setForm((f) => ({ ...f, category_id: e.target.value, subcategory_id: '' }))}
            className={inputClass}
          >
            <option value="">— chunein —</option>
            {tree.map((t) => (
              <option key={t.id} value={t.id}>
                {t.name}
              </option>
            ))}
          </select>
        </label>

        <label className="block">
          <span className={labelClass}>Subcategory</span>
          <select value={form.subcategory_id} onChange={(e) => update('subcategory_id', e.target.value)} disabled={subOptions.length === 0} className={inputClass}>
            <option value="">{subOptions.length === 0 ? 'Koi subcategory nahi' : '— optional —'}</option>
            {subOptions.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
        </label>

        <label className="block">
          <span className={labelClass}>Shehar *</span>
          <select
            value={form.city_id}
            onChange={(e) => setForm((f) => ({ ...f, city_id: e.target.value, area_id: '' }))}
            className={inputClass}
          >
            <option value="">— chunein —</option>
            {cities.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
        </label>

        <label className="block">
          <span className={labelClass}>Area</span>
          <select value={form.area_id} onChange={(e) => update('area_id', e.target.value)} disabled={areaOptions.length === 0} className={inputClass}>
            <option value="">{areaOptions.length === 0 ? 'Is shehar ke area "Cities & Areas" mein add karein' : '— optional —'}</option>
            {areaOptions.map((a) => (
              <option key={a.id} value={a.id}>
                {a.name}
              </option>
            ))}
          </select>
        </label>

        <label className="block sm:col-span-2">
          <span className={labelClass}>Short description (card par dikhegi)</span>
          <input value={form.short_description} onChange={(e) => update('short_description', e.target.value)} maxLength={160} placeholder="Ek line ka taaruf" className={inputClass} />
        </label>

        <label className="block sm:col-span-2">
          <span className={labelClass}>Full description</span>
          <textarea value={form.description} onChange={(e) => update('description', e.target.value)} rows={3} className={inputClass} />
        </label>

        <label className="block sm:col-span-2">
          <span className={labelClass}>Services / Menu (ek line = ek item)</span>
          <textarea value={form.services} onChange={(e) => update('services', e.target.value)} rows={4} placeholder={'General checkup\nBlood test\nHome visit'} className={inputClass} />
        </label>

        <label className="block sm:col-span-2">
          <span className={labelClass}>Address</span>
          <input value={form.address} onChange={(e) => update('address', e.target.value)} placeholder="Shop #, bazaar / road" className={inputClass} />
        </label>

        <label className="block">
          <span className={labelClass}>Phone (Call button)</span>
          <input value={form.phone} onChange={(e) => update('phone', e.target.value)} placeholder="0300 1234567" className={inputClass} />
        </label>

        <label className="block">
          <span className={labelClass}>WhatsApp number (Order button)</span>
          <input value={form.whatsapp} onChange={(e) => update('whatsapp', e.target.value)} placeholder="Khali ho to Phone use hoga" className={inputClass} />
        </label>

        <label className="block sm:col-span-2">
          <span className={labelClass}>Timing</span>
          <input value={form.timing} onChange={(e) => update('timing', e.target.value)} placeholder="Mon-Sat, 9am - 9pm" className={inputClass} />
        </label>

        {/* Location — powers "near me" search */}
        <div className="rounded-xl border border-aline bg-white p-3.5 sm:col-span-2">
          <p className="mb-2.5 text-[0.85rem] font-semibold text-aink">Map location (nearby search ke liye zaroori)</p>
          <label className="mb-3 block">
            <span className="mb-1 block text-xs text-amuted">Google Maps link paste karein, phir &quot;Link se coordinates&quot; dabayein</span>
            <input value={form.map_link} onChange={(e) => update('map_link', e.target.value)} placeholder="https://www.google.com/maps/place/.../@29.39,71.68,17z" className={inputClass} />
          </label>
          <div className="grid grid-cols-2 gap-3">
            <label className="block">
              <span className="mb-1 block text-xs text-amuted">Latitude</span>
              <input value={form.latitude} onChange={(e) => update('latitude', e.target.value)} inputMode="decimal" placeholder="29.395600" className={inputClass} />
            </label>
            <label className="block">
              <span className="mb-1 block text-xs text-amuted">Longitude</span>
              <input value={form.longitude} onChange={(e) => update('longitude', e.target.value)} inputMode="decimal" placeholder="71.683600" className={inputClass} />
            </label>
          </div>
          <div className="mt-3 flex flex-wrap gap-2">
            <button type="button" onClick={fillFromMapLink} className={`${smallBtn} border-atl2/30 bg-atl2/10 text-atl2 hover:bg-atl2 hover:text-white`}>
              Link se coordinates
            </button>
            <button type="button" onClick={useMyLocation} disabled={locating} className={`${smallBtn} border-aline bg-white text-aink hover:bg-acream disabled:opacity-60`}>
              {locating ? 'Dhoond rahe hain...' : 'Meri current location'}
            </button>
          </div>
        </div>

        <ImageUploadField
          folder="directory"
          label="Business Photo"
          imageUrl={form.photo_url}
          onUploaded={(url) => update('photo_url', url)}
          onError={setError}
          onUploadingChange={setUploading}
        />

        <label className="block">
          <span className={labelClass}>Verification status</span>
          <select value={form.verification_status} onChange={(e) => update('verification_status', e.target.value)} className={inputClass}>
            {VERIFICATION_STATUSES.map((s) => (
              <option key={s.value} value={s.value}>
                {s.label}
              </option>
            ))}
          </select>
          <span className="mt-1 block text-xs text-amuted">&quot;Verified&quot; sirf khud check karne ke baad lagayein — badge public page par dikhta hai. Paid requests &quot;Verified Badges&quot; tab se approve karein.</span>
        </label>

        {form.verification_status === 'verified' && (
          <label className="block">
            <span className={labelClass}>Badge kab tak (khali = hamesha)</span>
            <input type="date" value={form.verified_until} onChange={(e) => update('verified_until', e.target.value)} className={inputClass} />
            <span className="mt-1 block text-xs text-amuted">Is tareekh ke baad badge khud hat jata hai.</span>
          </label>
        )}

        <label className="block">
          <span className={labelClass}>Display Order (chhota number pehle)</span>
          <input type="number" value={form.display_order} onChange={(e) => update('display_order', e.target.value)} placeholder="0" className={inputClass} />
        </label>

        <div className="flex flex-col gap-2.5 sm:col-span-2 sm:flex-row sm:gap-6">
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
            <button type="button" onClick={cancelEdit} className="inline-flex items-center gap-2 rounded-full border border-aline bg-white px-6 py-2.5 text-sm font-semibold text-aink transition hover:bg-acream">
              <CloseIcon className="h-4 w-4" />
              Cancel
            </button>
          )}
        </div>
      </form>

      <div className="mb-3 flex flex-wrap items-center justify-between gap-3">
        <p className="text-sm font-semibold text-aink">
          {rows.length} business{rows.length === 1 ? '' : 'es'}
          {rows.filter((r) => r.latitude == null).length > 0 && (
            <span className="ml-2 text-xs font-normal text-amber-700">({rows.filter((r) => r.latitude == null).length} ki map location nahi — nearby mein nahi aayengi)</span>
          )}
        </p>
        <input type="search" value={filter} onChange={(e) => setFilter(e.target.value)} placeholder="Naam / category / shehar se dhundein..." className={`${inputClass} sm:max-w-xs`} />
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
                    {row.verification_status && row.verification_status !== 'unverified' && (
                      <span className={`ml-2 rounded-full px-2 py-0.5 text-[10px] font-bold uppercase ${STATUS_STYLE[row.verification_status] || ''}`}>{row.verification_status}</span>
                    )}
                  </p>
                  <p className="truncate text-xs text-amuted">
                    {catName(row.category_id) || row.category || 'Category nahi'} · {cityName(row.city_id) || row.area || 'Shehar nahi'}
                    {row.phone ? ` · ${row.phone}` : ''}
                    {row.latitude == null ? ' · 📍 location nahi' : ''}
                  </p>
                </div>
              </div>

              <div className="flex flex-shrink-0 flex-wrap items-center gap-2">
                <button onClick={() => toggle(row, 'is_featured')} className={`${smallBtn} ${row.is_featured ? 'border-amber-300 bg-amber-50 text-amber-800' : 'border-aline bg-white text-amuted hover:bg-acream'}`}>
                  {row.is_featured ? '★ Featured' : '☆ Feature'}
                </button>
                <button onClick={() => toggle(row, 'is_active')} className={`${smallBtn} ${row.is_active ? 'border-atl2/30 bg-atl2/10 text-atl2' : 'border-aline bg-white text-amuted hover:bg-acream'}`}>
                  {row.is_active ? 'Visible' : 'Hidden'}
                </button>
                {row.is_active && (
                  <a href={`/directory/business/${row.slug || row.id}`} target="_blank" rel="noopener noreferrer" className={`${smallBtn} border-atl2/30 bg-atl2/10 text-atl2 hover:bg-atl2 hover:text-white`}>
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
