import { VerifiedBadgeIcon3D, NotesBookIcon3D, DailyUpdateIcon3D, SupportIcon3D } from './Icons3D';

const ITEMS = [
  {
    label: 'Verified Sources',
    sub: 'All jobs and information from trusted sources',
    Icon: VerifiedBadgeIcon3D,
  },
  {
    label: 'Daily Updates',
    sub: 'New jobs and content added daily',
    Icon: DailyUpdateIcon3D,
  },
  {
    label: 'Free Study Resources',
    sub: 'Notes, tests, papers and much more',
    Icon: NotesBookIcon3D,
  },
  {
    label: 'Easy Applications',
    sub: 'Step-by-step guide for every application',
    Icon: SupportIcon3D,
  },
];

export default function TrustStrip({ siteName }) {
  return (
    <div className="border-b border-gray-100 bg-white">
      <div className="mx-auto max-w-7xl px-4 py-10 md:px-6 md:py-14">
        <h2 className="mb-8 text-center text-xl font-extrabold text-gray-900 md:text-2xl">
          Why Choose {siteName || 'Online Jobs & Study'}?
        </h2>
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 md:grid-cols-4 md:gap-8">
          {ITEMS.map(({ label, sub, Icon }) => (
            <div key={label} className="flex items-start gap-3">
              <span className="relative flex h-11 w-11 flex-shrink-0 items-center justify-center">
                <Icon className="h-full w-full" />
              </span>
              <div className="min-w-0">
                <p className="text-sm font-bold text-gray-900">{label}</p>
                <p className="mt-0.5 text-xs text-gray-500">{sub}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
