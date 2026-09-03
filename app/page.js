import { supabase } from '@/lib/supabaseClient';
import Header from '@/components/Header';
import NewsTicker from '@/components/NewsTicker';
import Hero from '@/components/Hero';
import BrowseCategories from '@/components/BrowseCategories';
import StatsStrip from '@/components/StatsStrip';
import TrustStrip from '@/components/TrustStrip';
import Testimonials from '@/components/Testimonials';
import JobsList from '@/components/JobsList';
import StudentsZone from '@/components/StudentsZone';
import ScholarshipsList from '@/components/ScholarshipsList';
import SupportBanner from '@/components/SupportBanner';
import TrustBadgesStrip from '@/components/TrustBadgesStrip';
import FinalCta from '@/components/FinalCta';
import Footer from '@/components/Footer';
import { getTestimonials, getScholarships, getHomeStats } from '@/lib/data';
import { isJobOpen, isScholarshipOpen, getTodayJobGroups } from '@/lib/jobStatus';

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
  const [{ data: settings }, { data: jobs }, testimonials, scholarships, stats] = await Promise.all([
    supabase
      .from('site_settings')
      .select('*')
      .order('updated_at', { ascending: false, nullsFirst: false })
      .limit(1)
      .maybeSingle(),
    supabase.from('jobs_table').select('*').order('created_at', { ascending: false }).limit(30),
    getTestimonials(6),
    // Fetch a buffer beyond the 5 the homepage actually shows (ScholarshipsList
    // caps at 5), since some of the most-recent rows may already be past
    // their deadline and get filtered out below — same reasoning as jobs
    // fetching 30 to backfill after the isJobOpen filter.
    getScholarships(15),
    // Live counts (+ admin boost) for the homepage Stats strip — same
    // source used by the About Us page's StatsStrip.
    getHomeStats(),
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
    testimonials,
    scholarships: scholarships || [],
    stats,
  };
}

export default async function HomePage() {
  const { settings, latestJobs, testimonials, scholarships, stats } = await getHomePageData();
  // Expired scholarships shouldn't surface on the homepage teaser, same
  // rule as jobs (see isJobOpen usage above).
  const openScholarships = scholarships.filter(isScholarshipOpen);

  return (
    <>
      <NewsTicker text={settings.scrolling_news} />
      <Header siteName={settings.site_name} logoUrl={settings.logo_url} />

      <main className="flex-1 bg-white">
        <Hero
          mainHeading={settings.main_heading}
          subHeading={settings.sub_heading}
          illustrationUrl={settings.hero_illustration_url}
        />

        <BrowseCategories />

        {/* Real, live numbers (+ admin boost) — same source/component as
            the About Us page's stats strip. Placed right after the entry
            categories so a first-time visitor sees proof of an active
            platform before scrolling into the job/scholarship lists. */}
        <StatsStrip stats={stats} />

        <div className="mx-auto max-w-7xl px-4 py-10 md:px-6 md:py-14">
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-3 lg:gap-6">
            <JobsList jobs={latestJobs} />
            <StudentsZone />
            <ScholarshipsList scholarships={openScholarships} />
          </div>
        </div>

        <TrustStrip siteName={settings.site_name} />

        <SupportBanner settings={settings} />

        <TrustBadgesStrip />

        <Testimonials testimonials={testimonials} />

        <FinalCta />
      </main>

      <Footer siteName={settings.site_name} settings={settings} />
    </>
  );
}
