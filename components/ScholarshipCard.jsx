import HomeIcon from './HomeIcons';
import { daysRemaining } from '@/lib/jobStatus';

function formatDate(dateStr) {
  if (!dateStr) return null;
  return new Date(dateStr).toLocaleDateString('en-US', { day: '2-digit', month: 'short', year: 'numeric' });
}

export default function ScholarshipCard({ scholarship }) {
  const remaining = daysRemaining(scholarship.deadline);
  const isExpired = remaining !== null && remaining < 0;
  const isUrgent = remaining !== null && remaining >= 0 && remaining <= 5;

  return (
    <div className="group relative flex flex-col overflow-hidden rounded-2xl border border-line bg-surface shadow-card transition-all duration-300 hover:shadow-card-hover">
      <div className="flex flex-1 flex-col p-5">
        <div className="mb-3 flex items-start justify-between gap-2">
          <span className="flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-full bg-accent-50 text-accent-700">
            <HomeIcon name="grad" className="h-6 w-6" />
          </span>
          {/* Status badge — Active vs Expiring Soon. Expired scholarships
              never reach this card (filtered out where scholarships are
              fetched), so there's no "Expired" state to show here. */}
          {scholarship.deadline && (
            <span
              className={`flex-shrink-0 rounded-full px-2.5 py-1 text-xs font-bold uppercase tracking-wide ${
                isUrgent ? 'bg-red-50 text-red-600' : 'bg-emerald-50 text-emerald-700'
              }`}
            >
              {isUrgent ? 'Expiring Soon' : 'Active'}
            </span>
          )}
        </div>

        <h3 className="mb-2 text-base font-bold leading-snug text-gray-900">{scholarship.title}</h3>

        {scholarship.provider && (
          <div className="mb-4 flex items-center gap-2 text-sm text-gray-600">
            <HomeIcon name="building" className="h-4 w-4 flex-shrink-0 text-gray-500" />
            <span className="truncate">{scholarship.provider}</span>
          </div>
        )}

        {scholarship.deadline && (
          <div
            className={`mb-4 flex items-center gap-2 rounded-xl px-3 py-2.5 ${
              isUrgent ? 'bg-red-50' : 'bg-surface-alt'
            }`}
          >
            <HomeIcon name="calendar" className="h-4 w-4 flex-shrink-0 text-gray-500" />
            <div className="min-w-0 leading-tight">
              <p
                className={`text-xs font-semibold uppercase tracking-wide ${
                  isUrgent ? 'text-red-500' : 'text-gray-500'
                }`}
              >
                {isExpired ? 'Deadline passed' : 'Apply by'}
              </p>
              <p className={`truncate text-sm font-bold ${isUrgent ? 'text-red-700' : 'text-gray-700'}`}>
                {formatDate(scholarship.deadline)}
              </p>
            </div>
          </div>
        )}

        <a
          href={scholarship.apply_link || '#'}
          target="_blank"
          rel="noopener noreferrer"
          className="mt-auto flex items-center justify-center rounded-xl bg-accent-600 px-4 py-3.5 text-center text-sm font-semibold text-white transition-all duration-200 active:scale-[0.98] hover:bg-accent-700 sm:py-2.5"
        >
          Apply Now
        </a>
      </div>
    </div>
  );
}
