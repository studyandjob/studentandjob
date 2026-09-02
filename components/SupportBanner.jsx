import Link from 'next/link';
import { SupportIcon3D, WhatsappIcon3D } from './Icons3D';

/**
 * Homepage-only support banner: two side-by-side cards — paid
 * "Application Support" (price pill) and free "Get Help on WhatsApp".
 * The WhatsApp half only renders its chat button when the admin has
 * actually turned the service on and set a number (same guard
 * WhatsAppServiceCard already used) so this never links to a dead chat.
 */
export default function SupportBanner({ settings }) {
  const waEnabled = Boolean(settings?.wa_service_enabled && settings?.wa_service_whatsapp_number);
  const price = settings?.wa_service_price || 'PKR 500';
  const waLink = waEnabled
    ? `https://wa.me/${settings.wa_service_whatsapp_number.replace(/\D/g, '')}?text=${encodeURIComponent(
        `Hi, I want help applying via your ${settings.wa_service_title || 'WhatsApp Application Support'} service.`
      )}`
    : null;

  return (
    <section className="border-b border-gray-100 bg-gray-50/60">
      <div className="mx-auto grid max-w-7xl grid-cols-1 gap-4 px-4 py-8 md:grid-cols-2 md:gap-6 md:px-6 md:py-10">
        <div className="flex items-center justify-between gap-4 rounded-2xl border border-brand-100 bg-brand-50/60 p-5">
          <div className="flex items-center gap-3">
            <span className="flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-xl bg-white shadow-sm">
              <SupportIcon3D className="h-6 w-6" />
            </span>
            <div>
              <p className="text-sm font-bold text-gray-900">Application Support</p>
              <p className="text-xs text-gray-500">We help you apply to jobs hassle-free</p>
            </div>
          </div>
          <span className="flex-shrink-0 rounded-lg bg-white px-3 py-2 text-center text-xs font-bold text-brand-700 shadow-sm">
            {price}
            <span className="block text-[10px] font-medium text-gray-400">Per Application</span>
          </span>
        </div>

        <div className="flex items-center justify-between gap-4 rounded-2xl border border-emerald-100 bg-emerald-50/60 p-5">
          <div className="flex items-center gap-3">
            <span className="flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-xl bg-white shadow-sm">
              <WhatsappIcon3D className="h-6 w-6" />
            </span>
            <div>
              <p className="text-sm font-bold text-gray-900">Get Help on WhatsApp</p>
              <p className="text-xs text-gray-500">Quick response · 9AM to 8PM</p>
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
