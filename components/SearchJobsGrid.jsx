import PublicJobCard from './PublicJobCard';

// Renders matching jobs as full PublicJobCard cards for the /search page.
// Each card's "View Details" now links straight to the job's own
// /jobs/[id] page (see PublicJobCard), so this no longer needs to own any
// modal-open state — it can stay a plain server component.
export default function SearchJobsGrid({ jobs = [] }) {
  if (jobs.length === 0) return null;

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {jobs.map((job) => (
        <PublicJobCard key={job.id} job={job} />
      ))}
    </div>
  );
}
