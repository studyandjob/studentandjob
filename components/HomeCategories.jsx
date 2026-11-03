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

/** Airbnb-style scrollable row of icon categories, with a "Filters" button on the right. */
export default function HomeCategories() {
  return (
    <div className="flex items-center gap-4 border-b border-line">
      <nav aria-label="Browse by category" className="min-w-0 flex-1">
        <ul className="no-scrollbar -mx-4 flex gap-1 overflow-x-auto px-4 md:mx-0 md:gap-3 md:px-0">
          {CATEGORIES.map((c) => (
            <li key={c.label} className="flex-shrink-0">
              <Link
                href={c.href}
                className="group flex min-w-[88px] flex-col items-center gap-2 border-b-2 border-transparent px-3 pb-3 pt-2 text-gray-500 transition hover:border-line-strong hover:text-gray-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500"
              >
                <HomeIcon name={c.icon} className="h-7 w-7" />
                <span className="whitespace-nowrap text-xs font-semibold">{c.label}</span>
              </Link>
            </li>
          ))}
        </ul>
      </nav>
      <Link
        href="/jobs"
        className="mb-3 hidden flex-shrink-0 items-center gap-2 rounded-xl border border-line-strong px-4 py-3 text-sm font-semibold text-gray-900 transition hover:border-brand-600 hover:bg-surface-alt sm:flex"
      >
        <HomeIcon name="menu" className="h-4 w-4" />
        Filters
      </Link>
    </div>
  );
}
