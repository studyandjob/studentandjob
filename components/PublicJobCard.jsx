'use client';

function formatDate(dateStr) {
  if (!dateStr) return null;
  return new Date(dateStr).toLocaleDateString('en-US', { day: '2-digit', month: 'short', year: 'numeric' });
}

/** Returns how many days remain until the deadline (negative = past). */
function daysRemaining(dateStr) {
  if (!dateStr) return null;
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const due = new Date(dateStr);
  due.setHours(0, 0, 0, 0);
  return Math.round((due - today) / 86400000);
}

/* ---------------------------------------------------------------------- */
/*  Icons — clean vector strokes, no emoji. Each is dropped into a small   */
/*  gradient-filled "badge" (see IconBadge) so it reads as a soft, glossy  */
/*  3D chip rather than a flat line icon.                                  */
/* ---------------------------------------------------------------------- */

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

const CalendarClockIcon = (props) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} {...props}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m5 4V3M5 11h6M5 21h6.5M5 21a2 2 0 01-2-2V7a2 2 0 012-2h9a2 2 0 012 2v3" />
    <path strokeLinecap="round" strokeLinejoin="round" d="M17 21a4 4 0 100-8 4 4 0 000 8z" />
    <path strokeLinecap="round" strokeLinejoin="round" d="M17 15.8V17l1 1" />
  </svg>
);

/** Shield / badge glyph used for Government-sector postings. */
const ShieldCheckIcon = (props) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} {...props}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M12 3l7 3.2v5.1c0 4.6-3 8.7-7 9.7-4-1-7-5.1-7-9.7V6.2L12 3z" />
    <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.2l2 2 4-4.4" />
  </svg>
);

/** Briefcase glyph used for Private-sector / other postings. */
const BriefcaseIcon = (props) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} {...props}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M3 8.5A1.5 1.5 0 014.5 7h15A1.5 1.5 0 0121 8.5V18a2 2 0 01-2 2H5a2 2 0 01-2-2V8.5z" />
    <path strokeLinecap="round" strokeLinejoin="round" d="M8 7V5.5A1.5 1.5 0 019.5 4h5A1.5 1.5 0 0116 5.5V7M3 13h18" />
  </svg>
);

const ArrowRightIcon = (props) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.4} {...props}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M5 12h14M13 6l6 6-6 6" />
  </svg>
);

/**
 * Small glossy "3D-style" icon chip — a gradient-filled rounded square with
 * a soft shadow and an inset highlight, standing in for a flat emoji/icon.
 */
function IconBadge({ icon, gradient, size = 'md' }) {
  const sizing = size === 'lg' ? 'h-11 w-11 rounded-2xl' : 'h-8 w-8 rounded-xl';
  const iconSizing = size === 'lg' ? 'h-5 w-5' : 'h-4 w-4';
  return (
    <span
      className={`relative flex flex-shrink-0 items-center justify-center ${sizing} bg-gradient-to-br ${gradient} text-white shadow-md shadow-black/10 ring-1 ring-white/40`}
    >
      <span className="pointer-events-none absolute inset-0 rounded-[inherit] bg-gradient-to-b from-white/25 to-transparent" />
      {icon({ className: `relative ${iconSizing}` })}
    </span>
  );
}

