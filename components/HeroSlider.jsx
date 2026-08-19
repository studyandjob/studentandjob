'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';

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
    <section className="relative overflow-hidden bg-gradient-to-br from-brand-700 to-brand-500 text-white">
      {/* Slides as background layer, if any exist */}
      {slides.length > 0 && (
        <div className="absolute inset-0">
          {slides.map((slide, i) => (
            <div
              key={slide.id}
              className={`absolute inset-0 transition-opacity duration-700 ${
                i === active ? 'opacity-40' : 'opacity-0'
              }`}
            >
              <Image src={slide.image_url} alt={slide.title} fill className="object-cover" priority={i === 0} />
            </div>
          ))}
          <div className="absolute inset-0 bg-brand-700/60" />
        </div>
      )}

      <div className="relative mx-auto max-w-7xl px-4 py-14 text-center md:px-6 md:py-24">
        <h1 className="text-2xl font-extrabold leading-tight md:text-5xl">
          {mainHeading || 'Find Your Next Government Job'}
        </h1>
        <p className="mx-auto mt-4 max-w-2xl text-sm text-brand-50 md:text-lg">
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
      </div>
    </section>
  );
}
