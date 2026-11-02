'use client';

import { useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import PublicJobCard from './PublicJobCard';
import WhatsAppServiceCard from './WhatsAppServiceCard';
import { isJobExpired, daysRemaining } from '@/lib/jobStatus';
import { matchesQuery } from '@/lib/searchMatch';
import SearchIcon from './HomeIcons';
import { SECTORS, JOB_TYPES } from '@/lib/matching';
import { isPageEnabled } from '@/lib/pages';

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
    search: searchParams.get('q') || FILTER_DEFAULTS.search,
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
    <div className="bg-white">
      {/* --- Header + search --- */}
      <div className="mx-auto max-w-7xl px-4 pb-2 pt-6 md:px-6 md:pt-10">
        <h1 className="text-2xl font-extrabold tracking-tight text-gray-900 sm:text-3xl md:text-4xl">
          Find your next job
        </h1>
        <p className="mt-1 font-urdu text-base leading-loose text-gray-500" dir="rtl" lang="ur">
          ہزاروں تازہ ترین گورنمنٹ اور پرائیویٹ جابز تلاش کریں
        </p>

        {/* Search bar */}
        <div className="mt-4 flex max-w-2xl items-center gap-3 rounded-full border border-gray-200 bg-white py-2 pl-5 pr-2 shadow-pill transition focus-within:shadow-card-hover">
          <SearchIcon name="search" className="h-5 w-5 flex-shrink-0 text-gray-400" />
          <input
            type="text"
            value={filters.search}
            onChange={(e) => update('search', e.target.value)}
            placeholder="Search job title, department or city"
            className="w-full bg-transparent py-2 text-sm font-medium text-gray-900 outline-none placeholder:text-gray-500 sm:text-base"
          />
        </div>

        {/* Province / Job type / City filters + sort */}
        <div className="no-scrollbar -mx-4 mt-5 flex items-center gap-2 overflow-x-auto px-4 pb-2 md:mx-0 md:flex-wrap md:overflow-visible md:px-0">
          <select
            value={filters.sector}
            onChange={(e) => update('sector', e.target.value)}
            className="h-11 rounded-full border border-gray-300 bg-white px-4 text-sm font-semibold text-gray-800 outline-none transition hover:border-gray-900 focus:border-gray-900 focus:ring-2 focus:ring-gray-200"
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
            className="h-11 rounded-full border border-gray-300 bg-white px-4 text-sm font-semibold text-gray-800 outline-none transition hover:border-gray-900 focus:border-gray-900 focus:ring-2 focus:ring-gray-200"
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
              className="h-11 rounded-full border border-gray-300 bg-white px-4 text-sm font-semibold text-gray-800 outline-none transition hover:border-gray-900 focus:border-gray-900 focus:ring-2 focus:ring-gray-200"
            >
              <option value="all">All Cities</option>
              {cities.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          )}

          <select
            value={sort}
            onChange={(e) => setSort(e.target.value)}
            aria-label="Sort"
            className="h-11 rounded-full border border-gray-300 bg-white px-4 text-sm font-semibold text-gray-800 outline-none transition hover:border-gray-900 focus:border-gray-900 focus:ring-2 focus:ring-gray-200"
          >
            {SORT_OPTIONS.map((o) => (
              <option key={o.value} value={o.value}>
                {o.label}
              </option>
            ))}
          </select>
        </div>

        <div className="mt-3 flex items-center justify-between border-b border-gray-200 pb-4">
          <p className="text-sm text-gray-600">
            <span className="font-bold text-gray-900">{filtered.length}</span> job{filtered.length === 1 ? '' : 's'} found
          </p>
          {activeFilterCount > 0 && (
            <button onClick={clearFilters} className="text-sm font-semibold text-gray-900 underline underline-offset-4">
              Clear filters
            </button>
          )}
        </div>
      </div>

      {/* --- Content --- */}
      <div className="mx-auto max-w-7xl px-4 py-6 md:px-6 md:py-8">
        {/* Job card grid */}
        {filtered.length === 0 ? (
          <div className="flex flex-col items-center gap-3 rounded-2xl border border-gray-200 bg-white py-16 text-center">
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
            <div className="grid grid-cols-1 gap-x-6 gap-y-9 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {visibleJobs.map((job) => (
                <PublicJobCard key={job.id} job={job} />
              ))}
            </div>

            {hasMore && (
              <div className="mt-8 flex justify-center">
                <button
                  onClick={() => setVisibleCount((c) => c + PAGE_SIZE)}
                  className="rounded-xl bg-gray-900 px-7 py-3.5 text-sm font-semibold text-white transition active:scale-[0.98] hover:bg-black"
                >
                  Load More Jobs
                </button>
              </div>
            )}
          </>
        )}

        {/* WhatsApp application-support ad — moved below the jobs list so
            it doesn't interrupt the listing right after the search box. */}
        {settings?.wa_service_enabled && isPageEnabled(settings, 'application-support') && (
          <div className="mt-8">
            <WhatsAppServiceCard settings={settings} />
          </div>
        )}
      </div>
    </div>
  );
}
