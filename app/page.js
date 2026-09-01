import { supabase } from '@/lib/supabaseClient';
import Header from '@/components/Header';
import NewsTicker from '@/components/NewsTicker';
import HeroSlider from '@/components/HeroSlider';
import TodayJobsStrip from '@/components/TodayJobsStrip';
import BrowseCategories from '@/components/BrowseCategories';
import TrustStrip from '@/components/TrustStrip';
import StatsStrip from '@/components/StatsStrip';
import Testimonials from '@/components/Testimonials';
import JobsList from '@/components/JobsList';
import StudentsZone from '@/components/StudentsZone';
import ScholarshipsTeaser from '@/components/ScholarshipsTeaser';
import WhatsAppServiceCard from '@/components/WhatsAppServiceCard';
import Footer from '@/components/Footer';
import { getHomeStats, getTestimonials, getScholarships } from '@/lib/data';
import { isJobOpen, getTodayJobGroups } from '@/lib/jobStatus';

// Re-fetch fresh data on every request so admin edits show up immediately.
// Swap to `export const revalidate = 60` if you'd rather cache for 60s.
export const dynamic = 'force-dynamic';

async function getHomePageData() {
  // site_settings is ordered by updated_at (most recent first), matching
  // lib/data.js's getSiteSettings(). Without this order, if the table ever
  // has more than one row (e.g. the seed row plus the row the admin actually
  // edits), .limit(1) can arbitrarily return the old/seed row here — showing
  // a stale logo/site name on the home page even though Admin Dashboard →
  // Site Settings was saved correctly.
  const [{ data: settings }, { data: jobs }, stats, testimonials, scholarships] = await Promise.all([
    supabase
      .from('site_settings')
      .select('*')
      .order('updated_at', { ascending: false, nullsFirst: false })
      .limit(1)
      .maybeSingle(),
    supabase.from('jobs_table').select('*').order('created_at', { ascending: false }).limit(30),
    getHomeStats(),
    getTestimonials(6),
    getScholarships(3),
  ]);

  const allOpenJobs = (jobs || []).filter(isJobOpen);
  const openJobs = allOpenJobs.slice(0, 8);

  // Today's Important Jobs already surfaces closing-today / closing-
  // tomorrow / new-today jobs above the "Latest Jobs" list. Without
  // excluding them here, a job like "Traffic Constable" that's closing
  // today would show up twice on the homepage — once in that strip and
  // again in "Latest Jobs" right below it.
  const { closingToday, closingTomorrow, newToday } = getTodayJobGroups(allOpenJobs);
  const todayHighlightIds = new Set(
    [...closingToday, ...closingTomorrow, ...newToday].map((j) => j.id)
  );
  const remainingJobs = allOpenJobs.filter((j) => !todayHighlightIds.has(j.id));
  // Edge case: if every open job happens to be closing today/tomorrow or
  // was just posted, don't leave "Latest Jobs" empty (which would wrongly
  // read as "no jobs posted yet") — fall back to the full open list.
  const latestJobs = (remainingJobs.length > 0 ? remainingJobs : allOpenJobs).slice(0, 8);

  return {
    settings: settings || {},
    jobs: openJobs,
    latestJobs,
    allOpenJobs,
    stats,
    testimonials,
    scholarships: scholarships || [],
  };
}

export default async function HomePage() {
  const { settings, jobs, latestJobs, allOpenJobs, stats, testimonials, scholarships } = await getHomePageData();

  return (
    <>
      <NewsTicker text={settings.scrolling_news} />
      <Header siteName={settings.site_name} logoUrl={settings.logo_url} />

      <main className="flex-1 bg-gray-50">
        {/* Hero auto-cycles through the latest live jobs — post a job in
            Admin → Jobs and it appears here automatically, no separate
            "slides" to manage. */}
        <HeroSlider
          jobs={jobs}
          mainHeading={settings.main_heading}
          subHeading={settings.sub_heading}
          slideSpeed={settings.hero_slide_speed}
        />

        {/* Gives visitors a reason to check back daily: jobs closing today/
            tomorrow (act now) and jobs posted today (what's fresh). Hidden
            entirely when none of the three buckets have anything. */}
        <TodayJobsStrip jobs={allOpenJobs} />

        <BrowseCategories />

        <div className="mx-auto max-w-7xl px-4 py-10 md:px-6 md:py-14">
          <div className="mb-6 flex items-end justify-between md:mb-8">
            <div>
              <h2 className="text-xl font-extrabold text-gray-900 md:text-2xl">Latest Jobs &amp; Study Zone</h2>
              <p className="mt-1 text-sm text-gray-500">Fresh job postings and study material, updated regularly.</p>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 md:gap-8">
            <JobsList jobs={latestJobs} />
            <StudentsZone />
          </div>
        </div>

        <ScholarshipsTeaser scholarships={scholarships} />

        <StatsStrip stats={stats} />

        <TrustStrip />

        {/* Paid application-support service, as its own full-width section
            (was previously tucked into a side column) — title, price,
            features and refund-policy link, same content shown on the
            /jobs page and job details modal. */}
        {settings?.wa_service_enabled && (
          <section className="border-b border-gray-100 bg-white">
            <div className="mx-auto max-w-4xl px-4 py-10 md:px-6 md:py-14">
              <h2 className="mb-6 text-center text-xl font-extrabold text-gray-900 md:mb-8 md:text-2xl">
                Need Help Applying?
              </h2>
              <WhatsAppServiceCard settings={settings} />
            </div>
          </section>
        )}

        <Testimonials testimonials={testimonials} />
      </main>

      <Footer siteName={settings.site_name} settings={settings} />
    </>
  );
}
