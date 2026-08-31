'use client';

import Link from 'next/link';

/**
 * Promo card for the paid WhatsApp application-support service. Renders
 * nothing if the admin hasn't turned it on (wa_service_enabled) — the
 * whole feature lives behind that one switch in Admin → WhatsApp Service.
 *
 * Price and a link to the full refund/terms text are ALWAYS shown next to
 * the WhatsApp button, never hidden behind an extra click, so a candidate
 * never taps "Chat on WhatsApp" without having seen both.
 */
export default function WhatsAppServiceCard({ settings, compact = false }) {
  if (!settings?.wa_service_enabled) return null;
  if (!settings.wa_service_whatsapp_number || !settings.wa_service_price) return null;

  const features = (settings.wa_service_features || '')
    .split('\n')
    .map((f) => f.trim())
    .filter(Boolean);

  const waLink = `https://wa.me/${settings.wa_service_whatsapp_number.replace(/\D/g, '')}?text=${encodeURIComponent(
    `Hi, I want help applying via your ${settings.wa_service_title || 'WhatsApp Application Support'} service.`
  )}`;

  return (
    <div className="rounded-2xl border border-emerald-200 bg-emerald-50/60 p-4 sm:p-5">
      <div className="mb-2 flex flex-wrap items-center justify-between gap-2">
        <h3 className="text-sm font-bold text-emerald-900 sm:text-base">
          {settings.wa_service_title || 'Application Support via WhatsApp'}
        </h3>
        <span className="rounded-full bg-emerald-600 px-3 py-1 text-xs font-bold text-white">
          {settings.wa_service_price}
        </span>
      </div>

      {settings.wa_service_description && !compact && (
        <p className="mb-3 text-sm text-emerald-900/80">{settings.wa_service_description}</p>
      )}

      {features.length > 0 && !compact && (
        <ul className="mb-3 flex flex-col gap-1">
          {features.map((f, i) => (
            <li key={i} className="flex items-start gap-1.5 text-sm text-emerald-900/80">
              <span className="mt-0.5 text-emerald-600">✓</span>
              <span>{f}</span>
            </li>
          ))}
        </ul>
      )}

      <div className="flex flex-wrap items-center gap-3">
        <a
          href={waLink}
          target="_blank"
          rel="noopener noreferrer"
          className="rounded-full bg-emerald-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-emerald-700"
        >
          {settings.wa_service_cta_text || 'Chat on WhatsApp'} — {settings.wa_service_price}
        </a>
        <Link href="/application-support" className="text-xs font-semibold text-emerald-800 underline underline-offset-2">
          Full details, price & refund policy
        </Link>
      </div>
    </div>
  );
}
