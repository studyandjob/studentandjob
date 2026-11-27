'use client';

import { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabaseClient';
import Art3D from '../Art3D';
import { Banner, inputCls } from './FormUI';

// Only ever send people back to a page inside the owner portal / directory.
export const safeNext = (n) =>
  typeof n === 'string' && (n.startsWith('/business') || n.startsWith('/directory')) && !n.startsWith('//') ? n : '/business/dashboard';

const COOLDOWN = 60;

/**
 * One-step email login — no registration form, no password.
 * New visitors get an account automatically the first time they confirm
 * their email; returning visitors simply sign in.
 *   1. type email  ->  we send a link (and a 6-digit code)
 *   2. click the link, or type the code  ->  signed in
 */
export default function EmailLogin({ next }) {
  const router = useRouter();
  const target = safeNext(next);
  const [email, setEmail] = useState('');
  const [code, setCode] = useState('');
  const [step, setStep] = useState('email'); // email | sent
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [wait, setWait] = useState(0);
  const codeRef = useRef(null);

  // Already signed in (or the link was opened in this browser) -> go straight through.
  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => data.session && router.replace(target));
    const { data: sub } = supabase.auth.onAuthStateChange((_e, session) => {
      if (session) router.replace(target);
    });
    return () => sub.subscription.unsubscribe();
  }, [router, target]);

  useEffect(() => {
    if (wait <= 0) return;
    const t = setTimeout(() => setWait((w) => w - 1), 1000);
    return () => clearTimeout(t);
  }, [wait]);

  async function send(e) {
    e?.preventDefault();
    setError('');
    const addr = email.trim().toLowerCase();
    if (!/^\S+@\S+\.\S+$/.test(addr)) return setError('Sahi email likhein.');
    setBusy(true);
    const { error: err } = await supabase.auth.signInWithOtp({
      email: addr,
      options: { shouldCreateUser: true, emailRedirectTo: `${window.location.origin}${target}` },
    });
    setBusy(false);
    if (err) {
      return setError(
        /rate|seconds|too many/i.test(err.message)
          ? 'Email bheji ja chuki hai — thori der (1 minute) baad dobara koshish karein.'
          : /signups? not allowed|disabled/i.test(err.message)
            ? 'Naye accounts abhi band hain — admin se rabta karein.'
            : 'Email nahi bheji ja saki. Thori der baad dobara koshish karein.'
      );
    }
    setEmail(addr);
    setStep('sent');
    setWait(COOLDOWN);
    setTimeout(() => codeRef.current?.focus(), 100);
  }

  async function verify(e) {
    e.preventDefault();
    setError('');
    const token = code.replace(/\s+/g, '');
    if (token.length < 6) return setError('Email mein aaya poora code likhein.');
    setBusy(true);
    const { error: err } = await supabase.auth.verifyOtp({ email, token, type: 'email' });
    setBusy(false);
    if (err) return setError('Code ghalat hai ya purana ho gaya. Naya code mangwayein.');
    router.replace(target);
  }

  return (
    <div className="rounded-3xl border border-line bg-gradient-to-b from-surface to-surface-alt p-6 shadow-[inset_0_1px_0_rgba(255,255,255,0.9),0_20px_40px_-24px_rgba(0,0,0,0.35)] md:p-8">
      <div className="mb-5 text-center">
        <Art3D name="shop" className="mx-auto h-14 w-14" />
        <h1 className="mt-2 text-2xl font-bold text-gray-900">{step === 'email' ? 'Apna business add karein' : 'Email check karein'}</h1>
        <p className="mt-1 text-sm text-gray-500">
          {step === 'email' ? 'Sirf apni email likhein — koi password ya registration form nahi.' : `Hum ne ${email} par login link aur code bheja hai.`}
        </p>
      </div>

      {step === 'email' ? (
        <form onSubmit={send} className="space-y-4">
          {error && <Banner>{error}</Banner>}
          <label className="block">
            <span className="mb-1.5 block text-sm font-semibold text-gray-900">Email</span>
            <input type="email" required autoFocus autoComplete="email" inputMode="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="aap@example.com" className={inputCls} />
          </label>
          <button type="submit" disabled={busy} className="w-full rounded-xl bg-gradient-to-b from-brand-500 to-brand-700 px-5 py-3 text-sm font-bold text-white shadow-[inset_0_1px_0_rgba(255,255,255,0.4),0_8px_18px_-8px_rgba(0,0,0,0.5)] transition hover:brightness-105 disabled:opacity-60">
            {busy ? 'Bhej rahe hain...' : 'Login link bhejein'}
          </button>
          <p className="text-center text-xs text-gray-500">Pehli dafa? Account khud ba khud ban jata hai.</p>
        </form>
      ) : (
        <div className="space-y-5">
          <Banner kind="success">Email mein diye gaye link par click karein — aap login ho jayenge.</Banner>
          <form onSubmit={verify} className="space-y-3">
            <p className="text-sm text-gray-600">Ya email mein agar code aaya ho to yahan likhein:</p>
            {error && <Banner>{error}</Banner>}
            <input ref={codeRef} value={code} onChange={(e) => setCode(e.target.value.replace(/[^\d\s]/g, ''))} inputMode="numeric" autoComplete="one-time-code" maxLength={10} placeholder="123456" aria-label="Email ka code" className={`${inputCls} text-center text-xl tracking-[0.4em]`} />
            <button type="submit" disabled={busy || code.replace(/\s+/g, '').length < 6} className="w-full rounded-xl bg-gradient-to-b from-brand-500 to-brand-700 px-5 py-3 text-sm font-bold text-white disabled:opacity-50">
              {busy ? 'Check ho raha hai...' : 'Code se login karein'}
            </button>
          </form>
          <div className="flex flex-wrap items-center justify-between gap-2 text-sm">
            <button type="button" onClick={() => { setStep('email'); setCode(''); setError(''); }} className="font-semibold text-gray-600 hover:text-gray-900">
              ← Email badlein
            </button>
            <button type="button" disabled={wait > 0 || busy} onClick={send} className="font-semibold text-brand-600 hover:underline disabled:text-gray-400 disabled:no-underline">
              {wait > 0 ? `Dobara bhejein (${wait}s)` : 'Dobara bhejein'}
            </button>
          </div>
          <p className="text-center text-xs text-gray-500">Email nahi mili? Spam / Promotions folder bhi dekhein.</p>
        </div>
      )}
    </div>
  );
}
