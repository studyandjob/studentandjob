import { GiftIcon3D, GraduationCapIcon3D, DailyUpdateIcon3D, LockShieldIcon3D } from './Icons3D';

// Same glossy 3D icon set used everywhere else on the site. Each badge gets
// its own tinted circle background (matching the icon's own color story) so
// the icon has depth and a focal point, instead of floating bare in a thin
// text row.
const BADGES = [
  { label: '100% Free Resources', Icon: GiftIcon3D, ring: 'bg-emerald-50' },
  { label: 'Built for Students & Job Seekers', Icon: GraduationCapIcon3D, ring: 'bg-brand-50' },
  { label: 'Daily Job Updates', Icon: DailyUpdateIcon3D, ring: 'bg-amber-50' },
  { label: 'Secure & Reliable', Icon: LockShieldIcon3D, ring: 'bg-blue-50' },
];

export default function TrustBadgesStrip() {
  return (
    <div className="border-b border-gray-100 bg-white">
      <div className="mx-auto max-w-7xl px-4 py-10 md:px-6 md:py-14">
        <div className="grid grid-cols-2 gap-4 sm:gap-5 md:grid-cols-4">
          {BADGES.map(({ label, Icon, ring }) => (
            <div
              key={label}
              className="flex flex-col items-center gap-3 rounded-2xl border border-gray-100 bg-white px-4 py-6 text-center shadow-sm ring-1 ring-black/5 transition hover:-translate-y-0.5 hover:shadow-md"
            >
              <span className={`flex h-14 w-14 flex-shrink-0 items-center justify-center rounded-full ${ring}`}>
                <Icon className="h-8 w-8" />
              </span>
              <p className="text-xs font-bold leading-snug text-gray-800 md:text-sm">{label}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
