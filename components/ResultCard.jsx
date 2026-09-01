import { VerifiedBadgeIcon3D, CalendarClockIcon3D } from './Icons3D';
import { daysRemaining } from '@/lib/jobStatus';

function formatDate(dateStr) {
  if (!dateStr) return null;
  return new Date(dateStr).toLocaleDateString('en-US', { day: '2-digit', month: 'short', year: 'numeric' });
}

function daysAgo(dateStr) {
  const remaining = daysRemaining(dateStr);
  return remaining === null ? null : -remaining;
}

export default function ResultCard({ result }) {
  const age = daysAgo(result.result_date);
  const isFresh = age !== null && age >= 0 && age <= 5;

  return (
    <div className="group relative flex flex-col overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-md">
      <div className="flex flex-1 flex-col p-5">
        <div className="mb-3 flex items-start justify-between gap-3">
          <span className="flex h-11 w-11 flex-shrink-0 items-center justify-center">
            <VerifiedBadgeIcon3D className="h-full w-full" />
          </span>
          {isFresh && (
            <span className="rounded-full bg-brand-50 px-2.5 py-1 text-xs font-bold uppercase tracking-wide text-brand-700">
              New
            </span>
          )}
        </div>

        <h3 className="mb-2 text-base font-bold leading-snug text-gray-900">{result.title}</h3>

        {result.board_or_department && (
          <p className="mb-4 truncate text-sm text-gray-600">{result.board_or_department}</p>
        )}

        {result.result_date && (
          <div className="mb-4 flex items-center gap-2 rounded-xl border border-gray-100 bg-gray-50 px-3 py-2">
            <CalendarClockIcon3D className="h-4 w-4 flex-shrink-0" />
            <div className="min-w-0 leading-tight">
              <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">Announced</p>
              <p className="truncate text-sm font-bold text-gray-700">{formatDate(result.result_date)}</p>
            </div>
          </div>
        )}

        <a
          href={result.result_link || '#'}
          target="_blank"
          rel="noopener noreferrer"
          className="mt-auto flex items-center justify-center rounded-xl bg-gradient-to-r from-brand-600 to-brand-700 px-4 py-3.5 text-center text-sm font-semibold text-white shadow-md shadow-brand-600/20 transition-all duration-200 active:scale-[0.98] hover:shadow-lg hover:shadow-brand-600/30 hover:-translate-y-0.5 sm:py-2.5"
        >
          Check Result
        </a>
      </div>
    </div>
  );
}
