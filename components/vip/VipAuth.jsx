'use client';

import { useState } from 'react';
import Link from 'next/link';
import { supabase } from '@/lib/supabaseClient';

export default function VipAuth({ onAuthed, siteName }) {
  const [mode, setMode] = useState('login'); // 'login' | 'signup'
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    setNotice('');
    setLoading(true);

    if (mode === 'signup') {
      const { data, error: signUpError } = await supabase.auth.signUp({ email, password });
      if (signUpError) {
        setError(signUpError.message);
        setLoading(false);
        return;
      }
      // Seed an empty profile right away so the Profile Builder has a row
      // to update, and so it's linked to auth.uid() from the start.
      if (data.user) {
        await supabase.from('candidate_profiles').insert({ user_id: data.user.id, full_name: fullName });
      }
      if (data.session) {
        onAuthed(data.session);
      } else {
        setNotice('Account created! Please check your email to confirm, then log in.');
        setMode('login');
      }
      setLoading(false);
      return;
    }

    const { data, error: loginError } = await supabase.auth.signInWithPassword({ email, password });
    setLoading(false);
    if (loginError) {
      setError(loginError.message);
      return;
    }
    onAuthed(data.session);
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 px-4 py-10">
      <div className="w-full max-w-[420px] rounded-2xl bg-white p-8 shadow-sm ring-1 ring-black/5 sm:p-10">
        <div className="mb-6 text-center">
          <h1 className="text-xl font-bold text-gray-900">
            {siteName || 'Job Portal'} <span className="text-brand-600">VIP</span>
          </h1>
          <p className="mt-1 text-xs text-gray-500">AI-powered CV builder &amp; smart job matching</p>
        </div>

        <div className="mb-6 flex gap-2 rounded-lg border border-gray-200 bg-gray-50 p-1">
          {['login', 'signup'].map((m) => (
            <button
              key={m}
              onClick={() => {
                setMode(m);
                setError('');
                setNotice('');
              }}
              className={`flex-1 rounded-md px-3 py-2 text-sm font-semibold transition ${
                mode === m ? 'bg-white text-brand-600 shadow-sm' : 'text-gray-500 hover:text-gray-800'
              }`}
            >
              {m === 'login' ? 'Log In' : 'Sign Up'}
            </button>
          ))}
        </div>

        {error && (
          <p className="mb-4 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-600">{error}</p>
        )}
        {notice && (
          <p className="mb-4 rounded-lg border border-brand-200 bg-brand-50 px-3 py-2 text-sm text-brand-700">
            {notice}
          </p>
        )}

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          {mode === 'signup' && (
            <label className="flex flex-col gap-1.5">
              <span className="text-sm font-semibold text-gray-800">Full Name</span>
              <input
                type="text"
                required
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                className="rounded-lg border border-gray-200 bg-gray-50 px-3.5 py-3 text-sm outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-100"
              />
            </label>
          )}
          <label className="flex flex-col gap-1.5">
            <span className="text-sm font-semibold text-gray-800">Email</span>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="rounded-lg border border-gray-200 bg-gray-50 px-3.5 py-3 text-sm outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-100"
            />
          </label>
          <label className="flex flex-col gap-1.5">
            <span className="text-sm font-semibold text-gray-800">Password</span>
            <input
              type="password"
              required
              minLength={6}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="rounded-lg border border-gray-200 bg-gray-50 px-3.5 py-3 text-sm outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-100"
            />
          </label>

          <button
            type="submit"
            disabled={loading}
            className="mt-2 rounded-full bg-brand-600 px-6 py-3 text-sm font-semibold text-white transition hover:bg-brand-700 disabled:opacity-60"
          >
            {loading ? 'Please wait…' : mode === 'login' ? 'Log In' : 'Create Account'}
          </button>
        </form>

        <div className="mt-5 text-center">
          <Link href="/" className="text-sm text-gray-500 hover:text-gray-800">
            ← Back to Home
          </Link>
        </div>
      </div>
    </div>
  );
}
