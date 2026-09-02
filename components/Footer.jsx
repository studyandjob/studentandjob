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
  { href: '/study-zone', label: 'Study Zone' },
  { href: '/results', label: 'Results' },
];

const IMPORTANT_LINKS = [
  { href: '/scholarships', label: 'Scholarships' },
  { href: '/contact', label: 'Contact Us' },
  { href: '/vip', label: 'VIP Portal' },
  { href: '/privacy-policy', label: 'Privacy Policy' },
];

const LEGAL_LINKS = [
  { href: '/about-us', label: 'About Us' },
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
  const importantLinks = settings?.wa_service_enabled
    ? [...IMPORTANT_LINKS, { href: '/application-support', label: 'Application Support' }]
    : IMPORTANT_LINKS;
  const name = siteName || '';

  return (
    <footer className="mt-auto bg-gray-900 text-gray-300">
      <div className="mx-auto max-w-7xl px-4 py-12 md:px-6">
        <div className="grid grid-cols-1 gap-10 sm:grid-cols-2 md:grid-cols-4">
          <div>
            {name && <p className="font-serif text-lg font-bold text-white">{name}</p>}
            <p className="mt-3 max-w-xs text-sm leading-relaxed text-gray-400">
              Your trusted platform for jobs, scholarships, results and study resources.
            </p>
          </div>

          <div>
            <p className="text-sm font-bold text-white">Quick Links</p>
            <ul className="mt-3 flex flex-col gap-2.5">
              {QUICK_LINKS.map((link) => (
                <li key={link.href}>
                  <Link href={link.href} className="text-sm text-gray-400 transition hover:text-white">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <p className="text-sm font-bold text-white">Important Links</p>
            <ul className="mt-3 flex flex-col gap-2.5">
              {importantLinks.map((link) => (
                <li key={link.href}>
                  <Link href={link.href} className="text-sm text-gray-400 transition hover:text-white">
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
                    className="flex h-9 w-9 items-center justify-center rounded-full bg-gray-800 transition hover:-translate-y-0.5 hover:bg-gray-700"
                  >
                    <PlatformIcon className="h-5 w-5" />
                  </a>
                ))}
              </div>
            ) : (
              <p className="mt-3 text-sm text-gray-500">Coming soon</p>
            )}

            <ul className="mt-5 flex flex-col gap-2.5">
              {LEGAL_LINKS.map((link) => (
                <li key={link.href}>
                  <Link href={link.href} className="text-sm text-gray-400 transition hover:text-white">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>

      <div className="border-t border-gray-800">
        <p className="mx-auto max-w-7xl px-4 py-5 text-center text-xs text-gray-500 md:px-6">
          © {new Date().getFullYear()} {name ? `${name}. ` : ''}All Rights Reserved.
        </p>
      </div>
    </footer>
  );
}
