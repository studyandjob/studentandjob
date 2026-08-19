'use client';

import { useState } from 'react';
import Link from 'next/link';
import { supabase } from '@/lib/supabaseClient';
import { EyeIcon, ArrowLeftIcon } from './icons';

export default function AdminLogin({ onLoggedIn, siteName }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleLogin(e) {
    e.preventDefault();
    setError('');
    setLoading(true);
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    setLoading(false);
    if (error) {
      setError(error.message);
      return;
    }
    onLoggedIn(data.session);
  }

  return (
    <div
      className="flex min-h-screen items-center justify-center px-4 py-10"
      style={{ background: 'linear-gradient(160deg, #14534F 0%, #1E7A73 100%)' }}
    >
      <div className="w-full max-w-[420px] rounded-[22px] bg-white p-8 shadow-2xl sm:p-10">
        {/* Logo / brand */}
        <div className="mb-7 text-center">
          <div className="mx-auto mb-3 flex h-[70px] w-[70px] items-center justify-center rounded-full border-[3px] border-agold bg-atl text-2xl font-bold text-white">
            {(siteName || 'A').charAt(0)}
          </div>
          <h1 className="font-serif text-xl font-bold text-atl">
            {siteName || 'Admin'} <em className="font-serif italic text-acoral">Portal</em>
          </h1>
          <p className="mt-1 text-xs text-amuted">Content Management Dashboard</p>
        </div>

        <h2 className="mb-6 text-center font-serif text-lg font-bold text-aink">Admin Login</h2>

        {error && (
          <p className="mb-4 rounded-lg border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-600">{error}</p>
        )}

        <form onSubmit={handleLogin}>
          <label className="mb-4 flex flex-col gap-1.5">
            <span className="text-sm font-semibold text-aink">Email</span>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="admin@example.com"
              autoComplete="off"
              className="rounded-[10px] border border-aline bg-[#FCFAF6] px-3.5 py-3 text-[0.93rem] text-aink outline-none transition focus:border-atl2 focus:ring-[3px] focus:ring-atl2/10"
            />
          </label>

          <label className="mb-2 flex flex-col gap-1.5">
            <span className="text-sm font-semibold text-aink">Password</span>
            <div className="relative">
              <input
                type={showPass ? 'text' : 'password'}
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                autoComplete="off"
                className="w-full rounded-[10px] border border-aline bg-[#FCFAF6] px-3.5 py-3 pr-11 text-[0.93rem] text-aink outline-none transition focus:border-atl2 focus:ring-[3px] focus:ring-atl2/10"
              />
              <button
                type="button"
                onClick={() => setShowPass((s) => !s)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-amuted hover:text-aink"
                aria-label="Toggle password visibility"
              >
                <EyeIcon className="h-5 w-5" />
              </button>
            </div>
          </label>

          <button
            type="submit"
            disabled={loading}
            className="mt-5 flex w-full items-center justify-center gap-2 rounded-full px-6 py-3 text-sm font-semibold text-white shadow-[0_6px_18px_-6px_rgba(242,120,92,0.5)] transition hover:-translate-y-0.5 hover:shadow-[0_10px_24px_-8px_rgba(242,120,92,0.6)] disabled:opacity-60"
            style={{ background: 'linear-gradient(135deg, #E8A33D, #F2785C)' }}
          >
            {loading ? 'Signing in...' : 'Login to Dashboard'}
          </button>
        </form>

        <div className="mt-4 border-t border-aline pt-3.5 text-center">
          <Link href="/" className="inline-flex items-center gap-1.5 text-sm text-amuted hover:text-aink">
            <ArrowLeftIcon className="h-3.5 w-3.5" />
            Back to Home Page
          </Link>
        </div>

        <p className="mt-4 text-center text-[0.72rem] text-amuted">
          Only accounts created by the site owner can access this dashboard.
        </p>
      </div>
    </div>
  );
}
