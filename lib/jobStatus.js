// Shared job expiry/status helpers.
// Previously each component (HeroSlider, JobsList, PublicJobsBrowser,
// PublicJobCard, PublicJobDetailsModal) re-implemented its own
// "is this job past its last_date" check, and some of them only checked
// job.status === 'closed' — which only changes when an admin manually
// clicks "Close". That's why a job with last_date in the past (e.g.
// 31 Aug 2026, viewed on 1 Sep 2026) still showed up in "Latest Jobs":
// nobody had manually closed it yet, so status was still 'active'.
//
// isJobExpired() checks the actual date. isJobOpen() is what public
// listings should filter on so expired jobs disappear from "Latest
// Jobs" automatically, without waiting on an admin action.

/** True once the job's last_date has already passed (date-only comparison). */
export function isJobExpired(job) {
  if (!job?.last_date) return false;
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const due = new Date(job.last_date);
  due.setHours(0, 0, 0, 0);
  return due < today;
}

/** True if a job should appear in "open" public listings (Latest Jobs, hero, default /jobs view). */
export function isJobOpen(job) {
  return job?.status !== 'closed' && !isJobExpired(job);
}
