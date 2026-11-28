'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import Link from 'next/link';
import { supabase } from '@/lib/supabaseClient';
import Art3D from '../Art3D';
import HomeIcon from '../HomeIcons';
import { buildNotifications, markNotificationSeen, useOwnerAccount, useSeen } from '@/lib/ownerAccount';

const DOT = { brand: 'bg-brand-500', amber: 'bg-amber-500', green: 'bg-emerald-500', red: 'bg-red-500' };

/** Contents of the profile menu — used in the desktop popover and the mobile drawer. */
export function ProfilePanel({ onNavigate }) {
  const acct = useOwnerAccount();
  const seen = useSeen();
  const notes = useMemo(() => buildNotifications(acct.businesses), [acct.businesses]);

  async function signOut() {
    await supabase.auth.signOut();
    onNavigate?.();
  }

  if (!acct.ready) return <p className="px-4 py-5 text-sm text-gray-500">Load ho raha hai...</p>;

  if (!acct.user) {
    return (
      <div className="p-4">
        <div className="flex items-start gap-3">
          <Art3D name="shop" className="h-11 w-11 flex-shrink-0" />
          <div>
            <p className="text-sm font-bold text-gray-900">Business owners ke liye</p>
            <p className="mt-0.5 text-xs text-gray-500">Google ya email se — na password, na registration form.</p>
          </div>
        </div>
        <div className="mt-4 grid gap-2">
          <Link href="/business/login" onClick={onNavigate} className="rounded-xl bg-gradient-to-b from-brand-500 to-brand-700 px-4 py-2.5 text-center text-sm font-bold text-white shadow-[inset_0_1px_0_rgba(255,255,255,0.4)] hover:brightness-105">
            Login karein
          </Link>
          <Link href="/business/new" onClick={onNavigate} className="rounded-xl border border-line bg-surface px-4 py-2.5 text-center text-sm font-semibold text-gray-800 hover:bg-surface-alt">
            Add your business
          </Link>
        </div>
      </div>
    );
  }

  const email = acct.user.email || '';
  const unseen = notes.filter((n) => !seen.has(n.key)).length;

  return (
    <div>
      <div className="flex items-center gap-3 border-b border-line px-4 py-3.5">
        <span className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-b from-brand-500 to-brand-700 text-base font-bold uppercase text-white">{email[0] || '?'}</span>
        <div className="min-w-0">
          <p className="truncate text-sm font-bold text-gray-900">{email}</p>
          <p className="text-xs text-gray-500">Business account</p>
        </div>
      </div>

      <div className="px-2 py-2">
        <p className="flex items-center gap-2 px-2 pb-1 pt-1 text-xs font-bold uppercase tracking-wide text-gray-500">
          Notifications
          {unseen > 0 && <span className="rounded-full bg-red-500 px-1.5 py-0.5 text-[10px] text-white">{unseen}</span>}
        </p>
        {notes.length === 0 ? (
          <p className="px-2 py-3 text-sm text-gray-500">Koi nayi notification nahi.</p>
        ) : (
          <ul>
            {notes.map((n) => {
              const isNew = !seen.has(n.key);
              return (
                <li key={n.key}>
                  <Link
                    href={n.href}
                    onClick={() => {
                      markNotificationSeen(n.key);
                      onNavigate?.();
                    }}
                    className={`flex items-start gap-3 rounded-xl px-2 py-2.5 transition hover:bg-surface-alt ${isNew ? 'bg-brand-50/60' : ''}`}
                  >
                    <Art3D name={n.art} className="h-9 w-9 flex-shrink-0" />
                    <span className="min-w-0 flex-1">
                      <span className="flex items-center gap-1.5 text-sm font-semibold text-gray-900">
                        {n.title}
                        {isNew && <span className={`h-2 w-2 flex-shrink-0 rounded-full ${DOT[n.tone] || DOT.brand}`} aria-label="Nayi" />}
                      </span>
                      <span className="mt-0.5 line-clamp-2 block text-xs text-gray-600">{n.text}</span>
                    </span>
                    <HomeIcon name="chevronRight" className="mt-2 h-4 w-4 flex-shrink-0 text-gray-400" />
                  </Link>
                </li>
              );
            })}
          </ul>
        )}
      </div>

      <div className="border-t border-line px-2 py-2 text-sm font-semibold text-gray-800">
        <Link href="/business/dashboard" onClick={onNavigate} className="block rounded-xl px-3 py-2.5 hover:bg-surface-alt">Meri listings</Link>
        <Link href="/business/new" onClick={onNavigate} className="block rounded-xl px-3 py-2.5 hover:bg-surface-alt">Naya business add karein</Link>
        <button type="button" onClick={signOut} className="block w-full rounded-xl px-3 py-2.5 text-left text-red-600 hover:bg-red-50">Logout</button>
      </div>
    </div>
  );
}

/**
 * The avatar pill in the header. On desktop it opens the profile popover
 * (with notification-style items such as "Add your business"); on phones it
 * opens the existing slide-in menu, which contains the same panel.
 */
export default function ProfileMenu({ onOpenDrawer }) {
  const acct = useOwnerAccount();
  const seen = useSeen();
  const notes = useMemo(() => buildNotifications(acct.businesses), [acct.businesses]);
  const unseen = acct.user ? notes.filter((n) => !seen.has(n.key)).length : 0;
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    if (!open) return;
    const onDown = (e) => ref.current && !ref.current.contains(e.target) && setOpen(false);
    const onKey = (e) => e.key === 'Escape' && setOpen(false);
    document.addEventListener('mousedown', onDown);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('mousedown', onDown);
      document.removeEventListener('keydown', onKey);
    };
  }, [open]);

  function click() {
    if (window.matchMedia('(max-width: 767px)').matches) return onOpenDrawer?.();
    setOpen((o) => !o);
  }

  const initial = acct.user?.email?.[0]?.toUpperCase();

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={click}
        aria-haspopup="menu"
        aria-expanded={open}
        aria-label={unseen ? `Menu — ${unseen} nayi notification` : 'Menu'}
        className="relative inline-flex h-11 items-center gap-2 rounded-full border border-line-strong px-3 text-gray-800 transition hover:shadow-pill focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500"
      >
        <HomeIcon name="menu" className="h-5 w-5" />
        <span className={`hidden h-7 w-7 items-center justify-center rounded-full text-white md:flex ${initial ? 'bg-gradient-to-b from-brand-500 to-brand-700 text-sm font-bold' : 'bg-gray-500'}`}>
          {initial || <HomeIcon name="users" className="h-4 w-4" />}
        </span>
        {unseen > 0 && (
          <span className="absolute -right-1 -top-1 flex h-[18px] min-w-[18px] items-center justify-center rounded-full bg-red-500 px-1 text-[10px] font-bold text-white shadow ring-2 ring-surface">{unseen}</span>
        )}
      </button>

      {open && (
        <div role="menu" className="absolute right-0 top-full z-[70] mt-2 hidden w-[340px] overflow-hidden rounded-2xl border border-line bg-surface shadow-[0_24px_60px_-20px_rgba(0,0,0,0.45)] md:block">
          <ProfilePanel onNavigate={() => setOpen(false)} />
        </div>
      )}
    </div>
  );
}
