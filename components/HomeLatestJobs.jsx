import JobViewLink from './JobViewLink';
import HomeSection from './HomeSection';
import HomeIcon from './HomeIcons';
import { daysLeftLabel } from './HomeDateStub';
import { toDateKey } from '@/lib/jobStatus';

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

function shortDate(lastDate) {
  const key = toDateKey(lastDate);
  if (!key) return null;
  const [, m, d] = key.split('-').map(Number);
  return `${d} ${MONTHS[m - 1]}`;
}

/** Newest open jobs as an Airbnb-style card grid. */
export default function HomeLatestJobs({ jobs = [] }) {
  return (
    <HomeSection title="Latest jobs" href="/jobs" linkLabel="Show all">
      {jobs.length === 0 ? (
        <p className="rounded-2xl border border-gray-200 bg-white p-10 text-center text-sm text-gray-500">
          No jobs posted yet. Check back soon.
        </p>
      ) : (
        <ul className="grid gap-x-6 gap-y-8 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {jobs.map((job) => {
            const canApply = job.show_apply_button !== false && !!job.apply_link;
            const label = daysLeftLabel(job.last_date);
            const date = shortDate(job.last_date);
            const gov = job.job_type === 'Government';
            return (
              <li key={job.id} className="group relative flex flex-col">
                {/* "Photo" area */}
                <div
                  className={`relative flex aspect-[4/3] items-center justify-center overflow-hidden rounded-2xl ${
                    gov ? 'bg-gradient-to-br from-brand-100 to-brand-50 text-brand-700' : 'bg-gradient-to-br from-accent-100 to-accent-50 text-accent-700'
                  }`}
                >
                  <HomeIcon
                    name={gov ? 'building' : 'briefcase'}
                    className="h-16 w-16 opacity-80 transition duration-300 group-hover:scale-110"
                  />
                  {job.job_type && (
                    <span className="absolute left-3 top-3 rounded-full bg-white px-3 py-1 text-xs font-bold text-gray-900 shadow-card">
                      {job.job_type}
                    </span>
                  )}
                  {label && (
                    <span className="absolute right-3 top-3 rounded-full bg-red-600 px-3 py-1 text-xs font-bold text-white shadow-card">
                      {label}
                    </span>
                  )}
                </div>

                <div className="mt-3 min-w-0 flex-1">
                  <JobViewLink
                    jobId={job.id}
                    className="line-clamp-2 text-base font-semibold leading-snug text-gray-900 after:absolute after:inset-0 after:content-[''] focus-visible:outline-none focus-visible:after:ring-2 focus-visible:after:ring-brand-500 focus-visible:after:rounded-2xl"
                  >
                    {job.title}
                  </JobViewLink>
                  {job.department && <p className="mt-0.5 truncate text-sm text-gray-500">{job.department}</p>}
                  <p className="mt-1 flex items-center gap-1.5 truncate text-sm text-gray-500">
                    <HomeIcon name="pin" className="h-4 w-4 flex-shrink-0" />
                    {job.city || 'Not stated'}
                  </p>
                  <p className="mt-1.5 text-sm text-gray-900">
                    <span className="font-semibold">{date ? `Last date ${date}` : 'Open until filled'}</span>
                  </p>
                </div>

                {canApply && (
                  <a
                    href={job.apply_link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="relative z-10 mt-3 flex min-h-[44px] items-center justify-center rounded-xl border border-gray-900 px-4 text-sm font-semibold text-gray-900 transition hover:bg-gray-900 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500"
                  >
                    Apply
                  </a>
                )}
              </li>
            );
          })}
        </ul>
      )}
    </HomeSection>
  );
}
