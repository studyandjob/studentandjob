'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import SearchBar from './SearchBar';

const QUICK_LINKS = [
  { label: 'Latest Jobs', href: '/jobs' },
  { label: 'Results', href: '/results' },
  { label: 'Scholarships', href: '/scholarships' },
  { label: 'Notes & Papers', href: '/students-zone' },
];

// How many of the latest jobs to cycle through in the hero banner, and how
// long each one stays on screen before auto-advancing.
const MAX_HERO_JOBS = 6;
const SLIDE_INTERVAL_MS = 4500;

function formatDate(dateStr) {
  if (!dateStr) return null;
  return new Date(dateStr).toLocaleDateString('en-US', { day: '2-digit', month: 'short', year: 'numeric' });
}

export default function HeroSlider({ jobs = [], mainHeading, subHeading }) {
  // Only open (non-closed) jobs, newest first, capped so the dots row
  // doesn't get unwieldy. `jobs` is already ordered by created_at desc
  // from the homepage query, so this preserves "latest first".
  const heroJobs = jobs.filter((j) => j.status !== 'closed').slice(0, MAX_HERO_JOBS);

  const [active, setActive] = useState(0);

  useEffect(() => {
    if (heroJobs.length < 2) return;
    const timer = setInterval(() => {
      setActive((prev) => (prev + 1) % heroJobs.length);
    }, SLIDE_INTERVAL_MS);
    return () => clearInterval(timer);
  }, [heroJobs.length]);

  // If the job list shrinks (e.g. after a refetch) make sure `active`
  // never points past the end of the array.
  useEffect(() => {
    if (active >= heroJobs.length) setActive(0);
  }, [heroJobs.length, active]);

  const currentJob = heroJobs[active];

  return (
    <section className="relative overflow-hidden bg-gradient-to-br from-brand-700 via-brand-600 to-brand-500 text-white">
      {/* Decorative background pattern */}
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.07]"
        style={{
          backgroundImage:
            'radial-gradient(circle at 2px 2px, white 1px, transparent 0)',
          backgroundSize: '28px 28px',
        }}
      />

      <div className="relative mx-auto max-w-5xl px-4 pb-20 pt-14 text-center md:px-6 md:pb-28 md:pt-20">
        <span className="inline-flex items-center gap-1.5 rounded-full bg-white/15 px-3 py-1 text-[11px] font-semibold uppercase tracking-wide text-brand-50 backdrop-blur-sm md:text-xs">
          ✅ Trusted by thousands of job seekers &amp; students
        </span>

        <h1 className="mt-5 text-3xl font-extrabold leading-tight tracking-tight md:text-5xl lg:text-6xl">
          {mainHeading || 'Find Your Next Government Job'}
        </h1>
        <p className="mx-auto mt-4 max-w-2xl text-sm text-brand-50/90 md:text-lg">
          {subHeading || 'Latest jobs, results, notes & scholarships in one place'}
        </p>

        {/* Auto-rotating job spotlight — pulls straight from live job
            postings, so it always reflects whatever's currently posted
            without anyone having to manage a separate "slides" list. */}
        {currentJob && (
          <>
            <div className="mx-auto mt-8 max-w-xl rounded-xl bg-white/10 p-4 backdrop-blur-sm transition-all duration-500">
              <p className="text-sm font-semibold md:text-base">{currentJob.title}</p>
              {currentJob.last_date && (
                <p className="mt-1 text-xs text-brand-50/80 md:text-sm">
                  Last Date {formatDate(currentJob.last_date)}
                </p>
              )}
              <Link
                href="/jobs"
                className="mt-2 inline-block rounded-md bg-white px-4 py-1.5 text-xs font-bold text-brand-700 hover:bg-brand-50 md:text-sm"
              >
                Learn more →
              </Link>
            </div>

            {/* Dots */}
            {heroJobs.length > 1 && (
              <div className="mt-5 flex justify-center gap-2">
                {heroJobs.map((job, i) => (
                  <button
                    key={job.id}
                    onClick={() => setActive(i)}
                    aria-label={`Go to job ${i + 1}`}
                    className={`h-2 w-2 rounded-full transition-all ${
                      i === active ? 'w-6 bg-white' : 'bg-white/40'
                    }`}
                  />
                ))}
              </div>
            )}
          </>
        )}

        {/* Search sits fully inside the hero now, no clipping at the section edge */}
        <div className="relative z-10 mx-auto mt-9 max-w-2xl">
          <SearchBar />
        </div>

        {/* Quick category links */}
        <div className="relative z-10 mx-auto mt-5 flex flex-wrap items-center justify-center gap-x-5 gap-y-2">
          {QUICK_LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="text-xs font-medium text-brand-50/80 underline-offset-4 transition hover:text-white hover:underline md:text-sm"
            >
              {link.label}
            </Link>
          ))}
        </div>
      </div>

      {/* Soft curve transition into the next section */}
      <div className="absolute inset-x-0 bottom-0 h-10 bg-gray-50" style={{ clipPath: 'ellipse(70% 100% at 50% 100%)' }} />
    </section>
  );
}
