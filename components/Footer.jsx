import Link from 'next/link';
import {
  FacebookIcon3D,
  WhatsappIcon3D,
  InstagramIcon3D,
  YoutubeIcon3D,
  TiktokIcon3D,
  XIcon3D,
  LinkedinIcon3D,
} from './Icons3D';

const QUICK_LINKS = [
  { href: '/', label: 'Home' },
  { href: '/jobs', label: 'Jobs' },
  { href: '/scholarships', label: 'Scholarships' },
  { href: '/results', label: 'Results' },
];

// Direct links into Study Zone's sub-sections — previously the footer
// only linked to the /study-zone hub, so Notes / Past Papers / Online
// Tests had no footer entry point of their own.
const STUDY_RESOURCE_LINKS = [
  { href: '/study-zone/notes', label: 'Notes' },
  { href: '/study-zone/materials?type=old_paper', label: 'Past Papers' },
  { href: '/study-zone/test', label: 'Online Tests' },
];

const LEGAL_LINKS = [
  { href: '/about-us', label: 'About Us' },
  { href: '/privacy-policy', label: 'Privacy Policy' },
  { href: '/terms-and-conditions', label: 'Terms & Conditions' },
  { href: '/disclaimer', label: 'Disclaimer' },
];

// Same field names as sql/add_social_media.sql / SocialMediaForm.jsx.
// A platform only renders here if the admin has actually filled its link in.
const SOCIAL_PLATFORMS = [
  { field: 'facebook_url', label: 'Facebook', icon: FacebookIcon3D },
  { field: 'whatsapp_channel_url', label: 'WhatsApp', icon: WhatsappIcon3D },
  { field: 'instagram_url', label: 'Instagram', icon: InstagramIcon3D },
  { field: 'youtube_url', label: 'YouTube', icon: YoutubeIcon3D },
  { field: 'tiktok_url', label: 'TikTok', icon: TiktokIcon3D },
  { field: 'twitter_url', label: 'X (Twitter)', icon: XIcon3D },
  { field: 'linkedin_url', label: 'LinkedIn', icon: LinkedinIcon3D },
];

export default function Footer({ siteName, settings }) {
  const socialLinks = SOCIAL_PLATFORMS.filter((p) => settings?.[p.field]);
  const waEnabled = Boolean(settings?.wa_service_enabled && settings?.wa_service_whatsapp_number);
  const waLink = waEnabled
    ? `https://wa.me/${settings.wa_service_whatsapp_number.replace(/\D/g, '')}`
    : null;

  // Support column — every entry is a real, existing route/link; nothing
  // shown unless the underlying feature is actually configured.
  const supportLinks = [
    { href: '/contact', label: 'Contact Us' },
    { href: '/vip', label: 'VIP Portal' },
    ...(waEnabled ? [{ href: '/application-support', label: 'Application Support' }] : []),
  ];

  const name = siteName || '';

  return (
    <footer className="mt-auto bg-gray-900 text-gray-300">
      <div className="mx-auto max-w-7xl px-4 py-12 md:px-6">
        <div className="grid grid-cols-2 gap-x-6 gap-y-10 sm:grid-cols-3 lg:grid-cols-6">
          <div className="col-span-2 sm:col-span-3 lg:col-span-1">
            {name && <p className="font-serif text-lg font-bold text-white">{name}</p>}
            <p className="mt-3 max-w-xs text-sm leading-relaxed text-gray-200">
              Your trusted platform for jobs, scholarships, results and study resources.
            </p>
          </div>

          <div>
            <p className="text-sm font-bold text-white">Quick Links</p>
            <ul className="mt-3 flex flex-col gap-2.5">
              {QUICK_LINKS.map((link) => (
                <li key={link.href}>
                  <Link href={link.href} className="text-sm text-gray-200 transition hover:text-white">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <p className="text-sm font-bold text-white">Study Resources</p>
            <ul className="mt-3 flex flex-col gap-2.5">
              {STUDY_RESOURCE_LINKS.map((link) => (
                <li key={link.href}>
                  <Link href={link.href} className="text-sm text-gray-200 transition hover:text-white">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <p className="text-sm font-bold text-white">Support</p>
            <ul className="mt-3 flex flex-col gap-2.5">
              {supportLinks.map((link) => (
                <li key={link.href}>
                  <Link href={link.href} className="text-sm text-gray-200 transition hover:text-white">
                    {link.label}
                  </Link>
                </li>
              ))}
              {waLink && (
                <li>
                  <a
                    href={waLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm text-gray-200 transition hover:text-white"
                  >
                    Chat on WhatsApp
                  </a>
                </li>
              )}
            </ul>
          </div>

          <div>
            <p className="text-sm font-bold text-white">Legal</p>
            <ul className="mt-3 flex flex-col gap-2.5">
              {LEGAL_LINKS.map((link) => (
                <li key={link.href}>
                  <Link href={link.href} className="text-sm text-gray-200 transition hover:text-white">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <p className="text-sm font-bold text-white">Follow Us</p>
            {socialLinks.length > 0 ? (
              <div className="mt-3 flex flex-wrap items-center gap-3">
                {socialLinks.map(({ field, label, icon: PlatformIcon }) => (
                  <a
                    key={field}
                    href={settings[field]}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={label}
                    title={label}
                    className="flex h-12 w-12 items-center justify-center rounded-full bg-white/5 ring-1 ring-white/10 transition hover:-translate-y-0.5 hover:bg-white/10"
                  >
                    <PlatformIcon className="h-8 w-8" />
                  </a>
                ))}
              </div>
            ) : (
              <p className="mt-3 text-sm text-gray-300">Coming soon</p>
            )}
          </div>
        </div>
      </div>

      <div className="border-t border-gray-800">
        <p className="mx-auto max-w-7xl px-4 py-5 text-center text-xs text-gray-300 md:px-6">
          © {new Date().getFullYear()} {name ? `${name}. ` : ''}All Rights Reserved.
        </p>
      </div>
    </footer>
  );
}
