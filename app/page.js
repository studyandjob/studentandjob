import { supabase } from '@/lib/supabaseClient';
import Header from '@/components/Header';
import NewsTicker from '@/components/NewsTicker';
import HomeLead from '@/components/HomeLead';
import HomeLatestJobs from '@/components/HomeLatestJobs';
import HomeSidebar from '@/components/HomeSidebar';
import JobSearchForm from '@/components/JobSearchForm';
import HomeInfo from '@/components/HomeInfo';
import HomeFaq from '@/components/HomeFaq';
import { getHeroSlides } from '@/lib/data';
import AdSlot from '@/components/AdSlot';
import Footer from '@/components/Footer';
import { isJobOpen } from '@/lib/jobStatus';

// Cache homepage data for 60s so repeat visits load faster. Admin edits
// (new jobs, settings) can take up to ~60s to appear on the live homepage.
export const revalidate = 60;

async function getHomePageData() {
  // site_settings is ordered by updated_at (most recent first), matching
  // lib/data.js's getSiteSettings(), so a stale seed row is never returned.
  const [{ data: settings }, { data: jobs }, slides] = await Promise.all([
    supabase
      .from('site_settings')
      .select('*')
      .order('updated_at', { ascending: false, nullsFirst: false })
      .limit(1)
      .maybeSingle(),
    supabase.from('jobs_table').select('*').order('created_at', { ascending: false }).limit(30),
    getHeroSlides(),
  ]);

  const allOpenJobs = (jobs || []).filter(isJobOpen);

  const latestJobs = allOpenJobs.slice(0, 12);

  return { settings: settings || {}, latestJobs, allOpenJobs, slides: slides || [] };
}

export default async function HomePage() {
  const { settings, latestJobs, allOpenJobs, slides } = await getHomePageData();

  return (
    <>
      <NewsTicker text={settings.scrolling_news} />
      <Header siteName={settings.site_name} logoUrl={settings.logo_url} />

      <main className="flex-1">
        {/* Phones: header has no search box, so it sits here */}
        <div className="border-b border-gray-200 bg-white px-4 py-3 md:hidden">
          <JobSearchForm />
        </div>

        <div className="mx-auto max-w-7xl space-y-8 px-4 py-6 md:px-6 md:py-8">
          <HomeLead jobs={allOpenJobs} slides={slides} slideSpeed={settings.hero_slide_speed} />

          <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_340px]">
            <div>
              <HomeLatestJobs jobs={latestJobs} />
              <AdSlot html={settings.ad_code_list} />
            </div>
            <HomeSidebar settings={{ ...settings, ad_code_list: '' }} />
          </div>
        </div>

        <HomeInfo />
        <HomeFaq />
      </main>

      <Footer siteName={settings.site_name} settings={settings} />
    </>
  );
}
