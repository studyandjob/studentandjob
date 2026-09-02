import Link from 'next/link';
import {
  ShieldCheckIcon3D,
  BriefcaseIcon3D,
  GraduationCapIcon3D,
  VerifiedBadgeIcon3D,
  NotesBookIcon3D,
} from './Icons3D';

// The five entry points the reference design highlights right under the
// hero — each maps to an existing route/filter already used elsewhere on
// the site (BrowseCategories previously only covered job sub-categories;
// this widens it to the five top-level sections a visitor scans for).
const CATEGORIES = [
  { label: 'Government Jobs', sub: 'Latest Govt Jobs', href: '/jobs?jobType=Government', Icon: ShieldCheckIcon3D },
  { label: 'Private Jobs', sub: 'Private Sector Jobs', href: '/jobs?jobType=Private', Icon: BriefcaseIcon3D },
  { label: 'Scholarships', sub: 'Local & International', href: '/scholarships', Icon: GraduationCapIcon3D },
  { label: 'Results', sub: 'Exam Results', href: '/results', Icon: VerifiedBadgeIcon3D },
  { label: 'Study Material', sub: 'Notes, Papers & More', href: '/study-zone', Icon: NotesBookIcon3D },
];

export default function BrowseCategories() {
  return (
    <section className="border-b border-gray-100 bg-white">
      <div className="mx-auto max-w-7xl px-4 py-6 md:px-6 md:py-8">
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-5 md:gap-4">
          {CATEGORIES.map(({ label, sub, href, Icon }) => (
            <Link
              key={label}
              href={href}
              className="flex items-center gap-3 rounded-xl border border-gray-100 bg-white px-3.5 py-3.5 transition hover:-translate-y-0.5 hover:border-brand-200 hover:shadow-sm active:scale-[0.98]"
            >
              <span className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-lg bg-brand-50">
                <Icon className="h-6 w-6" />
              </span>
              <span className="min-w-0">
                <span className="block truncate text-sm font-bold text-gray-900">{label}</span>
                <span className="block truncate text-xs text-gray-500">{sub}</span>
              </span>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
