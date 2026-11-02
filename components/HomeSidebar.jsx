import Link from 'next/link';
import HomeSection from './HomeSection';
import ChannelCta from './ChannelCta';
import AdSlot from './AdSlot';

// Each link uses a filter the jobs page already understands (?jobType=...) or
// a text search (?q=...), which also matches city and sector.
const CATEGORIES = [
  { label: 'Government jobs', href: '/jobs?jobType=Government' },
  { label: 'Private jobs', href: '/jobs?jobType=Private' },
  { label: 'Bank jobs', href: '/jobs?q=bank' },
  { label: 'Teaching jobs', href: '/jobs?q=teacher' },
  { label: 'Police and security', href: '/jobs?q=police' },
  { label: 'Punjab', href: '/jobs?q=Punjab' },
  { label: 'Sindh', href: '/jobs?q=Sindh' },
  { label: 'Khyber Pakhtunkhwa', href: '/jobs?q=Khyber' },
  { label: 'Balochistan', href: '/jobs?q=Balochistan' },
  { label: 'Islamabad', href: '/jobs?q=Islamabad' },
];

const CHECKLIST = [
  'Read the age limit and the required qualification.',
  'Note the last date and the time zone of the deadline.',
  'Keep your CNIC, degrees and photographs ready.',
  'Apply only through the official link or address.',
  'Never pay anyone to get a job.',
];

export default function HomeSidebar({ settings = {} }) {
  return (
    <aside className="space-y-6" aria-label="Sidebar">
      <HomeSection title="Browse by category">
        <ul className="overflow-hidden rounded-lg border border-gray-200 bg-white">
          {CATEGORIES.map((c, i) => (
            <li key={c.label} className={i > 0 ? 'border-t border-gray-100' : ''}>
              <Link
                href={c.href}
                className="flex min-h-[44px] items-center justify-between px-4 py-2.5 text-sm font-medium text-gray-800 transition hover:bg-brand-50 hover:text-brand-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-brand-500"
              >
                {c.label}
                <span aria-hidden="true" className="text-accent-600">
                  ›
                </span>
              </Link>
            </li>
          ))}
        </ul>
      </HomeSection>

      <HomeSection title="Before you apply">
        <ul className="space-y-2.5 rounded-lg border border-gray-200 bg-white p-4 text-sm text-gray-700">
          {CHECKLIST.map((t) => (
            <li key={t} className="flex gap-2.5">
              <span aria-hidden="true" className="mt-1 h-2 w-2 flex-shrink-0 rounded-sm bg-accent-500" />
              <span className="leading-snug">{t}</span>
            </li>
          ))}
        </ul>
      </HomeSection>

      <ChannelCta settings={settings} className="!flex-col !items-start !text-left" />
      <AdSlot html={settings.ad_code_list} />
    </aside>
  );
}
