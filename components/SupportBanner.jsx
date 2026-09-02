import Link from 'next/link';
import { SupportIcon3D, WhatsappIcon3D } from './Icons3D';

/**
 * Homepage-only support banner: "Optional Application Assistance" (paid,
 * links to the full /application-support page with terms) and free
 * "Get Help on WhatsApp" for general questions.
 *
 * Wording here is deliberately explicit that this is an *optional* paid
 * service for help filling out an application — not a fee to apply for
 * jobs themselves, and not a guarantee of employment. See
 * app/application-support/page.js for the full terms.
 */
export default function SupportBanner({ settings }) {
  const waEnabled = Boolean(settings?.wa_service_enabled && settings?.wa_service_whatsapp_number);
  const price = settings?.wa_service_price || 'PKR 500';
  const priceAlreadySaysPerApplication = /per\s*application/i.test(price);
  const waLink = waEnabled
    ? `https://wa.me/${settings.wa_service_whatsapp_number.replace(/\D/g, '')}?text=${encodeURIComponent(
        `Hi, I want help applying via your ${settings.wa_service_title || 'WhatsApp Application Support'} service.`
      )}`
    : null;

  return (
    <section className="border-b border-gray-100 bg-gray-50/60">
      <div className="mx-auto grid max-w-7xl grid-cols-1 gap-4 px-4 py-8 md:grid-cols-2 md:gap-6 md:px-6 md:py-10">
        <div className="flex flex-col gap-3 rounded-2xl border border-brand-100 bg-brand-50/60 p-5">
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-center gap-3">
              <span className="flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-xl bg-white shadow-sm">
                <SupportIcon3D className="h-6 w-6" />
              </span>
              <div>
                <p className="text-sm font-bold text-gray-900">Optional Application Assistance</p>
                <p className="text-xs text-gray-500">Need help completing a job application? Our team can assist you step-by-step.</p>
              </div>
            </div>
            <span className="flex-shrink-0 whitespace-nowrap rounded-lg bg-white px-3 py-2 text-center text-xs font-bold text-brand-700 shadow-sm">
              {price}
              {!priceAlreadySaysPerApplication && (
                <span className="block text-[10px] font-medium text-gray-400">Per Application</span>
              )}
            </span>
          </div>

          {/* Explicit disclaimer so visitors never mistake this optional,
              paid help service for a requirement to pay before applying,
              or for a guarantee of getting hired. */}
          <p className="text-[11px] leading-relaxed text-gray-500">
            This is an optional, paid assistance service. Job applications themselves are subject to the
            employer&apos;s own process and requirements — we do not guarantee employment.
          </p>

          <Link
            href="/application-support"
            className="mt-1 inline-flex w-fit items-center gap-1.5 rounded-lg bg-brand-600 px-4 py-2.5 text-xs font-bold text-white transition hover:bg-brand-700"
          >
            Get Application Help
          </Link>
        </div>

        <div className="flex items-center justify-between gap-4 rounded-2xl border border-emerald-100 bg-emerald-50/60 p-5">
          <div className="flex items-center gap-3">
            <span className="flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-xl bg-white shadow-sm">
              <WhatsappIcon3D className="h-6 w-6" />
            </span>
            <div>
              <p className="text-sm font-bold text-gray-900">Get Help on WhatsApp</p>
              <p className="text-xs text-gray-500">Message us with any question, anytime</p>
            </div>
          </div>
          {waEnabled ? (
            <a
              href={waLink}
              target="_blank"
              rel="noopener noreferrer"
              className="flex-shrink-0 rounded-lg bg-emerald-600 px-4 py-2.5 text-xs font-bold text-white transition hover:bg-emerald-700"
            >
              Chat Now
            </a>
          ) : (
            <Link
              href="/contact"
              className="flex-shrink-0 rounded-lg bg-emerald-600 px-4 py-2.5 text-xs font-bold text-white transition hover:bg-emerald-700"
            >
              Contact Us
            </Link>
          )}
        </div>
      </div>
    </section>
  );
}
