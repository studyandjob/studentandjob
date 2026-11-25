import Link from 'next/link';
import { notFound } from 'next/navigation';
import Header from '@/components/Header';
import NewsTicker from '@/components/NewsTicker';
import Footer from '@/components/Footer';
import HomeIcon from '@/components/HomeIcons';
import ShareButton from '@/components/directory/ShareButton';
import { getSiteSettings } from '@/lib/data';
import {
  businessPath,
  businessWaLink,
  directionsLink,
  enrichBusinesses,
  getBusinessBySlug,
  getTaxonomy,
  landingPath,
  telLink,
} from '@/lib/directory';

export const dynamic = 'force-dynamic';

export async function generateMetadata({ params }) {
  const raw = await getBusinessBySlug(params.slug);
  if (!raw) return { title: 'Business not found' };
  const taxonomy = await getTaxonomy();
  const [b] = enrichBusinesses([raw], taxonomy);
  const category = b.subcategory_label || b.category_label;
  return {
    title: `${b.name} — ${[category, b.city_label].filter(Boolean).join(', ')}`,
    description:
      b.short_description ||
      b.description?.slice(0, 160) ||
      `${b.name}, ${b.city_label}. Phone, address, timing aur WhatsApp order ke liye is page par rabta karein.`,
    openGraph: { title: b.name, images: b.photo_url ? [b.photo_url] : undefined },
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
  const [settings, raw, taxonomy] = await Promise.all([getSiteSettings(), getBusinessBySlug(params.slug), getTaxonomy()]);
  if (!raw) notFound();
  const [business] = enrichBusinesses([raw], taxonomy);

  const wa = businessWaLink(business, settings.site_name);
  const tel = telLink(business.phone);
  const directions = directionsLink(business);
  const verified = business.verification_status === 'verified';
  const services = String(business.services || '')
    .split('\n')
    .map((s) => s.trim())
    .filter(Boolean);
  const category = business.subcategory_label || business.category_label;
  const place = [business.area_label, business.city_label].filter(Boolean).join(', ');

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://onlinejobsandstudy.vercel.app';
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'LocalBusiness',
    name: business.name,
    url: `${siteUrl}${businessPath(business)}`,
    ...(business.photo_url ? { image: business.photo_url } : {}),
    ...(business.short_description || business.description ? { description: business.short_description || business.description } : {}),
    ...(business.phone ? { telephone: business.phone } : {}),
    address: {
      '@type': 'PostalAddress',
      streetAddress: business.address || undefined,
      addressLocality: business.city_label || undefined,
      addressCountry: 'PK',
    },
    ...(business.latitude != null && business.longitude != null
      ? { geo: { '@type': 'GeoCoordinates', latitude: business.latitude, longitude: business.longitude } }
      : {}),
    ...(business.timing ? { openingHours: business.timing } : {}),
  };

  return (
    <>
      <NewsTicker text={settings.show_news_ticker === false ? '' : settings.scrolling_news} />
      <Header siteName={settings.site_name} logoUrl={settings.logo_url} />

      <main className="flex-1 bg-surface">
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, '\\u003c') }} />

        <div className="mx-auto max-w-4xl px-4 py-8 md:px-6 md:py-12">
          <nav className="mb-4 text-sm text-gray-500" aria-label="Breadcrumb">
            <Link href="/directory" className="hover:underline">Directory</Link>
            {business.city_slug && (
              <>
                {' / '}
                <Link href={landingPath(business.city_slug)} className="hover:underline">{business.city_label}</Link>
              </>
            )}
            {business.category_slug && category && (
              <>
                {' / '}
                <Link href={landingPath(business.city_slug, business.subcategory_slug || business.category_slug)} className="hover:underline">
                  {category}
                </Link>
              </>
            )}
          </nav>

          <article className="overflow-hidden rounded-2xl border border-line bg-surface shadow-card">
            {business.photo_url ? (
              <img src={business.photo_url} alt={business.name} className="h-56 w-full object-cover md:h-80" />
            ) : (
              <div className="flex h-40 w-full items-center justify-center bg-gradient-to-br from-brand-100 to-brand-50 text-brand-600">
                <HomeIcon name="building" className="h-14 w-14" />
              </div>
            )}

            <div className="p-5 md:p-8">
              <div className="mb-3 flex flex-wrap items-center gap-2">
                {category && <span className="rounded-full bg-brand-50 px-3 py-1 text-xs font-semibold text-brand-700">{category}</span>}
                {place && <span className="rounded-full bg-gray-100 px-3 py-1 text-xs font-medium text-gray-600">{place}</span>}
                {business.is_featured && <span className="rounded-full bg-amber-400 px-3 py-1 text-xs font-bold text-amber-950">★ Featured</span>}
                {verified && (
                  <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700">
                    <HomeIcon name="shield" className="h-3.5 w-3.5" />
                    Verified
                  </span>
                )}
              </div>

              <h1 className="text-2xl font-bold tracking-tight text-gray-900 md:text-3xl">{business.name}</h1>
              {business.short_description && <p className="mt-2 text-base text-gray-600">{business.short_description}</p>}
              {business.description && (
                <p className="mt-3 whitespace-pre-line text-sm leading-relaxed text-gray-700 md:text-base">{business.description}</p>
              )}

              <ul className="mt-6 flex flex-col gap-3.5">
                {(business.address || place) && <Row icon="pin">{[business.address, place].filter(Boolean).join(', ')}</Row>}
                {business.timing && <Row icon="clock">{business.timing}</Row>}
                {business.phone && (
                  <Row icon="phone">
                    <a href={tel} className="font-medium hover:underline">{business.phone}</a>
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
                    Call Now
                  </a>
                )}
                {directions && (
                  <a
                    href={directions}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex min-h-[46px] items-center justify-center gap-2 rounded-md border border-line px-5 py-2.5 text-sm font-semibold text-gray-800 transition active:scale-95 hover:bg-surface-alt"
                  >
                    <HomeIcon name="pin" className="h-5 w-5" />
                    Get Directions
                  </a>
                )}
                <ShareButton title={business.name} />
              </div>
            </div>
          </article>
        </div>
      </main>

      <Footer siteName={settings.site_name} settings={settings} />
    </>
  );
}
