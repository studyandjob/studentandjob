import Link from 'next/link';
import { supabase } from '@/lib/supabaseClient';
import Header from '@/components/Header';
import NewsTicker from '@/components/NewsTicker';
import HomeHero from '@/components/HomeHero';
import TodayJobsStrip from '@/components/TodayJobsStrip';
import JobsList from '@/components/JobsList';
import AdSlot from '@/components/AdSlot';
import ChannelCta from '@/components/ChannelCta';
import Footer from '@/components/Footer';
import { isJobOpen, getTodayJobGroups } from '@/lib/jobStatus';

// Cache homepage data for 60s so repeat visits load faster. Admin edits
// (new jobs, settings) can take up to ~60s to appear on the live homepage.
export const revalidate = 60;

async function getHomePageData() {
  // site_settings is ordered by updated_at (most recent first), matching
  // lib/data.js's getSiteSettings(), so a stale seed row is never returned.
  const [{ data: settings }, { data: jobs }] = await Promise.all([
    supabase
      .from('site_settings')
      .select('*')
      .order('updated_at', { ascending: false, nullsFirst: false })
      .limit(1)
      .maybeSingle(),
    supabase.from('jobs_table').select('*').order('created_at', { ascending: false }).limit(30),
  ]);

  const allOpenJobs = (jobs || []).filter(isJobOpen);

  // Jobs already shown in "Today's Important Jobs" are left out of "Latest
  // Jobs" so none appears twice — unless that would leave the list empty.
  const { closingToday, closingTomorrow, newToday } = getTodayJobGroups(allOpenJobs);
  const highlighted = new Set([...closingToday, ...closingTomorrow, ...newToday].map((j) => j.id));
  const remaining = allOpenJobs.filter((j) => !highlighted.has(j.id));
  const latestJobs = (remaining.length > 0 ? remaining : allOpenJobs).slice(0, 10);

  return { settings: settings || {}, latestJobs, allOpenJobs };
}

export default async function HomePage() {
  const { settings, latestJobs, allOpenJobs } = await getHomePageData();

  return (
    <>
      <NewsTicker text={settings.scrolling_news} />
      <Header siteName={settings.site_name} logoUrl={settings.logo_url} />

      <main className="flex-1 bg-white">
        <HomeHero openJobsCount={allOpenJobs.length} />
        <TodayJobsStrip jobs={allOpenJobs} />

        <div className="border-b border-gray-100 bg-gray-50/60">
          <div className="mx-auto max-w-4xl px-4 py-10 md:px-6 md:py-12">
            <JobsList jobs={latestJobs} />
            <AdSlot html={settings.ad_code_list} />
            <div className="mt-6 text-center">
              <Link
                href="/jobs"
                className="inline-block rounded-xl bg-brand-600 px-6 py-3 text-sm font-bold text-white shadow-md shadow-brand-600/20 transition hover:bg-brand-700 active:scale-[0.98]"
              >
                View all jobs
              </Link>
            </div>
            <ChannelCta settings={settings} className="mt-8" />
          </div>
        </div>
      </main>

      <Footer siteName={settings.site_name} settings={settings} />
    </>
  );
}
