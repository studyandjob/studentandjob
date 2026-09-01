import Header from '@/components/Header';
import NewsTicker from '@/components/NewsTicker';
import Footer from '@/components/Footer';
import PublicJobsBrowser from '@/components/PublicJobsBrowser';
import { getSiteSettings, getJobs } from '@/lib/data';
import { Suspense } from 'react';

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
        <Suspense fallback={null}>
          <PublicJobsBrowser jobs={jobs} siteName={settings.site_name} settings={settings} />
        </Suspense>
      </main>

      <Footer siteName={settings.site_name} settings={settings} />
    </>
  );
}
