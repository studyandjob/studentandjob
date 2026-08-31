import { GraduationCapIcon3D, CalendarClockIcon3D, BuildingIcon3D } from './Icons3D';
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
    <div className="group relative flex flex-col overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-md">
      <div className="flex flex-1 flex-col p-5">
        <span className="mb-3 flex h-11 w-11 flex-shrink-0 items-center justify-center">
          <GraduationCapIcon3D className="h-full w-full" />
        </span>

        <h3 className="mb-2 text-base font-bold leading-snug text-gray-900">{scholarship.title}</h3>

        {scholarship.provider && (
          <div className="mb-4 flex items-center gap-2 text-sm text-gray-600">
            <BuildingIcon3D className="h-4 w-4 flex-shrink-0" />
            <span className="truncate">{scholarship.provider}</span>
          </div>
        )}

        {scholarship.deadline && (
          <div
            className={`mb-4 flex items-center gap-2 rounded-xl border px-3 py-2 ${
              isUrgent ? 'border-red-100 bg-red-50' : 'border-gray-100 bg-gray-50'
            }`}
          >
            <CalendarClockIcon3D className="h-4 w-4 flex-shrink-0" />
            <div className="min-w-0 leading-tight">
              <p
                className={`text-[0.65rem] font-semibold uppercase tracking-wide ${
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
          className="mt-auto flex items-center justify-center rounded-xl bg-gradient-to-r from-accent-600 to-accent-700 px-4 py-3.5 text-center text-sm font-semibold text-white shadow-md shadow-accent-600/20 transition-all duration-200 active:scale-[0.98] hover:shadow-lg hover:shadow-accent-600/30 hover:-translate-y-0.5 sm:py-2.5"
        >
          Apply Now
        </a>
      </div>
    </div>
  );
}
