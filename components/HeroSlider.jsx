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

export default function HeroSlider({ slides = [], mainHeading, subHeading }) {
  const [active, setActive] = useState(0);

  useEffect(() => {
    if (slides.length < 2) return;
    const timer = setInterval(() => {
      setActive((prev) => (prev + 1) % slides.length);
    }, 5000);
    return () => clearInterval(timer);
  }, [slides.length]);

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

      {/* Slides as background layer, if any exist */}
      {slides.length > 0 && (
        <div className="absolute inset-0">
          {slides.map((slide, i) => (
            <div
              key={slide.id}
              className={`absolute inset-0 transition-opacity duration-700 ${
                i === active ? 'opacity-30' : 'opacity-0'
              }`}
            >
              {/* Plain <img> on purpose (not next/image) — same reasoning as
                  Contact Us photos and the header logo: an admin-entered
                  slide image URL is already final, and next/image's
                  optimizer has a track record of failing silently in
                  production for external URLs like this. */}
              <img src={slide.image_url} alt={slide.title} className="h-full w-full object-cover" />
            </div>
          ))}
          <div className="absolute inset-0 bg-gradient-to-b from-brand-700/70 via-brand-700/50 to-brand-600/80" />
        </div>
      )}

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

        {slides.length > 0 && (
          <>
            <div className="mx-auto mt-8 max-w-xl rounded-xl bg-white/10 p-4 backdrop-blur-sm">
              <p className="text-sm font-semibold md:text-base">{slides[active]?.title}</p>
              {slides[active]?.link_url && (
                <Link
                  href={slides[active].link_url}
                  className="mt-2 inline-block rounded-md bg-white px-4 py-1.5 text-xs font-bold text-brand-700 hover:bg-brand-50 md:text-sm"
                >
                  Learn more →
                </Link>
              )}
            </div>

            {/* Dots */}
            <div className="mt-5 flex justify-center gap-2">
              {slides.map((s, i) => (
                <button
                  key={s.id}
                  onClick={() => setActive(i)}
                  aria-label={`Go to slide ${i + 1}`}
                  className={`h-2 w-2 rounded-full transition ${
                    i === active ? 'w-6 bg-white' : 'bg-white/40'
                  }`}
                />
              ))}
            </div>
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
