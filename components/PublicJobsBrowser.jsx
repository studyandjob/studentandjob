'use client';

import { useMemo, useState } from 'react';
import PublicJobCard from './PublicJobCard';
import PublicJobDetailsModal from './PublicJobDetailsModal';
import { SECTORS, JOB_CATEGORIES } from '@/lib/matching';

const SearchIcon = (props) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} {...props}>
    <circle cx="11" cy="11" r="7" />
    <path strokeLinecap="round" d="M21 21l-4.35-4.35" />
  </svg>
);

const FILTER_DEFAULTS = { search: '', sector: 'all', jobType: 'all', category: 'all', city: 'all' };

export default function PublicJobsBrowser({ jobs = [], siteName }) {
  const [filters, setFilters] = useState(FILTER_DEFAULTS);
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [selectedJob, setSelectedJob] = useState(null);

  const cities = useMemo(() => [...new Set(jobs.map((j) => j.city).filter(Boolean))].sort(), [jobs]);

  const filtered = useMemo(() => {
    return jobs.filter((job) => {
      if (job.status === 'closed') return false;
      if (filters.sector !== 'all' && job.sector !== filters.sector) return false;
      if (filters.jobType !== 'all' && job.job_type !== filters.jobType) return false;
      if (filters.category !== 'all' && job.category !== filters.category) return false;
      if (filters.city !== 'all' && job.city !== filters.city) return false;
      if (filters.search.trim()) {
        const q = filters.search.trim().toLowerCase();
        const haystack = `${job.title} ${job.department} ${job.city || ''}`.toLowerCase();
        if (!haystack.includes(q)) return false;
      }
      return true;
    });
  }, [jobs, filters]);

  const activeFilterCount = Object.entries(filters).filter(
    ([k, v]) => k !== 'search' && v && v !== 'all'
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
      <div className="relative overflow-hidden bg-gradient-to-br from-brand-700 via-brand-600 to-brand-500 text-white">
        <div
          className="pointer-events-none absolute inset-0 opacity-[0.07]"
          style={{
            backgroundImage: 'radial-gradient(circle at 2px 2px, white 1px, transparent 0)',
            backgroundSize: '28px 28px',
          }}
        />
        <div className="relative mx-auto max-w-5xl px-4 py-10 text-center md:px-6 md:py-16">
          <h1 className="text-2xl font-extrabold tracking-tight sm:text-3xl md:text-4xl">
            {siteName || 'Pak Study And Jobs'}
          </h1>
          <p
            className="mx-auto mt-2 max-w-xl font-urdu text-base leading-loose text-brand-50/90 sm:text-lg"
            dir="rtl"
            lang="ur"
          >
            ہزاروں تازہ ترین گورنمنٹ اور پرائیویٹ جابز تلاش کریں
          </p>

          {/* Search bar */}
          <div className="mx-auto mt-6 max-w-xl">
            <div className="flex items-center gap-2 rounded-full bg-white px-4 py-2.5 shadow-lg sm:py-3">
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
        <div
          className="absolute inset-x-0 bottom-0 h-8 bg-gray-50"
          style={{ clipPath: 'ellipse(70% 100% at 50% 100%)' }}
        />
      </div>

      {/* --- Content --- */}
      <div className="mx-auto max-w-6xl px-4 py-8 md:px-6 md:py-10">
        {/* Filter bar */}
        <div className="mb-6 rounded-2xl bg-white p-4 shadow-sm ring-1 ring-black/5 md:p-5">
          <button
            onClick={() => setFiltersOpen((v) => !v)}
            className="mb-3 flex w-full items-center justify-between rounded-lg border border-gray-200 px-4 py-2.5 text-sm font-semibold text-gray-700 md:hidden"
          >
            <span className="flex items-center gap-2">
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
              </svg>
              Filters {activeFilterCount > 0 && `(${activeFilterCount})`}
            </span>
            <svg
              className={`h-4 w-4 transition-transform ${filtersOpen ? 'rotate-180' : ''}`}
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </button>

          <div className={`${filtersOpen ? 'flex' : 'hidden'} flex-col gap-3 md:flex`}>
            <div className="flex gap-2 rounded-lg border border-gray-200 bg-gray-50 p-1">
              {['all', 'Government', 'Private'].map((t) => (
                <button
                  key={t}
                  onClick={() => update('jobType', t)}
                  className={`flex-1 rounded-md px-3 py-2 text-xs font-semibold transition sm:text-sm ${
                    filters.jobType === t ? 'bg-brand-600 text-white' : 'text-gray-500 hover:text-gray-800'
                  }`}
                >
                  {t === 'all' ? 'All Jobs' : `${t} Jobs`}
                </button>
              ))}
            </div>

            <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
              <select
                value={filters.sector}
                onChange={(e) => update('sector', e.target.value)}
                className="rounded-lg border border-gray-200 bg-gray-50 px-3.5 py-2.5 text-sm text-gray-800 outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-100"
              >
                <option value="all">All Sectors</option>
                {SECTORS.map((s) => (
                  <option key={s.value} value={s.value}>
                    {s.label}
                  </option>
                ))}
              </select>

              <select
                value={filters.category}
                onChange={(e) => update('category', e.target.value)}
                className="rounded-lg border border-gray-200 bg-gray-50 px-3.5 py-2.5 text-sm text-gray-800 outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-100"
              >
                <option value="all">All Categories</option>
                {JOB_CATEGORIES.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>

              <select
                value={filters.city}
                onChange={(e) => update('city', e.target.value)}
                className="rounded-lg border border-gray-200 bg-gray-50 px-3.5 py-2.5 text-sm text-gray-800 outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-100"
              >
                <option value="all">All Cities</option>
                {cities.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </div>

            {activeFilterCount > 0 && (
              <button onClick={clearFilters} className="self-start text-xs font-semibold text-brand-600 hover:underline">
                Clear all filters ×
              </button>
            )}
          </div>
        </div>

        <p className="mb-4 text-sm text-gray-500">
          {filtered.length} job{filtered.length === 1 ? '' : 's'} found
        </p>

        {/* Job card grid */}
        {filtered.length === 0 ? (
          <div className="rounded-2xl bg-white py-16 text-center shadow-sm ring-1 ring-black/5">
            <p className="text-sm text-gray-500">No jobs match your search. Try clearing some filters.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {filtered.map((job) => (
              <PublicJobCard key={job.id} job={job} onViewDetails={() => setSelectedJob(job)} />
            ))}
          </div>
        )}
      </div>

      {selectedJob && <PublicJobDetailsModal job={selectedJob} onClose={() => setSelectedJob(null)} />}
    </>
  );
}
