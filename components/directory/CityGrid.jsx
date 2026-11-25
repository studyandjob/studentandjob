import Link from 'next/link';
import Art3D from '../Art3D';
import { landingPath } from '@/lib/directory';

export default function CityGrid({ cities = [], counts = {} }) {
  if (cities.length === 0) return null;
  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
      {cities.map((c) => (
        <Link
          key={c.id}
          href={landingPath(c.slug)}
          className="group flex items-center gap-3 rounded-2xl border border-line bg-gradient-to-b from-surface to-surface-alt px-3.5 py-3 shadow-[inset_0_1px_0_rgba(255,255,255,0.9),0_6px_16px_-12px_rgba(0,0,0,0.3)] transition hover:-translate-y-0.5 hover:border-brand-300"
        >
          <Art3D name="pin" className="h-9 w-9 flex-shrink-0 transition group-hover:scale-110" />
          <span className="min-w-0">
            <span className="block truncate text-sm font-semibold text-gray-900">{c.name}</span>
            <span className="block truncate text-xs text-gray-500">{counts[c.id] > 0 ? `${counts[c.id]} listing${counts[c.id] === 1 ? '' : 's'}` : c.province}</span>
          </span>
        </Link>
      ))}
    </div>
  );
}
