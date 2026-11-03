'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import HomeIconSet from './HomeIcons';
import { useSiteConfig } from './SiteConfigProvider';

// Line icons (Airbnb-style): outline when idle, heavier stroke when active.
function mk(name) {
  return function Icon({ className = '', active = false }) {
    return (
      <span className={active ? '[&_svg]:stroke-[2.4]' : ''}>
        <HomeIconSet name={name} className={className} />
      </span>
    );
  };
}
const HomeIcon = mk('home');
const BriefcaseIcon3D = mk('briefcase');
const MailIcon3D = mk('mail');
const GraduationCapIcon3D = mk('grad');
const VerifiedBadgeIcon3D = mk('award');
const StarIcon3D = mk('star');
const MenuIcon3D = mk('menu');
const CloseIcon3D = mk('close');

// Every possible entry, in display order. Only pages switched on in
// Admin → Pages & Ads are shown.
const ALL_ITEMS = [
  { key: 'home', href: '/', label: 'Home', Icon: HomeIcon },
  { key: 'jobs', href: '/jobs', label: 'Jobs', Icon: BriefcaseIcon3D },
  { key: 'contact', href: '/contact', label: 'Contact', Icon: MailIcon3D },
  { key: 'study-zone', href: '/study-zone', label: 'Study Zone', Icon: GraduationCapIcon3D },
  { key: 'results', href: '/results', label: 'Results', Icon: VerifiedBadgeIcon3D },
  { key: 'scholarships', href: '/scholarships', label: 'Scholarships', Icon: VerifiedBadgeIcon3D },
  { key: 'vip', href: '/vip', label: 'VIP Portal', Icon: StarIcon3D },
];

const MAX_TABS = 5;

/**
 * Sticky bottom tab bar shown only on small screens. With just Home, Jobs
 * and Contact switched on, all three are tabs and there is no "Menu"
 * button. If more pages are switched on, the first four become tabs and
 * the rest move into a "Menu" sheet.
 */
export default function MobileBottomNav() {
  const pathname = usePathname();
  const { visibility } = useSiteConfig();
  const [moreOpen, setMoreOpen] = useState(false);

  // The admin dashboard has its own sidebar/navigation — this bar is only
  // for the public site.
  if (pathname?.startsWith('/admin')) return null;

  const items = ALL_ITEMS.filter((i) => visibility[i.key] !== false);
  const needsMenu = items.length > MAX_TABS;
  const tabs = needsMenu ? items.slice(0, MAX_TABS - 1) : items;
  const more = needsMenu ? items.slice(MAX_TABS - 1) : [];

  return (
    <>
      <nav
        className="fixed inset-x-0 bottom-0 z-40 flex items-stretch justify-between border-t border-line bg-surface px-1 pb-[env(safe-area-inset-bottom)] md:hidden"
        aria-label="Primary"
      >
        {tabs.map(({ href, label, Icon }) => {
          const active = pathname === href || (href !== '/' && pathname?.startsWith(`${href}/`));
          return (
            <Link
              key={href}
              href={href}
              className={`flex flex-1 flex-col items-center justify-center gap-1 py-2 text-[11px] font-semibold ${
                active ? 'text-brand-600' : 'text-gray-500'
              }`}
            >
              {Icon === HomeIcon ? <Icon className="h-5 w-5" active={active} /> : <Icon className="h-6 w-6" active={active} />}
              {label}
            </Link>
          );
        })}
        {needsMenu && (
          <button
            onClick={() => setMoreOpen(true)}
            className="flex flex-1 flex-col items-center justify-center gap-1 py-2 text-[11px] font-semibold text-gray-500"
          >
            <MenuIcon3D className="h-6 w-6" />
            Menu
          </button>
        )}
      </nav>

      {needsMenu && (
        <div
          className={`fixed inset-0 z-50 transition-opacity duration-200 md:hidden ${
            moreOpen ? 'pointer-events-auto opacity-100' : 'pointer-events-none opacity-0'
          }`}
        >
          <div className="absolute inset-0 bg-black/40" onClick={() => setMoreOpen(false)} />
          <div
            className={`absolute inset-x-0 bottom-0 rounded-t-3xl bg-surface p-5 pb-8 shadow-2xl transition-transform duration-200 ${
              moreOpen ? 'translate-y-0' : 'translate-y-full'
            }`}
          >
            <div className="mb-3 flex items-center justify-between">
              <span className="text-sm font-bold text-gray-900">More</span>
              <button
                onClick={() => setMoreOpen(false)}
                className="rounded-full p-2 text-gray-600 hover:bg-surface-alt"
                aria-label="Close menu"
              >
                <CloseIcon3D className="h-5 w-5" />
              </button>
            </div>
            <ul className="flex flex-col divide-y divide-line">
              {more.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    onClick={() => setMoreOpen(false)}
                    className="block py-3.5 text-base font-semibold text-gray-800"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}
    </>
  );
}
