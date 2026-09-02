'use client';

import Link from 'next/link';
import SearchBar from './SearchBar';
import { BriefcaseIcon3D, GraduationCapIcon3D, VerifiedBadgeIcon3D } from './Icons3D';

// Admin-entered main/sub headings (site_settings.main_heading / sub_heading)
// can be English, Urdu, or a mix. Detect Arabic/Urdu script so the text
// still gets the right font/direction even inside this new hero layout.
const URDU_SCRIPT_RE = /[\u0600-\u06FF\u0750-\u077F\uFB50-\uFDFF\uFE70-\uFEFF]/;
function isUrduText(text) {
  return typeof text === 'string' && URDU_SCRIPT_RE.test(text);
}

// Splits "Find Jobs. Build Skills. Shape Your Future." into a plain first
// line and a highlighted last line, the way the reference design does
// (final sentence in the accent color). Falls back gracefully for any
// custom admin heading that doesn't have 2+ sentences.
function splitHeading(heading) {
  const fallback = 'Find Jobs. Build Skills. Shape Your Future.';
  const text = (heading || fallback).trim();
  const parts = text.split(/(?<=[.!?])\s+/).filter(Boolean);
  if (parts.length < 2) return { lead: text, highlight: '' };
  return { lead: parts.slice(0, -1).join(' '), highlight: parts[parts.length - 1] };
}

export default function Hero({ mainHeading, subHeading, illustrationUrl }) {
  const { lead, highlight } = splitHeading(mainHeading);
  const rtl = isUrduText(mainHeading);

  return (
    <section className="relative overflow-hidden bg-gradient-to-b from-brand-50/70 via-white to-white">
      <div className="mx-auto grid max-w-7xl grid-cols-1 items-center gap-10 px-4 py-10 md:px-6 md:py-16 lg:grid-cols-2 lg:gap-8">
        {/* Copy column */}
        <div className="text-center lg:text-left">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-brand-50 px-3.5 py-1.5 text-xs font-semibold text-brand-700">
            #1 Jobs &amp; Study Platform in Pakistan
          </span>

          <h1
            className="mt-4 text-3xl font-bold leading-[1.15] tracking-tight text-gray-900 md:text-4xl lg:text-[2.75rem]"
            dir={rtl ? 'rtl' : undefined}
            lang={rtl ? 'ur' : undefined}
          >
            <span className={rtl ? 'font-urdu' : 'font-serif'}>
              {lead}
              {highlight && (
                <>
                  {' '}
                  <span className="text-accent-600">{highlight}</span>
                </>
              )}
            </span>
          </h1>

          <p className="mx-auto mt-4 max-w-xl text-base text-gray-600 lg:mx-0">
            {subHeading ||
              'Discover the latest government & private jobs, scholarships, exam results, and free study resources — all in one place.'}
          </p>

          <div className="mt-6 flex flex-wrap items-center justify-center gap-3 lg:justify-start">
            <Link
              href="/jobs"
              className="inline-flex items-center gap-2 rounded-lg bg-brand-600 px-5 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-brand-700 active:scale-[0.98]"
            >
              <BriefcaseIcon3D className="h-4 w-4" />
              Explore Latest Jobs
            </Link>
            <Link
              href="/study-zone"
              className="inline-flex items-center gap-2 rounded-lg border border-brand-200 bg-white px-5 py-3 text-sm font-semibold text-brand-700 transition hover:bg-brand-50 active:scale-[0.98]"
            >
              <GraduationCapIcon3D className="h-4 w-4" />
              Explore Study Resources
            </Link>
          </div>

          <div className="mx-auto mt-6 max-w-lg lg:mx-0">
            <SearchBar />
          </div>
        </div>

        {/* Illustration column — shown on every screen size (not just
            desktop) so it also appears on mobile, same as the reference
            design. Uses object-contain inside a fixed square box so an
            admin-uploaded image is never cropped on any device — see the
            "Hero Illustration" field in Admin → Website Settings for the
            recommended image size. */}
        <div className="relative mx-auto w-full max-w-sm lg:max-w-md">
          <div className="relative aspect-square w-full">
            {illustrationUrl ? (
              <img
                src={illustrationUrl}
                alt=""
                className="h-full w-full object-contain"
              />
            ) : (
              <HeroIllustration />
            )}
          </div>

          <FloatingCard className="left-0 top-4" tone="brand" label="Find Jobs" Icon={BriefcaseIcon3D} />
          <FloatingCard className="right-0 top-0" tone="green" label="Study Resources" Icon={GraduationCapIcon3D} />
          <FloatingCard className="right-2 top-1/3" tone="accent" label="Results" bars />
          <FloatingCard className="right-8 bottom-4" tone="amber" label="Scholarships" Icon={VerifiedBadgeIcon3D} />
        </div>
      </div>
    </section>
  );
}

