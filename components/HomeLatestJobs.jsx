import HomeRow from './HomeRow';
import PublicJobCard from './PublicJobCard';

/** Newest open jobs as an Airbnb-style carousel row. */
export default function HomeLatestJobs({ jobs = [] }) {
  if (jobs.length === 0) {
    return (
      <section>
        <h2 className="mb-4 text-xl font-semibold text-gray-900 md:text-[22px]">Latest jobs</h2>
        <p className="rounded-2xl border border-line bg-surface p-10 text-center text-sm text-gray-500">
          No jobs posted yet. Check back soon.
        </p>
      </section>
    );
  }
  return (
    <HomeRow title="Latest jobs" subtitle="Newly posted government and private jobs" href="/jobs">
      {jobs.map((job) => (
        <li key={job.id} className="flex w-[250px] flex-shrink-0 snap-start sm:w-[270px] lg:w-[300px]">
          <PublicJobCard job={job} />
        </li>
      ))}
    </HomeRow>
  );
}
