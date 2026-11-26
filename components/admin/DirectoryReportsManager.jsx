'use client';

import { useCallback, useEffect, useState } from 'react';
import { supabase } from '@/lib/supabaseClient';
import AdminCard from './AdminCard';
import { BriefcaseIcon } from './icons';

const smallBtn = 'flex items-center gap-1.5 rounded-full border px-3.5 py-1.5 text-xs font-semibold transition disabled:opacity-50';
const REASON = { wrong_info: 'Maloomat ghalat', closed: 'Band ho chuka', fake: 'Jaali listing', inappropriate: 'Nazeba mawad', other: 'Koi aur wajah' };
const fmt = (d) => (d ? new Date(d).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }) : '—');

// Admin → Business Directory → Reports & Claims.
export default function DirectoryReportsManager() {
  const [tab, setTab] = useState('reports');
  const [reports, setReports] = useState(null);
  const [claims, setClaims] = useState(null);
  const [busy, setBusy] = useState(null);
  const [error, setError] = useState('');
  const [note, setNote] = useState('');

  const load = useCallback(async () => {
    const [r, c] = await Promise.all([
      supabase.from('listing_reports').select('*, businesses_table(id, name, slug, is_active)').eq('status', 'open').order('created_at', { ascending: false }),
      supabase.from('claim_requests').select('*, businesses_table(id, name, slug)').eq('status', 'pending').order('created_at', { ascending: false }),
    ]);
    const bad = r.error || c.error;
    if (bad) setError(/does not exist/i.test(bad.message) ? 'Pehle sql/add_owner_and_doctor.sql run karein.' : bad.message);
    setReports(r.data || []);
    setClaims(c.data || []);
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  async function closeReport(rep, status) {
    setBusy(rep.id);
    setError('');
    const { data, error: err } = await supabase.from('listing_reports').update({ status }).eq('id', rep.id).select('id');
    setBusy(null);
    if (err) return setError(err.message);
    if (!data?.length) return setError('Change nahi hua — logout karke dobara login karein.');
    setReports((x) => x.filter((r) => r.id !== rep.id));
  }

  async function hideListing(rep) {
    if (!confirm(`"${rep.businesses_table?.name}" ko website se chhupana hai? (Baad mein Businesses tab se wapis la sakte hain.)`)) return;
    const { data, error: err } = await supabase.from('businesses_table').update({ is_active: false }).eq('id', rep.business_id).select('id');
    if (err) return setError(err.message);
    if (!data?.length) return setError('Change nahi hua — logout karke dobara login karein.');
    setNote('Listing chhupa di gayi.');
    load();
  }

  async function approveClaim(cl) {
    if (!confirm(`"${cl.businesses_table?.name}" ko ${cl.claimant_name} ke account se jorna hai? Pehle un ki shanakht khud check kar lein (phone: ${cl.phone}).`)) return;
    setBusy(cl.id);
    setError('');
    const { error: err } = await supabase.rpc('directory_approve_claim', { p_request_id: cl.id });
    setBusy(null);
    if (err) return setError(err.message);
    setNote('Claim approve ho gaya — ab yeh profile us owner ke dashboard mein hai.');
    load();
  }

  async function rejectClaim(cl) {
    setBusy(cl.id);
    const { data, error: err } = await supabase.from('claim_requests').update({ status: 'rejected', reviewed_at: new Date().toISOString() }).eq('id', cl.id).eq('status', 'pending').select('id');
    setBusy(null);
    if (err) return setError(err.message);
    if (!data?.length) return setError('Reject nahi hua — request pehle hi review ho chuki hai.');
    setClaims((x) => x.filter((c) => c.id !== cl.id));
  }

  const tabBtn = (id, label, n) => (
    <button type="button" onClick={() => setTab(id)} className={`rounded-full border px-4 py-1.5 text-sm font-semibold transition ${tab === id ? 'border-atl2 bg-atl2 text-white' : 'border-aline bg-white text-aink hover:bg-acream'}`}>
      {label}
      {n > 0 ? ` (${n})` : ''}
    </button>
  );

  return (
    <AdminCard title="Reports & Claims" description="Visitors ki shikayaat aur business owners ke claim requests." icon={BriefcaseIcon}>
      {error && <p className="mb-4 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-600">{error}</p>}
      {note && !error && <p className="mb-4 rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm text-emerald-700">{note}</p>}
      <div className="mb-4 flex flex-wrap gap-2">
        {tabBtn('reports', 'Reports', reports?.length || 0)}
        {tabBtn('claims', 'Claim requests', claims?.length || 0)}
      </div>

      {tab === 'reports' &&
        (reports === null ? (
          <p className="py-6 text-sm text-amuted">Load ho raha hai...</p>
        ) : reports.length === 0 ? (
          <p className="py-8 text-center text-sm text-amuted">Koi khula report nahi.</p>
        ) : (
          <ul className="flex flex-col gap-3">
            {reports.map((r) => (
              <li key={r.id} className="rounded-xl border border-aline bg-white p-4 text-sm text-aink">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="font-semibold">
                      <a href={`/directory/business/${r.businesses_table?.slug || r.business_id}`} target="_blank" rel="noopener noreferrer" className="text-atl2 hover:underline">{r.businesses_table?.name || 'Business'}</a>
                      <span className="ml-2 rounded-full bg-amber-100 px-2 py-0.5 text-[10px] font-bold text-amber-800">{REASON[r.reason] || r.reason}</span>
                    </p>
                    {r.details && <p className="mt-1 whitespace-pre-line text-xs">{r.details}</p>}
                    <p className="mt-1 text-xs text-amuted">{fmt(r.created_at)}{r.contact ? ` · Rabta: ${r.contact}` : ''}</p>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <button type="button" disabled={busy === r.id} onClick={() => closeReport(r, 'resolved')} className={`${smallBtn} border-emerald-300 bg-emerald-50 text-emerald-700 hover:bg-emerald-600 hover:text-white`}>Hal ho gaya</button>
                    <button type="button" disabled={busy === r.id} onClick={() => closeReport(r, 'dismissed')} className={`${smallBtn} border-aline bg-white text-aink hover:bg-acream`}>Nazar andaz</button>
                    {r.businesses_table?.is_active && (
                      <button type="button" onClick={() => hideListing(r)} className={`${smallBtn} border-red-200 bg-red-50 text-red-600 hover:bg-red-600 hover:text-white`}>Listing chhupayein</button>
                    )}
                  </div>
                </div>
              </li>
            ))}
          </ul>
        ))}

      {tab === 'claims' &&
        (claims === null ? (
          <p className="py-6 text-sm text-amuted">Load ho raha hai...</p>
        ) : claims.length === 0 ? (
          <p className="py-8 text-center text-sm text-amuted">Koi claim request intezar mein nahi.</p>
        ) : (
          <ul className="flex flex-col gap-3">
            {claims.map((c) => (
              <li key={c.id} className="rounded-xl border border-aline bg-white p-4 text-sm text-aink">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="font-semibold">
                      <a href={`/directory/business/${c.businesses_table?.slug || c.business_id}`} target="_blank" rel="noopener noreferrer" className="text-atl2 hover:underline">{c.businesses_table?.name || 'Business'}</a>
                    </p>
                    <p className="mt-1 text-xs text-amuted">{c.claimant_name} · {c.phone} · {fmt(c.created_at)}</p>
                    {c.message && <p className="mt-1 whitespace-pre-line text-xs">&quot;{c.message}&quot;</p>}
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <button type="button" disabled={busy === c.id} onClick={() => approveClaim(c)} className={`${smallBtn} border-emerald-300 bg-emerald-50 text-emerald-700 hover:bg-emerald-600 hover:text-white`}>Approve</button>
                    <button type="button" disabled={busy === c.id} onClick={() => rejectClaim(c)} className={`${smallBtn} border-red-200 bg-red-50 text-red-600 hover:bg-red-600 hover:text-white`}>Reject</button>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        ))}
    </AdminCard>
  );
}
