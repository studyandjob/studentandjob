'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { useNavigationProgress } from './NavigationProgress';
import HomeIcon from './HomeIcons';
import { SECTORS, JOB_TYPES } from '@/lib/matching';
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

// Icon shown beside each desktop tab.
const NAV_ICONS = {
  home: 'home',
  jobs: 'briefcase',
  'study-zone': 'grad',
  results: 'award',
  scholarships: 'gift',
  contact: 'mail',
};

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
          className="rounded-full border border-line bg-surface object-cover"
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
  // Desktop: the big search pill folds away once the page is scrolled.
  const [compact, setCompact] = useState(false);
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

  useEffect(() => {
    const onScroll = () => setCompact(window.scrollY > 40);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
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
      <header className="sticky top-0 z-50 border-b border-line bg-surface">
        {/* Row 1: logo · section tabs · member link + menu */}
        <div className="mx-auto flex max-w-[1760px] items-center justify-between gap-3 px-4 py-3 md:grid md:grid-cols-[1fr_auto_1fr] md:px-10 md:py-4">
          <Link href="/" className="flex min-w-0 items-center gap-2.5">
            <Logo siteName={siteName} logoUrl={logoUrl} />
            {siteName && (
              <span className="hidden truncate text-xl font-bold tracking-tight text-brand-600 md:block">{siteName}</span>
            )}
          </Link>

          {/* Mobile: pill search sits between logo and menu */}
          <form
            action="/jobs"
            method="get"
            role="search"
            className="flex min-w-0 flex-1 items-center gap-2 rounded-full border border-line-strong bg-surface py-2 pl-4 pr-2 shadow-card md:hidden"
          >
            <HomeIcon name="search" className="h-4 w-4 flex-shrink-0 text-gray-800" />
            <label className="min-w-0 flex-1">
              <span className="sr-only">Search jobs</span>
              <input
                name="q"
                type="search"
                placeholder="Search jobs"
                className="w-full bg-transparent text-sm font-semibold text-gray-900 outline-none placeholder:text-gray-800"
              />
            </label>
          </form>

          {/* Desktop section tabs (icon + label) */}
          <nav className="hidden items-center gap-1 md:flex" aria-label="Main">
            {navLinks.map((link) => {
              const active = isActive(link.href);
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  aria-current={active ? 'page' : undefined}
                  className={`group relative flex items-center gap-2 rounded-full px-4 py-2.5 text-sm font-semibold transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 ${
                    active ? 'text-gray-900' : 'text-gray-500 hover:bg-surface-alt hover:text-gray-900'
                  }`}
                >
                  <HomeIcon name={NAV_ICONS[link.key] || 'home'} className="h-5 w-5" />
                  {link.label}
                  {active && <span className="absolute inset-x-4 -bottom-[17px] h-0.5 rounded-full bg-brand-600" />}
                </Link>
              );
            })}
          </nav>

          <div className="flex items-center justify-end gap-2">
            {compact && (
              <button
                type="button"
                onClick={() => setCompact(false)}
                className="hidden items-center gap-2 rounded-full border border-line-strong py-2 pl-4 pr-2 text-sm font-semibold text-gray-900 shadow-card transition hover:shadow-pill md:flex"
              >
                Search
                <span className="flex h-7 w-7 items-center justify-center rounded-full bg-brand-600 text-white">
                  <HomeIcon name="search" className="h-3.5 w-3.5" />
                </span>
              </button>
            )}
            {visibility.vip && (
              <Link
                href="/vip"
                className="hidden items-center gap-1.5 rounded-full px-4 py-2.5 text-sm font-semibold text-gray-800 transition hover:bg-surface-alt lg:inline-flex"
              >
                <HomeIcon name="star" className="h-4 w-4 text-brand-600" />
                VIP Portal
              </Link>
            )}
            <button
              onClick={() => setOpen(true)}
              className="inline-flex h-11 items-center gap-2 rounded-full border border-line-strong px-3 text-gray-800 transition hover:shadow-pill focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500"
              aria-label="Open menu"
            >
              <HomeIcon name="menu" className="h-5 w-5" />
              <span className="hidden h-7 w-7 items-center justify-center rounded-full bg-brand-600 text-white md:flex">
                <HomeIcon name="users" className="h-4 w-4" />
              </span>
            </button>
          </div>
        </div>

        {/* Row 2 (desktop): Airbnb-style segmented search pill — collapses on scroll */}
        <div
          className={`hidden overflow-hidden transition-all duration-300 md:block ${
            compact ? 'max-h-0 opacity-0' : 'max-h-28 opacity-100'
          }`}
        >
          <form
            action="/jobs"
            method="get"
            role="search"
            className="mx-auto mb-4 flex w-full max-w-3xl items-stretch rounded-full border border-line-strong bg-surface shadow-pill"
          >
            <label className="group flex min-w-0 flex-[1.4] cursor-text flex-col justify-center rounded-full px-7 py-2.5 transition hover:bg-surface-alt focus-within:bg-surface-alt">
              <span className="text-xs font-bold text-gray-900">What</span>
              <input
                name="q"
                type="search"
                placeholder="Job title, department or city"
                className="w-full bg-transparent text-sm text-gray-900 outline-none placeholder:text-gray-500"
              />
            </label>
            <span className="my-3 w-px bg-gray-200" />
            <label className="flex min-w-0 flex-1 cursor-pointer flex-col justify-center rounded-full px-6 py-2.5 transition hover:bg-surface-alt focus-within:bg-surface-alt">
              <span className="text-xs font-bold text-gray-900">Job type</span>
              <select name="jobType" defaultValue="" className="w-full cursor-pointer appearance-none bg-transparent text-sm text-gray-700 outline-none">
                <option value="">Any type</option>
                {JOB_TYPES.map((t) => (
                  <option key={t} value={t}>
                    {t}
                  </option>
                ))}
              </select>
            </label>
            <span className="my-3 w-px bg-gray-200" />
            <label className="flex min-w-0 flex-1 cursor-pointer flex-col justify-center rounded-full py-2.5 pl-6 pr-2 transition hover:bg-surface-alt focus-within:bg-surface-alt">
              <span className="text-xs font-bold text-gray-900">Province</span>
              <span className="flex items-center gap-2">
                <select name="sector" defaultValue="" className="w-full min-w-0 cursor-pointer appearance-none bg-transparent text-sm text-gray-700 outline-none">
                  <option value="">Anywhere</option>
                  {SECTORS.map((s) => (
                    <option key={s.value} value={s.value}>
                      {s.value}
                    </option>
                  ))}
                </select>
              </span>
            </label>
            <button
              type="submit"
              aria-label="Search"
              className="m-2 flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full bg-brand-600 text-white transition hover:bg-brand-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-400"
            >
              <HomeIcon name="search" className="h-5 w-5" />
            </button>
          </form>
        </div>
      </header>

      {/* Mobile drawer */}
      <div
        className={`fixed inset-0 z-[60] transition-opacity duration-300 md:hidden ${
          open ? 'pointer-events-auto opacity-100' : 'pointer-events-none opacity-0'
        }`}
      >
        <div className="absolute inset-0 bg-black/50" onClick={() => setOpen(false)} />
        <aside
          className={`absolute right-0 top-0 flex h-full w-[86%] max-w-sm flex-col rounded-l-3xl bg-surface shadow-2xl transition-transform duration-300 ${
            open ? 'translate-x-0' : 'translate-x-full'
          }`}
        >
          <div className="flex items-center justify-between border-b border-line px-5 py-4">
            <span className="text-base font-bold text-brand-600">{siteName}</span>
            <button
              onClick={() => setOpen(false)}
              className="flex h-10 w-10 items-center justify-center rounded-full text-gray-700 hover:bg-surface-alt"
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
                  isActive(link.href) ? 'bg-surface-alt text-gray-900' : 'text-gray-700 hover:bg-surface-alt'
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
            <div className="mt-auto flex flex-wrap gap-x-5 gap-y-2 border-t border-line px-4 pt-4 text-sm text-gray-500">
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
