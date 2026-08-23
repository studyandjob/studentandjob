'use client';

function formatDate(dateStr) {
  if (!dateStr) return null;
  return new Date(dateStr).toLocaleDateString('en-US', { day: '2-digit', month: 'short', year: 'numeric' });
}

const MapPinIcon = (props) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} {...props}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M17.657 16.657L13.414 20.9a2 2 0 01-2.828 0l-4.243-4.243a8 8 0 1111.314 0z" />
    <path strokeLinecap="round" strokeLinejoin="round" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
  </svg>
);

const BuildingIcon = (props) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} {...props}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M3 21h18M5 21V7l8-4v18M19 21V11l-6-4M9 9h.01M9 12h.01M9 15h.01M9 18h.01" />
  </svg>
);

const CalendarIcon = (props) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} {...props}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
  </svg>
);

export default function PublicJobCard({ job, onViewDetails }) {
  return (
    <div className="flex flex-col rounded-2xl border border-gray-100 bg-white p-5 shadow-md transition hover:-translate-y-0.5 hover:shadow-lg">
      {/* Status tags */}
      <div className="mb-3 flex flex-wrap items-center gap-1.5">
        <span
          className={`rounded-full px-2.5 py-1 text-[0.68rem] font-bold uppercase tracking-wide ${
            job.job_type === 'Government' ? 'bg-brand-50 text-brand-700' : 'bg-accent-50 text-accent-700'
          }`}
        >
          {job.job_type}
        </span>
        {job.sector && (
          <span className="rounded-full bg-gray-100 px-2.5 py-1 text-[0.68rem] font-semibold text-gray-600">
            {job.sector}
          </span>
        )}
      </div>

      {/* Title */}
      <h3 className="mb-3 text-lg font-bold leading-snug text-gray-900">{job.title}</h3>

      {/* Metadata */}
      <div className="mb-4 flex flex-col gap-1.5 text-sm text-gray-600">
        {job.city && (
          <div className="flex items-center gap-2">
            <MapPinIcon className="h-4 w-4 flex-shrink-0 text-brand-500" />
            <span>{job.city}</span>
          </div>
        )}
        {job.department && (
          <div className="flex items-center gap-2">
            <BuildingIcon className="h-4 w-4 flex-shrink-0 text-brand-500" />
            <span className="truncate">{job.department}</span>
          </div>
        )}
        {job.last_date && (
          <div className="flex items-center gap-2">
            <CalendarIcon className="h-4 w-4 flex-shrink-0 text-red-500" />
            <span className="font-semibold text-red-600">آخری تاریخ: {formatDate(job.last_date)}</span>
          </div>
        )}
      </div>

      {/* Actions — stacked on mobile (Apply Now first for thumb reach), side-by-side on desktop */}
      <div className="mt-auto flex flex-col gap-2 sm:flex-row">
        <a
          href={job.apply_link || '#'}
          target="_blank"
          rel="noopener noreferrer"
          className="order-1 flex-1 rounded-lg bg-accent-500 px-4 py-2.5 text-center text-sm font-semibold text-white shadow-sm transition hover:bg-accent-600 sm:order-2"
        >
          Apply Now
        </a>
        <button
          onClick={onViewDetails}
          className="order-2 flex-1 rounded-lg border border-gray-200 px-4 py-2.5 text-center text-sm font-semibold text-gray-700 transition hover:border-brand-300 hover:text-brand-700 sm:order-1"
        >
          View Details
        </button>
      </div>
    </div>
  );
}
