'use client';

import { useMemo, useState } from 'react';
import PublicJobCard from './PublicJobCard';
import PublicJobDetailsModal from './PublicJobDetailsModal';
import WhatsAppServiceCard from './WhatsAppServiceCard';
import { SECTORS, JOB_CATEGORIES } from '@/lib/matching';
import { isJobExpired } from '@/lib/jobStatus';
import { matchesQuery } from '@/lib/searchMatch';
import { SearchIcon3D as SearchIcon, FilterIcon3D, ChevronDownIcon3D } from './Icons3D';

const FILTER_DEFAULTS = { search: '', sector: 'all', jobType: 'all', category: 'all', city: 'all', view: 'open' };

export default function PublicJobsBrowser({ jobs = [], siteName, settings }) {
  const [filters, setFilters] = useState(FILTER_DEFAULTS);
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [selectedJob, setSelectedJob] = useState(null);

  const cities = useMemo(() => [...new Set(jobs.map((j) => j.city).filter(Boolean))].sort(), [jobs]);

  const filtered = useMemo(() => {
    return jobs.filter((job) => {
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
  }, [jobs, filters]);

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
        {/* Filter bar — sticky on mobile so filters/results-count stay reachable
            with one thumb while scrolling a long job list. */}
        <div className="sticky top-16 z-10 mb-6 rounded-2xl bg-white p-4 shadow-sm ring-1 ring-black/5 md:static md:p-5">
          <button
            onClick={() => setFiltersOpen((v) => !v)}
            className="mb-3 flex min-h-[44px] w-full items-center justify-between rounded-lg border border-gray-200 px-4 py-3 text-sm font-semibold text-gray-700 active:scale-[0.99] md:hidden"
          >
            <span className="flex items-center gap-2">
              <FilterIcon3D className="h-4 w-4" />
              Filters {activeFilterCount > 0 && `(${activeFilterCount})`}
            </span>
            <ChevronDownIcon3D className={`h-4 w-4 transition-transform ${filtersOpen ? 'rotate-180' : ''}`} />
          </button>

          <div className={`${filtersOpen ? 'flex' : 'hidden'} flex-col gap-3 md:flex`}>
            <div className="flex gap-2 rounded-lg border border-gray-200 bg-gray-50 p-1">
              {[
                { value: 'open', label: 'Open Jobs' },
                { value: 'expired', label: 'Expired Jobs' },
              ].map((t) => (
                <button
                  key={t.value}
                  onClick={() => update('view', t.value)}
                  className={`flex-1 rounded-md px-3 py-3 text-xs font-semibold transition active:scale-[0.98] sm:py-2 sm:text-sm ${
                    filters.view === t.value ? 'bg-brand-600 text-white' : 'text-gray-500 hover:text-gray-800'
                  }`}
                >
                  {t.label}
                </button>
              ))}
            </div>

            <div className="flex gap-2 rounded-lg border border-gray-200 bg-gray-50 p-1">
              {['all', 'Government', 'Private'].map((t) => (
                <button
                  key={t}
                  onClick={() => update('jobType', t)}
                  className={`flex-1 rounded-md px-3 py-3 text-xs font-semibold transition active:scale-[0.98] sm:py-2 sm:text-sm ${
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
                className="min-h-[44px] rounded-lg border border-gray-200 bg-gray-50 px-3.5 py-3 text-sm text-gray-800 outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-100 sm:py-2.5"
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
                className="min-h-[44px] rounded-lg border border-gray-200 bg-gray-50 px-3.5 py-3 text-sm text-gray-800 outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-100 sm:py-2.5"
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
                className="min-h-[44px] rounded-lg border border-gray-200 bg-gray-50 px-3.5 py-3 text-sm text-gray-800 outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-100 sm:py-2.5"
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
              <button
                onClick={clearFilters}
                className="self-start py-1 text-xs font-semibold text-brand-600 hover:underline"
              >
                Clear all filters ×
              </button>
            )}
          </div>
        </div>

        <p className="mb-4 text-sm text-gray-500">
          {filtered.length} job{filtered.length === 1 ? '' : 's'} found
        </p>

        {settings?.wa_service_enabled && (
          <div className="mb-6">
            <WhatsAppServiceCard settings={settings} />
          </div>
        )}

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

      {selectedJob && (
        <PublicJobDetailsModal job={selectedJob} settings={settings} onClose={() => setSelectedJob(null)} />
      )}
    </>
  );
}
