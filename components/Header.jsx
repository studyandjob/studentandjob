'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { useNavigationProgress } from './NavigationProgress';
import { MenuIcon3D, CloseIcon3D, StarIcon3D } from './Icons3D';
import { useSiteConfig } from './SiteConfigProvider';

// VIP Portal is rendered separately (as a distinct button) rather than in
// this list. Routes are unchanged.
const NAV_LINKS = [
  { key: 'home', href: '/', label: 'Home' },
  { key: 'jobs', href: '/jobs', label: 'Jobs' },
  { key: 'study-zone', href: '/study-zone', label: 'Study Zone' },
  { key: 'results', href: '/results', label: 'Results' },
  { key: 'scholarships', href: '/scholarships', label: 'Scholarships' },
  { key: 'contact', href: '/contact', label: 'Contact Us' },
];

// Small links in the thin top bar (desktop only).
const TOP_LINKS = [
  { key: 'about', href: '/about-us', label: 'About Us' },
  { key: 'privacy', href: '/privacy-policy', label: 'Privacy Policy' },
  { key: 'contact', href: '/contact', label: 'Contact' },
];

function Logo({ siteName, logoUrl, size = 'md' }) {
  const box = size === 'lg' ? 'h-14 w-14' : 'h-10 w-10';
  if (logoUrl) {
    return (
      <div className={`relative ${box} flex-shrink-0`}>
        <Image
          src={logoUrl}
          alt={siteName || 'Logo'}
          fill
          sizes="56px"
          priority
          className="rounded-full border border-white/40 bg-white object-cover"
        />
      </div>
    );
  }
  if (!siteName) return null;
  return (
    <div className={`flex ${box} flex-shrink-0 items-center justify-center rounded-full bg-white text-lg font-bold text-brand-700`}>
      {siteName.charAt(0)}
    </div>
  );
}

