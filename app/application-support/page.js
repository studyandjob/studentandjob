import Header from '@/components/Header';
import NewsTicker from '@/components/NewsTicker';
import Footer from '@/components/Footer';
import PageBanner from '@/components/PageBanner';
import { getSiteSettings } from '@/lib/data';

export const dynamic = 'force-dynamic';

export async function generateMetadata() {
  const settings = await getSiteSettings();
  return { title: `Application Support Service — ${settings.site_name || 'Education & Job Portal'}` };
}

export default async function ApplicationSupportPage() {
  const settings = await getSiteSettings();
  const enabled = settings.wa_service_enabled && settings.wa_service_whatsapp_number && settings.wa_service_price;

  const features = (settings.wa_service_features || '')
    .split('\n')
    .map((f) => f.trim())
    .filter(Boolean);

  const waLink = enabled
    ? `https://wa.me/${settings.wa_service_whatsapp_number.replace(/\D/g, '')}?text=${encodeURIComponent(
        `Hi, I want help applying via your ${settings.wa_service_title || 'WhatsApp Application Support'} service.`
      )}`
    : null;

  return (
    <>
      <NewsTicker text={settings.scrolling_news} />
      <Header siteName={settings.site_name} logoUrl={settings.logo_url} />

      <main className="flex-1 bg-gray-50">
        <PageBanner title={settings.wa_service_title || 'Application Support via WhatsApp'} />

        <div className="mx-auto max-w-3xl px-4 py-10 md:px-6 md:py-14">
          {!enabled ? (
            <div className="rounded-2xl bg-white p-8 text-center shadow-sm ring-1 ring-black/5">
              <p className="text-sm text-gray-500">
                This service is not currently available. Please check back later or contact us for help.
              </p>
            </div>
          ) : (
            <div className="flex flex-col gap-6">
              {/* Price — always shown first and clearly, before anything else */}
              <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl bg-white p-6 shadow-sm ring-1 ring-black/5 md:p-8">
                <div>
                  <h1 className="text-lg font-bold text-gray-900 md:text-xl">
                    {settings.wa_service_title || 'Application Support via WhatsApp'}
                  </h1>
                  {settings.wa_service_description && (
                    <p className="mt-2 max-w-xl text-sm text-gray-600">{settings.wa_service_description}</p>
                  )}
                </div>
                <span className="flex-shrink-0 rounded-full bg-emerald-600 px-4 py-2 text-sm font-bold text-white">
                  {settings.wa_service_price}
                </span>
              </div>

              {features.length > 0 && (
                <div className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-black/5 md:p-8">
                  <h2 className="mb-3 text-sm font-bold uppercase tracking-wide text-gray-500">What's Included</h2>
                  <ul className="flex flex-col gap-2">
                    {features.map((f, i) => (
                      <li key={i} className="flex items-start gap-2 text-sm text-gray-800">
                        <span className="mt-0.5 text-emerald-600">✓</span>
                        <span>{f}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Refund / Terms — shown in full, on the same page as the CTA, not buried elsewhere */}
              {settings.wa_service_terms && (
                <div className="rounded-2xl border border-amber-200 bg-amber-50 p-6 md:p-8">
                  <h2 className="mb-3 text-sm font-bold uppercase tracking-wide text-amber-700">
                    Refund Policy &amp; Terms &amp; Conditions
                  </h2>
                  <div className="whitespace-pre-wrap text-sm leading-7 text-amber-900">{settings.wa_service_terms}</div>
                </div>
              )}

              <div className="rounded-2xl bg-white p-6 text-center shadow-sm ring-1 ring-black/5 md:p-8">
                <p className="mb-4 text-sm text-gray-600">
                  By messaging us, you confirm you've read the price and the refund/terms above.
                </p>
                <a
                  href={waLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-block rounded-full bg-emerald-600 px-8 py-3.5 text-sm font-bold text-white shadow-md transition hover:bg-emerald-700"
                >
                  {settings.wa_service_cta_text || 'Chat on WhatsApp'} — {settings.wa_service_price}
                </a>
              </div>
            </div>
          )}
        </div>
      </main>

      <Footer siteName={settings.site_name} settings={settings} />
    </>
  );
}
