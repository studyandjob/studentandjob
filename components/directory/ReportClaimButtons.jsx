'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { supabase } from '@/lib/supabaseClient';
import { Banner, SelectField, TextAreaField, TextField } from '../business/FormUI';

const REASONS = [
  { value: 'wrong_info', label: 'Maloomat ghalat hain' },
  { value: 'closed', label: 'Business band ho chuka hai' },
  { value: 'fake', label: 'Jaali / dhoka dene wali listing' },
  { value: 'inappropriate', label: 'Nazeba mawad' },
  { value: 'other', label: 'Koi aur wajah' },
];

/** "Report this profile" for everyone; "Claim this profile" when it has no owner yet. */
export default function ReportClaimButtons({ businessId, businessName, hasOwner }) {
  const pathname = usePathname();
  const [panel, setPanel] = useState(null); // 'report' | 'claim'
  const [session, setSession] = useState(null);
  const [state, setState] = useState({ status: 'idle', message: '' });
  const [r, setR] = useState({ reason: '', details: '', contact: '' });
  const [c, setC] = useState({ name: '', phone: '', message: '' });

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => setSession(data.session));
  }, []);

  const open = (p) => {
    setPanel(panel === p ? null : p);
    setState({ status: 'idle', message: '' });
  };

  async function sendReport(e) {
    e.preventDefault();
    if (!r.reason) return setState({ status: 'error', message: 'Wajah chunein.' });
    setState({ status: 'sending', message: '' });
    const { error } = await supabase.from('listing_reports').insert({
      business_id: businessId,
      reason: r.reason,
      details: r.details.trim() || null,
      contact: r.contact.trim() || null,
    });
    if (error) return setState({ status: 'error', message: 'Report nahi ja saki. Thori der baad dobara koshish karein.' });
    setState({ status: 'done', message: 'Shukriya — hum is listing ko check karenge.' });
  }

  async function sendClaim(e) {
    e.preventDefault();
    setState({ status: 'sending', message: '' });
    const { error } = await supabase.from('claim_requests').insert({
      business_id: businessId,
      user_id: session.user.id,
      claimant_name: c.name.trim(),
      phone: c.phone.trim(),
      message: c.message.trim() || null,
    });
    if (error) {
      const dup = error.code === '23505' || /duplicate/i.test(error.message);
      return setState({ status: 'error', message: dup ? 'Aap ki claim request pehle se review mein hai.' : 'Request nahi ja saki. Dobara koshish karein.' });
    }
    setState({ status: 'done', message: 'Claim request mil gayi. Admin aap ki shanakht check karke profile aap ke account se jodega.' });
  }

  const linkBtn = 'text-sm font-semibold text-gray-600 underline-offset-4 hover:text-gray-900 hover:underline';

  return (
    <div className="mt-8 border-t border-line pt-5">
      <div className="flex flex-wrap items-center gap-x-6 gap-y-2">
        {!hasOwner && (
          <button type="button" onClick={() => open('claim')} className={linkBtn}>
            Kya yeh aap ka business hai? Claim karein
          </button>
        )}
        <button type="button" onClick={() => open('report')} className={linkBtn}>
          Is listing ko report karein
        </button>
      </div>

      {panel && (
        <div className="mt-4 max-w-xl rounded-2xl border border-line bg-surface-alt p-4">
          {state.status === 'done' ? (
            <Banner kind="success">{state.message}</Banner>
          ) : panel === 'report' ? (
            <form onSubmit={sendReport} className="space-y-3">
              <p className="text-sm font-semibold text-gray-900">&quot;{businessName}&quot; ko report karein</p>
              <SelectField label="Wajah" required value={r.reason} onChange={(v) => setR((p) => ({ ...p, reason: v }))} options={REASONS} />
              <TextAreaField label="Tafseel (optional)" rows={3} maxLength={1000} value={r.details} onChange={(v) => setR((p) => ({ ...p, details: v }))} />
              <TextField label="Aap ka rabta (optional)" maxLength={100} value={r.contact} onChange={(v) => setR((p) => ({ ...p, contact: v }))} placeholder="Phone ya email" />
              {state.status === 'error' && <Banner>{state.message}</Banner>}
              <button type="submit" disabled={state.status === 'sending'} className="rounded-xl bg-gray-900 px-5 py-2.5 text-sm font-semibold text-white disabled:opacity-60">
                {state.status === 'sending' ? 'Bhej rahe hain...' : 'Report bhejein'}
              </button>
            </form>
          ) : !session ? (
            <div className="space-y-3 text-sm text-gray-700">
              <p>Profile claim karne ke liye pehle apne business account se login karein.</p>
              <div className="flex gap-2">
                <Link href={`/business/login?next=${encodeURIComponent(pathname || '/directory')}`} className="rounded-xl bg-gray-900 px-4 py-2 font-semibold text-white">Login</Link>
                <Link href="/business/register" className="rounded-xl border border-line bg-surface px-4 py-2 font-semibold text-gray-800">Account banayein</Link>
              </div>
            </div>
          ) : (
            <form onSubmit={sendClaim} className="space-y-3">
              <p className="text-sm font-semibold text-gray-900">&quot;{businessName}&quot; claim karein</p>
              <TextField label="Aap ka naam" required minLength={2} maxLength={80} value={c.name} onChange={(v) => setC((p) => ({ ...p, name: v }))} />
              <TextField label="Phone / WhatsApp" required type="tel" minLength={7} maxLength={20} value={c.phone} onChange={(v) => setC((p) => ({ ...p, phone: v }))} />
              <TextAreaField label="Ap is business se kaise juray hain?" rows={3} maxLength={500} value={c.message} onChange={(v) => setC((p) => ({ ...p, message: v }))} />
              {state.status === 'error' && <Banner>{state.message}</Banner>}
              <button type="submit" disabled={state.status === 'sending'} className="rounded-xl bg-gray-900 px-5 py-2.5 text-sm font-semibold text-white disabled:opacity-60">
                {state.status === 'sending' ? 'Bhej rahe hain...' : 'Claim request bhejein'}
              </button>
            </form>
          )}
        </div>
      )}
    </div>
  );
}
