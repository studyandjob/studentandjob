'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import Link from 'next/link';

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
      className="relative w-full overflow-hidden rounded-2xl bg-brand-900 shadow-2xl shadow-black/30 ring-1 ring-white/15"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onTouchStart={onTouchStart}
      onTouchEnd={onTouchEnd}
      role="region"
      aria-roledescription="carousel"
      aria-label="Featured jobs"
    >
      <div className="relative aspect-[16/10] w-full">
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
                  <div className="absolute -right-10 -top-10 h-48 w-48 rounded-full bg-white/10" />
                  <div className="absolute -bottom-16 left-10 h-56 w-56 rounded-full bg-white/5" />
                </div>
              )}
              <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/20 to-transparent" />
              <div className="absolute inset-x-0 bottom-0 p-4 sm:p-6">
                <p className="text-lg font-bold leading-snug text-white sm:text-2xl">{s.title}</p>
                {s.sub && <p className="mt-1 text-xs text-white/80 sm:text-sm">{s.sub}</p>}
                {s.href && (
                  <SlideLink
                    href={s.href}
                    className="mt-3 inline-flex min-h-[40px] items-center rounded-lg bg-white px-4 py-2 text-xs font-bold text-brand-800 transition hover:bg-brand-50 sm:text-sm"
                  >
                    Browse jobs →
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
            className="absolute left-2 top-1/2 hidden h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full bg-black/35 text-white backdrop-blur transition hover:bg-black/55 sm:flex"
          >
            ‹
          </button>
          <button
            type="button"
            onClick={() => go(index + 1)}
            aria-label="Next slide"
            className="absolute right-2 top-1/2 hidden h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full bg-black/35 text-white backdrop-blur transition hover:bg-black/55 sm:flex"
          >
            ›
          </button>
          <div className="absolute right-3 top-3 flex gap-1.5 sm:right-4 sm:top-4">
            {items.map((s, i) => (
              <button
                key={s.id}
                type="button"
                onClick={() => go(i)}
                aria-label={`Go to slide ${i + 1}`}
                aria-current={i === index}
                className={`h-2 rounded-full transition-all ${i === index ? 'w-6 bg-white' : 'w-2 bg-white/50 hover:bg-white/80'}`}
              />
            ))}
          </div>
        </>
      )}
    </div>
  );
}
