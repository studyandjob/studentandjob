'use client';

import {
  MapPinIcon3D as MapPinIcon,
  BuildingIcon3D as BuildingIcon,
  ShieldCheckIcon3D as ShieldCheckIcon,
  BriefcaseIcon3D as BriefcaseIcon,
  ArrowRightIcon3D as ArrowRightIcon,
  CalendarClockIcon3D as CalendarClockIcon,
} from './Icons3D';
import { daysRemaining } from '@/lib/jobStatus';

function formatDate(dateStr) {
  if (!dateStr) return null;
  return new Date(dateStr).toLocaleDateString('en-US', { day: '2-digit', month: 'short', year: 'numeric' });
}

// "Posted 2 days ago" style label for job.created_at — purely a
// presentation helper, never invents a date when created_at is missing.
function formatPosted(createdAt) {
  if (!createdAt) return null;
  const created = new Date(createdAt);
  if (Number.isNaN(created.getTime())) return null;
  const days = Math.floor((Date.now() - created.getTime()) / 86400000);
  if (days <= 0) return 'Posted Today';
  if (days === 1) return 'Posted Yesterday';
  if (days < 30) return `Posted ${days} days ago`;
  return `Posted ${formatDate(createdAt)}`;
}

// Label for the last-date banner. Only ever computed from the real
// last_date via daysRemaining() (Pakistan-time, no hardcoded "today") —
// never shows "X days left" unless it's mathematically accurate.
function lastDateLabel(remaining, isExpired) {
  if (isExpired) return 'Expired';
  if (remaining === 0) return 'Closing Today';
  if (remaining === 1) return '1 Day Left — Apply Soon';
  if (remaining !== null && remaining <= 3) return `${remaining} Days Left`;
  return 'Last date to apply';
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
  const isExpired = remaining !== null && remaining < 0;
  const isUrgent = !isExpired && remaining !== null && remaining <= 3;
  const posted = formatPosted(job.created_at);

  return (
    <div className="group relative flex flex-col overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-md">
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
              className={`rounded-full px-2.5 py-1 text-xs font-bold uppercase tracking-wide ${
                isGovernment ? 'bg-brand-50 text-brand-700' : 'bg-accent-50 text-accent-700'
              }`}
            >
              {job.job_type}
            </span>
            {job.sector && (
              <span className="rounded-full bg-gray-100 px-2.5 py-1 text-xs font-semibold text-gray-600">
                {job.sector}
              </span>
            )}
            {job.source_type && job.verified_on && (
              <span className="flex items-center gap-1 rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-semibold text-emerald-700">
                ✓ Verified {formatDate(job.verified_on)}
              </span>
            )}
          </div>
        </div>

        {/* Title */}
        <h3 className="mb-1.5 text-lg font-bold leading-snug text-gray-900">{job.title}</h3>

        {/* Posted date — only when created_at exists, never fabricated */}
        {posted && <p className="mb-3 text-xs font-medium text-gray-400">{posted}</p>}

        {/* Metadata */}
        <div className="mb-4 flex flex-col gap-2 text-sm text-gray-600">
          {job.city && (
            <div className="flex items-center gap-2">
              <IconBadge icon={MapPinIcon} gradient="from-accent-400 to-accent-700" />
              <span className="truncate">{job.city}</span>
            </div>
          )}
          {job.department && (
            <div className="flex items-center gap-2">
              <IconBadge icon={BuildingIcon} gradient="from-gray-400 to-gray-600" />
              <span className="truncate">{job.department}</span>
            </div>
          )}
        </div>

        {/* Quick-glance chips: Salary / Vacancies, when the admin has filled them in */}
        {(job.salary || job.vacancies) && (
          <div className="mb-4 flex flex-wrap gap-2">
            {job.salary && (
              <span className="rounded-full bg-gray-50 px-2.5 py-1 text-xs font-semibold text-gray-600">
                💰 {job.salary}
              </span>
            )}
            {job.vacancies && (
              <span className="rounded-full bg-gray-50 px-2.5 py-1 text-xs font-semibold text-gray-600">
                👥 {job.vacancies} {String(job.vacancies).match(/^\d+$/) ? 'Posts' : ''}
              </span>
            )}
          </div>
        )}

        {/* Last-date banner — red when urgent/expired so it still draws
            the eye, amber for a normal upcoming deadline. Label switches
            between Expired / Closing Today / N Days Left / plain date,
            always computed from the real last_date (see lastDateLabel). */}
        {job.last_date && (
          <div
            className={`mb-4 flex items-center gap-2 rounded-xl border px-3 py-2 ${
              isExpired || isUrgent ? 'border-red-100 bg-red-50' : 'border-amber-100 bg-amber-50'
            }`}
          >
            <IconBadge icon={CalendarClockIcon} gradient={isExpired || isUrgent ? 'from-red-500 to-red-600' : 'from-amber-500 to-amber-600'} />
            <div className="min-w-0 leading-tight">
              <p
                className={`text-xs font-semibold uppercase tracking-wide ${
                  isExpired || isUrgent ? 'text-red-500' : 'text-amber-600'
                }`}
              >
                {lastDateLabel(remaining, isExpired)}
              </p>
              <p className={`truncate text-sm font-bold ${isExpired || isUrgent ? 'text-red-700' : 'text-amber-800'}`}>
                {formatDate(job.last_date)}
              </p>
            </div>
          </div>
        )}

        {/* Actions — Apply first on mobile for thumb reach, side-by-side on desktop.
            py-3.5 on mobile keeps both buttons at a full ~44px+ tap target;
            desktop drops back to a tighter py-2.5. */}
        <div className="mt-auto flex flex-col gap-2 pt-1 sm:flex-row">
          <a
            href={job.apply_link || '#'}
            target="_blank"
            rel="noopener noreferrer"
            className="group/btn order-1 flex flex-1 items-center justify-center gap-1.5 rounded-xl bg-gradient-to-r from-brand-600 to-brand-700 px-4 py-3.5 text-center text-sm font-semibold text-white shadow-md shadow-brand-600/20 transition-all duration-200 active:scale-[0.98] hover:shadow-lg hover:shadow-brand-600/30 hover:-translate-y-0.5 sm:order-2 sm:py-2.5"
          >
            Apply Now
            <ArrowRightIcon className="h-4 w-4 transition-transform duration-200 group-hover/btn:translate-x-1" />
          </a>
          <button
            onClick={onViewDetails}
            className="order-2 flex-1 rounded-xl border-2 border-gray-200 bg-white px-4 py-3.5 text-center text-sm font-semibold text-gray-700 transition-all duration-200 active:scale-[0.98] hover:border-brand-300 hover:bg-brand-50 hover:text-brand-700 sm:order-1 sm:py-2.5"
          >
            View Details
          </button>
        </div>
      </div>
    </div>
  );
}
