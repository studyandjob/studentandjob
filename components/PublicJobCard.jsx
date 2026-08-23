'use client';

import {
  MapPinIcon3D as MapPinIcon,
  BuildingIcon3D as BuildingIcon,
  ShieldCheckIcon3D as ShieldCheckIcon,
  BriefcaseIcon3D as BriefcaseIcon,
  ArrowRightIcon3D as ArrowRightIcon,
  CalendarClockIcon3D as CalendarClockIcon,
} from './Icons3D';

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

/**
 * Full-realistic 3D icon chip — the icon graphics from Icons3D.jsx already
 * carry their own gradient, shadow and glare, so the badge here is just a
 * transparent sizing wrapper (kept as a component so call sites don't
 * change) rather than an extra flat-color circle behind them.
 */
function IconBadge({ icon: IconComp, size = 'md' }) {
  const sizing = size === 'lg' ? 'h-11 w-11' : 'h-8 w-8';
  return (
    <span className={`relative flex flex-shrink-0 items-center justify-center ${sizing}`}>
      <IconComp className="h-full w-full" />
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
