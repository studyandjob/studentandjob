import { WhatsappIcon3D } from './Icons3D';

// Always-visible entry point to WhatsApp support, on every page — not just
// the homepage SupportBanner (which visitors only see if they scroll down
// that far). Bottom-right, sized and positioned so it never overlaps the
// mobile bottom tab bar (see MobileBottomNav, which is fixed + z-40 and
// only shown below md).
export default function FloatingWhatsAppButton({ settings }) {
  const enabled = Boolean(settings?.wa_service_enabled && settings?.wa_service_whatsapp_number);
  if (!enabled) return null;

  const waLink = `https://wa.me/${settings.wa_service_whatsapp_number.replace(/\D/g, '')}?text=${encodeURIComponent(
    `Hi, I have a question about ${settings.site_name || 'your services'}.`
  )}`;

  return (
    <a
      href={waLink}
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Chat on WhatsApp"
      title="Chat on WhatsApp"
      className="fixed bottom-20 right-4 z-40 flex h-14 w-14 items-center justify-center rounded-full bg-emerald-500 shadow-lg shadow-emerald-600/30 ring-4 ring-white transition hover:-translate-y-0.5 hover:bg-emerald-600 active:scale-95 md:bottom-6 md:right-6 md:h-16 md:w-16"
    >
      <WhatsappIcon3D className="h-8 w-8 md:h-9 md:w-9" />
    </a>
  );
}
