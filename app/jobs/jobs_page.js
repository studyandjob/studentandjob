import Header from '@/components/Header';
import NewsTicker from '@/components/NewsTicker';
import Footer from '@/components/Footer';
import PageBanner from '@/components/PageBanner';
import PublicJobsBrowser from '@/components/PublicJobsBrowser';
import { getSiteSettings, getJobs } from '@/lib/data';

export const dynamic = 'force-dynamic';

export async function generateMetadata() {
  const settings = await getSiteSettings();
  return { title: `Jobs — ${settings.site_name || 'Education & Job Portal'}` };
}

export default async function JobsPage() {
  const [settings, jobs] = await Promise.all([getSiteSettings(), getJobs()]);

  return (
    <>
      <NewsTicker text={settings.scrolling_news} />
      <Header siteName={settings.site_name} logoUrl={settings.logo_url} />

      <main className="flex-1 bg-gray-50">
        <PageBanner
          title="Government & Private Jobs"
          subtitle="Browse the latest job postings, updated regularly."
          icon={
            <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
            </svg>
          }
        />

        <div className="mx-auto max-w-5xl px-4 py-10 md:px-6 md:py-14">
          <PublicJobsBrowser jobs={jobs} />
        </div>
      </main>

      <Footer siteName={settings.site_name} settings={settings} />
    </>
  );
}
