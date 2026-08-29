'use client';

import { useMemo, useState } from 'react';
import PublicJobDetailsModal from './PublicJobDetailsModal';
import { SECTORS, JOB_CATEGORIES } from '@/lib/matching';

function formatDate(dateStr) {
  if (!dateStr) return null;
  return new Date(dateStr).toLocaleDateString('en-US', { day: '2-digit', month: 'short', year: 'numeric' });
}

const FILTER_DEFAULTS = { search: '', sector: 'all', jobType: 'all', category: 'all', city: 'all' };

export default function PublicJobsBrowser({ jobs = [] }) {
  const [filters, setFilters] = useState(FILTER_DEFAULTS);
  const [filtersOpen, setFiltersOpen] = useState(false); // collapsed by default on mobile
  const [selectedJob, setSelectedJob] = useState(null);

  const cities = useMemo(
    () => [...new Set(jobs.map((j) => j.city).filter(Boolean))].sort(),
    [jobs]
  );

  const filtered = useMemo(() => {
    return jobs.filter((job) => {
      if (job.status === 'closed') return false;
      if (filters.sector !== 'all' && job.sector !== filters.sector) return false;
      if (filters.jobType !== 'all' && job.job_type !== filters.jobType) return false;
      if (filters.category !== 'all' && job.category !== filters.category) return false;
      if (filters.city !== 'all' && job.city !== filters.city) return false;
      if (filters.search.trim()) {
        const q = filters.search.trim().toLowerCase();
        const haystack = `${job.title} ${job.department}`.toLowerCase();
        if (!haystack.includes(q)) return false;
      }
      return true;
    });
  }, [jobs, filters]);

  const activeFilterCount = Object.entries(filters).filter(([k, v]) => v && v !== 'all' && v !== '').length;

  function update(key, value) {
    setFilters((f) => ({ ...f, [key]: value }));
  }

  function clearFilters() {
    setFilters(FILTER_DEFAULTS);
  }

  return (
    <div className="rounded-2xl bg-white p-4 shadow-sm ring-1 ring-black/5 md:p-6">
      {/* --- Filter bar --- */}
      <div className="mb-5 border-b border-gray-100 pb-5">
        {/* Mobile toggle */}
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
          {/* Job type tabs */}
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

          {/* Dropdown filters */}
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
            <input
              type="text"
              value={filters.search}
              onChange={(e) => update('search', e.target.value)}
              placeholder="Search by title or department…"
              className="rounded-lg border border-gray-200 bg-gray-50 px-3.5 py-2.5 text-sm text-gray-800 outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-100 lg:col-span-1"
            />

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

      {/* --- Job list --- */}
      {filtered.length === 0 ? (
        <p className="py-10 text-center text-sm text-gray-500">
          No jobs match your filters. Try clearing some filters.
        </p>
      ) : (
        <ul className="divide-y divide-gray-100">
          {filtered.map((job) => (
            <li key={job.id} className="flex flex-col gap-3 py-4 sm:flex-row sm:items-center sm:justify-between">
              <div className="min-w-0">
                <div className="mb-1 flex flex-wrap items-center gap-1.5">
                  <p className="text-sm font-semibold text-gray-800 md:text-base">{job.title}</p>
                  <span
                    className={`rounded-full px-2 py-0.5 text-[0.65rem] font-bold uppercase tracking-wide ${
                      job.job_type === 'Government' ? 'bg-brand-50 text-brand-700' : 'bg-gray-50 text-gray-600'
                    }`}
                  >
                    {job.job_type}
                  </span>
                  {job.sector && (
                    <span className="rounded-full bg-gray-100 px-2 py-0.5 text-[0.65rem] font-medium text-gray-600">
                      {job.sector}
                    </span>
                  )}
                </div>
                <p className="text-xs text-gray-500 md:text-sm">
                  {job.department}
                  {job.city && ` • ${job.city}`}
                  {job.last_date && (
                    <span className="ml-2 rounded bg-red-50 px-1.5 py-0.5 font-medium text-red-600">
                      Last date: {formatDate(job.last_date)}
                    </span>
                  )}
                </p>
              </div>
              <div className="flex flex-shrink-0 gap-2">
                <button
                  onClick={() => setSelectedJob(job)}
                  className="rounded-md border border-gray-200 px-4 py-2 text-center text-xs font-semibold text-gray-600 transition hover:border-brand-200 hover:text-brand-700"
                >
                  View Details
                </button>
                <a
                  href={job.apply_link || '#'}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="rounded-md bg-brand-600 px-4 py-2 text-center text-xs font-semibold text-white transition hover:bg-brand-700"
                >
                  Apply Now
                </a>
              </div>
            </li>
          ))}
        </ul>
      )}

      {selectedJob && <PublicJobDetailsModal job={selectedJob} onClose={() => setSelectedJob(null)} />}
    </div>
  );
}
