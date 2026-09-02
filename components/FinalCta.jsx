import Link from 'next/link';
import { BriefcaseIcon3D, GraduationCapIcon3D } from './Icons3D';

/**
 * Simple, calm closing section right before the footer — a last nudge
 * toward the two primary actions (Jobs / Study Zone) after the visitor
 * has scrolled through everything else. No stats, no testimonials, just
 * a clear next step.
 */
export default function FinalCta() {
  return (
    <section className="border-t border-gray-100 bg-brand-50/50">
      <div className="mx-auto max-w-4xl px-4 py-12 text-center md:px-6 md:py-16">
        <h2 className="text-2xl font-bold tracking-tight text-gray-900 md:text-3xl">
          Ready to Find Your Next Opportunity?
        </h2>
        <p className="mx-auto mt-3 max-w-xl text-sm text-gray-600 md:text-base">
          Explore jobs, scholarships and study resources — all in one place.
        </p>
        <div className="mt-7 flex flex-wrap items-center justify-center gap-3">
          <Link
            href="/jobs"
            className="inline-flex items-center gap-2 rounded-lg bg-brand-600 px-6 py-3.5 text-sm font-semibold text-white shadow-sm shadow-brand-600/20 transition hover:bg-brand-700 hover:shadow-md active:scale-[0.98]"
          >
            <BriefcaseIcon3D className="h-4 w-4" />
            Explore Jobs
          </Link>
          <Link
            href="/study-zone"
            className="inline-flex items-center gap-2 rounded-lg border border-brand-200 bg-white px-6 py-3.5 text-sm font-semibold text-brand-700 transition hover:bg-brand-50 active:scale-[0.98]"
          >
            <GraduationCapIcon3D className="h-4 w-4" />
            Explore Study Zone
          </Link>
        </div>
      </div>
    </section>
  );
}
