import Link from 'next/link';
import HomeIcon from './HomeIcons';

// Each chip links to /jobs with a filter the jobs page already understands
// (?jobType=...) or a text search (?q=...), which also matches city/sector.
const CATEGORIES = [
  { label: 'Government', href: '/jobs?jobType=Government', icon: 'building' },
  { label: 'Private', href: '/jobs?jobType=Private', icon: 'briefcase' },
  { label: 'Bank', href: '/jobs?q=bank', icon: 'bank' },
  { label: 'Teaching', href: '/jobs?q=teacher', icon: 'teacher' },
  { label: 'Police & Security', href: '/jobs?q=police', icon: 'shield' },
  { label: 'Punjab', href: '/jobs?q=Punjab', icon: 'pin' },
  { label: 'Sindh', href: '/jobs?q=Sindh', icon: 'pin' },
  { label: 'Khyber Pakhtunkhwa', href: '/jobs?q=Khyber', icon: 'pin' },
  { label: 'Balochistan', href: '/jobs?q=Balochistan', icon: 'pin' },
  { label: 'Islamabad', href: '/jobs?q=Islamabad', icon: 'pin' },
];

/** Airbnb-style scrollable row of icon categories. */
export default function HomeCategories() {
  return (
    <nav aria-label="Browse by category" className="border-b border-gray-200">
      <ul className="no-scrollbar -mx-4 flex gap-2 overflow-x-auto px-4 md:mx-0 md:justify-center md:gap-4 md:px-0">
        {CATEGORIES.map((c) => (
          <li key={c.label} className="flex-shrink-0">
            <Link
              href={c.href}
              className="group flex min-w-[84px] flex-col items-center gap-2 border-b-2 border-transparent px-3 pb-3 pt-2 text-gray-500 transition hover:border-gray-300 hover:text-gray-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500"
            >
              <HomeIcon name={c.icon} className="h-6 w-6" />
              <span className="whitespace-nowrap text-xs font-semibold">{c.label}</span>
            </Link>
          </li>
        ))}
      </ul>
    </nav>
  );
}
