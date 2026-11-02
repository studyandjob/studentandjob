'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { useNavigationProgress } from './NavigationProgress';
import HomeIcon from './HomeIcons';
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

function Logo({ siteName, logoUrl }) {
  if (logoUrl) {
    return (
      <div className="relative h-10 w-10 flex-shrink-0">
        <Image
          src={logoUrl}
          alt={siteName || 'Logo'}
          fill
          sizes="40px"
          priority
          className="rounded-full border border-gray-200 bg-white object-cover"
        />
      </div>
    );
  }
  if (!siteName) return null;
  return (
    <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-brand-600 text-lg font-bold text-white">
      {siteName.charAt(0)}
    </div>
  );
}

export default function Header({ siteName, logoUrl }) {
  const [open, setOpen] = useState(false);
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

  // Lock body scroll while the mobile drawer is open.
  useEffect(() => {
    document.body.style.overflow = open ? 'hidden' : '';
    return () => {
      document.body.style.overflow = '';
    };
  }, [open]);

  return (
    <>
      <header className="sticky top-0 z-50 border-b border-gray-200 bg-white">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-3 md:px-6 md:py-4">
          <Link href="/" className="flex min-w-0 items-center gap-2.5">
            <Logo siteName={siteName} logoUrl={logoUrl} />
            {siteName && (
              <span className="truncate text-lg font-extrabold tracking-tight text-brand-600 md:text-xl">{siteName}</span>
            )}
          </Link>

          {/* Desktop: Airbnb-style pill search */}
          <form
            action="/jobs"
            method="get"
            role="search"
            className="hidden w-full max-w-md items-center rounded-full border border-gray-300 bg-white py-1.5 pl-5 pr-1.5 shadow-card transition focus-within:shadow-pill hover:shadow-pill md:flex"
          >
            <label className="flex-1">
              <span className="sr-only">Search jobs</span>
              <input
                name="q"
                type="search"
                placeholder="Search jobs, departments, cities"
                className="w-full bg-transparent text-sm font-medium text-gray-900 outline-none placeholder:text-gray-500"
              />
            </label>
            <button
              type="submit"
              aria-label="Search"
              className="flex h-9 w-9 items-center justify-center rounded-full bg-brand-600 text-white transition hover:bg-brand-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-400"
            >
              <HomeIcon name="search" className="h-4 w-4" />
            </button>
          </form>

          <div className="flex items-center gap-2">
            {visibility.vip && (
              <Link
                href="/vip"
                className="hidden items-center gap-1.5 rounded-full px-4 py-2.5 text-sm font-semibold text-gray-800 transition hover:bg-gray-100 md:inline-flex"
              >
                <HomeIcon name="star" className="h-4 w-4 text-brand-600" />
                VIP Portal
              </Link>
            )}
            <button
              onClick={() => setOpen(true)}
              className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-gray-300 text-gray-800 transition hover:shadow-pill focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 md:hidden"
              aria-label="Open menu"
            >
              <HomeIcon name="menu" className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* Desktop navigation tabs */}
        <nav className="mx-auto hidden max-w-7xl items-center justify-center gap-1 px-6 md:flex" aria-label="Main">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              aria-current={isActive(link.href) ? 'page' : undefined}
              className={`relative px-4 pb-3 pt-1 text-sm font-semibold transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 ${
                isActive(link.href)
                  ? 'text-gray-900 after:absolute after:inset-x-4 after:bottom-0 after:h-0.5 after:rounded-full after:bg-gray-900'
                  : 'text-gray-500 hover:text-gray-900'
              }`}
            >
              {link.label}
            </Link>
          ))}
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
          className={`absolute right-0 top-0 flex h-full w-[86%] max-w-sm flex-col rounded-l-3xl bg-white shadow-2xl transition-transform duration-300 ${
            open ? 'translate-x-0' : 'translate-x-full'
          }`}
        >
          <div className="flex items-center justify-between border-b border-gray-100 px-5 py-4">
            <span className="text-base font-extrabold text-brand-600">{siteName}</span>
            <button
              onClick={() => setOpen(false)}
              className="flex h-10 w-10 items-center justify-center rounded-full text-gray-700 hover:bg-gray-100"
              aria-label="Close menu"
            >
              <HomeIcon name="close" className="h-5 w-5" />
            </button>
          </div>
          <nav className="flex flex-1 flex-col overflow-y-auto px-3 py-3">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setOpen(false)}
                aria-current={isActive(link.href) ? 'page' : undefined}
                className={`rounded-xl px-4 py-3.5 text-base font-semibold transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 ${
                  isActive(link.href) ? 'bg-gray-100 text-gray-900' : 'text-gray-700 hover:bg-gray-50'
                }`}
              >
                {link.label}
              </Link>
            ))}
            {visibility.vip && (
              <Link
                href="/vip"
                onClick={() => setOpen(false)}
                className="mt-3 inline-flex items-center justify-center gap-2 rounded-xl bg-brand-600 px-4 py-3.5 text-base font-semibold text-white transition hover:bg-brand-700"
              >
                <HomeIcon name="star" className="h-4 w-4" />
                VIP Portal
              </Link>
            )}
            <div className="mt-auto flex flex-wrap gap-x-5 gap-y-2 border-t border-gray-100 px-4 pt-4 text-sm text-gray-500">
              {topLinks
                .filter((l) => !navLinks.some((n) => n.href === l.href))
                .map((l) => (
                  <Link key={l.href} href={l.href} onClick={() => setOpen(false)} className="hover:text-gray-900">
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
