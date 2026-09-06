'use client';

import { useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import PublicJobCard from './PublicJobCard';
import WhatsAppServiceCard from './WhatsAppServiceCard';
import { isJobExpired, daysRemaining } from '@/lib/jobStatus';
import { matchesQuery } from '@/lib/searchMatch';
import { SearchIcon3D as SearchIcon } from './Icons3D';
import { SECTORS, JOB_TYPES } from '@/lib/matching';

// Sector (shown to visitors as "Province", since SECTORS is Federal/Punjab/
// Sindh/Balochistan/KPK/Azad Kashmir), City and Job Type are now real,
// user-adjustable dropdown filters below the search box. They're also still
// readable from the URL (?category=/&jobType=/&sector=) so the homepage's
// "Browse by Category" tiles keep working exactly as before.
const FILTER_DEFAULTS = { search: '', sector: 'all', jobType: 'all', category: 'all', city: 'all', view: 'open' };
const PAGE_SIZE = 12;

const SORT_OPTIONS = [
  { value: 'newest', label: 'Newest First' },
  { value: 'closing', label: 'Closing Soon' },
];

/** Applies the active sort to an already-filtered job list. 'closing' pushes
 * jobs with no last_date to the bottom instead of treating them as most
 * urgent. */
function sortJobs(list, sort) {
  const arr = [...list];
  if (sort === 'closing') {
    arr.sort((a, b) => {
      const da = daysRemaining(a.last_date);
      const db = daysRemaining(b.last_date);
      if (da === null && db === null) return 0;
      if (da === null) return 1;
      if (db === null) return -1;
      return da - db;
    });
    return arr;
  }
  // newest first (default) — created_at descending
  arr.sort((a, b) => new Date(b.created_at || 0) - new Date(a.created_at || 0));
  return arr;
}

export default function PublicJobsBrowser({ jobs = [], siteName, settings }) {
  // Lets a link like /jobs?category=Banking%20/%20Finance land with that
  // filter already applied — used by the homepage's "Browse by Category"
  // tiles so clicking a category actually filters, instead of dropping
  // the visitor on an unfiltered list they then have to filter manually.
  const searchParams = useSearchParams();
  const [filters, setFilters] = useState(() => ({
    ...FILTER_DEFAULTS,
    category: searchParams.get('category') || FILTER_DEFAULTS.category,
    jobType: searchParams.get('jobType') || FILTER_DEFAULTS.jobType,
    sector: searchParams.get('sector') || FILTER_DEFAULTS.sector,
  }));
  const [sort, setSort] = useState('newest');
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);

  // Distinct, non-empty cities actually present in the job data, sorted
  // alphabetically — never a hardcoded list, so it always matches what's
  // really posted.
  const cities = useMemo(() => {
    const set = new Set(jobs.map((j) => j.city?.trim()).filter(Boolean));
    return Array.from(set).sort((a, b) => a.localeCompare(b));
  }, [jobs]);

  const filtered = useMemo(() => {
    const list = jobs.filter((job) => {
      if (job.status === 'closed') return false;
      const expired = isJobExpired(job);
      if (filters.view === 'open' && expired) return false;
      if (filters.view === 'expired' && !expired) return false;
      if (filters.sector !== 'all' && job.sector !== filters.sector) return false;
      if (filters.jobType !== 'all' && job.job_type !== filters.jobType) return false;
      if (filters.category !== 'all' && job.category !== filters.category) return false;
      if (filters.city !== 'all' && job.city !== filters.city) return false;
      if (filters.search.trim()) {
        if (!matchesQuery([job.title, job.department, job.city, job.sector, job.category, job.job_type], filters.search)) {
          return false;
        }
      }
      return true;
    });
    return sortJobs(list, sort);
  }, [jobs, filters, sort]);

  // Reset how many cards are shown whenever the result set actually
  // changes shape (new filters/sort/search) — otherwise "Load More"
  // progress from a previous search would carry over.
  useEffect(() => {
    setVisibleCount(PAGE_SIZE);
  }, [filters, sort]);

  const visibleJobs = filtered.slice(0, visibleCount);
  const hasMore = visibleCount < filtered.length;

  const activeFilterCount = Object.entries(filters).filter(
    ([k, v]) => k !== 'search' && k !== 'view' && v && v !== 'all'
  ).length;

  function update(key, value) {
    setFilters((f) => ({ ...f, [key]: value }));
  }

  function clearFilters() {
    setFilters(FILTER_DEFAULTS);
  }

  return (
    <>
      {/* --- Hero / Header --- */}
      <div className="relative overflow-hidden border-b border-gray-100 bg-white">
        <div className="relative mx-auto max-w-5xl px-4 py-10 text-center md:px-6 md:py-14">
          <h1 className="font-serif text-2xl font-bold tracking-tight text-gray-900 sm:text-3xl md:text-4xl">
            {siteName || 'Pak Study And Jobs'}
          </h1>
          <p
            className="mx-auto mt-2 max-w-xl font-urdu text-base leading-loose text-gray-600 sm:text-lg"
            dir="rtl"
            lang="ur"
          >
            ہزاروں تازہ ترین گورنمنٹ اور پرائیویٹ جابز تلاش کریں
          </p>

          {/* Search bar */}
          <div className="mx-auto mt-6 max-w-xl">
            <div className="flex items-center gap-2 rounded-full border border-gray-200 bg-white px-4 py-2.5 shadow-md sm:py-3">
              <SearchIcon className="h-5 w-5 flex-shrink-0 text-gray-400" />
              <input
                type="text"
                value={filters.search}
                onChange={(e) => update('search', e.target.value)}
                placeholder="Search Job Title, Department or City"
                className="w-full bg-transparent text-sm text-gray-800 outline-none placeholder:text-gray-400 sm:text-base"
              />
            </div>
          </div>
        </div>
      </div>

      {/* --- Content --- */}
      <div className="mx-auto max-w-6xl px-4 py-8 md:px-6 md:py-10">
        <div className="mb-6 flex flex-col gap-3 rounded-xl border border-gray-100 bg-white px-4 py-3 shadow-sm">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <p className="text-xs text-gray-500 sm:text-sm">
              <span className="font-bold text-gray-800">{filtered.length}</span> job{filtered.length === 1 ? '' : 's'} found
              {activeFilterCount > 0 && (
                <button onClick={clearFilters} className="ml-2 text-xs font-semibold text-brand-600 hover:underline">
                  Clear ×
                </button>
              )}
            </p>
            <label className="flex items-center gap-1.5 text-xs text-gray-500 sm:text-sm">
              <span>Sort:</span>
              <select
                value={sort}
                onChange={(e) => setSort(e.target.value)}
                className="rounded-lg border border-gray-200 bg-white px-2.5 py-1.5 text-xs font-semibold text-gray-700 outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-100 sm:text-sm"
              >
                {SORT_OPTIONS.map((o) => (
                  <option key={o.value} value={o.value}>
                    {o.label}
                  </option>
                ))}
              </select>
            </label>
          </div>

          {/* Province (sector) / City / Job Type — real filters, not just
              URL-driven. Each select's own "All ..." option doubles as its
              label, so there's no extra caption text crowding the row. */}
          <div className="flex flex-wrap items-center gap-2 border-t border-gray-100 pt-3">
            <select
              value={filters.sector}
              onChange={(e) => update('sector', e.target.value)}
              className="rounded-lg border border-gray-200 bg-white px-2.5 py-1.5 text-xs font-medium text-gray-700 outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-100 sm:text-sm"
            >
              <option value="all">All Provinces</option>
              {SECTORS.map((s) => (
                <option key={s.value} value={s.value}>
                  {s.label}
                </option>
              ))}
            </select>

            <select
              value={filters.jobType}
              onChange={(e) => update('jobType', e.target.value)}
              className="rounded-lg border border-gray-200 bg-white px-2.5 py-1.5 text-xs font-medium text-gray-700 outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-100 sm:text-sm"
            >
              <option value="all">All Job Types</option>
              {JOB_TYPES.map((t) => (
                <option key={t} value={t}>
                  {t}
                </option>
              ))}
            </select>

            {cities.length > 0 && (
              <select
                value={filters.city}
                onChange={(e) => update('city', e.target.value)}
                className="rounded-lg border border-gray-200 bg-white px-2.5 py-1.5 text-xs font-medium text-gray-700 outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-100 sm:text-sm"
              >
                <option value="all">All Cities</option>
                {cities.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            )}
          </div>
        </div>

        {/* Job card grid */}
        {filtered.length === 0 ? (
          <div className="flex flex-col items-center gap-3 rounded-2xl bg-white py-16 text-center shadow-sm ring-1 ring-black/5">
            <span className="flex h-14 w-14 items-center justify-center rounded-full bg-gray-50 text-2xl">
              🔍
            </span>
            <p className="text-sm text-gray-500">No jobs match your search. Try clearing some filters.</p>
            {activeFilterCount > 0 || filters.search ? (
              <button
                onClick={clearFilters}
                className="rounded-full bg-brand-600 px-4 py-2 text-xs font-semibold text-white transition hover:bg-brand-700"
              >
                Clear all filters
              </button>
            ) : null}
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {visibleJobs.map((job) => (
                <PublicJobCard key={job.id} job={job} />
              ))}
            </div>

            {hasMore && (
              <div className="mt-8 flex justify-center">
                <button
                  onClick={() => setVisibleCount((c) => c + PAGE_SIZE)}
                  className="rounded-full border-2 border-gray-200 bg-white px-6 py-3 text-sm font-semibold text-gray-700 transition active:scale-[0.98] hover:border-brand-300 hover:bg-brand-50 hover:text-brand-700"
                >
                  Load More Jobs
                </button>
              </div>
            )}
          </>
        )}

        {/* WhatsApp application-support ad — moved below the jobs list so
            it doesn't interrupt the listing right after the search box. */}
        {settings?.wa_service_enabled && (
          <div className="mt-8">
            <WhatsAppServiceCard settings={settings} />
          </div>
        )}
      </div>
    </>
  );
}
