'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabaseClient';
import Art3D from '../Art3D';
import { Banner, TextField } from './FormUI';

// Only ever send people back to a page inside the owner portal.
const safeNext = (n) =>
  typeof n === 'string' && (n.startsWith('/business') || n.startsWith('/directory')) && !n.startsWith('//') ? n : '/business/dashboard';

/** Email + password: register (new owners) and login. */
export default function BusinessAuthForm({ mode = 'login', next }) {
  const router = useRouter();
  const isRegister = mode === 'register';
  const [f, setF] = useState({ name: '', email: '', phone: '', password: '', confirm: '' });
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [info, setInfo] = useState('');
  const [forgot, setForgot] = useState(false);
  const set = (k, v) => setF((p) => ({ ...p, [k]: v }));

  async function submit(e) {
    e.preventDefault();
    setError('');
    setInfo('');
    const email = f.email.trim().toLowerCase();

    if (forgot) {
      setBusy(true);
      const { error: err } = await supabase.auth.resetPasswordForEmail(email, { redirectTo: `${window.location.origin}/business/reset-password` });
      setBusy(false);
      if (err) return setError('Email nahi bheji ja saki. Thori der baad dobara koshish karein.');
      return setInfo('Agar yeh email registered hai to password badalne ka link bhej diya gaya hai. Apna inbox (aur spam) check karein.');
    }

    if (isRegister) {
      if (f.name.trim().length < 2) return setError('Apna naam likhein.');
      if (f.password.length < 8) return setError('Password kam az kam 8 huroof ka rakhein.');
      if (f.password !== f.confirm) return setError('Dono password mel nahi khate.');
      setBusy(true);
      const { data, error: err } = await supabase.auth.signUp({
        email,
        password: f.password,
        options: {
          data: { full_name: f.name.trim(), phone: f.phone.trim() || null },
          emailRedirectTo: `${window.location.origin}/business/dashboard`,
        },
      });
      setBusy(false);
      if (err) return setError(/already/i.test(err.message) ? 'Yeh email pehle se registered hai — login karein.' : err.message);
      if (data.user && data.user.identities && data.user.identities.length === 0) return setError('Yeh email pehle se registered hai — login karein.');
      if (data.session) return router.replace(safeNext(next || '/business/new'));
      return setInfo('Registration ho gayi! Aap ki email par confirmation link bheja gaya hai — us par click karke login karein.');
    }

    setBusy(true);
    const { error: err } = await supabase.auth.signInWithPassword({ email, password: f.password });
    setBusy(false);
    if (err) return setError(/confirm/i.test(err.message) ? 'Pehle email ka confirmation link click karein.' : 'Email ya password ghalat hai.');
    router.replace(safeNext(next));
  }

  return (
    <div className="rounded-3xl border border-line bg-gradient-to-b from-surface to-surface-alt p-6 shadow-[inset_0_1px_0_rgba(255,255,255,0.9),0_20px_40px_-24px_rgba(0,0,0,0.35)] md:p-8">
      <div className="mb-5 text-center">
        <Art3D name="shop" className="mx-auto h-14 w-14" />
        <h1 className="mt-2 text-2xl font-bold text-gray-900">{forgot ? 'Password bhool gaye?' : isRegister ? 'Apna business add karein' : 'Business login'}</h1>
        <p className="mt-1 text-sm text-gray-500">
          {forgot ? 'Email likhein, hum password badalne ka link bhejenge.' : isRegister ? 'Email aur password se account banayein, phir apni profile bharein.' : 'Apni listings manage karne ke liye login karein.'}
        </p>
      </div>

      <form onSubmit={submit} className="space-y-4">
        {error && <Banner>{error}</Banner>}
        {info && <Banner kind="success">{info}</Banner>}
        {isRegister && !forgot && (
          <>
            <TextField label="Aap ka naam" required value={f.name} onChange={(v) => set('name', v)} autoComplete="name" />
            <TextField label="Phone / WhatsApp (optional)" type="tel" value={f.phone} onChange={(v) => set('phone', v)} autoComplete="tel" />
          </>
        )}
        <TextField label="Email" required type="email" value={f.email} onChange={(v) => set('email', v)} autoComplete="email" />
        {!forgot && (
          <TextField
            label="Password"
            required
            type="password"
            value={f.password}
            onChange={(v) => set('password', v)}
            autoComplete={isRegister ? 'new-password' : 'current-password'}
            hint={isRegister ? 'Kam az kam 8 huroof' : undefined}
          />
        )}
        {isRegister && !forgot && <TextField label="Password dobara likhein" required type="password" value={f.confirm} onChange={(v) => set('confirm', v)} autoComplete="new-password" />}

        <button type="submit" disabled={busy} className="w-full rounded-xl bg-gradient-to-b from-brand-500 to-brand-700 px-5 py-3 text-sm font-bold text-white shadow-[inset_0_1px_0_rgba(255,255,255,0.4),0_8px_18px_-8px_rgba(0,0,0,0.5)] transition hover:brightness-105 disabled:opacity-60">
          {busy ? 'Ruk jayein...' : forgot ? 'Reset link bhejein' : isRegister ? 'Account banayein' : 'Login'}
        </button>
      </form>

      <div className="mt-5 space-y-2 text-center text-sm text-gray-600">
        {!isRegister && !forgot && (
          <button type="button" onClick={() => { setForgot(true); setError(''); setInfo(''); }} className="font-semibold text-brand-600 hover:underline">
            Password bhool gaye?
          </button>
        )}
        {forgot && (
          <button type="button" onClick={() => { setForgot(false); setError(''); setInfo(''); }} className="font-semibold text-brand-600 hover:underline">
            ← Login par wapis
          </button>
        )}
        {!forgot && (
          <p>
            {isRegister ? 'Pehle se account hai? ' : 'Naya business? '}
            <Link href={isRegister ? '/business/login' : '/business/register'} className="font-semibold text-brand-600 hover:underline">
              {isRegister ? 'Login karein' : 'Account banayein'}
            </Link>
          </p>
        )}
      </div>
    </div>
  );
}
