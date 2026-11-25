'use client';

import { useState } from 'react';
import { supabase } from '@/lib/supabaseClient';
import VerifiedBadge from './VerifiedBadge';
import { PAYMENT_METHODS } from '@/lib/directory';

const input =
  'w-full rounded-xl border border-line bg-surface px-3.5 py-3 text-sm text-gray-900 outline-none focus:border-brand-600 focus:ring-2 focus:ring-brand-600/20';

/**
 * "Get Verified" — business page. The visitor pays by JazzCash / Easypaisa /
 * bank transfer and sends the transaction ID here; the admin checks the
 * payment and approves from the dashboard. No payment is taken on the site.
 */
export default function GetVerifiedForm({ businessId, businessName, settings }) {
  const [open, setOpen] = useState(false);
  const [state, setState] = useState({ status: 'idle', message: '' }); // idle | sending | done | error
  const [f, setF] = useState({ name: '', phone: '', method: 'jazzcash', txn: '', note: '', website: '' });

  const price = settings?.verified_price;
  const months = settings?.verified_months;
  const accounts = [
    settings?.jazzcash_number && ['JazzCash', settings.jazzcash_number],
    settings?.easypaisa_number && ['Easypaisa', settings.easypaisa_number],
  ].filter(Boolean);

  function set(k, v) {
    setF((p) => ({ ...p, [k]: v }));
  }

  async function submit(e) {
    e.preventDefault();
    // Hidden field only bots fill in — pretend success, send nothing.
    if (f.website) return setState({ status: 'done', message: '' });
    setState({ status: 'sending', message: '' });
    const { error } = await supabase.from('verification_requests').insert({
      business_id: businessId,
      requester_name: f.name.trim(),
      phone: f.phone.trim(),
      payment_method: f.method,
      transaction_id: f.txn.trim(),
      amount: price ?? null,
      plan_months: months ?? null,
      note: f.note.trim() || null,
    });
    if (error) {
      const dup = error.code === '23505' || /duplicate/i.test(error.message);
      return setState({
        status: 'error',
        message: dup
          ? 'Is business ki verification request pehle se review mein hai. Hum jald rabta karenge.'
          : 'Request nahi ja saki. Details check karke dobara koshish karein.',
      });
    }
    setState({ status: 'done', message: '' });
  }

  if (!settings?.verified_enabled) return null;

  return (
    <section className="mt-8 overflow-hidden rounded-3xl border border-sky-200 bg-gradient-to-b from-sky-50 to-surface p-5 shadow-[inset_0_1px_0_rgba(255,255,255,0.9)] md:p-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="min-w-0">
          <div className="mb-1.5">
            <VerifiedBadge />
          </div>
          <h2 className="text-lg font-bold text-gray-900">Apne business ko Verified karwayein</h2>
          <p className="mt-1 text-sm text-gray-600">
            Verified badge se customers ka bharosa barhta hai aur search mein aap ki listing aage aati hai.
            {price != null && months ? ` Fee: Rs. ${Number(price).toLocaleString('en-PK')} / ${months} mahine.` : ''}
          </p>
        </div>
        {state.status !== 'done' && (
          <button
            type="button"
            onClick={() => setOpen((o) => !o)}
            className="rounded-xl bg-gradient-to-b from-sky-400 to-blue-600 px-5 py-2.5 text-sm font-semibold text-white shadow-[inset_0_1px_0_rgba(255,255,255,0.5),0_8px_18px_-8px_rgba(37,99,235,0.7)] transition active:scale-95 hover:brightness-105"
          >
            {open ? 'Band karein' : 'Get Verified'}
          </button>
        )}
      </div>

      {state.status === 'done' && (
        <p className="mt-4 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-800">
          Shukriya! Aap ki request mil gayi. Admin payment check karke approve karega — badge lagte hi listing par nazar aane lagega.
        </p>
      )}

      {open && state.status !== 'done' && (
        <div className="mt-5 grid gap-5 md:grid-cols-2">
          <div className="rounded-2xl border border-line bg-surface p-4 text-sm text-gray-700">
            <p className="mb-2 font-semibold text-gray-900">Step 1 — Payment bhejein</p>
            {price != null && (
              <p className="mb-2">
                Rs. <span className="font-bold">{Number(price).toLocaleString('en-PK')}</span> {months ? `(${months} mahine ke liye)` : ''}
              </p>
            )}
            {accounts.length === 0 && !settings?.bank_details && <p className="text-gray-500">Payment ki tafseel jald yahan dikhai jayegi. Filhal humein WhatsApp par rabta karein.</p>}
            <ul className="space-y-1">
              {accounts.map(([label, num]) => (
                <li key={label}>
                  <span className="font-semibold">{label}:</span> <span className="select-all">{num}</span>
                </li>
              ))}
              {settings?.account_title && (
                <li>
                  <span className="font-semibold">Account title:</span> {settings.account_title}
                </li>
              )}
            </ul>
            {settings?.bank_details && <p className="mt-2 whitespace-pre-line">{settings.bank_details}</p>}
            {settings?.extra_instructions && <p className="mt-2 whitespace-pre-line text-gray-600">{settings.extra_instructions}</p>}
            <p className="mt-3 rounded-lg bg-surface-alt px-3 py-2 text-xs text-gray-500">
              Verified badge ka matlab hai ke admin ne business ki maujoodgi aur contact details check ki hain. Yeh kisi doctor, vakeel ya idare ki professional licence ki guarantee nahi.
            </p>
          </div>

          <form onSubmit={submit} className="grid gap-3">
            <p className="font-semibold text-gray-900">Step 2 — Details bhejein</p>
            <p className="-mt-2 text-xs text-gray-500">Business: {businessName}</p>
            <input required minLength={2} maxLength={80} value={f.name} onChange={(e) => set('name', e.target.value)} placeholder="Aap ka naam" className={input} />
            <input required inputMode="tel" minLength={7} maxLength={20} value={f.phone} onChange={(e) => set('phone', e.target.value)} placeholder="Aap ka phone / WhatsApp" className={input} />
            <select value={f.method} onChange={(e) => set('method', e.target.value)} className={input}>
              {PAYMENT_METHODS.map((m) => (
                <option key={m.value} value={m.value}>
                  {m.label}
                </option>
              ))}
            </select>
            <input required minLength={3} maxLength={60} value={f.txn} onChange={(e) => set('txn', e.target.value)} placeholder="Transaction ID" className={input} />
            <textarea maxLength={500} rows={2} value={f.note} onChange={(e) => set('note', e.target.value)} placeholder="Koi note (optional)" className={input} />
            {/* honeypot */}
            <input tabIndex={-1} autoComplete="off" value={f.website} onChange={(e) => set('website', e.target.value)} className="hidden" aria-hidden="true" />
            {state.status === 'error' && <p className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-600">{state.message}</p>}
            <button
              type="submit"
              disabled={state.status === 'sending'}
              className="rounded-xl bg-gradient-to-b from-sky-400 to-blue-600 px-5 py-3 text-sm font-semibold text-white shadow-[inset_0_1px_0_rgba(255,255,255,0.5)] transition active:scale-95 hover:brightness-105 disabled:opacity-60"
            >
              {state.status === 'sending' ? 'Bhej rahe hain...' : 'Request bhejein'}
            </button>
          </form>
        </div>
      )}
    </section>
  );
}
