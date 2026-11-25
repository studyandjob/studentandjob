import Link from 'next/link';
import { notFound } from 'next/navigation';
import Header from '@/components/Header';
import NewsTicker from '@/components/NewsTicker';
import Footer from '@/components/Footer';
import HomeIcon from '@/components/HomeIcons';
import { getSiteSettings } from '@/lib/data';
import { getBusinessById, businessWaLink, telLink } from '@/lib/directory';

export const dynamic = 'force-dynamic';

export async function generateMetadata({ params }) {
  const business = await getBusinessById(params.id);
  if (!business) return { title: 'Business not found' };
  return {
    title: `${business.name} — ${business.category}, ${business.area}`,
    description:
      business.description ||
      `${business.name}, ${business.area}. Phone, address, timing aur WhatsApp order ke liye is page par rabta karein.`,
  };
}

function Row({ icon, children }) {
  return (
    <li className="flex items-start gap-3 text-sm text-gray-700">
      <HomeIcon name={icon} className="mt-0.5 h-5 w-5 flex-shrink-0 text-brand-600" />
      <span className="min-w-0 break-words">{children}</span>
    </li>
  );
}

export default async function BusinessPage({ params }) {
  const [settings, business] = await Promise.all([getSiteSettings(), getBusinessById(params.id)]);
  if (!business) notFound();

  const wa = businessWaLink(business, settings.site_name);
  const tel = telLink(business.phone);
  const services = String(business.services || '')
    .split('\n')
    .map((s) => s.trim())
    .filter(Boolean);

  return (
    <>
      <NewsTicker text={settings.show_news_ticker === false ? '' : settings.scrolling_news} />
      <Header siteName={settings.site_name} logoUrl={settings.logo_url} />

      <main className="flex-1 bg-surface">
        <div className="mx-auto max-w-4xl px-4 py-8 md:px-6 md:py-12">
          <Link href="/directory" className="text-sm font-semibold text-brand-600 hover:underline">
            ← Directory par wapis
          </Link>

          <article className="mt-4 overflow-hidden rounded-2xl border border-line bg-surface shadow-card">
            {business.photo_url ? (
              <img src={business.photo_url} alt={business.name} className="h-56 w-full object-cover md:h-80" />
            ) : (
              <div className="flex h-40 w-full items-center justify-center bg-gradient-to-br from-brand-100 to-brand-50 text-brand-600">
                <HomeIcon name="building" className="h-14 w-14" />
              </div>
            )}

            <div className="p-5 md:p-8">
              <div className="mb-3 flex flex-wrap items-center gap-2">
                <span className="rounded-full bg-brand-50 px-3 py-1 text-xs font-semibold text-brand-700">{business.category}</span>
                <span className="rounded-full bg-gray-100 px-3 py-1 text-xs font-medium text-gray-600">{business.area}</span>
                {business.is_featured && (
                  <span className="rounded-full bg-amber-400 px-3 py-1 text-xs font-bold text-amber-950">★ Featured</span>
                )}
              </div>

              <h1 className="text-2xl font-bold tracking-tight text-gray-900 md:text-3xl">{business.name}</h1>
              {business.description && (
                <p className="mt-3 whitespace-pre-line text-sm leading-relaxed text-gray-700 md:text-base">{business.description}</p>
              )}

              <ul className="mt-6 flex flex-col gap-3.5">
                {business.address && <Row icon="pin">{business.address}</Row>}
                {business.timing && <Row icon="clock">{business.timing}</Row>}
                {business.phone && (
                  <Row icon="phone">
                    <a href={tel} className="font-medium hover:underline">
                      {business.phone}
                    </a>
                  </Row>
                )}
              </ul>

              {services.length > 0 && (
                <div className="mt-6">
                  <h2 className="mb-2 text-base font-bold text-gray-900">Services / Menu</h2>
                  <ul className="grid grid-cols-1 gap-x-6 gap-y-1.5 sm:grid-cols-2">
                    {services.map((s, i) => (
                      <li key={i} className="flex items-start gap-2 text-sm text-gray-700">
                        <HomeIcon name="check" className="mt-0.5 h-4 w-4 flex-shrink-0 text-emerald-600" />
                        <span>{s}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              <div className="mt-8 flex flex-wrap gap-3">
                {wa && (
                  <a
                    href={wa}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex min-h-[46px] items-center justify-center gap-2 rounded-md bg-emerald-500 px-5 py-2.5 text-sm font-semibold text-white transition active:scale-95 hover:bg-emerald-600"
                  >
                    <HomeIcon name="whatsapp" className="h-5 w-5" />
                    WhatsApp par Order karein
                  </a>
                )}
                {tel && (
                  <a
                    href={tel}
                    className="inline-flex min-h-[46px] items-center justify-center gap-2 rounded-md border border-line px-5 py-2.5 text-sm font-semibold text-gray-800 transition active:scale-95 hover:bg-surface-alt"
                  >
                    <HomeIcon name="phone" className="h-5 w-5" />
                    Call karein
                  </a>
                )}
                {business.map_link && (
                  <a
                    href={business.map_link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex min-h-[46px] items-center justify-center gap-2 rounded-md border border-line px-5 py-2.5 text-sm font-semibold text-gray-800 transition active:scale-95 hover:bg-surface-alt"
                  >
                    <HomeIcon name="pin" className="h-5 w-5" />
                    Map par dekhein
                  </a>
                )}
              </div>
            </div>
          </article>
        </div>
      </main>

      <Footer siteName={settings.site_name} settings={settings} />
    </>
  );
}
