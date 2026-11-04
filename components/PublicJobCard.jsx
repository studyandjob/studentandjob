'use client';

import JobViewLink from './JobViewLink';
import HomeIcon from './HomeIcons';
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
  if (days <= 0) return 'Posted today';
  if (days === 1) return 'Posted yesterday';
  if (days < 30) return `Posted ${days} days ago`;
  return `Posted ${formatDate(createdAt)}`;
}

// Badge text for the deadline — only ever computed from the real
// last_date via daysRemaining() (Pakistan-time), never invented.
function deadlineBadge(remaining, isExpired) {
  if (isExpired) return 'Expired';
  if (remaining === 0) return 'Closes today';
  if (remaining === 1) return '1 day left';
  if (remaining !== null && remaining <= 7) return `${remaining} days left`;
  return null;
}

/** Airbnb-style listing card: soft "photo" tile on top, clean text below. */
export default function PublicJobCard({ job }) {
  const isGovernment = job.job_type === 'Government';
  const canApply = job.show_apply_button !== false && !!job.apply_link;
  const remaining = daysRemaining(job.last_date);
  const isExpired = remaining !== null && remaining < 0;
  const badge = deadlineBadge(remaining, isExpired);
  const posted = formatPosted(job.created_at);

  return (
    <div className="group relative flex h-full w-full flex-col">
      <div
        className={`relative flex aspect-[4/3] items-center justify-center overflow-hidden rounded-2xl ${
          isGovernment
            ? 'bg-gradient-to-br from-brand-100 to-brand-50 text-brand-600'
            : 'bg-gradient-to-br from-brand-50 to-surface-alt text-brand-500'
        }`}
      >
        <HomeIcon
          name={isGovernment ? 'building' : 'briefcase'}
          className="h-16 w-16 opacity-80 transition duration-300 group-hover:scale-110"
        />
        {job.job_type && (
          <span className="absolute left-3 top-3 rounded-full bg-surface px-3 py-1 text-xs font-bold text-gray-900 shadow-card">
            {job.job_type}
          </span>
        )}
        {badge && (
          <span
            className={`absolute right-3 top-3 rounded-full px-3 py-1 text-xs font-bold text-white shadow-card ${
              isExpired ? 'bg-gray-700' : 'bg-red-600'
            }`}
          >
            {badge}
          </span>
        )}
        {job.source_type && job.verified_on && (
          <span className="absolute bottom-3 left-3 rounded-full bg-white/95 px-2.5 py-1 text-[11px] font-semibold text-emerald-700 shadow-card">
            ✓ Verified {formatDate(job.verified_on)}
          </span>
        )}
      </div>

      <div className="mt-3 flex min-w-0 flex-1 flex-col">
        <JobViewLink
          jobId={job.id}
          className="line-clamp-2 text-[15px] font-semibold leading-snug text-gray-900 after:absolute after:inset-0 after:content-[''] focus-visible:outline-none focus-visible:after:rounded-2xl focus-visible:after:ring-2 focus-visible:after:ring-brand-500"
        >
          {job.title}
        </JobViewLink>
        {job.department && <p className="mt-0.5 truncate text-sm text-gray-500">{job.department}</p>}
        {job.city && (
          <p className="mt-1 flex items-center gap-1.5 truncate text-sm text-gray-500">
            <HomeIcon name="pin" className="h-4 w-4 flex-shrink-0" />
            {job.city}
            {job.sector ? ` · ${job.sector}` : ''}
          </p>
        )}

        {(job.salary || job.vacancies) && (
          <div className="mt-2 flex flex-wrap gap-1.5">
            {job.salary && (
              <span className="rounded-full bg-surface-alt px-2.5 py-1 text-xs font-semibold text-gray-700">
                {job.salary}
              </span>
            )}
            {job.vacancies && (
              <span className="rounded-full bg-surface-alt px-2.5 py-1 text-xs font-semibold text-gray-700">
                {job.vacancies} {String(job.vacancies).match(/^\d+$/) ? 'posts' : ''}
              </span>
            )}
          </div>
        )}

        <p className="mt-2 text-sm text-gray-900">
          <span className="font-semibold">
            {job.last_date ? `Last date ${formatDate(job.last_date)}` : 'Open until filled'}
          </span>
          {posted && <span className="text-gray-500"> · {posted}</span>}
        </p>
      </div>

      {canApply && (
        <a
          href={job.apply_link}
          target="_blank"
          rel="noopener noreferrer"
          className="relative z-10 mt-3 flex min-h-[44px] items-center justify-center rounded-xl border border-brand-600 px-4 text-sm font-semibold text-brand-700 transition hover:bg-brand-600 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500"
        >
          Apply Now
        </a>
      )}
    </div>
  );
}
