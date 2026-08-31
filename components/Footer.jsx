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

const LEGAL_LINKS = [
  { href: '/about-us', label: 'About Us' },
  { href: '/privacy-policy', label: 'Privacy Policy' },
  { href: '/terms-and-conditions', label: 'Terms & Conditions' },
  { href: '/disclaimer', label: 'Disclaimer' },
  { href: '/contact', label: 'Contact' },
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
  const legalLinks = settings?.wa_service_enabled
    ? [{ href: '/application-support', label: 'Application Support' }, ...LEGAL_LINKS]
    : LEGAL_LINKS;

  return (
    <footer className="mt-auto border-t border-brand-100 bg-white">
      <div className="mx-auto max-w-7xl px-4 py-10 md:px-6">
        <div className="flex flex-col items-center justify-between gap-6 md:flex-row">
          <div className="text-center md:text-left">
            <p className="font-serif text-base font-bold text-gray-900">{siteName || 'Pak Study And Jobs'}</p>
            <p className="mt-1 text-sm text-gray-500">
              © {new Date().getFullYear()} {siteName || 'Pak Study And Jobs'}. All rights reserved.
            </p>
          </div>

          <nav className="flex flex-wrap justify-center gap-x-5 gap-y-2">
            {legalLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="rounded text-sm font-medium text-gray-600 transition hover:text-brand-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500"
              >
                {link.label}
              </Link>
            ))}
          </nav>
        </div>

        {socialLinks.length > 0 && (
          <div className="mt-8 flex flex-wrap items-center justify-center gap-3 border-t border-brand-100 pt-6">
            {socialLinks.map(({ field, label, icon: PlatformIcon }) => (
              <a
                key={field}
                href={settings[field]}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={label}
                title={label}
                className="rounded-full transition hover:-translate-y-0.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500"
              >
                <PlatformIcon className="h-9 w-9" />
              </a>
            ))}
          </div>
        )}
      </div>
    </footer>
  );
}
