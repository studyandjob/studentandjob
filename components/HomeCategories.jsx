import Link from 'next/link';
import HomeIcon from './HomeIcons';

// Each card links to /jobs with a filter the jobs page already understands
// (?jobType=...) or a text search (?q=...), which also matches city/sector.
const CATEGORIES = [
  { label: 'Government Jobs', sub: 'Federal & provincial', href: '/jobs?jobType=Government', icon: 'building' },
  { label: 'Private Jobs', sub: 'Companies & firms', href: '/jobs?jobType=Private', icon: 'briefcase' },
  { label: 'Bank Jobs', sub: 'Banking & finance', href: '/jobs?q=bank', icon: 'bank' },
  { label: 'Teaching Jobs', sub: 'Schools & universities', href: '/jobs?q=teacher', icon: 'teacher' },
  { label: 'Police & Security', sub: 'Police, army, FIA', href: '/jobs?q=police', icon: 'shield' },
  { label: 'Punjab Jobs', sub: 'Lahore, Rawalpindi', href: '/jobs?q=Punjab', icon: 'pin' },
  { label: 'Sindh Jobs', sub: 'Karachi, Hyderabad', href: '/jobs?q=Sindh', icon: 'pin' },
  { label: 'Islamabad Jobs', sub: 'Capital territory', href: '/jobs?q=Islamabad', icon: 'pin' },
  { label: 'KPK Jobs', sub: 'Peshawar & more', href: '/jobs?q=Khyber', icon: 'pin' },
  { label: 'Balochistan Jobs', sub: 'Quetta & more', href: '/jobs?q=Balochistan', icon: 'pin' },
];

export default function HomeCategories() {
  return (
    <section className="bg-white">
      <div className="mx-auto max-w-7xl px-4 py-10 md:px-6 md:py-14">
        <div className="mb-6 text-center md:mb-8">
          <h2 className="font-serif text-2xl font-bold text-gray-900 md:text-3xl">Browse Jobs by Category</h2>
          <p className="mt-2 text-sm text-gray-600 md:text-base">Pick a category to see only the jobs that matter to you.</p>
        </div>
        <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:gap-4 lg:grid-cols-5">
          {CATEGORIES.map((c) => (
            <li key={c.label}>
              <Link
                href={c.href}
                className="group flex h-full min-h-[96px] flex-col items-start gap-3 rounded-2xl border border-gray-200 bg-white p-4 shadow-sm transition hover:-translate-y-0.5 hover:border-brand-300 hover:shadow-md"
              >
                <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-brand-50 text-brand-700 transition group-hover:bg-brand-600 group-hover:text-white">
                  <HomeIcon name={c.icon} className="h-6 w-6" />
                </span>
                <span>
                  <span className="block text-sm font-bold text-gray-900 md:text-base">{c.label}</span>
                  <span className="mt-0.5 block text-xs text-gray-500">{c.sub}</span>
                </span>
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
