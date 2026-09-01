'use client';

import { useMemo, useState } from 'react';
import PublicJobDetailsModal from './PublicJobDetailsModal';
import { CalendarClockIcon3D, BriefcaseIcon3D } from './Icons3D';
import { getTodayJobGroups } from '@/lib/jobStatus';

const GROUP_DEFS = [
  {
    key: 'closingToday',
    emoji: '🔴',
    label: 'Closing Today',
    chipClass: 'bg-red-50 text-red-700 border-red-100',
    barClass: 'border-red-100 bg-red-50',
  },
  {
    key: 'closingTomorrow',
    emoji: '🟠',
    label: 'Closing Tomorrow',
    chipClass: 'bg-amber-50 text-amber-700 border-amber-100',
    barClass: 'border-amber-100 bg-amber-50',
  },
  {
    key: 'newToday',
    emoji: '🆕',
    label: 'New Today',
    chipClass: 'bg-emerald-50 text-emerald-700 border-emerald-100',
    barClass: 'border-emerald-100 bg-emerald-50',
  },
];

export default function TodayJobsStrip({ jobs = [] }) {
  const [selectedJob, setSelectedJob] = useState(null);
  const { closingToday, closingTomorrow, newToday } = useMemo(() => getTodayJobGroups(jobs), [jobs]);

  const groups = GROUP_DEFS.map((g) => ({
    ...g,
    jobs: g.key === 'closingToday' ? closingToday : g.key === 'closingTomorrow' ? closingTomorrow : newToday,
  }));

  const totalCount = groups.reduce((sum, g) => sum + g.jobs.length, 0);
  if (totalCount === 0) return null;

  return (
    <section className="border-b border-gray-100 bg-gray-50/60">
      <div className="mx-auto max-w-7xl px-4 py-8 md:px-6 md:py-10">
        <div className="mb-4 flex items-center gap-2.5">
          <span className="flex h-9 w-9 flex-shrink-0 items-center justify-center">
            <CalendarClockIcon3D className="h-full w-full" />
          </span>
          <h2 className="text-base font-bold text-gray-900 md:text-lg">Today&apos;s Important Jobs</h2>
        </div>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          {groups.map(({ key, emoji, label, chipClass, barClass, jobs: groupJobs }) => {
            if (groupJobs.length === 0) return null;

            return (
              <div key={key} className={`rounded-2xl border bg-white p-4 shadow-sm ring-1 ring-black/5`}>
                <p className={`mb-3 inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-bold ${chipClass}`}>
                  <span>{emoji}</span>
                  {label} ({groupJobs.length})
                </p>
                <ul className="flex flex-col gap-2">
                  {groupJobs.slice(0, 4).map((job) => (
                    <li key={job.id}>
                      <button
                        onClick={() => setSelectedJob(job)}
                        className={`flex w-full items-center gap-2 rounded-xl border px-3 py-2.5 text-left transition active:scale-[0.98] ${barClass}`}
                      >
                        <span className="flex h-7 w-7 flex-shrink-0 items-center justify-center opacity-80">
                          <BriefcaseIcon3D className="h-full w-full" />
                        </span>
                        <span className="min-w-0">
                          <span className="block truncate text-sm font-semibold text-gray-800">{job.title}</span>
                          {job.department && (
                            <span className="block truncate text-xs text-gray-500">{job.department}</span>
                          )}
                        </span>
                      </button>
                    </li>
                  ))}
                </ul>
              </div>
            );
          })}
        </div>
      </div>

      {selectedJob && <PublicJobDetailsModal job={selectedJob} onClose={() => setSelectedJob(null)} />}
    </section>
  );
}
