import { WhatsappIcon3D } from './Icons3D';

/**
 * "Get new jobs on WhatsApp" button. Shown only when a WhatsApp channel
 * link is saved in Admin → Social Media. A visitor who joins the channel
 * comes back every time a job is posted — repeat visits = repeat ad views.
 */
export default function ChannelCta({ settings, className = '' }) {
  const url = settings?.whatsapp_channel_url;
  if (!url) return null;
  return (
    <div
      className={`flex flex-col items-center gap-3 rounded-2xl border border-emerald-100 bg-emerald-50 p-5 text-center sm:flex-row sm:text-left ${className}`}
    >
      <WhatsappIcon3D className="h-12 w-12 flex-shrink-0" />
      <div className="flex-1">
        <p className="text-sm font-bold text-gray-900">Get new jobs on WhatsApp</p>
        <p className="text-xs text-gray-600">Join our channel and see every new job ad as soon as it is posted.</p>
      </div>
      <a
        href={url}
        target="_blank"
        rel="noopener noreferrer"
        className="rounded-xl bg-emerald-600 px-5 py-2.5 text-sm font-bold text-white transition hover:bg-emerald-700 active:scale-[0.98]"
      >
        Join channel
      </a>
    </div>
  );
}
