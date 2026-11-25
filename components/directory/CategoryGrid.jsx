import Link from 'next/link';
import Art3D from '../Art3D';
import { artFor, landingPath } from '@/lib/directory';

// Server component: glossy category tiles linking to SEO landing pages.
// `counts` is { [categoryId]: n } — optional.
export default function CategoryGrid({ categories = [], counts = {}, citySlug = null }) {
  if (categories.length === 0) return null;
  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
      {categories.map((c) => (
        <Link
          key={c.id}
          href={landingPath(citySlug, c.slug)}
          className="group relative flex flex-col items-center gap-2 overflow-hidden rounded-3xl border border-line bg-gradient-to-b from-surface to-surface-alt p-4 text-center shadow-[inset_0_1px_0_rgba(255,255,255,0.9),0_8px_22px_-14px_rgba(0,0,0,0.3)] transition hover:-translate-y-1 hover:shadow-[inset_0_1px_0_rgba(255,255,255,0.9),0_16px_30px_-14px_rgba(0,0,0,0.38)]"
        >
          <Art3D name={artFor(c.slug)} className="h-14 w-14 transition duration-300 group-hover:scale-110" />
          <span className="text-sm font-semibold leading-tight text-gray-900">{c.name}</span>
          {counts[c.id] > 0 && <span className="text-xs text-gray-500">{counts[c.id]} listing{counts[c.id] === 1 ? '' : 's'}</span>}
        </Link>
      ))}
    </div>
  );
}
