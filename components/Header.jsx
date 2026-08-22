'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useNavigationProgress } from './NavigationProgress';

const NAV_LINKS = [
  { href: '/', label: 'Home' },
  { href: '/jobs', label: 'Jobs' },
  { href: '/students-zone', label: 'Students Zone' },
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

  return (
    <header className="sticky top-0 z-50 bg-white shadow-sm">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 md:px-6">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2">
          {logoUrl ? (
            // Plain <img> on purpose (not next/image) — same reasoning as the
            // Contact Us photos: an admin-entered logo URL is already a
            // final image URL, and next/image's optimizer has a track record
            // of failing silently in production for external URLs like this.
            <img
              src={logoUrl}
              alt={siteName || 'Logo'}
              className="h-10 w-10 rounded-md object-cover"
            />
          ) : (
            <div className="flex h-10 w-10 items-center justify-center rounded-md bg-brand-600 font-bold text-white">
              {(siteName || 'P').charAt(0)}
            </div>
          )}
          <span className="text-lg font-bold text-gray-900 md:text-xl">
            {siteName || 'Education & Job Portal'}
          </span>
        </Link>

        {/* Desktop nav */}
        <nav className="hidden items-center gap-6 md:flex">
          {NAV_LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="text-sm font-medium text-gray-600 transition hover:text-brand-600"
            >
              {link.label}
            </Link>
          ))}
        </nav>

        {/* Mobile menu button */}
        <button
          onClick={() => setOpen(!open)}
          className="inline-flex items-center justify-center rounded-md p-2 text-gray-600 hover:bg-gray-100 md:hidden"
          aria-label="Toggle menu"
        >
          <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            {open ? (
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            ) : (
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            )}
          </svg>
        </button>
      </div>

      {/* Mobile nav */}
      {open && (
        <nav className="flex flex-col gap-1 border-t bg-white px-4 py-3 md:hidden">
          {NAV_LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              onClick={() => setOpen(false)}
              className="rounded-md px-3 py-2 text-sm font-medium text-gray-700 hover:bg-brand-50 hover:text-brand-600"
            >
              {link.label}
            </Link>
          ))}
        </nav>
      )}
    </header>
  );
}
