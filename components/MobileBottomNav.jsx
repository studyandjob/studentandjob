'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  BriefcaseIcon3D,
  GraduationCapIcon3D,
  VerifiedBadgeIcon3D,
  MenuIcon3D,
  CloseIcon3D,
} from './Icons3D';

// Compact home icon — not in Icons3D's set, kept local since it's only
// used here.
function HomeIcon({ className = '', active = false }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="none" stroke="currentColor" strokeWidth={active ? 2.4 : 2}>
      <path d="M3 11.5 12 4l9 7.5" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M5.5 10v9.5a1 1 0 0 0 1 1H9.5a1 1 0 0 0 1-1V15a1 1 0 0 1 1-1h1a1 1 0 0 1 1 1v4.5a1 1 0 0 0 1 1h3a1 1 0 0 0 1-1V10" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

const TABS = [
  { href: '/', label: 'Home', Icon: HomeIcon },
  { href: '/jobs', label: 'Jobs', Icon: BriefcaseIcon3D },
  { href: '/study-zone', label: 'Study Zone', Icon: GraduationCapIcon3D },
  { href: '/results', label: 'Results', Icon: VerifiedBadgeIcon3D },
];

const MORE_LINKS = [
  { href: '/scholarships', label: 'Scholarships' },
  { href: '/contact', label: 'Contact Us' },
  { href: '/vip', label: 'VIP Portal' },
];

/**
 * Sticky bottom tab bar shown only on small screens (mobile view in the
 * reference design). Rendered once in the root layout so it's available
 * on every page — app/layout.js reserves the matching bottom padding on
 * <body> so page content never sits underneath it.
 */
export default function MobileBottomNav() {
  const pathname = usePathname();
  const [moreOpen, setMoreOpen] = useState(false);

  // The admin dashboard has its own sidebar/navigation — this bar is only
  // for the public site.
  if (pathname?.startsWith('/admin')) return null;

  return (
    <>
      <nav
        className="fixed inset-x-0 bottom-0 z-40 flex items-stretch justify-between border-t border-gray-100 bg-white px-1 shadow-[0_-2px_10px_rgba(0,0,0,0.05)] md:hidden"
        aria-label="Primary"
      >
        {TABS.map(({ href, label, Icon }) => {
          const active = pathname === href;
          return (
            <Link
              key={href}
              href={href}
              className={`flex flex-1 flex-col items-center justify-center gap-1 py-2 text-[11px] font-semibold ${
                active ? 'text-brand-600' : 'text-gray-500'
              }`}
            >
              {Icon === HomeIcon ? <Icon className="h-5 w-5" active={active} /> : <Icon className="h-5 w-5" />}
              {label}
            </Link>
          );
        })}
        <button
          onClick={() => setMoreOpen(true)}
          className="flex flex-1 flex-col items-center justify-center gap-1 py-2 text-[11px] font-semibold text-gray-500"
        >
          <MenuIcon3D className="h-5 w-5" />
          Menu
        </button>
      </nav>

      {/* "More" sheet — the tab bar only has room for 4-5 items, so the
          remaining nav links (Scholarships, Contact, VIP Portal) live
          behind this Menu tab instead of being dropped entirely. */}
      <div
        className={`fixed inset-0 z-50 transition-opacity duration-200 md:hidden ${
          moreOpen ? 'pointer-events-auto opacity-100' : 'pointer-events-none opacity-0'
        }`}
      >
        <div className="absolute inset-0 bg-black/40" onClick={() => setMoreOpen(false)} />
        <div
          className={`absolute inset-x-0 bottom-0 rounded-t-2xl bg-white p-4 pb-6 shadow-xl transition-transform duration-200 ${
            moreOpen ? 'translate-y-0' : 'translate-y-full'
          }`}
        >
          <div className="mb-3 flex items-center justify-between">
            <span className="text-sm font-bold text-gray-900">More</span>
            <button
              onClick={() => setMoreOpen(false)}
              className="rounded-lg p-1.5 text-gray-500 hover:bg-gray-50"
              aria-label="Close menu"
            >
              <CloseIcon3D className="h-5 w-5" />
            </button>
          </div>
          <ul className="flex flex-col divide-y divide-gray-100">
            {MORE_LINKS.map((link) => (
              <li key={link.href}>
                <Link
                  href={link.href}
                  onClick={() => setMoreOpen(false)}
                  className="block py-3 text-sm font-semibold text-gray-700"
                >
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </>
  );
}
