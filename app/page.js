import { supabase } from '@/lib/supabaseClient';
import Header from '@/components/Header';
import NewsTicker from '@/components/NewsTicker';
import HeroSlider from '@/components/HeroSlider';
import TrustStrip from '@/components/TrustStrip';
import StatsStrip from '@/components/StatsStrip';
import Testimonials from '@/components/Testimonials';
import JobsList from '@/components/JobsList';
import StudentsZone from '@/components/StudentsZone';
import Footer from '@/components/Footer';
import { getHomeStats, getTestimonials } from '@/lib/data';

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
  const [{ data: settings }, { data: jobs }, { data: notes }, stats, testimonials] = await Promise.all([
    supabase
      .from('site_settings')
      .select('*')
      .order('updated_at', { ascending: false, nullsFirst: false })
      .limit(1)
      .maybeSingle(),
    supabase.from('jobs_table').select('*').order('created_at', { ascending: false }).limit(8),
    supabase.from('students_data').select('*').order('created_at', { ascending: false }).limit(6),
    getHomeStats(),
    getTestimonials(6),
  ]);

  return {
    settings: settings || {},
    jobs: jobs || [],
    notes: notes || [],
    stats,
    testimonials,
  };
}

export default async function HomePage() {
  const { settings, jobs, notes, stats, testimonials } = await getHomePageData();

  return (
    <>
      <NewsTicker text={settings.scrolling_news} />
      <Header siteName={settings.site_name} logoUrl={settings.logo_url} />

      <main className="flex-1 bg-gray-50">
        {/* Hero auto-cycles through the latest live jobs — post a job in
            Admin → Jobs and it appears here automatically, no separate
            "slides" to manage. */}
        <HeroSlider jobs={jobs} mainHeading={settings.main_heading} subHeading={settings.sub_heading} />

        <TrustStrip />

        <StatsStrip stats={stats} />

        <div className="mx-auto max-w-7xl px-4 py-10 md:px-6 md:py-14">
          <div className="mb-6 flex items-end justify-between md:mb-8">
            <div>
              <h2 className="text-xl font-extrabold text-gray-900 md:text-2xl">Explore the Portal</h2>
              <p className="mt-1 text-sm text-gray-500">Fresh job postings and study material, updated regularly.</p>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 md:gap-8">
            <JobsList jobs={jobs} />
            <StudentsZone notes={notes} />
          </div>
        </div>

        <Testimonials testimonials={testimonials} />
      </main>

      <Footer siteName={settings.site_name} settings={settings} />
    </>
  );
}
