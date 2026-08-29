'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import SearchBar from './SearchBar';
import {
  MapPinIcon3D as MapPinIcon,
  BuildingIcon3D as BuildingIcon,
  CalendarClockIcon3D as CalendarClockIcon,
  ShieldCheckIcon3D as ShieldCheckIcon,
  BriefcaseIcon3D as BriefcaseIcon,
  ArrowRightIcon3D as ArrowRightIcon,
} from './Icons3D';

const QUICK_LINKS = [
  { label: 'Latest Jobs', href: '/jobs' },
  { label: 'Results', href: '/results' },
  { label: 'Scholarships', href: '/scholarships' },
  { label: 'Notes & Papers', href: '/students-zone' },
];

// How many of the latest jobs to cycle through, and how long each stays
// on screen before auto-advancing.
const MAX_HERO_JOBS = 6;
const SLIDE_INTERVAL_MS = 4500;

function formatDate(dateStr) {
  if (!dateStr) return null;
  return new Date(dateStr).toLocaleDateString('en-US', { day: '2-digit', month: 'short', year: 'numeric' });
}

function daysRemaining(dateStr) {
  if (!dateStr) return null;
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const due = new Date(dateStr);
  due.setHours(0, 0, 0, 0);
  return Math.round((due - today) / 86400000);
}

