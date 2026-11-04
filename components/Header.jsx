'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { useNavigationProgress } from './NavigationProgress';
import HomeIcon from './HomeIcons';
import Art3D from './Art3D';
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
  home: 'globe',
  jobs: 'briefcase',
  'study-zone': 'study',
  results: 'trophy',
  scholarships: 'medal',
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
  // Mobile: the full-screen search sheet.
  const [searchOpen, setSearchOpen] = useState(false);
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
    // Hysteresis (60 down / 20 up) so the header never flickers at the threshold.
    const onScroll = () => setCompact((c) => (window.scrollY > 60 ? true : window.scrollY < 20 ? false : c));
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  // Lock body scroll while the mobile drawer is open.
  useEffect(() => {
    document.body.style.overflow = open || searchOpen ? 'hidden' : '';
    return () => {
      document.body.style.overflow = '';
    };
  }, [open, searchOpen]);

  return (
    <>
      <header className={`sticky top-0 z-50 bg-surface ${compact ? 'border-b border-line' : ''}`}>
        {/* Row 1: logo · (tabs | compact search pill) · member link + menu */}
        <div className="mx-auto flex max-w-[1760px] items-center justify-between gap-3 px-4 py-2.5 md:grid md:grid-cols-[1fr_auto_1fr] md:px-10 md:py-3">
          <Link href="/" className="flex min-w-0 items-center gap-2.5">
            <Logo siteName={siteName} logoUrl={logoUrl} />
            {siteName && (
              <span className="hidden truncate text-xl font-bold tracking-tight text-brand-600 md:block">{siteName}</span>
            )}
          </Link>

          {/* Mobile: tap the pill to open the full search sheet (like Airbnb) */}
          <button
            type="button"
            onClick={() => setSearchOpen(true)}
            className="flex min-w-0 flex-1 items-center gap-3 rounded-full border border-line-strong bg-surface py-2.5 pl-4 pr-4 text-left shadow-card md:hidden"
            aria-label="Search jobs"
          >
            <HomeIcon name="search" className="h-5 w-5 flex-shrink-0 text-gray-900" />
            <span className="min-w-0">
              <span className="block truncate text-sm font-semibold leading-tight text-gray-900">Search jobs</span>
              <span className="block truncate text-xs leading-tight text-gray-500">Any type · Anywhere</span>
            </span>
          </button>

          {/* Desktop centre: tabs when expanded, compact search pill after scrolling */}
          <div className="hidden justify-center md:flex">
            {compact ? (
              <button
                type="button"
                onClick={() => setCompact(false)}
                className="flex items-center divide-x divide-line rounded-full border border-line-strong bg-surface py-1.5 pl-2 pr-1.5 text-sm font-semibold text-gray-900 shadow-card transition hover:shadow-pill"
                aria-label="Open search"
              >
                <span className="flex items-center gap-2 px-4">
                  <Art3D name="briefcase" className="h-8 w-8" />
                  Any job
                </span>
                <span className="px-4">Any type</span>
                <span className="px-4 text-gray-500">Anywhere</span>
                <span className="ml-1 flex h-9 w-9 items-center justify-center rounded-full bg-brand-600 text-white">
                  <HomeIcon name="search" className="h-4 w-4" />
                </span>
              </button>
            ) : (
              <nav className="flex items-end gap-2" aria-label="Main">
                {navLinks.map((link) => {
                  const active = isActive(link.href);
                  return (
                    <Link
                      key={link.href}
                      href={link.href}
                      aria-current={active ? 'page' : undefined}
                      className={`group relative flex items-center gap-2.5 rounded-xl px-4 pb-3 pt-1 text-sm font-semibold transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 ${
                        active ? 'text-gray-900' : 'text-gray-500 hover:text-gray-900'
                      }`}
                    >
                      <Art3D
                        name={NAV_ICONS[link.key] || 'globe'}
                        className={`h-11 w-11 transition ${active ? '' : 'opacity-80 group-hover:scale-110 group-hover:opacity-100'}`}
                      />
                      {link.label}
                      {active && <span className="absolute inset-x-3 bottom-0 h-0.5 rounded-full bg-gray-900" />}
                    </Link>
                  );
                })}
              </nav>
            )}
          </div>

          <div className="flex items-center justify-end gap-2">
            {visibility.vip && (
              <Link
                href="/vip"
                className="hidden items-center gap-2 rounded-full px-4 py-2.5 text-sm font-semibold text-gray-900 transition hover:bg-surface-alt lg:inline-flex"
              >
                <Art3D name="star" className="h-6 w-6" />
                VIP Portal
              </Link>
            )}
            <button
              onClick={() => setOpen(true)}
              className="inline-flex h-11 items-center gap-2 rounded-full border border-line-strong px-3 text-gray-800 transition hover:shadow-pill focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500"
              aria-label="Open menu"
            >
              <HomeIcon name="menu" className="h-5 w-5" />
              <span className="hidden h-7 w-7 items-center justify-center rounded-full bg-gray-500 text-white md:flex">
                <HomeIcon name="users" className="h-4 w-4" />
              </span>
            </button>
          </div>
        </div>

        {/* Row 2 (desktop): Airbnb-style segmented search pill — folds away on scroll */}
        {/* Absolutely positioned so toggling it never changes the page height
            (a height change while scrolling made the header flicker). */}
        <div
          className={`absolute inset-x-0 top-full hidden border-b border-line bg-surface transition duration-200 md:block ${
            compact ? 'pointer-events-none -translate-y-2 opacity-0' : 'translate-y-0 opacity-100'
          }`}
          aria-hidden={compact}
        >
          <form
            action="/jobs"
            method="get"
            role="search"
            className="mx-auto mb-5 flex w-full max-w-4xl items-stretch rounded-full border border-line-strong bg-surface shadow-pill"
          >
            <label className="flex min-w-0 flex-[1.5] cursor-text flex-col justify-center rounded-full px-8 py-3 transition hover:bg-surface-alt focus-within:bg-surface-alt focus-within:shadow-pill">
              <span className="text-xs font-bold text-gray-900">What</span>
              <input
                name="q"
                type="search"
                placeholder="Search job title, department or city"
                className="w-full bg-transparent text-sm text-gray-900 outline-none placeholder:text-gray-500"
              />
            </label>
            <span className="my-4 w-px bg-line" />
            <label className="flex min-w-0 flex-1 cursor-pointer flex-col justify-center rounded-full px-7 py-3 transition hover:bg-surface-alt focus-within:bg-surface-alt focus-within:shadow-pill">
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
            <span className="my-4 w-px bg-line" />
            <label className="flex min-w-0 flex-1 cursor-pointer flex-col justify-center rounded-full py-3 pl-7 pr-2 transition hover:bg-surface-alt focus-within:bg-surface-alt focus-within:shadow-pill">
              <span className="text-xs font-bold text-gray-900">Province</span>
              <select name="sector" defaultValue="" className="w-full min-w-0 cursor-pointer appearance-none bg-transparent text-sm text-gray-700 outline-none">
                <option value="">Anywhere</option>
                {SECTORS.map((s) => (
                  <option key={s.value} value={s.value}>
                    {s.value}
                  </option>
                ))}
              </select>
            </label>
            <button
              type="submit"
              className="m-2 flex h-14 items-center gap-2 rounded-full bg-brand-600 px-6 text-sm font-bold text-white transition hover:bg-brand-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-400"
            >
              <HomeIcon name="search" className="h-5 w-5" />
              Search
            </button>
          </form>
        </div>
      </header>
      {/* Reserves the room the expanded search row overlays, so content never jumps. */}
      <div className="hidden h-[92px] md:block" aria-hidden="true" />

      {/* Mobile search sheet (Airbnb-style stacked cards) */}
      {searchOpen && (
        <div className="fixed inset-0 z-[70] flex flex-col bg-surface-alt md:hidden" role="dialog" aria-modal="true" aria-label="Search jobs">
          <div className="flex items-center justify-between px-4 py-4">
            <button
              type="button"
              onClick={() => setSearchOpen(false)}
              className="flex h-9 w-9 items-center justify-center rounded-full border border-line-strong bg-surface text-gray-900"
              aria-label="Close search"
            >
              <HomeIcon name="close" className="h-4 w-4" />
            </button>
            <p className="text-base font-semibold text-gray-900">Find a job</p>
            <span className="w-9" />
          </div>
          <form action="/jobs" method="get" className="flex flex-1 flex-col">
            <div className="flex-1 space-y-3 overflow-y-auto px-4 pb-4">
              <label className="block rounded-3xl bg-surface p-5 shadow-pill">
                <span className="text-lg font-semibold text-gray-900">What job are you looking for?</span>
                <span className="mt-3 flex items-center gap-3 rounded-xl border border-line-strong px-4 py-3.5">
                  <HomeIcon name="search" className="h-5 w-5 text-gray-700" />
                  <input
                    name="q"
                    type="search"
                    autoFocus
                    placeholder="Job title, department or city"
                    className="w-full bg-transparent text-base text-gray-900 outline-none placeholder:text-gray-500"
                  />
                </span>
              </label>

              <fieldset className="rounded-3xl bg-surface p-5 shadow-card">
                <legend className="sr-only">Job type</legend>
                <p className="text-lg font-semibold text-gray-900">Job type</p>
                <div className="mt-3 flex flex-wrap gap-2">
                  {['', ...JOB_TYPES].map((t) => (
                    <label key={t || 'any'} className="cursor-pointer">
                      <input type="radio" name="jobType" value={t} defaultChecked={t === ''} className="peer sr-only" />
                      <span className="inline-block rounded-full border border-line-strong px-4 py-2 text-sm font-semibold text-gray-700 transition peer-checked:border-gray-900 peer-checked:bg-surface-alt peer-checked:text-gray-900 peer-checked:ring-1 peer-checked:ring-gray-900">
                        {t || 'Any type'}
                      </span>
                    </label>
                  ))}
                </div>
              </fieldset>

              <label className="block rounded-3xl bg-surface p-5 shadow-card">
                <span className="text-lg font-semibold text-gray-900">Province</span>
                <select
                  name="sector"
                  defaultValue=""
                  className="mt-3 w-full rounded-xl border border-line-strong bg-surface px-4 py-3.5 text-base text-gray-900 outline-none focus:border-brand-600"
                >
                  <option value="">Anywhere</option>
                  {SECTORS.map((s) => (
                    <option key={s.value} value={s.value}>
                      {s.value}
                    </option>
                  ))}
                </select>
              </label>
            </div>
            <div className="flex items-center justify-between border-t border-line bg-surface px-4 py-3 pb-[max(0.75rem,env(safe-area-inset-bottom))]">
              <button type="reset" className="text-sm font-semibold text-gray-900 underline underline-offset-4">
                Clear all
              </button>
              <button
                type="submit"
                className="inline-flex items-center gap-2 rounded-xl bg-brand-600 px-7 py-3.5 text-base font-bold text-white transition active:scale-[0.98]"
              >
                <HomeIcon name="search" className="h-5 w-5" />
                Search
              </button>
            </div>
          </form>
        </div>
      )}

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
