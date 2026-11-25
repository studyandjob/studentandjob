import Link from 'next/link';
import HomeIcon from '../HomeIcons';
import { landingPath } from '@/lib/directory';

// Server component: category cards linking to SEO landing pages.
// `counts` is { [categoryId]: n } — optional.
export default function CategoryGrid({ categories = [], counts = {}, citySlug = null }) {
  if (categories.length === 0) return null;
  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
      {categories.map((c) => (
        <Link
          key={c.id}
          href={landingPath(citySlug, c.slug)}
          className="group flex flex-col items-center gap-2.5 rounded-2xl border border-line bg-surface p-4 text-center shadow-card transition hover:-translate-y-0.5 hover:shadow-card-hover"
        >
          <span className="flex h-12 w-12 items-center justify-center rounded-full bg-brand-50 text-brand-600 transition group-hover:bg-brand-600 group-hover:text-white">
            <HomeIcon name={c.icon || 'briefcase'} className="h-6 w-6" />
          </span>
          <span className="text-sm font-semibold leading-tight text-gray-900">{c.name}</span>
          {counts[c.id] > 0 && <span className="text-xs text-gray-500">{counts[c.id]} listing{counts[c.id] === 1 ? '' : 's'}</span>}
        </Link>
      ))}
    </div>
  );
}