export default function HeroSlider({ jobs = [], mainHeading, subHeading }) {
  // Latest open jobs, newest first (already ordered that way by the
  // homepage query), capped so the dots row stays tidy.
  const heroJobs = jobs.filter((j) => j.status !== 'closed').slice(0, MAX_HERO_JOBS);

  const [active, setActive] = useState(0);

  useEffect(() => {
    if (heroJobs.length < 2) return;
    const timer = setInterval(() => {
      setActive((prev) => (prev + 1) % heroJobs.length);
    }, SLIDE_INTERVAL_MS);
    return () => clearInterval(timer);
  }, [heroJobs.length]);

  useEffect(() => {
    if (active >= heroJobs.length) setActive(0);
  }, [heroJobs.length, active]);

  // Renders one job as a spotlight card. Called once per job in the sliding
  // track below (not just the active one) so the neighbouring card is
  // already in the DOM and can slide smoothly into view instead of
  // popping/fading in.
  function renderSpotlightCard(job) {
    const isGovernment = job?.job_type === 'Government';
    const remaining = job ? daysRemaining(job.last_date) : null;
    const isUrgent = remaining !== null && remaining >= 0 && remaining <= 3;

    return (
      <div className="rounded-2xl border border-white/15 bg-white/95 p-4 text-left text-gray-900 shadow-2xl shadow-black/20 backdrop-blur-sm sm:p-5">
        {/* Header row: type icon + pill tags */}
        <div className="mb-3 flex items-center gap-2.5">
          <span
            className={`flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-xl bg-gradient-to-br text-white shadow-sm ${
              isGovernment ? 'from-brand-500 to-brand-700' : 'from-accent-500 to-accent-700'
            }`}
          >
            {isGovernment ? <ShieldCheckIcon className="h-4 w-4" /> : <BriefcaseIcon className="h-4 w-4" />}
          </span>
          <div className="flex flex-wrap items-center gap-1.5">
            <span
              className={`rounded-full px-2.5 py-0.5 text-[0.65rem] font-bold uppercase tracking-wide ${
                isGovernment ? 'bg-brand-50 text-brand-700' : 'bg-accent-50 text-accent-700'
              }`}
            >
              {job.job_type}
            </span>
            {job.sector && (
              <span className="rounded-full bg-gray-100 px-2.5 py-0.5 text-[0.65rem] font-semibold text-gray-600">
                {job.sector}
              </span>
            )}
          </div>
        </div>

        {/* Title */}
        <h3 className="mb-2 truncate text-base font-bold leading-snug text-gray-900 sm:text-lg">{job.title}</h3>

        {/* Meta */}
        {(job.city || job.department) && (
          <div className="mb-3 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-gray-500 sm:text-sm">
            {job.city && (
              <span className="flex items-center gap-1">
                <MapPinIcon className="h-3.5 w-3.5 text-brand-500" />
                {job.city}
              </span>
            )}
            {job.department && (
              <span className="flex min-w-0 items-center gap-1">
                <BuildingIcon className="h-3.5 w-3.5 flex-shrink-0 text-brand-500" />
                <span className="truncate">{job.department}</span>
              </span>
            )}
          </div>
        )}

        {/* Last date + actions */}
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          {job.last_date && (
            <div
              className={`inline-flex items-center gap-1.5 self-start rounded-lg px-2.5 py-1 text-xs font-semibold ${
                isUrgent ? 'bg-red-50 text-red-700' : 'bg-gray-50 text-gray-700'
              }`}
            >
              <CalendarClockIcon className="h-3.5 w-3.5" />
              Last Date: {formatDate(job.last_date)}
            </div>
          )}
          <div className="flex gap-2">
            <Link
              href="/jobs"
              className="rounded-lg border-2 border-gray-200 px-3 py-1.5 text-center text-xs font-semibold text-gray-700 transition hover:border-brand-300 hover:bg-brand-50 hover:text-brand-700"
            >
              View Details
            </Link>
            <a
              href={job.apply_link || '#'}
              target="_blank"
              rel="noopener noreferrer"
              className="group/btn inline-flex items-center gap-1 rounded-lg bg-gradient-to-r from-green-600 to-brand-600 px-3 py-1.5 text-center text-xs font-semibold text-white shadow-sm transition hover:shadow-md"
            >
              Apply Now
              <ArrowRightIcon className="h-3.5 w-3.5 transition-transform group-hover/btn:translate-x-0.5" />
            </a>
          </div>
        </div>
      </div>
    );
  }

  return (
    <section className="relative overflow-hidden border-b border-brand-100 bg-white">
      {/* Very soft decorative dot pattern — subtle on white instead of the
          old white-dots-on-green look */}
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.05]"
        style={{
          backgroundImage: 'radial-gradient(circle at 2px 2px, #1E8449 1px, transparent 0)',
          backgroundSize: '28px 28px',
        }}
      />
      <div className="pointer-events-none absolute -top-24 left-1/2 h-72 w-72 -translate-x-1/2 rounded-full bg-brand-100/60 blur-3xl" />

      <div className="relative mx-auto max-w-5xl px-4 pb-10 pt-8 text-center md:px-6 md:pb-14 md:pt-12">
        <span className="inline-flex items-center gap-1.5 rounded-full border border-brand-100 bg-brand-50 px-3 py-1 text-[11px] font-semibold uppercase tracking-wide text-brand-700 md:text-xs">
          ✅ Trusted by thousands of job seekers &amp; students
        </span>

        <h1 className="mt-3.5 font-serif text-2xl font-bold leading-tight tracking-tight text-aink md:text-4xl lg:text-5xl">
          {mainHeading || 'Find Your Next Government Job'}
        </h1>
        <p className="mx-auto mt-2.5 max-w-2xl text-sm text-gray-600 md:text-base">
          {subHeading || 'Latest jobs, results, notes & scholarships in one place'}
        </p>

        {/* Job spotlight — every open job is rendered into a horizontal
            track, and we simply translate the track to the active index.
            That's what turns slide changes into a smooth left/right glide
            instead of the old blink/fade swap. */}
        {heroJobs.length > 0 && (
          <div className="mx-auto mt-6 max-w-lg">
            <div className="overflow-hidden rounded-2xl">
              <div
                className="flex transition-transform duration-700 ease-in-out"
                style={{ transform: `translateX(-${active * 100}%)` }}
              >
                {heroJobs.map((j) => (
                  <div key={j.id} className="w-full flex-shrink-0">
                    {renderSpotlightCard(j)}
                  </div>
                ))}
              </div>
            </div>

            {/* Dots */}
            {heroJobs.length > 1 && (
              <div className="mt-4 flex justify-center gap-2">
                {heroJobs.map((j, i) => (
                  <button
                    key={j.id}
                    onClick={() => setActive(i)}
                    aria-label={`Go to job ${i + 1}`}
                    className={`h-2 rounded-full transition-all ${i === active ? 'w-6 bg-brand-600' : 'w-2 bg-brand-200'}`}
                  />
                ))}
              </div>
            )}
          </div>
        )}

        {/* Search sits fully inside the hero now, no clipping at the section edge */}
        <div className="relative z-10 mx-auto mt-6 max-w-2xl">
          <SearchBar />
        </div>

        {/* Quick category links */}
        <div className="relative z-10 mx-auto mt-4 flex flex-wrap items-center justify-center gap-x-5 gap-y-2">
          {QUICK_LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="text-xs font-medium text-gray-600 underline-offset-4 transition hover:text-brand-700 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 focus-visible:rounded md:text-sm"
            >
              {link.label}
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
