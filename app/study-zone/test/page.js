import Header from '@/components/Header';
import NewsTicker from '@/components/NewsTicker';
import Footer from '@/components/Footer';
import PageBanner from '@/components/PageBanner';
import { GraduationCapIcon3D } from '@/components/Icons3D';
import { getSiteSettings, getStudyClasses } from '@/lib/data';
import TestSetupForm from '@/components/StudyZone/TestSetupForm';

export const dynamic = 'force-dynamic';

export async function generateMetadata() {
  const settings = await getSiteSettings();
  return { title: `Start Online Test — ${settings.site_name || 'Education & Job Portal'}` };
}

export default async function TestSetupPage() {
  const [settings, classes] = await Promise.all([getSiteSettings(), getStudyClasses()]);

  return (
    <>
      <NewsTicker text={settings.scrolling_news} />
      <Header siteName={settings.site_name} logoUrl={settings.logo_url} />

      <main className="flex-1 bg-gray-50">
        <PageBanner
          title="Start Online Test"
          subtitle="Choose your class and subject to begin a timed, randomized paper."
          icon={<GraduationCapIcon3D className="h-9 w-9" />}
        />

        <div className="mx-auto max-w-xl px-4 py-10 md:px-6 md:py-14">
          {classes.length === 0 ? (
            <p className="rounded-xl bg-white p-6 text-center text-sm text-gray-500 shadow-sm ring-1 ring-black/5">
              No classes have been set up yet. Please check back soon.
            </p>
          ) : (
            <TestSetupForm classes={classes} />
          )}
        </div>
      </main>

      <Footer siteName={settings.site_name} settings={settings} />
    </>
  );
}
