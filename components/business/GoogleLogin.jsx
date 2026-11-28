'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabaseClient';

const GIS_SRC = 'https://accounts.google.com/gsi/client';

function loadGoogleScript() {
  return new Promise((resolve, reject) => {
    if (window.google?.accounts?.id) return resolve();
    const existing = document.querySelector(`script[src="${GIS_SRC}"]`);
    if (existing) {
      existing.addEventListener('load', () => resolve());
      existing.addEventListener('error', reject);
      return;
    }
    const s = document.createElement('script');
    s.src = GIS_SRC;
    s.async = true;
    s.defer = true;
    s.onload = () => resolve();
    s.onerror = reject;
    document.head.appendChild(s);
  });
}

/**
 * Sign in with the Google account the browser already knows — no email code.
 *  - Button: normal Google sign-in (always available once the Google provider
 *    is switched on in Supabase).
 *  - One Tap: if NEXT_PUBLIC_GOOGLE_CLIENT_ID is set, Google offers the
 *    browser's signed-in account automatically as soon as this page opens.
 * Google has already verified the email address, so this is as safe as a code.
 */
export default function GoogleLogin({ target, onError }) {
  const [busy, setBusy] = useState(false);
  const clientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID;

  useEffect(() => {
    if (!clientId) return undefined;
    let cancelled = false;
    loadGoogleScript()
      .then(() => {
        if (cancelled || !window.google?.accounts?.id) return;
        window.google.accounts.id.initialize({
          client_id: clientId,
          auto_select: true,
          cancel_on_tap_outside: false,
          use_fedcm_for_prompt: true,
          callback: async (resp) => {
            const { error } = await supabase.auth.signInWithIdToken({ provider: 'google', token: resp.credential });
            if (error) onError?.('Google login nahi ho saka. Neeche diye button ya email se koshish karein.');
            // On success the auth listener in EmailLogin sends the visitor onward.
          },
        });
        window.google.accounts.id.prompt();
      })
      .catch(() => {});
    return () => {
      cancelled = true;
      try {
        window.google?.accounts?.id?.cancel();
      } catch {}
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [clientId]);

  async function click() {
    setBusy(true);
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo: `${window.location.origin}${target}`, queryParams: { prompt: 'select_account' } },
    });
    if (error) {
      setBusy(false);
      onError?.('Google login abhi tayyar nahi hai. Email se login karein.');
    }
  }

  return (
    <button
      type="button"
      onClick={click}
      disabled={busy}
      className="flex w-full items-center justify-center gap-3 rounded-xl border border-line-strong bg-white px-5 py-3 text-sm font-semibold text-gray-800 shadow-[inset_0_1px_0_rgba(255,255,255,0.9)] transition hover:bg-surface-alt active:scale-[0.99] disabled:opacity-60"
    >
      <svg viewBox="0 0 48 48" className="h-5 w-5" aria-hidden="true">
        <path fill="#FFC107" d="M43.6 20.1H42V20H24v8h11.3C33.7 32.7 29.2 36 24 36c-6.6 0-12-5.4-12-12s5.4-12 12-12c3.1 0 5.8 1.2 8 3l5.7-5.7C34 6.1 29.3 4 24 4 13 4 4 13 4 24s9 20 20 20 20-9 20-20c0-1.3-.1-2.6-.4-3.9z" />
        <path fill="#FF3D00" d="M6.3 14.7l6.6 4.8C14.7 15.1 19 12 24 12c3.1 0 5.8 1.2 8 3l5.7-5.7C34 6.1 29.3 4 24 4 16.3 4 9.7 8.3 6.3 14.7z" />
        <path fill="#4CAF50" d="M24 44c5.2 0 9.9-2 13.4-5.2l-6.2-5.2C29.2 35.1 26.7 36 24 36c-5.2 0-9.6-3.3-11.3-8l-6.5 5C9.5 39.6 16.2 44 24 44z" />
        <path fill="#1976D2" d="M43.6 20.1H42V20H24v8h11.3c-.8 2.2-2.2 4.2-4.1 5.6l6.2 5.2C37 39.2 44 34 44 24c0-1.3-.1-2.6-.4-3.9z" />
      </svg>
      {busy ? 'Google par ja rahe hain...' : 'Google se login karein'}
    </button>
  );
}
