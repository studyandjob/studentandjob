'use client';

import { useCallback, useEffect, useState } from 'react';
import { supabase } from '@/lib/supabaseClient';
import AdminCard from './AdminCard';
import { BriefcaseIcon, SaveIcon } from './icons';
import { PAYMENT_METHODS, isVerified } from '@/lib/directory';

const inputClass =
  'w-full rounded-[10px] border border-aline bg-[#FCFAF6] px-3.5 py-3 text-[0.93rem] text-aink outline-none transition focus:border-atl2 focus:ring-[3px] focus:ring-atl2/10';
const labelClass = 'mb-1.5 block text-[0.85rem] font-semibold text-aink';
const smallBtn = 'flex items-center gap-1.5 rounded-full border px-3.5 py-1.5 text-xs font-semibold transition disabled:opacity-50';

const FILTERS = [
  { id: 'pending', label: 'Pending' },
  { id: 'approved', label: 'Approved' },
  { id: 'rejected', label: 'Rejected' },
];

const fmtDate = (d) => (d ? new Date(d).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }) : '—');

// Admin → Business Directory → Verified Badges:
//  1) price / duration / payment details shown on the public "Get Verified" form
//  2) incoming requests — check the payment in your JazzCash/Easypaisa/bank app,
//     then Approve (badge starts, auto-expires) or Reject.
export default function DirectoryVerificationManager() {
  const [settings, setSettings] = useState(null);
  const [requests, setRequests] = useState([]);
  const [filter, setFilter] = useState('pending');
  const [loading, setLoading] = useState(true);
  const [busyId, setBusyId] = useState(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [note, setNote] = useState('');
  const [months, setMonths] = useState({}); // per-request override

  const load = useCallback(async () => {
    setLoading(true);
    const [s, r] = await Promise.all([
      supabase.from('directory_settings').select('*').eq('id', 1).maybeSingle(),
      supabase
        .from('verification_requests')
        .select('*, businesses_table(id, name, slug, verification_status, verified_until)')
        .order('created_at', { ascending: false })
        .limit(200),
    ]);
    if (s.error || r.error) {
      setError(
        (s.error || r.error).message.includes('does not exist')
          ? 'Tables nahi mili — pehle sql/add_verified_badges.sql Supabase mein run karein.'
          : (s.error || r.error).message
      );
    }
    setSettings(s.data || null);
    setRequests(r.data || []);
    setLoading(false);
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  function setField(k, v) {
    setSettings((p) => ({ ...p, [k]: v }));
  }

  async function saveSettings(e) {
    e.preventDefault();
    setSaving(true);
    setError('');
    setNote('');
    const payload = {
      id: 1,
      verified_enabled: Boolean(settings.verified_enabled),
      verified_price: Math.max(0, Number(settings.verified_price) || 0),
      verified_months: Math.min(120, Math.max(1, Number(settings.verified_months) || 12)),
      account_title: settings.account_title?.trim() || null,
      jazzcash_number: settings.jazzcash_number?.trim() || null,
      easypaisa_number: settings.easypaisa_number?.trim() || null,
      bank_details: settings.bank_details?.trim() || null,
      extra_instructions: settings.extra_instructions?.trim() || null,
      updated_at: new Date().toISOString(),
    };
    const { data, error: err } = await supabase.from('directory_settings').upsert(payload).select();
    setSaving(false);
    if (err) return setError(err.message);
    if (!data?.length) return setError('Save nahi hua — logout karke dobara login karein.');
    setSettings(data[0]);
    setNote('Settings save ho gayi.');
  }

  async function approve(req) {
    const m = Number(months[req.id]) || req.plan_months || settings?.verified_months || 12;
    if (!confirm(`"${req.businesses_table?.name}" ko ${m} mahine ke liye Verified karna hai? Pehle payment (TX: ${req.transaction_id}) apne account mein check kar lein.`)) return;
    setBusyId(req.id);
    setError('');
    setNote('');
    const { data, error: err } = await supabase.rpc('directory_approve_verification', { p_request_id: req.id, p_months: m });
    setBusyId(null);
    if (err) return setError(err.message);
    setNote(`Approve ho gaya — badge ${fmtDate(data)} tak chalega.`);
    load();
  }

  async function reject(req) {
    const reason = prompt('Reject karne ki wajah (optional, sirf aap ko nazar aayegi):', '');
    if (reason === null) return;
    setBusyId(req.id);
    setError('');
    const { data, error: err } = await supabase
      .from('verification_requests')
      .update({ status: 'rejected', admin_note: reason.trim() || null, reviewed_at: new Date().toISOString() })
      .eq('id', req.id)
      .eq('status', 'pending')
      .select();
    setBusyId(null);
    if (err) return setError(err.message);
    if (!data?.length) return setError('Reject nahi hua — request pehle hi review ho chuki hai ya session expire ho gaya.');
    load();
  }

  async function removeBadge(business) {
    if (!confirm(`"${business.name}" ka Verified badge hata dein?`)) return;
    const { data, error: err } = await supabase
      .from('businesses_table')
      .update({ verification_status: 'unverified', verified_until: null })
      .eq('id', business.id)
      .select();
    if (err) return setError(err.message);
    if (!data?.length) return setError('Change nahi hua — logout karke dobara login karein.');
    load();
  }

  const shown = requests.filter((r) => r.status === filter);
  const pendingCount = requests.filter((r) => r.status === 'pending').length;
  const methodLabel = (v) => PAYMENT_METHODS.find((m) => m.value === v)?.label || v;

  return (
    <div className="flex flex-col gap-5">
      <AdminCard
        title="Verified Badge — Qeemat aur Payment"
        description="Yeh maloomat business page ke 'Get Verified' form mein dikhti hain. Payment aap ke apne JazzCash / Easypaisa / bank account mein aati hai."
        icon={BriefcaseIcon}
      >
        {error && <p className="mb-4 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-600">{error}</p>}
        {note && !error && <p className="mb-4 rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm text-emerald-700">{note}</p>}

        {loading && !settings ? (
          <p className="py-4 text-sm text-amuted">Load ho raha hai...</p>
        ) : !settings ? (
          <p className="py-4 text-sm text-amuted">Settings nahi mili. sql/add_verified_badges.sql run karein.</p>
        ) : (
          <form onSubmit={saveSettings} className="grid grid-cols-1 gap-3.5 rounded-xl bg-[#F5F9F8] p-4 sm:grid-cols-2">
            <label className="flex items-center gap-2.5 text-sm font-medium text-aink sm:col-span-2">
              <input type="checkbox" checked={Boolean(settings.verified_enabled)} onChange={(e) => setField('verified_enabled', e.target.checked)} className="h-4 w-4 accent-[#1E8449]" />
              &quot;Get Verified&quot; form website par dikhayein
            </label>
            <label className="block">
              <span className={labelClass}>Fee (Rs.)</span>
              <input type="number" min="0" value={settings.verified_price ?? ''} onChange={(e) => setField('verified_price', e.target.value)} className={inputClass} />
            </label>
            <label className="block">
              <span className={labelClass}>Badge ki muddat (mahine)</span>
              <input type="number" min="1" max="120" value={settings.verified_months ?? ''} onChange={(e) => setField('verified_months', e.target.value)} className={inputClass} />
            </label>
            <label className="block">
              <span className={labelClass}>Account title (naam)</span>
              <input value={settings.account_title || ''} onChange={(e) => setField('account_title', e.target.value)} className={inputClass} />
            </label>
            <label className="block">
              <span className={labelClass}>JazzCash number</span>
              <input value={settings.jazzcash_number || ''} onChange={(e) => setField('jazzcash_number', e.target.value)} placeholder="03xx xxxxxxx" className={inputClass} />
            </label>
            <label className="block">
              <span className={labelClass}>Easypaisa number</span>
              <input value={settings.easypaisa_number || ''} onChange={(e) => setField('easypaisa_number', e.target.value)} placeholder="03xx xxxxxxx" className={inputClass} />
            </label>
            <label className="block">
              <span className={labelClass}>Bank details (optional)</span>
              <textarea rows={2} value={settings.bank_details || ''} onChange={(e) => setField('bank_details', e.target.value)} placeholder={'Bank: ...\nIBAN: ...'} className={inputClass} />
            </label>
            <label className="block sm:col-span-2">
              <span className={labelClass}>Mazeed hidayat (optional)</span>
              <textarea rows={2} value={settings.extra_instructions || ''} onChange={(e) => setField('extra_instructions', e.target.value)} placeholder="Payment ke baad screenshot WhatsApp par bhi bhej dein..." className={inputClass} />
            </label>
            <div className="sm:col-span-2">
              <button type="submit" disabled={saving} className="inline-flex items-center gap-2 rounded-full px-6 py-2.5 text-sm font-semibold text-white transition hover:-translate-y-0.5 disabled:opacity-60" style={{ background: 'linear-gradient(135deg, #1E8449, #2E5AAC)' }}>
                <SaveIcon className="h-4 w-4" />
                {saving ? 'Saving...' : 'Save Settings'}
              </button>
            </div>
          </form>
        )}
      </AdminCard>

      <AdminCard title={`Verification Requests${pendingCount ? ` (${pendingCount} pending)` : ''}`} description="Payment apne account mein check karein, phir Approve dabayein. Approve par badge lagta hai aur muddat khatam hone par khud hat jata hai." icon={BriefcaseIcon}>
        <div className="mb-4 flex flex-wrap gap-2">
          {FILTERS.map((f) => (
            <button key={f.id} type="button" onClick={() => setFilter(f.id)} className={`rounded-full border px-4 py-1.5 text-sm font-semibold transition ${filter === f.id ? 'border-atl2 bg-atl2 text-white' : 'border-aline bg-white text-aink hover:bg-acream'}`}>
              {f.label}
              {f.id === 'pending' && pendingCount > 0 ? ` (${pendingCount})` : ''}
            </button>
          ))}
          <button type="button" onClick={load} className="rounded-full border border-aline bg-white px-4 py-1.5 text-sm font-semibold text-aink hover:bg-acream">
            Refresh
          </button>
        </div>

        {shown.length === 0 ? (
          <p className="py-6 text-center text-sm text-amuted">Is category mein koi request nahi.</p>
        ) : (
          <ul className="flex flex-col gap-3">
            {shown.map((r) => {
              const b = r.businesses_table;
              const active = b && isVerified(b);
              return (
                <li key={r.id} className="rounded-xl border border-aline bg-white p-4 text-sm text-aink">
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div className="min-w-0">
                      <p className="font-semibold">
                        {b ? (
                          <a href={`/directory/business/${b.slug || b.id}`} target="_blank" rel="noopener noreferrer" className="text-atl2 hover:underline">
                            {b.name}
                          </a>
                        ) : (
                          'Business'
                        )}
                        {active && <span className="ml-2 rounded-full bg-sky-100 px-2 py-0.5 text-[10px] font-bold text-sky-700">ABHI VERIFIED — {fmtDate(b.verified_until)} tak</span>}
                      </p>
                      <p className="mt-1 text-xs text-amuted">
                        {r.requester_name} · {r.phone} · {methodLabel(r.payment_method)} · TX: <span className="select-all font-semibold text-aink">{r.transaction_id}</span>
                        {r.amount != null ? ` · Rs. ${Number(r.amount).toLocaleString('en-PK')}` : ''}
                      </p>
                      {r.note && <p className="mt-1 text-xs">&quot;{r.note}&quot;</p>}
                      <p className="mt-1 text-xs text-amuted">
                        Bheji gayi: {fmtDate(r.created_at)}
                        {r.reviewed_at ? ` · Review: ${fmtDate(r.reviewed_at)}` : ''}
                        {r.admin_note ? ` · Note: ${r.admin_note}` : ''}
                      </p>
                    </div>

                    {r.status === 'pending' && (
                      <div className="flex flex-wrap items-center gap-2">
                        <label className="flex items-center gap-1.5 text-xs text-amuted">
                          Mahine
                          <input type="number" min="1" max="120" value={months[r.id] ?? r.plan_months ?? settings?.verified_months ?? 12} onChange={(e) => setMonths((p) => ({ ...p, [r.id]: e.target.value }))} className="w-16 rounded-lg border border-aline px-2 py-1.5 text-sm text-aink" />
                        </label>
                        <button type="button" disabled={busyId === r.id} onClick={() => approve(r)} className={`${smallBtn} border-emerald-300 bg-emerald-50 text-emerald-700 hover:bg-emerald-600 hover:text-white`}>
                          Approve
                        </button>
                        <button type="button" disabled={busyId === r.id} onClick={() => reject(r)} className={`${smallBtn} border-red-200 bg-red-50 text-red-600 hover:bg-red-600 hover:text-white`}>
                          Reject
                        </button>
                      </div>
                    )}
                    {r.status === 'approved' && active && (
                      <button type="button" onClick={() => removeBadge(b)} className={`${smallBtn} border-red-200 bg-red-50 text-red-600 hover:bg-red-600 hover:text-white`}>
                        Badge hatayein
                      </button>
                    )}
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </AdminCard>
    </div>
  );
}
