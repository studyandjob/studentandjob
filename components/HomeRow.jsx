'use client';

import { useRef, useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import HomeIcon from './HomeIcons';

/**
 * Airbnb-style carousel row: "Title ›" heading, round prev/next buttons and a
 * horizontally scrolling list of cards. Pass the cards as <li> children.
 */
export default function HomeRow({ title, subtitle, href, children }) {
  const ref = useRef(null);
  const [canPrev, setCanPrev] = useState(false);
  const [canNext, setCanNext] = useState(true);

  const update = useCallback(() => {
    const el = ref.current;
    if (!el) return;
    setCanPrev(el.scrollLeft > 4);
    setCanNext(el.scrollLeft + el.clientWidth < el.scrollWidth - 4);
  }, []);

  useEffect(() => {
    update();
    const el = ref.current;
    if (!el) return undefined;
    el.addEventListener('scroll', update, { passive: true });
    window.addEventListener('resize', update);
    return () => {
      el.removeEventListener('scroll', update);
      window.removeEventListener('resize', update);
    };
  }, [update]);

  function scrollBy(dir) {
    const el = ref.current;
    if (el) el.scrollBy({ left: dir * el.clientWidth * 0.85, behavior: 'smooth' });
  }

  const btn =
    'hidden h-8 w-8 items-center justify-center rounded-full border border-line-strong bg-surface text-gray-800 transition hover:scale-105 hover:shadow-card-hover disabled:cursor-default disabled:opacity-30 disabled:hover:scale-100 disabled:hover:shadow-none md:flex';

  return (
    <section>
      <div className="mb-3 flex items-end justify-between gap-3 md:mb-4">
        <div className="min-w-0">
          <h2 className="text-xl font-semibold leading-tight text-gray-900 md:text-[22px]">
            {href ? (
              <Link href={href} className="inline-flex items-center gap-1 hover:underline">
                {title}
                <HomeIcon name="chevronRight" className="h-5 w-5" />
              </Link>
            ) : (
              title
            )}
          </h2>
          {subtitle && <p className="mt-0.5 text-sm text-gray-500">{subtitle}</p>}
        </div>
        <div className="flex items-center gap-2">
          <button type="button" aria-label="Previous" disabled={!canPrev} onClick={() => scrollBy(-1)} className={btn}>
            <HomeIcon name="chevronLeft" className="h-4 w-4" />
          </button>
          <button type="button" aria-label="Next" disabled={!canNext} onClick={() => scrollBy(1)} className={btn}>
            <HomeIcon name="chevronRight" className="h-4 w-4" />
          </button>
        </div>
      </div>
      <ul ref={ref} className="no-scrollbar -mx-4 flex snap-x gap-4 overflow-x-auto px-4 pb-2 md:-mx-0 md:gap-5 md:px-0">
        {children}
      </ul>
    </section>
  );
}
