import Link from 'next/link';
import { landingPath } from '@/lib/directory';

export default function CityGrid({ cities = [], counts = {} }) {
  if (cities.length === 0) return null;
  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
      {cities.map((c) => (
        <Link
          key={c.id}
          href={landingPath(c.slug)}
          className="rounded-xl border border-line bg-surface px-4 py-3 transition hover:border-brand-600 hover:shadow-card"
        >
          <p className="text-sm font-semibold text-gray-900">{c.name}</p>
          <p className="text-xs text-gray-500">{counts[c.id] > 0 ? `${counts[c.id]} listing${counts[c.id] === 1 ? '' : 's'}` : c.province}</p>
        </Link>
      ))}
    </div>
  );
}
