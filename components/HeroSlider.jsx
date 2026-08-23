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

const SLIDE_INTERVAL_MS = 5000;

export default function HeroSlider({ slides = [], mainHeading, subHeading }) {
  const [active, setActive] = useState(0);

  useEffect(() => {
    if (slides.length < 2) return;
    const timer = setInterval(() => {
      setActive((prev) => (prev + 1) % slides.length);
    }, SLIDE_INTERVAL_MS);
    return () => clearInterval(timer);
  }, [slides.length]);

  useEffect(() => {
    if (active >= slides.length) setActive(0);
  }, [slides.length, active]);

  function goTo(i) {
    setActive(i);
  }
  function prev() {
    setActive((p) => (p - 1 + slides.length) % slides.length);
  }
  function next() {
    setActive((p) => (p + 1) % slides.length);
  }

  const currentSlide = slides[active];

  return (
    <section className="relative overflow-hidden bg-gradient-to-br from-brand-700 via-brand-600 to-brand-500 text-white">
      {/* Decorative background pattern */}
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.07]"
        style={{
          backgroundImage: 'radial-gradient(circle at 2px 2px, white 1px, transparent 0)',
          backgroundSize: '28px 28px',
        }}
      />

      <div className="relative mx-auto max-w-5xl px-4 pb-16 pt-14 text-center md:px-6 md:pb-24 md:pt-20">
        <span className="inline-flex items-center gap-1.5 rounded-full bg-white/15 px-3 py-1 text-[11px] font-semibold uppercase tracking-wide text-brand-50 backdrop-blur-sm md:text-xs">
          ✅ Trusted by thousands of job seekers &amp; students
        </span>

        <h1 className="mt-5 text-3xl font-extrabold leading-tight tracking-tight md:text-5xl lg:text-6xl">
          {mainHeading || 'Find Your Next Government Job'}
        </h1>
        <p className="mx-auto mt-4 max-w-2xl text-sm text-brand-50/90 md:text-lg">
          {subHeading || 'Latest jobs, results, notes & scholarships in one place'}
        </p>

        {/* Admin-managed slide carousel. Any image — tall poster or wide
            banner, any aspect ratio — is shown in FULL (object-contain,
            never cropped) inside a responsive frame that resizes cleanly
            between mobile and desktop. A blurred, scaled copy of the same
            image fills the frame behind it so there's never awkward empty
            space, regardless of the uploaded image's shape. */}
        {slides.length > 0 && currentSlide && (
          <div className="mx-auto mt-8 max-w-2xl">
            <div className="group relative overflow-hidden rounded-2xl bg-black/10 shadow-xl ring-1 ring-white/10">
              {/* Fixed, responsive frame height — short on mobile, taller on
                  desktop — so the slider never pushes the fold down too far
                  on small screens while still giving large images room. */}
              <div className="relative h-52 w-full sm:h-72 md:h-80">
                {slides.map((slide, i) => (
                  <div
                    key={slide.id}
                    className={`absolute inset-0 transition-opacity duration-700 ${
                      i === active ? 'opacity-100' : 'pointer-events-none opacity-0'
                    }`}
                  >
                    {/* Blurred backdrop fills the frame regardless of the
                        real image's aspect ratio. */}
                    <img
                      src={slide.image_url}
                      alt=""
                      aria-hidden="true"
                      className="absolute inset-0 h-full w-full scale-110 object-cover opacity-50 blur-2xl"
                    />
                    {/* Full, un-cropped image on top — this is what
                        "fits properly" on any device. */}
                    <img
                      src={slide.image_url}
                      alt={slide.title || 'Slide'}
                      className="relative h-full w-full object-contain p-2 drop-shadow-lg sm:p-3"
                    />
                  </div>
                ))}
              </div>

              {/* Caption / CTA bar */}
              {(currentSlide.title || currentSlide.link_url) && (
                <div className="flex flex-col items-center gap-2 bg-black/25 px-4 py-3 backdrop-blur-sm sm:flex-row sm:justify-between sm:px-5">
                  {currentSlide.title && (
                    <p className="text-center text-sm font-semibold sm:text-left md:text-base">{currentSlide.title}</p>
                  )}
                  {currentSlide.link_url && (
                    <Link
                      href={currentSlide.link_url}
                      className="flex-shrink-0 rounded-md bg-white px-4 py-1.5 text-xs font-bold text-brand-700 hover:bg-brand-50 md:text-sm"
                    >
                      Learn more →
                    </Link>
                  )}
                </div>
              )}

              {/* Prev / next arrows — desktop hover, always visible on touch */}
              {slides.length > 1 && (
                <>
                  <button
                    onClick={prev}
                    aria-label="Previous slide"
                    className="absolute left-2 top-1/2 -translate-y-1/2 rounded-full bg-black/30 p-1.5 text-white opacity-80 backdrop-blur-sm transition hover:bg-black/50 sm:opacity-0 sm:group-hover:opacity-80"
                  >
                    <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
                    </svg>
                  </button>
                  <button
                    onClick={next}
                    aria-label="Next slide"
                    className="absolute right-2 top-1/2 -translate-y-1/2 rounded-full bg-black/30 p-1.5 text-white opacity-80 backdrop-blur-sm transition hover:bg-black/50 sm:opacity-0 sm:group-hover:opacity-80"
                  >
                    <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                    </svg>
                  </button>
                </>
              )}
            </div>

            {/* Dots */}
            {slides.length > 1 && (
              <div className="mt-4 flex justify-center gap-2">
                {slides.map((s, i) => (
                  <button
                    key={s.id}
                    onClick={() => goTo(i)}
                    aria-label={`Go to slide ${i + 1}`}
                    className={`h-2 rounded-full transition-all ${i === active ? 'w-6 bg-white' : 'w-2 bg-white/40'}`}
                  />
                ))}
              </div>
            )}
          </div>
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
