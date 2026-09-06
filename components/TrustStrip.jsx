import Link from 'next/link';
import {
  VerifiedBadgeIcon3D,
  DailyUpdateIcon3D,
  GiftIcon3D,
  SupportIcon3D,
  GraduationCapIcon3D,
  LockShieldIcon3D,
} from './Icons3D';

// Single combined "Why choose us" section — this used to be split across
// two separate strips (TrustStrip + TrustBadgesStrip) that repeated almost
// the same 4 points ("Daily Updates" / "Daily Job Updates", "Free Study
// Resources" / "100% Free Resources") in two different places on the same
// page. Merged into one strong set of 6 distinct points so nothing repeats.
// `href` is optional — items with a real destination page are clickable,
// items that are pure trust claims (no dedicated page) render as plain cards.
const ITEMS = [
  {
    label: 'Verified Sources',
    sub: 'All jobs and information from trusted sources',
    Icon: VerifiedBadgeIcon3D,
    ring: 'bg-emerald-50',
  },
  {
    label: 'Daily Updates',
    sub: 'New jobs and content added every day',
    Icon: DailyUpdateIcon3D,
    ring: 'bg-blue-50',
    href: '/jobs',
  },
  {
    label: '100% Free Resources',
    sub: 'Notes, tests, past papers and much more',
    Icon: GiftIcon3D,
    ring: 'bg-amber-50',
    href: '/study-zone',
  },
  {
    label: 'Easy Applications',
    sub: 'Step-by-step guide for every application',
    Icon: SupportIcon3D,
    ring: 'bg-brand-50',
    href: '/application-support',
  },
  {
    label: 'Built for Students & Job Seekers',
    sub: 'Everything in one place, for every kind of learner',
    Icon: GraduationCapIcon3D,
    ring: 'bg-violet-50',
  },
  {
    label: 'Secure & Reliable',
    sub: 'Your data and privacy are always protected',
    Icon: LockShieldIcon3D,
    ring: 'bg-sky-50',
    href: '/privacy-policy',
  },
];

function Card({ label, sub, Icon, ring }) {
  return (
    <div className="flex h-full flex-col items-center gap-3 rounded-2xl border border-gray-100 bg-white px-4 py-6 text-center shadow-sm ring-1 ring-black/5 transition group-hover:-translate-y-0.5 group-hover:shadow-md">
      <span className={`flex h-14 w-14 flex-shrink-0 items-center justify-center rounded-full ${ring}`}>
        <Icon className="h-8 w-8" />
      </span>
      <div>
        <p className="text-sm font-bold text-gray-900">{label}</p>
        <p className="mt-1 text-xs leading-relaxed text-gray-500">{sub}</p>
      </div>
    </div>
  );
}

export default function TrustStrip({ siteName }) {
  return (
    <div className="border-b border-gray-100 bg-white">
      <div className="mx-auto max-w-7xl px-4 py-10 md:px-6 md:py-14">
        <h2 className="text-center text-xl font-extrabold text-gray-900 md:text-2xl">
          {siteName ? `Why Choose ${siteName}?` : 'Why Choose Us?'}
        </h2>
        <p className="mx-auto mt-2 max-w-xl text-center text-sm text-gray-500">
          Trusted by students and job seekers across Pakistan.
        </p>

        <div className="mt-8 grid grid-cols-2 gap-4 sm:gap-5 md:grid-cols-3">
          {ITEMS.map((item) =>
            item.href ? (
              <Link key={item.label} href={item.href} className="group">
                <Card {...item} />
              </Link>
            ) : (
              <div key={item.label} className="group">
                <Card {...item} />
              </div>
            )
          )}
        </div>
      </div>
    </div>
  );
}
