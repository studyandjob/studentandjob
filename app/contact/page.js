import Header from '@/components/Header';
import NewsTicker from '@/components/NewsTicker';
import Footer from '@/components/Footer';
import PageBanner from '@/components/PageBanner';
import ContactForm from '@/components/ContactForm';
import { getSiteSettings } from '@/lib/data';

export const dynamic = 'force-dynamic';

export async function generateMetadata() {
  const settings = await getSiteSettings();
  return { title: `Contact Us — ${settings.site_name || 'Education & Job Portal'}` };
}

export default async function ContactPage() {
  const settings = await getSiteSettings();

  return (
    <>
      <NewsTicker text={settings.scrolling_news} />
      <Header siteName={settings.site_name} logoUrl={settings.logo_url} />

      <main className="flex-1 bg-gray-50">
        <PageBanner
          title="Contact Us"
          subtitle="Have a question? Send us a message and we'll get back to you."
          icon={
            <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
            </svg>
          }
        />

        <div className="mx-auto max-w-3xl px-4 py-10 md:px-6 md:py-14">
          <div className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-black/5 md:p-8">
            <ContactForm />
          </div>
        </div>
      </main>

      <Footer siteName={settings.site_name} />
    </>
  );
}
