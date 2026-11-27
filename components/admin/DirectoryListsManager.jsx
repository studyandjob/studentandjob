'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { supabase } from '@/lib/supabaseClient';
import AdminCard from './AdminCard';
import { BriefcaseIcon } from './icons';
import { isVerified } from '@/lib/directory';

const smallBtn = 'flex items-center gap-1.5 rounded-full border px-3.5 py-1.5 text-xs font-semibold transition disabled:opacity-50';
const inputClass = 'w-full rounded-[10px] border border-aline bg-[#FCFAF6] px-3.5 py-3 text-[0.93rem] text-aink outline-none focus:border-atl2 sm:max-w-xs';
const PAGE = 30;

const STATUS_STYLE = {
  draft: 'bg-gray-200 text-gray-700',
  pending: 'bg-amber-100 text-amber-800',
  published: 'bg-emerald-100 text-emerald-800',
  rejected: 'bg-red-100 text-red-700',
  banned: 'bg-gray-800 text-white',
};
const STATUS_LABEL = { draft: 'Draft', pending: 'Waiting approval', published: 'Approved', rejected: 'Rejected', banned: 'Banned' };

// The six lists — same idea as the member lists in the other admin panel.
const LISTS = [
  { id: 'all', label: 'All Business', tone: 'text-aink', test: () => true },
  { id: 'waiting', label: 'Waiting Approval', tone: 'text-amber-700', test: (b) => b.listing_status === 'pending' },
  { id: 'approved', label: 'Approved', tone: 'text-emerald-700', test: (b) => b.listing_status === 'published' },
  { id: 'verified', label: 'Verified', tone: 'text-sky-700', test: (b) => b.listing_status === 'published' && isVerified(b) },
  { id: 'featured', label: 'Featured', tone: 'text-amber-600', test: (b) => b.is_featured },
  { id: 'banned', label: 'Banned', tone: 'text-red-700', test: (b) => b.listing_status === 'banned' },
];

const EMPTY_TEXT = {
  all: 'Abhi koi business nahi.',
  waiting: 'Koi business approval ka intezar nahi kar raha. 🎉',
  approved: 'Abhi koi approved business nahi.',
  verified: 'Abhi koi verified business nahi. (Verified badge "Verified Badges" tab se milta hai.)',
  featured: 'Koi featured business nahi.',
  banned: 'Koi banned business nahi.',
};

const fmt = (d) => (d ? new Date(d).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }) : '—');

