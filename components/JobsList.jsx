import Link from 'next/link';

function formatDate(dateStr) {
  if (!dateStr) return null;
  return new Date(dateStr).toLocaleDateString('en-US', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });
}

export default function JobsList({ jobs = [] }) {
  return (
    <section className="rounded-2xl bg-white p-4 shadow-sm ring-1 ring-black/5 md:p-6">
      <div className="mb-4 flex items-center justify-between border-b border-gray-100 pb-4">
        <div className="flex items-center gap-2.5">
          <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-brand-50 text-brand-600">
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
            </svg>
          </span>
          <h2 className="text-base font-bold text-gray-900 md:text-lg">Latest Government Jobs</h2>
        </div>
        <Link href="/jobs" className="text-xs font-semibold text-brand-600 hover:underline md:text-sm">
          View all →
        </Link>
      </div>

      {jobs.length === 0 ? (
        <p className="py-8 text-center text-sm text-gray-500">No jobs posted yet. Check back soon.</p>
      ) : (
        <ul className="divide-y divide-gray-100">
          {jobs.map((job) => (
            <li key={job.id} className="flex items-center justify-between gap-3 py-3">
              <div className="min-w-0">
                <p className="truncate text-sm font-semibold text-gray-800 md:text-base">{job.title}</p>
                <p className="mt-0.5 text-xs text-gray-500">
                  {job.department}
                  {job.last_date && (
                    <span className="ml-2 rounded bg-red-50 px-1.5 py-0.5 font-medium text-red-600">
                      Last date: {formatDate(job.last_date)}
                    </span>
                  )}
                </p>
              </div>
              <a
                href={job.apply_link || '#'}
                target="_blank"
                rel="noopener noreferrer"
                className="flex-shrink-0 rounded-md bg-brand-600 px-3 py-1.5 text-xs font-semibold text-white transition hover:bg-brand-700"
              >
                Apply
              </a>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