export default function Header({ siteName, logoUrl }) {
  const [open, setOpen] = useState(false);
  const [today, setToday] = useState('');
  const { setLogo } = useNavigationProgress();
  const pathname = usePathname();
  // Only pages switched on in Admin → Pages & Ads appear in the menu.
  const { visibility } = useSiteConfig();
  const navLinks = NAV_LINKS.filter((l) => visibility[l.key] !== false);
  const topLinks = TOP_LINKS.filter((l) => visibility[l.key] !== false);

  // "/" is active only on the exact home page; other links are active on
  // their own path or any nested route (e.g. /jobs/123).
  function isActive(href) {
    if (href === '/') return pathname === '/';
    return pathname === href || pathname?.startsWith(`${href}/`);
  }

  // Register this page's logo/site name with the global page-loading overlay.
  useEffect(() => {
    setLogo({ siteName, logoUrl });
  }, [siteName, logoUrl, setLogo]);

  // Date is set after mount so server and browser HTML always match.
  useEffect(() => {
    setToday(
      new Date().toLocaleDateString('en-GB', {
        weekday: 'long',
        day: 'numeric',
        month: 'long',
        year: 'numeric',
        timeZone: 'Asia/Karachi',
      })
    );
  }, []);

  // Lock body scroll while the mobile drawer is open.
  useEffect(() => {
    document.body.style.overflow = open ? 'hidden' : '';
    return () => {
      document.body.style.overflow = '';
    };
  }, [open]);

  return (
    <>
      {/* Thin top bar: date + small links (desktop) */}
      <div className="hidden bg-brand-900 text-xs text-white/75 md:block">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-1.5">
          <span>{today || '\u00A0'}</span>
          <nav className="flex items-center gap-5" aria-label="Secondary">
            {topLinks.map((l) => (
              <Link key={l.href} href={l.href} className="transition hover:text-white">
                {l.label}
              </Link>
            ))}
          </nav>
        </div>
      </div>

      {/* Masthead: name on the left, search on the right (desktop) */}
      <div className="hidden border-b border-gray-200 bg-white md:block">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-6 px-6 py-4">
          <Link href="/" className="flex items-center gap-4">
            {logoUrl ? (
              <div className="relative h-16 w-16 flex-shrink-0">
                <Image
                  src={logoUrl}
                  alt={siteName || 'Logo'}
                  fill
                  sizes="64px"
                  priority
                  className="rounded-full border border-gray-200 bg-white object-cover"
                />
              </div>
            ) : (
              siteName && (
                <div className="flex h-16 w-16 flex-shrink-0 items-center justify-center rounded-full bg-brand-600 text-2xl font-bold text-white">
                  {siteName.charAt(0)}
                </div>
              )
            )}
            <span>
              {siteName && (
                <span className="block font-serif text-3xl font-bold tracking-tight text-brand-900">{siteName}</span>
              )}
              <span className="mt-0.5 block text-sm text-gray-500">Government and private jobs in Pakistan</span>
            </span>
          </Link>

          <form action="/jobs" method="get" role="search" className="flex w-full max-w-sm items-stretch">
            <label className="flex-1">
              <span className="sr-only">Search jobs</span>
              <input
                name="q"
                type="search"
                placeholder="Search jobs, departments, cities"
                className="h-11 w-full rounded-l-md border border-gray-300 bg-white px-3 text-sm text-gray-900 outline-none focus:border-brand-600 focus:ring-2 focus:ring-brand-200"
              />
            </label>
            <button
              type="submit"
              className="h-11 rounded-r-md bg-brand-600 px-5 text-sm font-semibold text-white transition hover:bg-brand-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-400"
            >
              Search
            </button>
          </form>
        </div>
      </div>

      {/* Sticky bar: brand row on phones, navigation on desktop */}
      <header className="sticky top-0 z-50 border-b-2 border-accent-500 bg-brand-600 shadow-md">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-2 md:hidden">
          <Link href="/" className="flex min-w-0 items-center gap-3">
            <Logo siteName={siteName} logoUrl={logoUrl} />
            {siteName && <span className="truncate font-serif text-lg font-bold tracking-tight text-white">{siteName}</span>}
          </Link>
          <button
            onClick={() => setOpen(true)}
            className="inline-flex h-11 w-11 items-center justify-center rounded-md text-white hover:bg-white/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white"
            aria-label="Open menu"
          >
            <MenuIcon3D className="h-6 w-6" />
          </button>
        </div>

        <nav className="mx-auto hidden max-w-7xl items-center px-6 md:flex" aria-label="Main">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              aria-current={isActive(link.href) ? 'page' : undefined}
              className={`relative px-4 py-3 text-sm font-semibold transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-white ${
                isActive(link.href) ? 'bg-black/25 text-white' : 'text-white/85 hover:bg-white/10 hover:text-white'
              }`}
            >
              {link.label}
            </Link>
          ))}
          {visibility.vip && (
            <Link
              href="/vip"
              className="ml-auto inline-flex items-center gap-1.5 rounded-md bg-accent-500 px-3.5 py-1.5 text-sm font-semibold text-white transition hover:bg-accent-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white"
            >
              <StarIcon3D className="h-4 w-4" />
              VIP Portal
            </Link>
          )}
        </nav>
      </header>

      {/* Mobile drawer */}
      <div
        className={`fixed inset-0 z-[60] transition-opacity duration-300 md:hidden ${
          open ? 'pointer-events-auto opacity-100' : 'pointer-events-none opacity-0'
        }`}
      >
        <div className="absolute inset-0 bg-black/50" onClick={() => setOpen(false)} />
        <aside
          className={`absolute right-0 top-0 flex h-full w-[82%] max-w-xs flex-col bg-white shadow-2xl transition-transform duration-300 ${
            open ? 'translate-x-0' : 'translate-x-full'
          }`}
        >
          <div className="flex items-center justify-between bg-brand-600 px-5 py-4">
            <span className="font-serif text-base font-bold text-white">{siteName}</span>
            <button
              onClick={() => setOpen(false)}
              className="rounded-md p-1.5 text-white hover:bg-white/10"
              aria-label="Close menu"
            >
              <CloseIcon3D className="h-5 w-5" />
            </button>
          </div>
          <nav className="flex flex-1 flex-col overflow-y-auto py-2">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setOpen(false)}
                aria-current={isActive(link.href) ? 'page' : undefined}
                className={`border-l-4 px-5 py-3.5 text-sm font-semibold transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-brand-500 ${
                  isActive(link.href)
                    ? 'border-accent-500 bg-brand-50 text-brand-800'
                    : 'border-transparent text-gray-700 hover:bg-gray-50 hover:text-brand-800'
                }`}
              >
                {link.label}
              </Link>
            ))}
            {visibility.vip && (
              <Link
                href="/vip"
                onClick={() => setOpen(false)}
                className="mx-5 mt-3 inline-flex items-center justify-center gap-1.5 rounded-md bg-accent-500 px-4 py-3 text-sm font-semibold text-white"
              >
                <StarIcon3D className="h-4 w-4" />
                VIP Portal
              </Link>
            )}
            <div className="mt-auto border-t border-gray-200 px-5 py-4 text-xs text-gray-500">
              {topLinks
                .filter((l) => !navLinks.some((n) => n.href === l.href))
                .map((l) => (
                  <Link key={l.href} href={l.href} onClick={() => setOpen(false)} className="mr-4 hover:text-brand-700">
                    {l.label}
                  </Link>
                ))}
            </div>
          </nav>
        </aside>
      </div>
    </>
  );
}
