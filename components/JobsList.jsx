'use client';

import { useState } from 'react';
import Link from 'next/link';
import PublicJobDetailsModal from './PublicJobDetailsModal';
import { BriefcaseIcon3D } from './Icons3D';
import { isDatePast } from '@/lib/jobStatus';

function formatDate(dateStr) {
  if (!dateStr) return null;
  return new Date(dateStr).toLocaleDateString('en-US', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });
}

export default function JobsList({ jobs = [] }) {
  const [selectedJob, setSelectedJob] = useState(null);

  return (
    <section className="rounded-2xl bg-white p-4 shadow-sm ring-1 ring-black/5 md:p-6">
      <div className="mb-4 flex items-center justify-between border-b border-gray-100 pb-4">
        <div className="flex items-center gap-3">
          <span className="relative flex h-10 w-10 flex-shrink-0 items-center justify-center">
            <BriefcaseIcon3D className="h-full w-full" />
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
        <ul className="divide-y divide-brand-100">
          {jobs.map((job) => (
            <li key={job.id} className="flex items-center justify-between gap-3 py-3">
              <div className="min-w-0">
                <p className="truncate text-sm font-semibold text-gray-800 md:text-base">{job.title}</p>
                <p className="mt-0.5 text-xs text-gray-500">
                  {job.department}
                  {job.last_date && (
                    <span
                      className={`ml-2 rounded px-1.5 py-0.5 font-medium ${
                        isDatePast(job.last_date) ? 'bg-red-100 text-red-700' : 'bg-red-50 text-red-600'
                      }`}
                    >
                      Last date: {formatDate(job.last_date)}
                    </span>
                  )}
                </p>
              </div>
              <div className="flex flex-shrink-0 items-center gap-2">
                <button
                  onClick={() => setSelectedJob(job)}
                  className="flex min-h-[40px] items-center justify-center rounded-md border border-gray-200 px-3.5 py-2 text-xs font-semibold text-gray-600 transition active:scale-95 hover:border-brand-200 hover:text-brand-700"
                >
                  View
                </button>
                <a
                href={job.apply_link || '#'}
                target="_blank"
                rel="noopener noreferrer"
                className="flex min-h-[40px] flex-shrink-0 items-center justify-center rounded-md bg-brand-600 px-3.5 py-2 text-xs font-semibold text-white transition active:scale-95 hover:bg-brand-700"
              >
                Apply
              </a>
              </div>
            </li>
          ))}
        </ul>
      )}

      {selectedJob && <PublicJobDetailsModal job={selectedJob} onClose={() => setSelectedJob(null)} />}
    </section>
  );
}
