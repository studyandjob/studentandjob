import JobViewLink from './JobViewLink';
import HomeSection from './HomeSection';
import HomeDateStub, { daysLeftLabel } from './HomeDateStub';

/** Newest open jobs as a table-style list: last date, job and department, city, action. */
export default function HomeLatestJobs({ jobs = [] }) {
  return (
    <HomeSection title="Latest jobs" href="/jobs" linkLabel="View all jobs">
      {jobs.length === 0 ? (
        <p className="rounded-lg border border-gray-200 bg-white p-8 text-center text-sm text-gray-500">
          No jobs posted yet. Check back soon.
        </p>
      ) : (
        <div className="overflow-hidden rounded-lg border border-gray-200 bg-white">
          <div className="hidden grid-cols-[72px_minmax(0,1fr)_150px_150px] gap-4 border-b border-gray-200 bg-gray-50 px-4 py-2 text-xs font-semibold text-gray-600 md:grid">
            <span>Last date</span>
            <span>Job and department</span>
            <span>City</span>
            <span className="text-right">Action</span>
          </div>
          <ul className="divide-y divide-gray-100">
            {jobs.map((job) => {
              const canApply = job.show_apply_button !== false && !!job.apply_link;
              const label = daysLeftLabel(job.last_date);
              return (
                <li
                  key={job.id}
                  className="grid grid-cols-[56px_minmax(0,1fr)] items-center gap-x-3 gap-y-2 px-4 py-3 transition hover:bg-brand-50/60 md:grid-cols-[72px_minmax(0,1fr)_150px_150px] md:gap-4"
                >
                  <HomeDateStub lastDate={job.last_date} />
                  <div className="min-w-0">
                    <JobViewLink
                      jobId={job.id}
                      className="block text-sm font-semibold leading-snug text-gray-900 hover:text-brand-700 hover:underline md:text-base"
                    >
                      {job.title}
                    </JobViewLink>
                    <p className="mt-0.5 text-xs text-gray-500">
                      {job.job_type && (
                        <span className="mr-1.5 rounded border border-gray-200 px-1.5 py-0.5 font-medium text-gray-600">
                          {job.job_type}
                        </span>
                      )}
                      {job.department}
                      {label && <span className="ml-1.5 font-semibold text-red-700">{label}</span>}
                    </p>
                  </div>
                  <p className="col-start-2 text-xs text-gray-600 md:col-start-auto md:text-sm">
                    {job.city || <span className="text-gray-400">Not stated</span>}
                  </p>
                  <div className="col-start-2 flex gap-2 md:col-start-auto md:justify-end">
                    <JobViewLink
                      jobId={job.id}
                      className="flex min-h-[40px] items-center rounded-md border border-brand-600 px-3.5 text-xs font-semibold text-brand-700 transition hover:bg-brand-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500"
                    >
                      View
                    </JobViewLink>
                    {canApply && (
                      <a
                        href={job.apply_link}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex min-h-[40px] items-center rounded-md bg-brand-600 px-3.5 text-xs font-semibold text-white transition hover:bg-brand-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500"
                      >
                        Apply
                      </a>
                    )}
                  </div>
                </li>
              );
            })}
          </ul>
        </div>
      )}
    </HomeSection>
  );
}
