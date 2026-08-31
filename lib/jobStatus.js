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
//
// IMPORTANT — timezone: this runs both in the browser and on the server
// (Next.js server components render on Vercel, whose functions run in
// UTC, not Pakistan time). Comparing `new Date(job.last_date)` against
// `new Date()` used the SERVER's clock — so for the first ~5 hours of
// every new day in Pakistan (UTC+5), the server's UTC clock still shows
// "yesterday", and a job due "yesterday" in Pakistan kept showing as not
// yet expired. Since every job on this site is a Pakistan job, "today"
// is always computed in Asia/Karachi explicitly (not the server's local
// timezone), and compared as plain YYYY-MM-DD strings so parsing a date
// column never gets reinterpreted into a different calendar day.

const TIMEZONE = 'Asia/Karachi';
const dateKeyFormatter = new Intl.DateTimeFormat('en-CA', { timeZone: TIMEZONE }); // en-CA => 'YYYY-MM-DD'

/** Normalizes a date value (Postgres `date` string, ISO timestamp, or Date) to a 'YYYY-MM-DD' key. */
export function toDateKey(value) {
  if (!value) return null;
  // Supabase returns Postgres `date` columns as a plain 'YYYY-MM-DD'
  // string already — use it as-is rather than re-parsing through Date,
  // which would reinterpret it as UTC midnight and can shift it a day.
  if (typeof value === 'string' && /^\d{4}-\d{2}-\d{2}/.test(value)) return value.slice(0, 10);
  return dateKeyFormatter.format(new Date(value));
}

/** Today's date in Pakistan time, as a 'YYYY-MM-DD' key. */
export function todayKey() {
  return dateKeyFormatter.format(new Date());
}

/** True once the job's last_date has already passed, per Pakistan's current date. */
export function isJobExpired(job) {
  if (!job?.last_date) return false;
  return toDateKey(job.last_date) < todayKey();
}

/** True if a job should appear in "open" public listings (Latest Jobs, hero, default /jobs view). */
export function isJobOpen(job) {
  return job?.status !== 'closed' && !isJobExpired(job);
}

/** True once any date value (job.last_date, scholarship.deadline, etc.) has passed, per Pakistan's current date. */
export function isDatePast(dateValue) {
  const key = toDateKey(dateValue);
  if (!key) return false;
  return key < todayKey();
}

/** Whole days remaining until dateValue (negative once it's passed), computed against Pakistan's current date. */
export function daysRemaining(dateValue) {
  const key = toDateKey(dateValue);
  if (!key) return null;
  const [y, m, d] = key.split('-').map(Number);
  const due = Date.UTC(y, m - 1, d);
  const [ty, tm, td] = todayKey().split('-').map(Number);
  const today = Date.UTC(ty, tm - 1, td);
  return Math.round((due - today) / 86400000);
}
