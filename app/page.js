import { supabase } from '@/lib/supabaseClient';
import Header from '@/components/Header';
import NewsTicker from '@/components/NewsTicker';
import HeroSlider from '@/components/HeroSlider';
import TrustStrip from '@/components/TrustStrip';
import JobsList from '@/components/JobsList';
import StudentsZone from '@/components/StudentsZone';
import Footer from '@/components/Footer';

// Re-fetch fresh data on every request so admin edits show up immediately.
// Swap to `export const revalidate = 60` if you'd rather cache for 60s.
export const dynamic = 'force-dynamic';

async function getHomePageData() {
  const [{ data: settings }, { data: slides }, { data: jobs }, { data: notes }] = await Promise.all([
    supabase.from('site_settings').select('*').limit(1).maybeSingle(),
    supabase.from('hero_slides').select('*').order('display_order', { ascending: true }),
    supabase.from('jobs_table').select('*').order('created_at', { ascending: false }).limit(8),
    supabase.from('students_data').select('*').order('created_at', { ascending: false }).limit(6),
  ]);

  return {
    settings: settings || {},
    slides: slides || [],
    jobs: jobs || [],
    notes: notes || [],
  };
}

export default async function HomePage() {
  const { settings, slides, jobs, notes } = await getHomePageData();

  return (
    <>
      <NewsTicker text={settings.scrolling_news} />
      <Header siteName={settings.site_name} logoUrl={settings.logo_url} />

      <main className="flex-1 bg-gray-50">
        <HeroSlider slides={slides} mainHeading={settings.main_heading} subHeading={settings.sub_heading} />

        <TrustStrip />

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
      </main>

      <Footer siteName={settings.site_name} />
    </>
  );
}
