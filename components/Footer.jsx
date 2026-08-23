import Link from 'next/link';

const LEGAL_LINKS = [
  { href: '/about-us', label: 'About Us' },
  { href: '/privacy-policy', label: 'Privacy Policy' },
  { href: '/terms-and-conditions', label: 'Terms & Conditions' },
  { href: '/disclaimer', label: 'Disclaimer' },
  { href: '/contact', label: 'Contact' },
];

export default function Footer({ siteName }) {
  return (
    <footer className="mt-auto bg-gray-800">
      <div className="mx-auto max-w-7xl px-4 py-10 md:px-6">
        <div className="flex flex-col items-center justify-between gap-6 md:flex-row">
          <div className="text-center md:text-left">
            <p className="text-base font-bold text-white">{siteName || 'Pak Study And Jobs'}</p>
            <p className="mt-1 text-sm text-gray-400">
              © {new Date().getFullYear()} {siteName || 'Pak Study And Jobs'}. All rights reserved.
            </p>
          </div>
          <nav className="flex flex-wrap justify-center gap-x-5 gap-y-2">
            {LEGAL_LINKS.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="text-sm font-medium text-gray-300 transition hover:text-white"
              >
                {link.label}
              </Link>
            ))}
          </nav>
        </div>
      </div>
    </footer>
  );
}
