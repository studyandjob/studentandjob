import JobViewLink from './JobViewLink';
import HomeSlider from './HomeSlider';
import HomeDateStub, { daysLeftLabel } from './HomeDateStub';
import { toDateKey } from '@/lib/jobStatus';

/** Top of the home page: featured slider (2/3) beside a "Closing soon" list (1/3). */
export default function HomeLead({ jobs = [], slides = [], slideSpeed = '1x' }) {
  // Jobs that have a last date, soonest first; if none do, fall back to newest.
  const dated = jobs
    .filter((j) => toDateKey(j.last_date))
    .sort((a, b) => toDateKey(a.last_date).localeCompare(toDateKey(b.last_date)));
  const closing = dated.length > 0 ? dated.slice(0, 6) : jobs.slice(0, 6);
  const panelTitle = dated.length > 0 ? 'Closing soon' : 'Latest openings';

  return (
    <div className="grid gap-5 lg:grid-cols-3">
      <div className="lg:col-span-2">
        <HomeSlider slides={slides} speed={slideSpeed} />
      </div>

      <aside className="relative min-h-[280px]" aria-label={panelTitle}>
        <div className="flex flex-col overflow-hidden rounded-lg border border-gray-200 bg-white lg:absolute lg:inset-0">
          <h2 className="border-b-2 border-accent-500 bg-brand-600 px-4 py-2.5 font-serif text-base font-bold text-white">
            {panelTitle}
          </h2>
          {closing.length === 0 ? (
            <p className="p-4 text-sm text-gray-500">No open jobs right now. Check back soon.</p>
          ) : (
            <ul className="flex-1 divide-y divide-gray-100 overflow-y-auto">
              {closing.map((job) => {
                const label = daysLeftLabel(job.last_date);
                return (
                  <li key={job.id}>
                    <JobViewLink
                      jobId={job.id}
                      className="flex items-center gap-3 px-4 py-3 transition hover:bg-brand-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-brand-500"
                    >
                      <HomeDateStub lastDate={job.last_date} size="sm" />
                      <span className="min-w-0">
                        <span className="block truncate text-sm font-semibold text-gray-900">{job.title}</span>
                        <span className="block truncate text-xs text-gray-500">
                          {job.department}
                          {label && <span className="ml-1.5 font-semibold text-red-700">{label}</span>}
                        </span>
                      </span>
                    </JobViewLink>
                  </li>
                );
              })}
            </ul>
          )}
        </div>
      </aside>
    </div>
  );
}
