import Link from 'next/link';
import JobSearchForm from './JobSearchForm';

/** Jobs-only home hero: one headline, one search box, two shortcuts. */
export default function HomeHero({ openJobsCount = 0 }) {
  return (
    <section className="border-b border-brand-100 bg-gradient-to-b from-brand-50 to-white">
      <div className="mx-auto flex max-w-3xl flex-col items-center gap-5 px-4 py-12 text-center md:py-16">
        <h1 className="font-serif text-3xl font-bold leading-tight tracking-tight text-gray-900 md:text-4xl">
          Latest Jobs in Pakistan
        </h1>
        <p className="max-w-xl text-base leading-relaxed text-gray-600">
          Government and private job ads in one place. Check the last date, see what is required and apply.
        </p>
        <JobSearchForm />
        <div className="flex flex-wrap items-center justify-center gap-2 text-sm">
          <Link
            href="/jobs?jobType=Government"
            className="rounded-full border border-brand-200 bg-white px-4 py-1.5 font-semibold text-brand-700 transition hover:bg-brand-50"
          >
            Government jobs
          </Link>
          <Link
            href="/jobs?jobType=Private"
            className="rounded-full border border-brand-200 bg-white px-4 py-1.5 font-semibold text-brand-700 transition hover:bg-brand-50"
          >
            Private jobs
          </Link>
          {openJobsCount > 0 && <span className="px-2 text-gray-500">{openJobsCount} jobs open now</span>}
        </div>
      </div>
    </section>
  );
}
