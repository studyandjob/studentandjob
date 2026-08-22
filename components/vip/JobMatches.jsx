'use client';

import { useMemo, useState } from 'react';
import JobCard from './JobCard';
import JobModal from './JobModal';
import { SECTORS, getMatchingJobs } from '@/lib/matching';

export default function JobMatches({ jobs = [], profile }) {
  const [sector, setSector] = useState('all');
  const [jobType, setJobType] = useState('Government');
  const [onlyMatches, setOnlyMatches] = useState(true);
  const [selectedJob, setSelectedJob] = useState(null);

  const activeJobs = useMemo(() => jobs.filter((j) => j.status !== 'closed'), [jobs]);

  // AI Smart Job Matching: score every job against the candidate's
  // profile (education + skills + sector preference), then filter down
  // to the sector / job-type tabs the user has selected.
  const ranked = useMemo(() => {
    if (!profile) return activeJobs.map((job) => ({ job, match: null }));
    return getMatchingJobs(profile, activeJobs, 0); // score everything, filter visually below
  }, [activeJobs, profile]);

  const visible = ranked.filter(({ job, match }) => {
    if (sector !== 'all' && job.sector !== sector) return false;
    if (job.job_type !== jobType) return false;
    if (onlyMatches && profile && match && match.score < 30) return false;
    return true;
  });

  const selectedMatch = selectedJob ? ranked.find((r) => r.job.id === selectedJob.id)?.match : null;

  return (
    <div>
      <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex gap-2 rounded-lg border border-gray-200 bg-white p-1">
          {['Government', 'Private'].map((t) => (
            <button
              key={t}
              onClick={() => setJobType(t)}
              className={`rounded-md px-4 py-2 text-sm font-semibold transition ${
                jobType === t ? 'bg-brand-600 text-white' : 'text-gray-500 hover:text-gray-800'
              }`}
            >
              {t} Jobs
            </button>
          ))}
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <select
            value={sector}
            onChange={(e) => setSector(e.target.value)}
            className="rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm text-gray-700 outline-none focus:border-brand-500"
          >
            <option value="all">All Sectors</option>
            {SECTORS.map((s) => (
              <option key={s.value} value={s.value}>
                {s.label}
              </option>
            ))}
          </select>

          {profile && (
            <label className="flex items-center gap-2 text-sm text-gray-600">
              <input type="checkbox" checked={onlyMatches} onChange={(e) => setOnlyMatches(e.target.checked)} className="h-4 w-4 rounded border-gray-300 text-brand-600" />
              Show matches only
            </label>
          )}
        </div>
      </div>

      {!profile && (
        <p className="mb-4 rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-800">
          Complete your Profile to see an AI match score on every job below.
        </p>
      )}

      {visible.length === 0 ? (
        <p className="py-10 text-center text-sm text-gray-500">
          No {jobType.toLowerCase()} jobs {sector !== 'all' ? `in ${sector} ` : ''}right now
          {onlyMatches && profile ? ' that match your profile — try turning off "Show matches only".' : '.'}
        </p>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {visible.map(({ job, match }) => (
            <JobCard key={job.id} job={job} match={match} onViewDetails={() => setSelectedJob(job)} />
          ))}
        </div>
      )}

      {selectedJob && <JobModal job={selectedJob} match={selectedMatch} onClose={() => setSelectedJob(null)} />}
    </div>
  );
}
