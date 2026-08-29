import Header from '@/components/Header';
import NewsTicker from '@/components/NewsTicker';
import Footer from '@/components/Footer';
import PageBanner from '@/components/PageBanner';
import ScholarshipCard from '@/components/ScholarshipCard';
import { GraduationCapIcon3D } from '@/components/Icons3D';
import { getSiteSettings, getScholarships } from '@/lib/data';

export const dynamic = 'force-dynamic';

export async function generateMetadata() {
  const settings = await getSiteSettings();
  return { title: `Scholarships — ${settings.site_name || 'Education & Job Portal'}` };
}

export default async function ScholarshipsPage() {
  const [settings, scholarships] = await Promise.all([getSiteSettings(), getScholarships()]);

  return (
    <>
      <NewsTicker text={settings.scrolling_news} />
      <Header siteName={settings.site_name} logoUrl={settings.logo_url} />

      <main className="flex-1 bg-gray-50">
        <PageBanner
          title="Scholarships"
          subtitle="Local and international scholarships for students."
          icon={<GraduationCapIcon3D className="h-9 w-9" />}
        />

        <div className="mx-auto max-w-7xl px-4 py-10 md:px-6 md:py-14">
          <p className="mb-6 text-sm text-gray-500">
            {scholarships.length} scholarship{scholarships.length === 1 ? '' : 's'} available
          </p>

          {scholarships.length === 0 ? (
            <div className="rounded-2xl bg-white p-10 text-center shadow-sm ring-1 ring-black/5">
              <p className="text-sm text-gray-500">No scholarships posted yet. Check back soon.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {scholarships.map((s) => (
                <ScholarshipCard key={s.id} scholarship={s} />
              ))}
            </div>
          )}
        </div>
      </main>

      <Footer siteName={settings.site_name} settings={settings} />
    </>
  );
}
