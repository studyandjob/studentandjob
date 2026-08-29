'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabaseClient';
import AdminCard from './AdminCard';
import { IdCardIcon } from './icons';

const TABS = [
  { id: 'pending', label: 'New Requests' },
  { id: 'active', label: 'Active Members' },
  { id: 'expired', label: 'Expired Members' },
];

function formatDate(dateStr) {
  if (!dateStr) return '—';
  return new Date(dateStr).toLocaleDateString('en-US', { day: '2-digit', month: 'short', year: 'numeric' });
}

function addPlanMonths(plan) {
  const map = { '1 Month': 1, '3 Months': 3, '6 Months': 6, '1 Year': 12 };
  return map[plan] || 1;
}

export default function MembersManager({ initialRequests = [] }) {
  const [requests, setRequests] = useState(initialRequests);
  const [tab, setTab] = useState('pending');
  const [error, setError] = useState('');
  const [busyId, setBusyId] = useState(null);

  // Billing automation: every time this tab loads, ask the database to
  // flip any 'active' membership whose end_date has passed to 'expired'
  // (see sync_expired_members() in sql/schema_v2_ai_portal.sql), then
  // re-fetch so the cards reflect the up-to-date status immediately.
  useEffect(() => {
    (async () => {
      await supabase.rpc('sync_expired_members');
      const { data } = await supabase
        .from('member_requests')
        .select('*, candidate_profiles(full_name, phone, whatsapp, email, city, photo_url)')
        .order('created_at', { ascending: false });
      if (data) setRequests(data);
    })();
  }, []);

  const filtered = requests.filter((r) => r.status === tab);

  async function approveAndActivate(req) {
    setBusyId(req.id);
    setError('');
    const months = addPlanMonths(req.plan);
    const start = new Date();
    const end = new Date();
    end.setMonth(end.getMonth() + months);

    const { data, error: updateError } = await supabase
      .from('member_requests')
      .update({
        status: 'active',
        start_date: start.toISOString().slice(0, 10),
        end_date: end.toISOString().slice(0, 10),
      })
      .eq('id', req.id)
      .select('*, candidate_profiles(full_name, phone, whatsapp, email, city, photo_url)')
      .single();

    setBusyId(null);
    if (updateError) {
      setError(updateError.message);
      return;
    }
    setRequests((prev) => prev.map((r) => (r.id === data.id ? data : r)));
  }

  async function setStatus(req, status) {
    setBusyId(req.id);
    setError('');
    const { data, error: updateError } = await supabase
      .from('member_requests')
      .update({ status })
      .eq('id', req.id)
      .select('*, candidate_profiles(full_name, phone, whatsapp, email, city, photo_url)')
      .single();
    setBusyId(null);
    if (updateError) {
      setError(updateError.message);
      return;
    }
    setRequests((prev) => prev.map((r) => (r.id === data.id ? data : r)));
  }

  return (
    <AdminCard
      title="Admin Portal Requests"
      description="Review VIP membership requests, activate members, and track billing status."
      icon={IdCardIcon}
    >
      {error && (
        <p className="mb-4 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-600">{error}</p>
      )}

      <div className="mb-5 flex gap-2 rounded-[10px] border border-aline bg-[#FCFAF6] p-1">
        {TABS.map((t) => {
          const count = requests.filter((r) => r.status === t.id).length;
          return (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              className={`flex flex-1 items-center justify-center gap-1.5 rounded-lg px-3 py-2.5 text-sm font-semibold transition ${
                tab === t.id ? 'bg-atl text-white' : 'text-amuted hover:text-aink'
              }`}
            >
              {t.label}
              {count > 0 && (
                <span
                  className={`flex h-5 min-w-[20px] items-center justify-center rounded-full px-1.5 text-[0.68rem] font-bold ${
                    tab === t.id ? 'bg-white/25 text-white' : 'bg-acoral/15 text-acoral'
                  }`}
                >
                  {count}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {filtered.length === 0 ? (
        <p className="py-8 text-center text-sm text-amuted">No members in this list yet.</p>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((req) => {
            const profile = req.candidate_profiles;
            return (
              <div key={req.id} className="rounded-[14px] border border-aline bg-white p-4">
                <div className="mb-3 flex items-center gap-3">
                  {profile?.photo_url ? (
                    <img src={profile.photo_url} alt="" className="h-11 w-11 flex-shrink-0 rounded-full object-cover" />
                  ) : (
                    <div className="flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-full bg-atl/10 text-sm font-bold text-atl">
                      {(profile?.full_name || 'U').charAt(0)}
                    </div>
                  )}
                  <div className="min-w-0">
                    <p className="truncate font-semibold text-aink">{profile?.full_name || 'Unnamed candidate'}</p>
                    <p className="truncate text-xs text-amuted">{profile?.city || '—'}</p>
                  </div>
                </div>

                <dl className="mb-3 space-y-1 text-xs text-amuted">
                  <div className="flex justify-between">
                    <dt>Phone</dt>
                    <dd className="text-aink">{profile?.phone || req.whatsapp || '—'}</dd>
                  </div>
                  <div className="flex justify-between">
                    <dt>Plan</dt>
                    <dd className="text-aink">{req.plan}</dd>
                  </div>
                  <div className="flex justify-between">
                    <dt>Amount</dt>
                    <dd className="text-aink">{req.amount ? `Rs. ${req.amount}` : '—'}</dd>
                  </div>
                  <div className="flex justify-between">
                    <dt>Method</dt>
                    <dd className="text-aink">{req.payment_method || '—'}</dd>
                  </div>
                  {req.status !== 'pending' && (
                    <div className="flex justify-between">
                      <dt>Valid till</dt>
                      <dd className="text-aink">{formatDate(req.end_date)}</dd>
                    </div>
                  )}
                </dl>

                {req.payment_proof_url && (
                  <a
                    href={req.payment_proof_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mb-3 block text-xs font-semibold text-atl2 hover:underline"
                  >
                    View payment proof →
                  </a>
                )}

                <span
                  className={`mb-3 inline-block rounded-full px-2.5 py-1 text-[0.68rem] font-bold uppercase tracking-wide ${
                    req.status === 'active'
                      ? 'bg-brand-100 text-brand-700'
                      : req.status === 'expired'
                      ? 'bg-red-100 text-red-600'
                      : req.status === 'rejected'
                      ? 'bg-gray-200 text-gray-600'
                      : 'bg-agold/15 text-agold'
                  }`}
                >
                  {req.status}
                </span>

                <div className="flex flex-wrap gap-2">
                  {req.status === 'pending' && (
                    <>
                      <button
                        disabled={busyId === req.id}
                        onClick={() => approveAndActivate(req)}
                        className="rounded-full bg-atl px-3.5 py-1.5 text-xs font-semibold text-white transition hover:bg-atl2 disabled:opacity-60"
                      >
                        Approve & Activate
                      </button>
                      <button
                        disabled={busyId === req.id}
                        onClick={() => setStatus(req, 'rejected')}
                        className="rounded-full border border-red-200 px-3.5 py-1.5 text-xs font-semibold text-red-600 transition hover:bg-red-600 hover:text-white"
                      >
                        Reject
                      </button>
                    </>
                  )}
                  {req.status === 'active' && (
                    <button
                      disabled={busyId === req.id}
                      onClick={() => setStatus(req, 'expired')}
                      className="rounded-full border border-aline px-3.5 py-1.5 text-xs font-semibold text-amuted transition hover:text-aink"
                    >
                      Mark Expired
                    </button>
                  )}
                  {req.status === 'expired' && (
                    <button
                      disabled={busyId === req.id}
                      onClick={() => approveAndActivate(req)}
                      className="rounded-full bg-atl px-3.5 py-1.5 text-xs font-semibold text-white transition hover:bg-atl2 disabled:opacity-60"
                    >
                      Renew (Reactivate)
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </AdminCard>
  );
}
