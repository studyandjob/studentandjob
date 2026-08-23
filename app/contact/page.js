import Header from '@/components/Header';
import NewsTicker from '@/components/NewsTicker';
import Footer from '@/components/Footer';
import PageBanner from '@/components/PageBanner';
import ContactForm from '@/components/ContactForm';
import ContactCards from '@/components/ContactCards';
import { MailIcon3D } from '@/components/Icons3D';
import { getSiteSettings, getContacts } from '@/lib/data';

export const dynamic = 'force-dynamic';

export async function generateMetadata() {
  const settings = await getSiteSettings();
  return { title: `Contact Us — ${settings.site_name || 'Education & Job Portal'}` };
}

export default async function ContactPage() {
  const [settings, contacts] = await Promise.all([getSiteSettings(), getContacts()]);

  return (
    <>
      <NewsTicker text={settings.scrolling_news} />
      <Header siteName={settings.site_name} logoUrl={settings.logo_url} />

      <main className="flex-1 bg-gray-50">
        <PageBanner
          title="Contact Us"
          subtitle="Have a question? Send us a message and we'll get back to you."
          icon={<MailIcon3D className="h-9 w-9" />}
        />

        <div className="mx-auto max-w-5xl px-4 py-10 md:px-6 md:py-14">
          <ContactCards contacts={contacts} />

          <div className="mx-auto max-w-3xl rounded-2xl bg-white p-5 shadow-sm ring-1 ring-black/5 md:p-8">
            <ContactForm />
          </div>
        </div>
      </main>

      <Footer siteName={settings.site_name} />
    </>
  );
}
