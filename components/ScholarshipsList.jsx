import Link from 'next/link';
import { GraduationCapIcon3D } from './Icons3D';
import { daysRemaining } from '@/lib/jobStatus';

function formatDate(dateStr) {
  if (!dateStr) return null;
  return new Date(dateStr).toLocaleDateString('en-US', { day: '2-digit', month: 'short', year: 'numeric' });
}

export default function ScholarshipsList({ scholarships = [] }) {
  return (
    <section className="rounded-2xl bg-white p-4 shadow-sm ring-1 ring-black/5 md:p-6">
      <div className="mb-4 flex items-center justify-between border-b border-gray-100 pb-4">
        <div className="flex items-center gap-3">
          <span className="relative flex h-10 w-10 flex-shrink-0 items-center justify-center">
            <GraduationCapIcon3D className="h-full w-full" />
          </span>
          <h2 className="text-base font-bold text-gray-900 md:text-lg">Scholarships</h2>
        </div>
        <Link href="/scholarships" className="text-xs font-semibold text-brand-600 hover:underline md:text-sm">
          View all →
        </Link>
      </div>

      {scholarships.length === 0 ? (
        <p className="py-8 text-center text-sm text-gray-500">No scholarships posted yet. Check back soon.</p>
      ) : (
        <ul className="divide-y divide-gray-100">
          {scholarships.slice(0, 5).map((s) => {
            const remaining = daysRemaining(s.deadline);
            const isUrgent = remaining !== null && remaining >= 0 && remaining <= 5;
            return (
              <li key={s.id} className="flex items-center justify-between gap-3 py-3">
                <div className="min-w-0">
                  <p className="truncate text-sm font-semibold text-gray-800 md:text-base">{s.title}</p>
                  {s.deadline && (
                    <p className="mt-0.5 text-xs text-gray-500">
                      Deadline:{' '}
                      <span className={`font-medium ${isUrgent ? 'text-red-600' : 'text-gray-600'}`}>
                        {formatDate(s.deadline)}
                      </span>
                    </p>
                  )}
                </div>
                <a
                  href={s.apply_link || '#'}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex min-h-[40px] flex-shrink-0 items-center justify-center rounded-md bg-accent-600 px-3.5 py-2 text-xs font-semibold text-white transition active:scale-95 hover:bg-accent-700"
                >
                  Apply Now
                </a>
              </li>
            );
          })}
        </ul>
      )}
    </section>
  );
}
