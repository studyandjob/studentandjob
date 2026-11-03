import Link from 'next/link';
import { resolveVisibility } from '@/lib/pages';
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
  { key: 'home', href: '/', label: 'Home' },
  { key: 'jobs', href: '/jobs', label: 'Jobs' },
  { key: 'scholarships', href: '/scholarships', label: 'Scholarships' },
  { key: 'results', href: '/results', label: 'Results' },
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
  { key: 'about', href: '/about-us', label: 'About Us' },
  { key: 'privacy', href: '/privacy-policy', label: 'Privacy Policy' },
  { key: 'terms', href: '/terms-and-conditions', label: 'Terms & Conditions' },
  { key: 'disclaimer', href: '/disclaimer', label: 'Disclaimer' },
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
  const visibility = resolveVisibility(settings);
  const quickLinks = QUICK_LINKS.filter((l) => visibility[l.key]);
  const legalLinks = LEGAL_LINKS.filter((l) => visibility[l.key]);
  const showStudy = visibility['study-zone'];
  const supportLinks = [
    { href: '/contact', label: 'Contact Us' },
    ...(visibility.vip ? [{ href: '/vip', label: 'VIP Portal' }] : []),
    ...(waEnabled && visibility['application-support']
      ? [{ href: '/application-support', label: 'Application Support' }]
      : []),
  ];

  const name = siteName || '';

  const year = new Date().getFullYear();
  const legalDots = legalLinks;

  return (
    <footer className="mt-auto border-t border-line bg-surface-alt text-gray-900">
      <div className="mx-auto max-w-[1760px] px-4 py-10 md:px-10 md:py-12">
        <div className="grid grid-cols-1 gap-x-8 gap-y-8 border-b border-line pb-10 sm:grid-cols-2 lg:grid-cols-4">
          <div>
            {name && <p className="text-lg font-bold text-brand-600">{name}</p>}
            <p className="mt-3 max-w-xs text-sm leading-relaxed text-gray-600">
              Latest government and private job openings in Pakistan, with last dates and how to apply.
            </p>
          </div>

          <div>
            <p className="text-sm font-semibold">Explore</p>
            <ul className="mt-3 flex flex-col gap-3">
              {quickLinks.map((link) => (
                <li key={link.href}>
                  <Link href={link.href} className="text-sm text-gray-700 hover:underline">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {showStudy && (
            <div>
              <p className="text-sm font-semibold">Study resources</p>
              <ul className="mt-3 flex flex-col gap-3">
                {STUDY_RESOURCE_LINKS.map((link) => (
                  <li key={link.href}>
                    <Link href={link.href} className="text-sm text-gray-700 hover:underline">
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          )}

          <div>
            <p className="text-sm font-semibold">Support</p>
            <ul className="mt-3 flex flex-col gap-3">
              {supportLinks.map((link) => (
                <li key={link.href}>
                  <Link href={link.href} className="text-sm text-gray-700 hover:underline">
                    {link.label}
                  </Link>
                </li>
              ))}
              {waLink && (
                <li>
                  <a href={waLink} target="_blank" rel="noopener noreferrer" className="text-sm text-gray-700 hover:underline">
                    Chat on WhatsApp
                  </a>
                </li>
              )}
            </ul>
          </div>
        </div>

        <div className="flex flex-col gap-4 pt-6 md:flex-row md:items-center md:justify-between">
          <p className="flex flex-wrap items-center gap-x-2 gap-y-1 text-sm text-gray-700">
            <span>
              © {year} {name ? `${name}, ` : ''}All rights reserved
            </span>
            {legalDots.map((link) => (
              <span key={link.href} className="flex items-center gap-2">
                <span aria-hidden="true">·</span>
                <Link href={link.href} className="hover:underline">
                  {link.label}
                </Link>
              </span>
            ))}
          </p>

          {socialLinks.length > 0 && (
            <div className="flex flex-wrap items-center gap-3">
              {socialLinks.map(({ field, label, icon: PlatformIcon }) => (
                <a
                  key={field}
                  href={settings[field]}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={label}
                  title={label}
                  className="flex h-9 w-9 items-center justify-center transition hover:scale-110"
                >
                  <PlatformIcon className="h-7 w-7" />
                </a>
              ))}
            </div>
          )}
        </div>
      </div>
    </footer>
  );
}
