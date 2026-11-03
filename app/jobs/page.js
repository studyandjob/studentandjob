import Header from '@/components/Header';
import NewsTicker from '@/components/NewsTicker';
import Footer from '@/components/Footer';
import PublicJobsBrowser from '@/components/PublicJobsBrowser';
import AdSlot from '@/components/AdSlot';
import { getSiteSettings, getJobs } from '@/lib/data';
import { Suspense } from 'react';

export const dynamic = 'force-dynamic';

export async function generateMetadata() {
  const settings = await getSiteSettings();
  const siteName = settings.site_name || 'Education & Job Portal';
  const description =
    'Browse the latest government and private job ads in Pakistan — filter by sector, category and city, and apply directly.';
  return {
    title: `Jobs — ${siteName}`,
    description,
    alternates: { canonical: '/jobs' },
    openGraph: { title: `Jobs — ${siteName}`, description, url: '/jobs' },
    twitter: { card: 'summary', title: `Jobs — ${siteName}`, description },
  };
}

export default async function JobsPage() {
  const [settings, jobs] = await Promise.all([getSiteSettings(), getJobs()]);

  return (
    <>
      <NewsTicker text={settings.scrolling_news} />
      <Header siteName={settings.site_name} logoUrl={settings.logo_url} />

      <main className="flex-1 bg-surface">
        <div className="mx-auto max-w-7xl px-4 md:px-6">
          <AdSlot html={settings.ad_code_list} className="mb-0" />
        </div>
        <Suspense fallback={null}>
          <PublicJobsBrowser jobs={jobs} siteName={settings.site_name} settings={settings} />
        </Suspense>
      </main>

      <Footer siteName={settings.site_name} settings={settings} />
    </>
  );
}