export default function PublicJobCard({ job, onViewDetails }) {
  const isGovernment = job.job_type === 'Government';
  const remaining = daysRemaining(job.last_date);
  const isUrgent = remaining !== null && remaining >= 0 && remaining <= 3;
  const isExpired = remaining !== null && remaining < 0;

  return (
    <div className="group relative flex flex-col overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-md transition-all duration-300 hover:-translate-y-1 hover:shadow-xl">
      {/* Accent bar */}
      <div
        className={`h-1 w-full bg-gradient-to-r ${
          isGovernment ? 'from-brand-600 via-brand-500 to-brand-400' : 'from-accent-600 via-accent-500 to-emerald-400'
        }`}
      />

      <div className="flex flex-1 flex-col p-5">
        {/* Header: category icon + tags */}
        <div className="mb-3 flex items-start gap-3">
          <IconBadge
            size="lg"
            icon={isGovernment ? ShieldCheckIcon : BriefcaseIcon}
            gradient={isGovernment ? 'from-brand-500 to-brand-700' : 'from-accent-500 to-accent-700'}
          />
          <div className="flex min-w-0 flex-1 flex-wrap items-center gap-1.5 pt-1">
            <span
              className={`rounded-full px-2.5 py-1 text-[0.68rem] font-bold uppercase tracking-wide ${
                isGovernment ? 'bg-brand-50 text-brand-700' : 'bg-accent-50 text-accent-700'
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
        </div>

        {/* Title */}
        <h3 className="mb-3 text-lg font-bold leading-snug text-gray-900">{job.title}</h3>

        {/* Metadata */}
        <div className="mb-4 flex flex-col gap-2 text-sm text-gray-600">
          {job.city && (
            <div className="flex items-center gap-2">
              <IconBadge icon={MapPinIcon} gradient="from-sky-400 to-brand-600" />
              <span className="truncate">{job.city}</span>
            </div>
          )}
          {job.department && (
            <div className="flex items-center gap-2">
              <IconBadge icon={BuildingIcon} gradient="from-slate-400 to-slate-600" />
              <span className="truncate">{job.department}</span>
            </div>
          )}
        </div>

        {/* Last-date urgency banner */}
        {job.last_date && (
          <div
            className={`mb-4 flex items-center gap-2 rounded-xl border px-3 py-2 ${
              isExpired
                ? 'border-gray-200 bg-gray-50'
                : isUrgent
                  ? 'border-red-100 bg-red-50'
                  : 'border-amber-100 bg-amber-50'
            }`}
          >
            <IconBadge
              icon={CalendarClockIcon}
              gradient={isExpired ? 'from-gray-400 to-gray-500' : isUrgent ? 'from-red-500 to-rose-600' : 'from-amber-400 to-orange-500'}
            />
            <div className="min-w-0 leading-tight">
              <p
                className={`text-[0.65rem] font-semibold uppercase tracking-wide ${
                  isExpired ? 'text-gray-400' : isUrgent ? 'text-red-500' : 'text-amber-600'
                }`}
              >
                {isExpired ? 'Closed' : isUrgent ? 'Closing soon' : 'Last date to apply'}
              </p>
              <p className={`truncate text-sm font-bold ${isExpired ? 'text-gray-500' : isUrgent ? 'text-red-700' : 'text-amber-800'}`}>
                {formatDate(job.last_date)}
              </p>
            </div>
          </div>
        )}

        {/* Actions — Apply first on mobile for thumb reach, side-by-side on desktop */}
        <div className="mt-auto flex flex-col gap-2 pt-1 sm:flex-row">
          <a
            href={job.apply_link || '#'}
            target="_blank"
            rel="noopener noreferrer"
            className="group/btn order-1 flex flex-1 items-center justify-center gap-1.5 rounded-xl bg-gradient-to-r from-green-600 to-emerald-600 px-4 py-2.5 text-center text-sm font-semibold text-white shadow-md shadow-emerald-600/20 transition-all duration-200 hover:shadow-lg hover:shadow-emerald-600/30 hover:-translate-y-0.5 sm:order-2"
          >
            Apply Now
            <ArrowRightIcon className="h-4 w-4 transition-transform duration-200 group-hover/btn:translate-x-1" />
          </a>
          <button
            onClick={onViewDetails}
            className="order-2 flex-1 rounded-xl border-2 border-gray-200 bg-white px-4 py-2.5 text-center text-sm font-semibold text-gray-700 transition-all duration-200 hover:border-brand-300 hover:bg-brand-50 hover:text-brand-700 sm:order-1"
          >
            View Details
          </button>
        </div>
      </div>
    </div>
  );
}
