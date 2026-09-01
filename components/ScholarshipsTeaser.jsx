import Link from 'next/link';
import ScholarshipCard from './ScholarshipCard';
import { GraduationCapIcon3D } from './Icons3D';

export default function ScholarshipsTeaser({ scholarships = [] }) {
  if (scholarships.length === 0) return null;

  return (
    <section className="border-b border-gray-100 bg-gray-50/60">
      <div className="mx-auto max-w-7xl px-4 py-10 md:px-6 md:py-14">
        <div className="mb-6 flex items-end justify-between md:mb-8">
          <div className="flex items-center gap-2.5">
            <span className="flex h-9 w-9 flex-shrink-0 items-center justify-center">
              <GraduationCapIcon3D className="h-8 w-8" />
            </span>
            <div>
              <h2 className="text-xl font-extrabold text-gray-900 md:text-2xl">Scholarships</h2>
              <p className="mt-1 text-sm text-gray-500">Latest scholarships and their deadlines.</p>
            </div>
          </div>
          <Link href="/scholarships" className="flex-shrink-0 text-sm font-semibold text-brand-600 hover:underline">
            View all →
          </Link>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {scholarships.slice(0, 3).map((s) => (
            <ScholarshipCard key={s.id} scholarship={s} />
          ))}
        </div>
      </div>
    </section>
  );
}
