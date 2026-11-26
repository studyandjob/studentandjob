'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { supabase } from '@/lib/supabaseClient';
import AdminCard from './AdminCard';
import { BriefcaseIcon, PlusIcon } from './icons';

const smallBtn = 'flex items-center gap-1.5 rounded-full border px-3.5 py-1.5 text-xs font-semibold transition';
const inputClass = 'w-full rounded-[10px] border border-aline bg-[#FCFAF6] px-3.5 py-3 text-[0.93rem] text-aink outline-none focus:border-atl2 sm:max-w-xs';
const LISTING = {
  draft: 'bg-gray-200 text-gray-700',
  pending: 'bg-amber-100 text-amber-800',
  published: 'bg-emerald-100 text-emerald-800',
  rejected: 'bg-red-100 text-red-700',
};
const PMDC = { pending: 'bg-amber-50 text-amber-700', verified: 'bg-sky-100 text-sky-700', rejected: 'bg-red-50 text-red-600' };

// Admin → Business Directory → Doctors: every doctor profile, with full edit.
export default function DirectoryDoctorsManager({ onEdit, onNew }) {
  const [rows, setRows] = useState(null);
  const [reg, setReg] = useState({});
  const [filter, setFilter] = useState('');
  const [error, setError] = useState('');

  const load = useCallback(async () => {
    const [b, r] = await Promise.all([
      supabase.from('businesses_table').select('id, name, slug, photo_url, listing_status, is_featured, category, area, updated_at').eq('profile_type', 'doctor').order('updated_at', { ascending: false }),
      supabase.from('doctor_registration').select('business_id, pmdc_number, verification_status'),
    ]);
    if (b.error) {
      setError(/column|does not exist/i.test(b.error.message) ? 'Pehle sql/add_owner_and_doctor.sql run karein.' : b.error.message);
      return setRows([]);
    }
    setRows(b.data || []);
    setReg(Object.fromEntries((r.data || []).map((x) => [x.business_id, x])));
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  async function remove(b) {
    if (!confirm(`"${b.name}" ki poori doctor profile (clinics, FAQs, documents ke records samet) delete karni hai? Yeh wapis nahi ho sakta.`)) return;
    const { data, error: err } = await supabase.from('businesses_table').delete().eq('id', b.id).select('id');
    if (err) return setError(err.message);
    if (!data?.length) return setError('Delete nahi hua — logout karke dobara login karein.');
    setRows((r) => r.filter((x) => x.id !== b.id));
  }

  const shown = useMemo(() => {
    const q = filter.trim().toLowerCase();
    return (rows || []).filter((b) => !q || [b.name, reg[b.id]?.pmdc_number, b.area].filter(Boolean).some((v) => String(v).toLowerCase().includes(q)));
  }, [rows, filter, reg]);

  return (
    <AdminCard title="Doctor Profiles" description="Sab doctor profiles — poora form edit karein, PMDC verify karein, publish ya reject karein." icon={BriefcaseIcon}>
      {error && <p className="mb-4 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-600">{error}</p>}
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <button type="button" onClick={onNew} className="inline-flex items-center gap-2 rounded-full px-5 py-2.5 text-sm font-semibold text-white" style={{ background: 'linear-gradient(135deg, #1E8449, #2E5AAC)' }}>
          <PlusIcon className="h-4 w-4" /> Nayi doctor profile (admin ki taraf se)
        </button>
        <input type="search" value={filter} onChange={(e) => setFilter(e.target.value)} placeholder="Naam / PMDC / shehar..." className={inputClass} />
      </div>

      {rows === null ? (
        <p className="py-6 text-sm text-amuted">Load ho raha hai...</p>
      ) : shown.length === 0 ? (
        <p className="py-8 text-center text-sm text-amuted">{rows.length === 0 ? 'Abhi koi doctor profile nahi.' : 'Koi match nahi mila.'}</p>
      ) : (
        <ul className="flex flex-col gap-2.5">
          {shown.map((b) => {
            const r = reg[b.id];
            return (
              <li key={b.id} className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-aline bg-white px-4 py-3 text-sm text-aink">
                <div className="flex min-w-0 flex-1 items-center gap-3">
                  {b.photo_url ? <img src={b.photo_url} alt="" className="h-12 w-12 flex-shrink-0 rounded-lg object-cover" /> : <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-lg bg-atl2/10 text-atl2"><BriefcaseIcon className="h-5 w-5" /></div>}
                  <div className="min-w-0">
                    <p className="truncate font-semibold">
                      {b.name}
                      {b.is_featured && <span className="ml-2 rounded-full bg-amber-100 px-2 py-0.5 text-[10px] font-bold text-amber-800">★ FEATURED</span>}
                    </p>
                    <p className="mt-0.5 flex flex-wrap items-center gap-1.5 text-xs text-amuted">
                      <span className={`rounded-full px-2 py-0.5 text-[10px] font-bold uppercase ${LISTING[b.listing_status] || ''}`}>{b.listing_status}</span>
                      <span className={`rounded-full px-2 py-0.5 text-[10px] font-bold uppercase ${PMDC[r?.verification_status || 'pending']}`}>PMDC {r?.verification_status || 'pending'}</span>
                      <span>{r?.pmdc_number || 'PMDC number nahi'} · {b.area || '—'}</span>
                    </p>
                  </div>
                </div>
                <div className="flex flex-wrap gap-2">
                  {b.listing_status === 'published' && (
                    <a href={`/directory/business/${b.slug || b.id}`} target="_blank" rel="noopener noreferrer" className={`${smallBtn} border-atl2/30 bg-atl2/10 text-atl2 hover:bg-atl2 hover:text-white`}>View</a>
                  )}
                  <button type="button" onClick={() => onEdit(b.id)} className={`${smallBtn} border-aline bg-white text-aink hover:bg-acream`}>Poora edit</button>
                  <button type="button" onClick={() => remove(b)} className={`${smallBtn} border-red-200 bg-red-50 text-red-600 hover:bg-red-600 hover:text-white`}>Delete</button>
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </AdminCard>
  );
}
