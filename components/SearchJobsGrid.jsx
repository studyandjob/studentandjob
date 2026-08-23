'use client';

import { useState } from 'react';
import PublicJobCard from './PublicJobCard';
import PublicJobDetailsModal from './PublicJobDetailsModal';

// Small client wrapper so the /search page (a server component) can render
// matching jobs as full PublicJobCard cards, including a working
// "View Details" modal — a plain server component can't pass an
// onViewDetails function into a client component, so that bit of state
// lives here instead.
export default function SearchJobsGrid({ jobs = [] }) {
  const [selectedJob, setSelectedJob] = useState(null);

  if (jobs.length === 0) return null;

  return (
    <>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {jobs.map((job) => (
          <PublicJobCard key={job.id} job={job} onViewDetails={() => setSelectedJob(job)} />
        ))}
      </div>

      {selectedJob && <PublicJobDetailsModal job={selectedJob} onClose={() => setSelectedJob(null)} />}
    </>
  );
}
