import Header from '@/components/Header';
import NewsTicker from '@/components/NewsTicker';
import Footer from '@/components/Footer';
import PageBanner from '@/components/PageBanner';
import HomeIcon from '@/components/HomeIcons';
import DirectoryBrowser from '@/components/DirectoryBrowser';
import { getSiteSettings } from '@/lib/data';
import { getBusinesses, toWaNumber } from '@/lib/directory';

export const dynamic = 'force-dynamic';

export async function generateMetadata() {
  const settings = await getSiteSettings();
  return {
    title: `Bahawalpur Business Directory — ${settings.site_name || 'Local Directory'}`,
    description:
      'Bahawalpur, Khairpur aur aas paas ke doctors, academies, restaurants, shops aur repair services ki directory — phone aur WhatsApp order ke sath.',
  };
}

export default async function DirectoryPage() {
  const [settings, businesses] = await Promise.all([getSiteSettings(), getBusinesses()]);

  // "Apna business add karwayein" — goes to the same WhatsApp number the
  // admin already set in Admin → WhatsApp Service (if any).
  const listNumber = toWaNumber(settings.wa_service_whatsapp_number);
  const listLink = listNumber
    ? `https://wa.me/${listNumber}?text=${encodeURIComponent(
        'Assalam o Alaikum, main apna business Bahawalpur Business Directory mein add karwana chahta hoon.'
      )}`
    : '';

  return (
    <>
      <NewsTicker text={settings.show_news_ticker === false ? '' : settings.scrolling_news} />
      <Header siteName={settings.site_name} logoUrl={settings.logo_url} />

      <main className="flex-1 bg-surface">
        <PageBanner
          title="Bahawalpur Business Directory"
          subtitle="Local doctors, academies, restaurants, shops aur services — seedha WhatsApp par order karein."
          icon={<HomeIcon name="building" className="h-9 w-9 text-brand-600" />}
        />

        <div className="mx-auto max-w-7xl px-4 py-8 md:px-6 md:py-12">
          {businesses.length === 0 ? (
            <div className="rounded-2xl border border-line bg-surface p-10 text-center shadow-card">
              <p className="text-base font-semibold text-gray-700">Directory jald shuru ho rahi hai</p>
              <p className="mt-1.5 text-sm text-gray-500">Local businesses yahan nazar aane lagenge.</p>
            </div>
          ) : (
            <DirectoryBrowser businesses={businesses} siteName={settings.site_name} />
          )}

          {listLink && (
            <div className="mt-12 flex flex-col items-center justify-between gap-4 rounded-2xl border border-line bg-surface-alt p-6 text-center md:flex-row md:text-left">
              <div>
                <p className="text-base font-bold text-gray-900">Apna business list karwana chahte hain?</p>
                <p className="mt-1 text-sm text-gray-600">Humein WhatsApp par message karein, hum aap ki listing add kar denge.</p>
              </div>
              <a
                href={listLink}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex min-h-[44px] items-center justify-center gap-2 rounded-md bg-emerald-500 px-5 py-2.5 text-sm font-semibold text-white transition active:scale-95 hover:bg-emerald-600"
              >
                <HomeIcon name="whatsapp" className="h-5 w-5" />
                WhatsApp par rabta karein
              </a>
            </div>
          )}
        </div>
      </main>

      <Footer siteName={settings.site_name} settings={settings} />
    </>
  );
}