const TONE_CLASSES = {
  brand: 'bg-brand-600 text-white',
  green: 'bg-emerald-500 text-white',
  accent: 'bg-accent-600 text-white',
  amber: 'bg-amber-500 text-white',
};

function FloatingCard({ className = '', tone = 'brand', label, Icon, bars = false }) {
  return (
    <div
      className={`absolute z-10 flex items-center gap-2 rounded-xl bg-white px-3 py-2 shadow-lg ring-1 ring-black/5 ${className}`}
    >
      <span className={`flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-lg ${TONE_CLASSES[tone]}`}>
        {bars ? (
          <svg viewBox="0 0 16 16" className="h-3.5 w-3.5" fill="currentColor">
            <rect x="1" y="8" width="3" height="6" rx="0.5" />
            <rect x="6.5" y="4" width="3" height="10" rx="0.5" />
            <rect x="12" y="1" width="3" height="13" rx="0.5" />
          </svg>
        ) : (
          <Icon className="h-4 w-4" />
        )}
      </span>
      <span className="text-xs font-semibold text-gray-800">{label}</span>
    </div>
  );
}

// A simple, original flat-style illustration (person at a desk with a
// laptop) drawn in the site's own palette — not a reproduction of any
// third-party artwork, just built to carry the same warm, friendly tone.
function HeroIllustration() {
  return (
    <svg viewBox="0 0 400 340" className="h-full w-full drop-shadow-sm" xmlns="http://www.w3.org/2000/svg">
      <ellipse cx="200" cy="310" rx="150" ry="18" className="fill-brand-100/70" />

      {/* Desk */}
      <rect x="70" y="230" width="260" height="14" rx="4" className="fill-gray-200" />
      <rect x="90" y="244" width="12" height="60" className="fill-gray-300" />
      <rect x="298" y="244" width="12" height="60" className="fill-gray-300" />

      {/* Books */}
      <rect x="255" y="205" width="70" height="14" rx="2" className="fill-accent-600" />
      <rect x="260" y="191" width="60" height="14" rx="2" className="fill-brand-500" />
      <rect x="265" y="177" width="50" height="14" rx="2" className="fill-amber-500" />

      {/* Plant */}
      <rect x="75" y="205" width="26" height="25" rx="3" className="fill-brand-200" />
      <path d="M88 205 C 70 190, 66 165, 88 150 C 110 165, 106 190, 88 205 Z" className="fill-emerald-500" />

      {/* Laptop */}
      <rect x="150" y="200" width="100" height="34" rx="4" className="fill-gray-100 stroke-gray-300" strokeWidth="1.5" />
      <rect x="158" y="207" width="84" height="20" rx="2" className="fill-brand-600" />
      <rect x="140" y="230" width="120" height="8" rx="2" className="fill-gray-300" />

      {/* Chair */}
      <rect x="185" y="215" width="10" height="70" rx="4" className="fill-gray-300" />

      {/* Person */}
      <circle cx="200" cy="120" r="26" className="fill-amber-200" />
      <path d="M175 118 C 175 95, 225 95, 225 118 L 222 108 C 210 100, 190 100, 178 108 Z" className="fill-gray-800" />
      <path
        d="M150 232 C 150 180, 170 150, 200 150 C 230 150, 250 180, 250 232 L 150 232 Z"
        className="fill-brand-600"
      />
      <rect x="178" y="182" width="44" height="30" rx="6" className="fill-brand-700" />
      <path d="M160 210 C 165 195, 178 185, 190 184 L 190 220 L 160 224 Z" className="fill-brand-500" />
      <path d="M240 210 C 235 195, 222 185, 210 184 L 210 220 L 240 224 Z" className="fill-brand-500" />
    </svg>
  );
}
