'use client';

import { useCallback, useEffect, useState } from 'react';
import { supabase } from '@/lib/supabaseClient';
import AdminCard from './AdminCard';
import { BriefcaseIcon } from './icons';

const smallBtn = 'flex items-center gap-1.5 rounded-full border px-3.5 py-1.5 text-xs font-semibold transition disabled:opacity-50';
const fmt = (d) => (d ? new Date(d).toLocaleString('en-GB', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' }) : '—');

// Admin → Business Directory → Approvals. New owner submissions wait here;
// nothing is public until the admin approves it.
export default function DirectoryApprovalsManager({ onReview, onChanged }) {
  const [rows, setRows] = useState(null);
  const [extra, setExtra] = useState({}); // id -> { email, pmdc, docs }
  const [busy, setBusy] = useState(null);
  const [error, setError] = useState('');

  const load = useCallback(async () => {
    const { data, error: err } = await supabase
      .from('businesses_table')
      .select('id, name, profile_type, category, city_id, area, photo_url, phone, whatsapp, short_description, submitted_at, created_at')
      .eq('listing_status', 'pending')
      .order('submitted_at', { ascending: true, nullsFirst: false });
    if (err) {
      setError(/column|does not exist/i.test(err.message) ? 'Pehle sql/add_owner_and_doctor.sql run karein.' : err.message);
      return setRows([]);
    }
    setRows(data || []);
    // owner email, PMDC number and document count for each (admin only)
    const info = {};
    await Promise.all(
      (data || []).map(async (b) => {
        const [em, reg, docs] = await Promise.all([
          supabase.rpc('directory_owner_email', { p_business_id: b.id }),
          b.profile_type === 'doctor' ? supabase.from('doctor_registration').select('pmdc_number').eq('business_id', b.id).maybeSingle() : Promise.resolve({ data: null }),
          b.profile_type === 'doctor' ? supabase.from('doctor_documents').select('id', { count: 'exact', head: true }).eq('business_id', b.id) : Promise.resolve({ count: 0 }),
        ]);
        info[b.id] = { email: em.data || '', pmdc: reg.data?.pmdc_number || '', docs: docs.count || 0 };
      })
    );
    setExtra(info);
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  async function decide(b, publish) {
    let note = null;
    if (!publish) {
      note = prompt('Reject karne ki wajah likhein (owner ko nazar aayegi):', '');
      if (note === null) return;
      if (!note.trim()) return setError('Reject karne ke liye wajah likhna zaroori hai, taake owner theek kar sake.');
    } else if (!confirm(`"${b.name}" ko publish karna hai? Yeh website par live ho jayega.`)) return;
    setBusy(b.id);
    setError('');
    const patch = publish ? { listing_status: 'published', admin_note: null } : { listing_status: 'rejected', admin_note: note.trim() };
    const { data, error: err } = await supabase.from('businesses_table').update(patch).eq('id', b.id).select('id');
    setBusy(null);
    if (err) return setError(err.message);
    if (!data?.length) return setError('Change nahi hua — logout karke dobara login karein.');
    setRows((r) => r.filter((x) => x.id !== b.id));
    onChanged?.();
  }

  return (
    <AdminCard title={`Approvals${rows?.length ? ` (${rows.length})` : ''}`} description="Business owners ki nayi profiles. Pehle poori profile dekhein, phir Approve ya Reject karein. Approve karne par hi website par live hoti hain." icon={BriefcaseIcon}>
      {error && <p className="mb-4 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-600">{error}</p>}
      {rows === null ? (
        <p className="py-6 text-sm text-amuted">Load ho raha hai...</p>
      ) : rows.length === 0 ? (
        <p className="py-8 text-center text-sm text-amuted">Koi profile approval ka intezar nahi kar rahi. 🎉</p>
      ) : (
        <ul className="flex flex-col gap-3">
          {rows.map((b) => {
            const x = extra[b.id] || {};
            return (
              <li key={b.id} className="rounded-xl border border-aline bg-white p-4 text-sm text-aink">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div className="flex min-w-0 items-start gap-3">
                    {b.photo_url && <img src={b.photo_url} alt="" className="h-14 w-14 flex-shrink-0 rounded-lg object-cover" />}
                    <div className="min-w-0">
                      <p className="font-semibold">
                        {b.name}
                        {b.profile_type === 'doctor' && <span className="ml-2 rounded-full bg-sky-100 px-2 py-0.5 text-[10px] font-bold text-sky-700">DOCTOR</span>}
                      </p>
                      <p className="mt-0.5 text-xs text-amuted">
                        {b.category || '—'} · {b.phone || b.whatsapp || 'phone nahi'} · Bheji gayi: {fmt(b.submitted_at || b.created_at)}
                      </p>
                      <p className="mt-0.5 text-xs text-amuted">
                        Owner: {x.email || '—'}
                        {b.profile_type === 'doctor' && ` · PMDC: ${x.pmdc || 'nahi diya'} · Documents: ${x.docs ?? 0}`}
                      </p>
                      {b.short_description && <p className="mt-1 line-clamp-2 text-xs">{b.short_description}</p>}
                    </div>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <button type="button" onClick={() => onReview(b.id)} className={`${smallBtn} border-aline bg-white text-aink hover:bg-acream`}>Poori profile dekhein</button>
                    <button type="button" disabled={busy === b.id} onClick={() => decide(b, true)} className={`${smallBtn} border-emerald-300 bg-emerald-50 text-emerald-700 hover:bg-emerald-600 hover:text-white`}>Approve</button>
                    <button type="button" disabled={busy === b.id} onClick={() => decide(b, false)} className={`${smallBtn} border-red-200 bg-red-50 text-red-600 hover:bg-red-600 hover:text-white`}>Reject</button>
                  </div>
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </AdminCard>
  );
}
