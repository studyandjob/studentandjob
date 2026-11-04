import HomeRow from './HomeRow';
import PublicJobCard from './PublicJobCard';
import { toDateKey } from '@/lib/jobStatus';

/** Carousel of jobs whose last date is nearest (falls back to newest). */
export default function HomeClosingSoon({ jobs = [] }) {
  // Jobs that have a last date, soonest first; if none do, fall back to newest.
  const dated = jobs
    .filter((j) => toDateKey(j.last_date))
    .sort((a, b) => toDateKey(a.last_date).localeCompare(toDateKey(b.last_date)));
  const closing = dated.length > 0 ? dated.slice(0, 10) : jobs.slice(0, 10);
  const title = dated.length > 0 ? 'Closing soon' : 'Latest openings';
  // With only a handful of jobs, "Closing soon" would just repeat "Latest jobs" below it.
  if (closing.length === 0 || jobs.length <= 4) return null;

  return (
    <HomeRow title={title} subtitle="Apply before the last date" href="/jobs">
      {closing.map((job) => (
        <li key={job.id} className="flex w-[250px] flex-shrink-0 snap-start sm:w-[270px] lg:w-[300px]">
          <PublicJobCard job={job} />
        </li>
      ))}
    </HomeRow>
  );
}
