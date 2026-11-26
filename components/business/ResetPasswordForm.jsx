'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { supabase } from '@/lib/supabaseClient';
import { Banner, TextField } from './FormUI';

// Landing page of the "reset password" email link.
export default function ResetPasswordForm() {
  const [ready, setReady] = useState(false);
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [done, setDone] = useState(false);

  useEffect(() => {
    // The recovery link signs the visitor in temporarily; wait for that.
    supabase.auth.getSession().then(({ data }) => data.session && setReady(true));
    const { data: sub } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'PASSWORD_RECOVERY' || session) setReady(true);
    });
    return () => sub.subscription.unsubscribe();
  }, []);

  async function submit(e) {
    e.preventDefault();
    setError('');
    if (password.length < 8) return setError('Password kam az kam 8 huroof ka rakhein.');
    if (password !== confirm) return setError('Dono password mel nahi khate.');
    setBusy(true);
    const { error: err } = await supabase.auth.updateUser({ password });
    setBusy(false);
    if (err) return setError(err.message);
    setDone(true);
  }

  return (
    <div className="rounded-3xl border border-line bg-gradient-to-b from-surface to-surface-alt p-6 shadow-card md:p-8">
      <h1 className="text-center text-2xl font-bold text-gray-900">Naya password</h1>
      {done ? (
        <div className="mt-5 space-y-4 text-center">
          <Banner kind="success">Password badal gaya.</Banner>
          <Link href="/business/dashboard" className="inline-block rounded-xl bg-gradient-to-b from-brand-500 to-brand-700 px-6 py-3 text-sm font-bold text-white">Dashboard par jayein</Link>
        </div>
      ) : !ready ? (
        <p className="mt-5 text-center text-sm text-gray-600">
          Link check ho raha hai... Agar kuch nahi hota to email ka link dobara kholein, ya <Link href="/business/login" className="font-semibold text-brand-600 hover:underline">login page</Link> se naya link maangein.
        </p>
      ) : (
        <form onSubmit={submit} className="mt-5 space-y-4">
          {error && <Banner>{error}</Banner>}
          <TextField label="Naya password" required type="password" value={password} onChange={setPassword} autoComplete="new-password" hint="Kam az kam 8 huroof" />
          <TextField label="Dobara likhein" required type="password" value={confirm} onChange={setConfirm} autoComplete="new-password" />
          <button type="submit" disabled={busy} className="w-full rounded-xl bg-gradient-to-b from-brand-500 to-brand-700 px-5 py-3 text-sm font-bold text-white disabled:opacity-60">
            {busy ? 'Ruk jayein...' : 'Password badlein'}
          </button>
        </form>
      )}
    </div>
  );
}
