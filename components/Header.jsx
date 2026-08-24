'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useNavigationProgress } from './NavigationProgress';
import { MenuIcon3D, CloseIcon3D } from './Icons3D';

const NAV_LINKS = [
  { href: '/', label: 'Home' },
  { href: '/jobs', label: 'Jobs' },
  { href: '/students-zone', label: 'Students Zone' },
  { href: '/study-zone', label: 'Study Zone' },
  { href: '/results', label: 'Results' },
  { href: '/scholarships', label: 'Scholarships' },
  { href: '/contact', label: 'Contact Us' },
  { href: '/vip', label: 'VIP Portal' },
];

export default function Header({ siteName, logoUrl }) {
  const [open, setOpen] = useState(false);
  const { setLogo } = useNavigationProgress();

  // Register this page's logo/site name with the global page-loading
  // overlay (see NavigationProgress + PageLoadingOverlay) so that whenever
  // the user clicks a link, the full-page loading overlay knows what logo
  // to show centered on screen — without a separate data fetch.
  useEffect(() => {
    setLogo({ siteName, logoUrl });
  }, [siteName, logoUrl, setLogo]);

  // Lock body scroll while the mobile sidebar is open.
  useEffect(() => {
    document.body.style.overflow = open ? 'hidden' : '';
    return () => {
      document.body.style.overflow = '';
    };
  }, [open]);

  return (
    <>
      <header className="sticky top-0 z-50 bg-brand-600 shadow-lg shadow-brand-900/10">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3.5 md:px-6">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2.5">
            {logoUrl ? (
              <img
                src={logoUrl}
                alt={siteName || 'Logo'}
                className="h-10 w-10 rounded-lg border border-white/20 bg-white/10 object-cover"
              />
            ) : (
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-white font-bold text-brand-600">
                {(siteName || 'P').charAt(0)}
              </div>
            )}
            <span className="text-lg font-bold tracking-tight text-white md:text-xl">
              {siteName || 'Pak Study And Jobs'}
            </span>
          </Link>

          {/* Desktop nav */}
          <nav className="hidden items-center gap-1 md:flex">
            {NAV_LINKS.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="rounded-lg px-3.5 py-2 text-sm font-semibold text-white/85 transition hover:bg-white/10 hover:text-white"
              >
                {link.label}
              </Link>
            ))}
          </nav>

          {/* Mobile hamburger */}
          <button
            onClick={() => setOpen(true)}
            className="inline-flex items-center justify-center rounded-lg p-2 text-white hover:bg-white/10 md:hidden"
            aria-label="Open menu"
          >
            <MenuIcon3D className="h-6 w-6" />
          </button>
        </div>
      </header>

      {/* Mobile sidebar drawer */}
      <div
        className={`fixed inset-0 z-[60] transition-opacity duration-300 md:hidden ${
          open ? 'pointer-events-auto opacity-100' : 'pointer-events-none opacity-0'
        }`}
      >
        <div className="absolute inset-0 bg-black/50" onClick={() => setOpen(false)} />
        <aside
          className={`absolute right-0 top-0 flex h-full w-[80%] max-w-xs flex-col bg-white shadow-2xl transition-transform duration-300 ${
            open ? 'translate-x-0' : 'translate-x-full'
          }`}
        >
          <div className="flex items-center justify-between bg-brand-600 px-5 py-4">
            <span className="text-base font-bold text-white">{siteName || 'Pak Study And Jobs'}</span>
            <button
              onClick={() => setOpen(false)}
              className="rounded-lg p-1.5 text-white hover:bg-white/10"
              aria-label="Close menu"
            >
              <CloseIcon3D className="h-5 w-5" />
            </button>
          </div>
          <nav className="flex flex-1 flex-col gap-1 overflow-y-auto px-3 py-4">
            {NAV_LINKS.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setOpen(false)}
                className="rounded-lg px-4 py-3 text-sm font-semibold text-gray-700 transition hover:bg-brand-50 hover:text-brand-700"
              >
                {link.label}
              </Link>
            ))}
          </nav>
        </aside>
      </div>
    </>
  );
}
