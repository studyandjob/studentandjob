'use client';

import { useState } from 'react';
import { supabase } from '@/lib/supabaseClient';

const PLANS = [
  { label: '1 Month', amount: 500 },
  { label: '3 Months', amount: 1300 },
  { label: '1 Year', amount: 4500 },
];

function formatDate(dateStr) {
  if (!dateStr) return '—';
  return new Date(dateStr).toLocaleDateString('en-US', { day: '2-digit', month: 'short', year: 'numeric' });
}

export default function MembershipCard({ userId, profileId, currentRequest, onRequested }) {
  const [plan, setPlan] = useState(PLANS[0].label);
  const [paymentMethod, setPaymentMethod] = useState('Easypaisa');
  const [proofUrl, setProofUrl] = useState('');
  const [whatsapp, setWhatsapp] = useState('');
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  async function handleProofUpload(e) {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    const path = `payment_proofs/${userId}-${Date.now()}.${file.name.split('.').pop()}`;
    const { error: uploadError } = await supabase.storage.from('vip_uploads').upload(path, file);
    setUploading(false);
    if (uploadError) {
      setError(uploadError.message);
      return;
    }
    const { data } = supabase.storage.from('vip_uploads').getPublicUrl(path);
    setProofUrl(data.publicUrl);
  }

  async function submitRequest(e) {
    e.preventDefault();
    setSaving(true);
    setError('');
    const selected = PLANS.find((p) => p.label === plan);
    const { data, error: insertError } = await supabase
      .from('member_requests')
      .insert({
        user_id: userId,
        candidate_id: profileId,
        plan,
        amount: selected?.amount,
        payment_method: paymentMethod,
        payment_proof_url: proofUrl || null,
        whatsapp,
        status: 'pending',
      })
      .select()
      .single();
    setSaving(false);
    if (insertError) {
      setError(insertError.message);
      return;
    }
    onRequested?.(data);
  }

  if (currentRequest && currentRequest.status === 'active') {
    return (
      <div className="rounded-2xl bg-brand-50 p-6 text-center ring-1 ring-brand-100">
        <p className="text-lg font-bold text-brand-700">✓ VIP Membership Active</p>
        <p className="mt-1 text-sm text-brand-700">Valid until {formatDate(currentRequest.end_date)}</p>
      </div>
    );
  }

  if (currentRequest && currentRequest.status === 'pending') {
    return (
      <div className="rounded-2xl bg-gray-50 p-6 text-center ring-1 ring-gray-100">
        <p className="text-lg font-bold text-gray-700">Request Submitted</p>
        <p className="mt-1 text-sm text-gray-700">
          Your {currentRequest.plan} membership request is awaiting admin approval.
        </p>
      </div>
    );
  }

  return (
    <div className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-black/5">
      {currentRequest?.status === 'expired' && (
        <p className="mb-4 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-600">
          Your previous membership expired on {formatDate(currentRequest.end_date)}. Renew below.
        </p>
      )}
      <h3 className="mb-4 text-base font-bold text-gray-900">Become / Renew VIP Member</h3>

      {error && <p className="mb-4 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-600">{error}</p>}

      <form onSubmit={submitRequest} className="flex flex-col gap-4">
        <div className="grid grid-cols-3 gap-2">
          {PLANS.map((p) => (
            <button
              type="button"
              key={p.label}
              onClick={() => setPlan(p.label)}
              className={`rounded-lg border px-3 py-3 text-center text-sm font-semibold transition ${
                plan === p.label ? 'border-brand-600 bg-brand-50 text-brand-600' : 'border-gray-200 text-gray-500'
              }`}
            >
              {p.label}
              <div className="text-xs font-normal">Rs. {p.amount}</div>
            </button>
          ))}
        </div>

        <label className="flex flex-col gap-1.5">
          <span className="text-sm font-semibold text-gray-800">Payment Method</span>
          <select value={paymentMethod} onChange={(e) => setPaymentMethod(e.target.value)} className="rounded-lg border border-gray-200 bg-gray-50 px-3.5 py-2.5 text-sm">
            <option>Easypaisa</option>
            <option>JazzCash</option>
            <option>Bank Transfer</option>
          </select>
        </label>

        <label className="flex flex-col gap-1.5">
          <span className="text-sm font-semibold text-gray-800">Your WhatsApp Number</span>
          <input
            required
            value={whatsapp}
            onChange={(e) => setWhatsapp(e.target.value)}
            className="rounded-lg border border-gray-200 bg-gray-50 px-3.5 py-2.5 text-sm"
          />
        </label>

        <label className="flex flex-col gap-1.5">
          <span className="text-sm font-semibold text-gray-800">Upload Payment Screenshot</span>
          <input type="file" accept="image/*" onChange={handleProofUpload} className="text-sm" />
          {proofUrl && <span className="text-xs text-brand-600">Uploaded ✓</span>}
        </label>

        <button
          type="submit"
          disabled={saving || uploading}
          className="rounded-full bg-brand-600 px-6 py-3 text-sm font-semibold text-white transition hover:bg-brand-700 disabled:opacity-60"
        >
          {saving ? 'Submitting…' : 'Submit Membership Request'}
        </button>
      </form>
    </div>
  );
}
