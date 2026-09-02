'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useNavigationProgress } from './NavigationProgress';
import { MenuIcon3D, CloseIcon3D, StarIcon3D } from './Icons3D';

// VIP Portal is rendered separately (as a distinguished CTA button) rather
// than living in this list, so it doesn't get the same plain nav-link
// treatment as the others — see the brief's "distinguish VIP Portal as a
// CTA" requirement. Route itself is unchanged.
const NAV_LINKS = [
  { href: '/', label: 'Home' },
  { href: '/jobs', label: 'Jobs' },
  { href: '/study-zone', label: 'Study Zone' },
  { href: '/results', label: 'Results' },
  { href: '/scholarships', label: 'Scholarships' },
  { href: '/contact', label: 'Contact Us' },
];

export default function Header({ siteName, logoUrl }) {
  const [open, setOpen] = useState(false);
  const { setLogo } = useNavigationProgress();
  const pathname = usePathname();

  // "/" should only be active on the exact home page; every other link is
  // active on its own path or any nested route under it (e.g. /jobs/123).
  function isActive(href) {
    if (href === '/') return pathname === '/';
    return pathname === href || pathname?.startsWith(`${href}/`);
  }

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
      <header className="sticky top-0 z-50 border-b border-brand-100 bg-white shadow-sm">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 md:px-6">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2.5">
            {logoUrl ? (
              <img
                src={logoUrl}
                alt={siteName || 'Logo'}
                className="h-10 w-10 rounded-full border-2 border-brand-200 bg-brand-50 object-cover shadow-sm"
              />
            ) : (
              siteName && (
                <div className="flex h-10 w-10 items-center justify-center rounded-full border-2 border-brand-200 bg-brand-600 font-bold text-white shadow-sm">
                  {siteName.charAt(0)}
                </div>
              )
            )}
            {siteName && (
              <span className="font-serif text-lg font-bold tracking-tight text-gray-900 md:text-xl">
                {siteName}
              </span>
            )}
          </Link>

          {/* Desktop nav */}
          <nav className="hidden items-center gap-1 md:flex">
            {NAV_LINKS.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                aria-current={isActive(link.href) ? 'page' : undefined}
                className={`rounded-lg px-3.5 py-2 text-sm font-semibold transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 focus-visible:ring-offset-2 ${
                  isActive(link.href) ? 'bg-brand-50 text-brand-700' : 'text-gray-600 hover:bg-brand-50 hover:text-brand-700'
                }`}
              >
                {link.label}
              </Link>
            ))}
            {/* VIP Portal — distinguished as its own CTA rather than a
                plain nav link, same route as before. */}
            <Link
              href="/vip"
              className="ml-1 inline-flex items-center gap-1.5 rounded-lg bg-gradient-to-r from-accent-600 to-accent-700 px-3.5 py-2 text-sm font-semibold text-white shadow-sm shadow-accent-600/20 transition hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-500 focus-visible:ring-offset-2"
            >
              <StarIcon3D className="h-4 w-4" />
              VIP Portal
            </Link>
          </nav>

          {/* Mobile hamburger */}
          <button
            onClick={() => setOpen(true)}
            className="inline-flex items-center justify-center rounded-lg p-2 text-brand-700 hover:bg-brand-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 focus-visible:ring-offset-2 md:hidden"
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
            <span className="text-base font-bold text-white">{siteName}</span>
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
                aria-current={isActive(link.href) ? 'page' : undefined}
                className={`rounded-lg px-4 py-3 text-sm font-semibold transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 ${
                  isActive(link.href) ? 'bg-brand-50 text-brand-700' : 'text-gray-700 hover:bg-brand-50 hover:text-brand-700'
                }`}
              >
                {link.label}
              </Link>
            ))}
            {/* VIP Portal CTA — kept at the bottom of the drawer, visually
                distinct, same as the desktop nav. */}
            <Link
              href="/vip"
              onClick={() => setOpen(false)}
              className="mt-2 inline-flex items-center justify-center gap-1.5 rounded-lg bg-gradient-to-r from-accent-600 to-accent-700 px-4 py-3 text-sm font-semibold text-white shadow-sm"
            >
              <StarIcon3D className="h-4 w-4" />
              VIP Portal
            </Link>
          </nav>
        </aside>
      </div>
    </>
  );
}
