import Link from 'next/link';
import JobSearchForm from './JobSearchForm';
import HomeSlider from './HomeSlider';
import HomeIcon from './HomeIcons';

/** Corporate-blue home hero: headline + search on the left, image slider on
 * the right (stacked on phones). */
export default function HomeHero({ openJobsCount = 0, slides = [], slideSpeed = '1x' }) {
  return (
    <section className="relative overflow-hidden bg-gradient-to-br from-brand-900 via-brand-800 to-brand-700 text-white">
      <div className="pointer-events-none absolute -right-24 -top-24 h-72 w-72 rounded-full bg-white/5" />
      <div className="pointer-events-none absolute -bottom-32 left-1/3 h-80 w-80 rounded-full bg-white/5" />

      <div className="relative mx-auto grid max-w-7xl items-center gap-8 px-4 py-10 md:px-6 md:py-14 lg:grid-cols-2 lg:gap-12 lg:py-16">
        <div className="text-center lg:text-left">
          <span className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-3 py-1 text-xs font-semibold text-white/90">
            <HomeIcon name="check" className="h-4 w-4" />
            Free job information for Pakistan
          </span>
          <h1 className="mt-4 font-serif text-3xl font-bold leading-tight tracking-tight sm:text-4xl lg:text-5xl">
            Find Your Next Job in Pakistan
          </h1>
          <p className="mx-auto mt-4 max-w-xl text-base leading-relaxed text-white/80 lg:mx-0">
            Government and private job ads in one place. Check the last date, see what is required and apply the right way.
          </p>

          <div className="mt-6 [&_form]:mx-auto lg:[&_form]:mx-0">
            <JobSearchForm />
          </div>

          <div className="mt-5 flex flex-wrap items-center justify-center gap-2 text-sm lg:justify-start">
            <Link
              href="/jobs?jobType=Government"
              className="rounded-full border border-white/25 bg-white/10 px-4 py-1.5 font-semibold text-white transition hover:bg-white/20"
            >
              Government jobs
            </Link>
            <Link
              href="/jobs?jobType=Private"
              className="rounded-full border border-white/25 bg-white/10 px-4 py-1.5 font-semibold text-white transition hover:bg-white/20"
            >
              Private jobs
            </Link>
            {openJobsCount > 0 && (
              <span className="px-2 text-white/75">
                <strong className="text-white">{openJobsCount}</strong> {openJobsCount === 1 ? 'job' : 'jobs'} open now
              </span>
            )}
          </div>
        </div>

        <HomeSlider slides={slides} speed={slideSpeed} />
      </div>
    </section>
  );
}
