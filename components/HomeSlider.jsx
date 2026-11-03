'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import HomeIcon from './HomeIcons';

// Shown when the admin has not added any image slides yet, so the home page
// always has a good-looking banner. Real slides come from Admin → Hero Slides.
const FALLBACK_SLIDES = [
  { id: 'f1', title: 'Latest Government Jobs', sub: 'Federal, provincial and local departments in one place', href: '/jobs?jobType=Government' },
  { id: 'f2', title: 'Private Sector Jobs', sub: 'Banks, companies, schools and more', href: '/jobs?jobType=Private' },
  { id: 'f3', title: 'Never Miss a Last Date', sub: 'Every job shows its deadline and how to apply', href: '/jobs' },
];

const BASE_INTERVAL_MS = 5000;

function speedMultiplier(speed) {
  const n = parseInt(String(speed || '1x'), 10);
  return n >= 1 && n <= 4 ? n : 1;
}

function SlideLink({ href, className, children }) {
  if (!href) return <div className={className}>{children}</div>;
  if (href.startsWith('/')) return <Link href={href} className={className}>{children}</Link>;
  return (
    <a href={href} target="_blank" rel="noopener noreferrer" className={className}>
      {children}
    </a>
  );
}

export default function HomeSlider({ slides = [], speed = '1x' }) {
  // Only image slides are used here; video-only slides are skipped.
  const imageSlides = slides
    .filter((s) => typeof s.image_url === 'string' && s.image_url.trim() !== '')
    .map((s) => ({ id: s.id, title: s.title, image: s.image_url, href: s.link_url || '' }));
  const items = imageSlides.length > 0 ? imageSlides : FALLBACK_SLIDES;

  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);
  const touchX = useRef(null);
  const count = items.length;

  const go = useCallback((i) => setIndex(((i % count) + count) % count), [count]);

  useEffect(() => {
    if (count < 2 || paused) return undefined;
    if (typeof window !== 'undefined' && window.matchMedia?.('(prefers-reduced-motion: reduce)').matches) {
      return undefined;
    }
    const t = setTimeout(() => setIndex((i) => (i + 1) % count), BASE_INTERVAL_MS / speedMultiplier(speed));
    return () => clearTimeout(t);
  }, [index, count, paused, speed]);

  function onTouchStart(e) {
    touchX.current = e.touches[0].clientX;
  }
  function onTouchEnd(e) {
    if (touchX.current === null) return;
    const dx = e.changedTouches[0].clientX - touchX.current;
    touchX.current = null;
    if (Math.abs(dx) > 40) go(index + (dx < 0 ? 1 : -1));
  }

  return (
    <div
      className="relative w-full overflow-hidden rounded-2xl bg-brand-900 shadow-card"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onTouchStart={onTouchStart}
      onTouchEnd={onTouchEnd}
      role="region"
      aria-roledescription="carousel"
      aria-label="Featured jobs"
    >
      <div className="relative aspect-[3/1] w-full">
        {items.map((s, i) => {
          const active = i === index;
          return (
            <div
              key={s.id}
              className={`absolute inset-0 transition-opacity duration-700 ${active ? 'opacity-100' : 'pointer-events-none opacity-0'}`}
              aria-hidden={!active}
            >
              {s.image ? (
                // Plain <img> on purpose, same as the rest of this project.
                <img
                  src={s.image}
                  alt={s.title}
                  className="h-full w-full object-cover"
                  loading={i === 0 ? 'eager' : 'lazy'}
                />
              ) : (
                <div className="relative h-full w-full bg-gradient-to-br from-brand-500 via-brand-700 to-brand-900">
                  <div className="absolute -right-10 -top-10 h-64 w-64 rounded-full bg-white/10" />
                  <div className="absolute -bottom-20 left-16 h-72 w-72 rounded-full bg-white/5" />
                </div>
              )}
              {/* Phones: the banner is too short for text, so the whole image is the link */}
              {s.href && (
                <SlideLink href={s.href} className="absolute inset-0 sm:hidden">
                  <span className="sr-only">{s.title}</span>
                </SlideLink>
              )}
              <div className="absolute inset-0 hidden bg-gradient-to-t from-black/70 via-black/10 to-transparent sm:block" />
              <div className="absolute inset-x-0 bottom-0 hidden p-6 pb-11 sm:block lg:p-8 lg:pb-12">
                <p className="max-w-xl text-lg font-bold leading-tight text-white sm:text-2xl lg:text-3xl">{s.title}</p>
                {s.sub && <p className="mt-1 max-w-lg text-xs text-white/85 sm:text-sm">{s.sub}</p>}
                {s.href && (
                  <SlideLink
                    href={s.href}
                    className="mt-3 inline-flex min-h-[40px] items-center rounded-full bg-white px-5 py-2 text-sm font-bold text-gray-900 transition hover:scale-[1.03] hover:shadow-pill"
                  >
                    Browse jobs
                  </SlideLink>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {count > 1 && (
        <>
          <button
            type="button"
            onClick={() => go(index - 1)}
            aria-label="Previous slide"
            className="absolute left-3 top-1/2 hidden h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full bg-white/90 text-gray-900 shadow-pill transition hover:scale-105 hover:bg-white sm:flex"
          >
            <HomeIcon name="chevronLeft" className="h-5 w-5" />
          </button>
          <button
            type="button"
            onClick={() => go(index + 1)}
            aria-label="Next slide"
            className="absolute right-3 top-1/2 hidden h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full bg-white/90 text-gray-900 shadow-pill transition hover:scale-105 hover:bg-white sm:flex"
          >
            <HomeIcon name="chevronRight" className="h-5 w-5" />
          </button>
          <div className="absolute inset-x-0 bottom-2 flex justify-center gap-1.5 sm:bottom-4">
            {items.map((s, i) => (
              <button
                key={s.id}
                type="button"
                onClick={() => go(i)}
                aria-label={`Go to slide ${i + 1}`}
                aria-current={i === index}
                className={`h-1.5 rounded-full transition-all ${i === index ? 'w-6 bg-white' : 'w-1.5 bg-white/60 hover:bg-white/90'}`}
              />
            ))}
          </div>
        </>
      )}
    </div>
  );
}