// Admin → Business Directory → Business Lists
export default function DirectoryListsManager({ cities = [], onReview, onChanged }) {
  const [rows, setRows] = useState(null);
  const [list, setList] = useState('all');
  const [filter, setFilter] = useState('');
  const [limit, setLimit] = useState(PAGE);
  const [busy, setBusy] = useState(null);
  const [error, setError] = useState('');
  const [note, setNote] = useState('');
  const [owners, setOwners] = useState({}); // id -> email (waiting list only)

  const load = useCallback(async () => {
    const { data, error: err } = await supabase
      .from('businesses_table')
      .select('id, name, slug, photo_url, profile_type, category, area, city_id, phone, whatsapp, listing_status, is_featured, is_active, verification_status, verified_until, owner_id, admin_note, submitted_at, created_at, updated_at')
      .order('updated_at', { ascending: false })
      .limit(3000);
    if (err) {
      setError(/column|does not exist/i.test(err.message) ? 'Pehle sql/add_owner_and_doctor.sql (aur add_banned_status.sql) run karein.' : err.message);
      return setRows([]);
    }
    setRows(data || []);
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const counts = useMemo(() => Object.fromEntries(LISTS.map((l) => [l.id, (rows || []).filter(l.test).length])), [rows]);
  const cityName = (id) => cities.find((c) => c.id === id)?.name;

  const shown = useMemo(() => {
    const def = LISTS.find((l) => l.id === list);
    const q = filter.trim().toLowerCase();
    return (rows || [])
      .filter(def.test)
      .filter((b) => !q || [b.name, b.phone, b.whatsapp, b.category, b.area, cityName(b.city_id)].filter(Boolean).some((v) => String(v).toLowerCase().includes(q)));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [rows, list, filter, cities]);

  // Owner emails for the waiting list (admin-only lookup)
  useEffect(() => {
    if (list !== 'waiting') return;
    const missing = shown.slice(0, limit).filter((b) => b.owner_id && owners[b.id] === undefined);
    if (!missing.length) return;
    let alive = true;
    (async () => {
      const found = {};
      await Promise.all(missing.map(async (b) => {
        const { data } = await supabase.rpc('directory_owner_email', { p_business_id: b.id });
        found[b.id] = data || '';
      }));
      if (alive) setOwners((o) => ({ ...o, ...found }));
    })();
    return () => {
      alive = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [list, shown, limit]);

  async function patch(b, changes, okMsg) {
    setBusy(b.id);
    setError('');
    setNote('');
    const { data, error: err } = await supabase.from('businesses_table').update(changes).eq('id', b.id).select('*');
    setBusy(null);
    if (err) return setError(err.message);
    if (!data?.length) return setError('Change nahi hua — logout karke dobara login karein.');
    setRows((r) => r.map((x) => (x.id === b.id ? { ...x, ...data[0] } : x)));
    if (okMsg) setNote(okMsg);
    onChanged?.();
  }

  const approve = (b) => confirm(`"${b.name}" ko approve karna hai? Yeh website par live ho jayega.`) && patch(b, { listing_status: 'published', admin_note: null }, `"${b.name}" approve ho gaya.`);

  function reject(b) {
    const why = prompt('Reject karne ki wajah likhein (owner ko dikhegi):', '');
    if (why === null) return;
    if (!why.trim()) return setError('Reject karne ke liye wajah likhna zaroori hai, taake owner theek kar sake.');
    patch(b, { listing_status: 'rejected', admin_note: why.trim() }, `"${b.name}" reject ho gaya.`);
  }

  function ban(b) {
    const why = prompt(`"${b.name}" ko ban karne ki wajah (owner ko dikhegi):`, '');
    if (why === null) return;
    patch(b, { listing_status: 'banned', admin_note: why.trim() || 'Policy ki khilaf warzi', is_featured: false }, `"${b.name}" ban ho gaya — website se hat gaya.`);
  }

  const unban = (b) => confirm(`"${b.name}" ka ban hataya jaye? Yeh dobara website par nazar aane lagega.`) && patch(b, { listing_status: 'published', admin_note: null }, `"${b.name}" ka ban hat gaya.`);
  const toggleFeatured = (b) => patch(b, { is_featured: !b.is_featured }, b.is_featured ? 'Featured hata diya.' : 'Featured kar diya.');
  const removeBadge = (b) => confirm(`"${b.name}" ka Verified badge hata dein?`) && patch(b, { verification_status: 'unverified', verified_until: null }, 'Verified badge hat gaya.');

  async function remove(b) {
    if (!confirm(`"${b.name}" ko hamesha ke liye delete karna hai? Yeh wapis nahi ho sakta.`)) return;
    setBusy(b.id);
    const { data, error: err } = await supabase.from('businesses_table').delete().eq('id', b.id).select('id');
    setBusy(null);
    if (err) return setError(err.message);
    if (!data?.length) return setError('Delete nahi hua — logout karke dobara login karein.');
    setRows((r) => r.filter((x) => x.id !== b.id));
    onChanged?.();
  }

  return (
    <AdminCard title="Business Lists" description="Sab businesses alag alag lists mein — upar ke kisi box par click karke list badlein." icon={BriefcaseIcon}>
      {/* the six lists, with counts */}
      <div className="mb-5 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
        {LISTS.map((l) => {
          const active = list === l.id;
          return (
            <button
              key={l.id}
              type="button"
              onClick={() => { setList(l.id); setLimit(PAGE); }}
              aria-pressed={active}
              className={`rounded-xl border px-3 py-3 text-left transition ${active ? 'border-atl2 bg-atl2/10 shadow-sm' : 'border-aline bg-white hover:bg-acream'}`}
            >
              <span className={`block text-2xl font-extrabold leading-none ${l.tone}`}>{rows ? counts[l.id] : '…'}</span>
              <span className="mt-1.5 block text-xs font-semibold text-aink">{l.label}</span>
            </button>
          );
        })}
      </div>

      {error && <p className="mb-4 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-600">{error}</p>}
      {note && !error && <p className="mb-4 rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm text-emerald-700">{note}</p>}

      <div className="mb-3 flex flex-wrap items-center justify-between gap-3">
        <p className="text-sm font-semibold text-aink">
          {LISTS.find((l) => l.id === list).label}: {shown.length}
        </p>
        <input type="search" value={filter} onChange={(e) => { setFilter(e.target.value); setLimit(PAGE); }} placeholder="Naam / phone / category / shehar..." className={inputClass} />
      </div>

      {rows === null ? (
        <p className="py-8 text-center text-sm text-amuted">Load ho raha hai...</p>
      ) : shown.length === 0 ? (
        <p className="py-8 text-center text-sm text-amuted">{rows.length && filter ? 'Koi match nahi mila.' : EMPTY_TEXT[list]}</p>
      ) : (
        <>
          <ul className="flex flex-col gap-2.5">
            {shown.slice(0, limit).map((b) => {
              const verified = isVerified(b);
              const status = b.listing_status;
              return (
                <li key={b.id} className={`flex flex-wrap items-center justify-between gap-3 rounded-xl border border-aline bg-white px-4 py-3 text-sm text-aink ${b.is_active ? '' : 'opacity-60'}`}>
                  <div className="flex min-w-0 flex-1 items-center gap-3">
                    {b.photo_url ? (
                      <img src={b.photo_url} alt="" className="h-12 w-12 flex-shrink-0 rounded-lg border border-aline object-cover" />
                    ) : (
                      <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-lg bg-atl2/10 text-atl2"><BriefcaseIcon className="h-5 w-5" /></div>
                    )}
                    <div className="min-w-0">
                      <p className="flex flex-wrap items-center gap-1.5 font-semibold">
                        <span className="truncate">{b.name}</span>
                        <span className={`rounded-full px-2 py-0.5 text-[10px] font-bold uppercase ${STATUS_STYLE[status] || ''}`}>{STATUS_LABEL[status] || status}</span>
                        {b.is_featured && <span className="rounded-full bg-amber-100 px-2 py-0.5 text-[10px] font-bold text-amber-800">★ FEATURED</span>}
                        {verified && <span className="rounded-full bg-sky-100 px-2 py-0.5 text-[10px] font-bold text-sky-700">✓ VERIFIED{b.verified_until ? ` · ${fmt(b.verified_until)} tak` : ''}</span>}
                        {b.profile_type === 'doctor' && <span className="rounded-full bg-violet-100 px-2 py-0.5 text-[10px] font-bold text-violet-700">DOCTOR</span>}
                        {!b.is_active && <span className="rounded-full bg-gray-200 px-2 py-0.5 text-[10px] font-bold text-gray-600">HIDDEN</span>}
                      </p>
                      <p className="mt-0.5 truncate text-xs text-amuted">
                        {b.category || 'Category nahi'} · {cityName(b.city_id) || b.area || 'Shehar nahi'} · {b.phone || b.whatsapp || 'phone nahi'}
                      </p>
                      <p className="mt-0.5 truncate text-xs text-amuted">
                        {b.owner_id ? `Owner: ${list === 'waiting' ? owners[b.id] || '…' : 'user account'}` : 'Admin ne add kiya'} · Update: {fmt(b.updated_at)}
                      </p>
                      {(status === 'rejected' || status === 'banned') && b.admin_note && <p className="mt-0.5 text-xs font-medium text-red-600">Wajah: {b.admin_note}</p>}
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center gap-2">
                    {status === 'published' && (
                      <a href={`/directory/business/${b.slug || b.id}`} target="_blank" rel="noopener noreferrer" className={`${smallBtn} border-atl2/30 bg-atl2/10 text-atl2 hover:bg-atl2 hover:text-white`}>View</a>
                    )}
                    <button type="button" onClick={() => onReview(b.id)} className={`${smallBtn} border-aline bg-white text-aink hover:bg-acream`}>{status === 'pending' ? 'Poori profile dekhein' : 'Poora form'}</button>
                    {status === 'pending' && (
                      <>
                        <button type="button" disabled={busy === b.id} onClick={() => approve(b)} className={`${smallBtn} border-emerald-300 bg-emerald-50 text-emerald-700 hover:bg-emerald-600 hover:text-white`}>Approve</button>
                        <button type="button" disabled={busy === b.id} onClick={() => reject(b)} className={`${smallBtn} border-red-200 bg-red-50 text-red-600 hover:bg-red-600 hover:text-white`}>Reject</button>
                      </>
                    )}
                    {status === 'published' && (
                      <button type="button" disabled={busy === b.id} onClick={() => toggleFeatured(b)} className={`${smallBtn} ${b.is_featured ? 'border-amber-300 bg-amber-50 text-amber-800' : 'border-aline bg-white text-amuted hover:bg-acream'}`}>
                        {b.is_featured ? '★ Featured' : '☆ Feature'}
                      </button>
                    )}
                    {status === 'published' && verified && (
                      <button type="button" disabled={busy === b.id} onClick={() => removeBadge(b)} className={`${smallBtn} border-aline bg-white text-aink hover:bg-acream`}>Badge hatayein</button>
                    )}
                    {status === 'banned' ? (
                      <button type="button" disabled={busy === b.id} onClick={() => unban(b)} className={`${smallBtn} border-emerald-300 bg-emerald-50 text-emerald-700 hover:bg-emerald-600 hover:text-white`}>Unban</button>
                    ) : (
                      <button type="button" disabled={busy === b.id} onClick={() => ban(b)} className={`${smallBtn} border-red-200 bg-red-50 text-red-600 hover:bg-red-600 hover:text-white`}>Ban</button>
                    )}
                    <button type="button" disabled={busy === b.id} onClick={() => remove(b)} className={`${smallBtn} border-aline bg-white text-amuted hover:border-red-200 hover:text-red-600`}>Delete</button>
                  </div>
                </li>
              );
            })}
          </ul>
          {shown.length > limit && (
            <div className="mt-5 text-center">
              <button type="button" onClick={() => setLimit((n) => n + PAGE)} className="rounded-full border border-aline bg-white px-6 py-2.5 text-sm font-semibold text-aink hover:bg-acream">
                Mazeed dikhayein ({shown.length - limit} baqi)
              </button>
            </div>
          )}
        </>
      )}
    </AdminCard>
  );
}
