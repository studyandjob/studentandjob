import JobViewLink from './JobViewLink';
import HomeSection from './HomeSection';
import HomeDateStub, { daysLeftLabel } from './HomeDateStub';
import { toDateKey } from '@/lib/jobStatus';

/** Horizontal scroller of jobs whose last date is nearest (falls back to newest). */
export default function HomeClosingSoon({ jobs = [] }) {
  // Jobs that have a last date, soonest first; if none do, fall back to newest.
  const dated = jobs
    .filter((j) => toDateKey(j.last_date))
    .sort((a, b) => toDateKey(a.last_date).localeCompare(toDateKey(b.last_date)));
  const closing = dated.length > 0 ? dated.slice(0, 8) : jobs.slice(0, 8);
  const title = dated.length > 0 ? 'Closing soon' : 'Latest openings';
  if (closing.length === 0) return null;

  return (
    <HomeSection title={title}>
      <ul className="no-scrollbar -mx-4 flex snap-x gap-4 overflow-x-auto px-4 pb-2 md:mx-0 md:px-0">
        {closing.map((job) => {
          const label = daysLeftLabel(job.last_date);
          return (
            <li key={job.id} className="w-[270px] flex-shrink-0 snap-start sm:w-[300px]">
              <JobViewLink
                jobId={job.id}
                className="flex h-full items-center gap-3 rounded-2xl border border-gray-200 bg-white p-3.5 transition hover:shadow-card-hover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500"
              >
                <HomeDateStub lastDate={job.last_date} size="sm" />
                <span className="min-w-0">
                  <span className="block truncate text-sm font-semibold text-gray-900">{job.title}</span>
                  <span className="block truncate text-xs text-gray-500">{job.department}</span>
                  {label && <span className="mt-0.5 block text-xs font-semibold text-red-600">{label}</span>}
                </span>
              </JobViewLink>
            </li>
          );
        })}
      </ul>
    </HomeSection>
  );
}
