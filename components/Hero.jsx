'use client';

import Link from 'next/link';
import SearchBar from './SearchBar';
import {
  BriefcaseIcon3D,
  GraduationCapIcon3D,
  VerifiedBadgeIcon3D,
  DocumentIcon3D,
  ShieldCheckIcon3D,
} from './Icons3D';

// Admin-entered main/sub headings (site_settings.main_heading / sub_heading)
// can be English, Urdu, or a mix. Detect Arabic/Urdu script so the text
// still gets the right font/direction even inside this new hero layout.
const URDU_SCRIPT_RE = /[\u0600-\u06FF\u0750-\u077F\uFB50-\uFDFF\uFE70-\uFEFF]/;
function isUrduText(text) {
  return typeof text === 'string' && URDU_SCRIPT_RE.test(text);
}

// Splits a heading like "Find Jobs. Build Skills. Shape Your Future." into
// a plain lead part and a highlighted last sentence, the way the reference
// design does (final sentence in the accent color). No hardcoded fallback
// text here — if the admin hasn't set a heading yet, the caller simply
// doesn't render this at all (see Hero() below).
function splitHeading(heading) {
  const text = heading.trim();
  const parts = text.split(/(?<=[.!?])\s+/).filter(Boolean);
  if (parts.length < 2) return { lead: text, highlight: '' };
  return { lead: parts.slice(0, -1).join(' '), highlight: parts[parts.length - 1] };
}

export default function Hero({ mainHeading, subHeading, illustrationUrl }) {
  const hasHeading = Boolean(mainHeading?.trim());
  const hasSubHeading = Boolean(subHeading?.trim());
  const { lead, highlight } = hasHeading ? splitHeading(mainHeading) : { lead: '', highlight: '' };
  const rtl = isUrduText(mainHeading);

  return (
    <section className="relative overflow-hidden bg-gradient-to-b from-brand-50/60 via-white to-white">
      {/* Very subtle dot texture for depth — not a decorative photo, just
          a low-opacity pattern so the hero doesn't read as a flat block.
          Kept faint on purpose (see brief: avoid excessive gradients). */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 opacity-[0.04]"
        style={{
          backgroundImage: 'radial-gradient(circle at 1.5px 1.5px, currentColor 1.5px, transparent 0)',
          backgroundSize: '26px 26px',
          color: 'rgb(var(--brand-600))',
        }}
      />

      <div className="relative mx-auto grid max-w-7xl grid-cols-1 items-center gap-10 px-4 py-12 md:px-6 md:py-16 lg:grid-cols-2 lg:gap-12">
        {/* Copy column */}
        <div className="text-center lg:text-left">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-brand-50 px-3.5 py-1.5 text-xs font-semibold text-brand-700 ring-1 ring-inset ring-brand-100">
            Your One-Stop Platform for Jobs &amp; Study
          </span>

          {/* Main heading (site_settings.main_heading) — nothing shown
              here until the admin actually sets it in Admin → Website
              Settings, so this never displays placeholder marketing copy. */}
          {hasHeading && (
            <h1
              className="mt-5 text-4xl font-bold leading-[1.1] tracking-tight text-gray-900 sm:text-5xl lg:text-[3.25rem]"
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
          )}

          {/* Sub-heading (site_settings.sub_heading) — same rule: only
              rendered once the admin has actually entered one. */}
          {hasSubHeading && (
            <p className="mx-auto mt-4 max-w-xl text-base leading-relaxed text-gray-600 lg:mx-0 lg:text-lg">
              {subHeading}
            </p>
          )}

          <div className="mt-7 flex flex-wrap items-center justify-center gap-3 lg:justify-start">
            <Link
              href="/jobs"
              className="inline-flex items-center gap-2 rounded-lg bg-brand-600 px-5 py-3.5 text-sm font-semibold text-white shadow-sm shadow-brand-600/20 transition hover:bg-brand-700 hover:shadow-md active:scale-[0.98]"
            >
              <BriefcaseIcon3D className="h-4 w-4" />
              Explore Latest Jobs
            </Link>
            <Link
              href="/study-zone"
              className="inline-flex items-center gap-2 rounded-lg border border-brand-200 bg-white px-5 py-3.5 text-sm font-semibold text-brand-700 transition hover:bg-brand-50 active:scale-[0.98]"
            >
              <GraduationCapIcon3D className="h-4 w-4" />
              Explore Study Resources
            </Link>
          </div>

          <div className="mx-auto mt-7 max-w-lg lg:mx-0">
            <SearchBar />
          </div>
        </div>

        {/* Visual column — an admin-uploaded illustration when one exists,
            otherwise a built-in abstract composition (icons + shapes, no
            stock photo) so the hero always has a balanced second column
            instead of collapsing to plain centered text. */}
        {illustrationUrl ? (
          <div className="relative mx-auto w-full max-w-sm lg:max-w-md">
            <div className="relative aspect-square w-full">
              <img src={illustrationUrl} alt="" className="h-full w-full object-contain" />
            </div>

            <FloatingCard className="left-0 top-4" tone="brand" label="Find Jobs" Icon={BriefcaseIcon3D} />
            <FloatingCard className="right-0 top-0" tone="green" label="Study Resources" Icon={GraduationCapIcon3D} />
            <FloatingCard className="right-2 top-1/3" tone="accent" label="Results" bars />
            <FloatingCard className="right-8 bottom-4" tone="amber" label="Scholarships" Icon={VerifiedBadgeIcon3D} />
          </div>
        ) : (
          <DefaultHeroVisual />
        )}
      </div>
    </section>
  );
}

// Built-in fallback visual for when the admin hasn't uploaded a hero
// illustration yet. Purely abstract (soft gradient blobs + the site's own
// icon set) — no stock photography or depiction of real people, so it
// never risks looking like a fabricated "testimonial" photo.
function DefaultHeroVisual() {
  return (
    <div className="relative mx-auto hidden aspect-square w-full max-w-md items-center justify-center lg:flex">
      <div className="absolute inset-0 rounded-[2.5rem] bg-gradient-to-br from-brand-50 via-white to-accent-50" />
      <div className="absolute inset-6 rounded-[2rem] border border-brand-100/70" />

      {/* Center badge */}
      <div className="relative z-10 flex h-28 w-28 items-center justify-center rounded-full bg-white shadow-xl shadow-brand-900/10 ring-1 ring-black/5">
        <ShieldCheckIcon3D className="h-12 w-12" />
      </div>

      <FloatingCard className="left-4 top-8" tone="brand" label="Find Jobs" Icon={BriefcaseIcon3D} />
      <FloatingCard className="right-2 top-4" tone="green" label="Study Resources" Icon={GraduationCapIcon3D} />
      <FloatingCard className="left-6 bottom-10" tone="accent" label="Notes & Papers" Icon={DocumentIcon3D} />
      <FloatingCard className="right-6 bottom-4" tone="amber" label="Scholarships" Icon={VerifiedBadgeIcon3D} />
    </div>
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

