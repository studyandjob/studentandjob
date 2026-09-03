import { GiftIcon3D, GraduationCapIcon3D, DailyUpdateIcon3D, LockShieldIcon3D } from './Icons3D';

// Same glossy 3D icon set used everywhere else on the site, replacing the
// plain emoji characters this strip used to render (emoji rendering varies
// a lot across OS/browser and looked out of place next to the rest of the
// site's custom icon style).
const BADGES = [
  { label: '100% Free Resources', Icon: GiftIcon3D },
  { label: 'Built for Students & Job Seekers', Icon: GraduationCapIcon3D },
  { label: 'Daily Job Updates', Icon: DailyUpdateIcon3D },
  { label: 'Secure & Reliable', Icon: LockShieldIcon3D },
];

export default function TrustBadgesStrip() {
  return (
    <div className="border-b border-gray-100 bg-white">
      <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-center gap-x-8 gap-y-4 px-4 py-6 md:px-6">
        {BADGES.map(({ label, Icon }) => (
          <span key={label} className="flex items-center gap-2 text-xs font-semibold text-gray-600 md:text-sm">
            <Icon className="h-6 w-6 flex-shrink-0 md:h-7 md:w-7" />
            {label}
          </span>
        ))}
      </div>
    </div>
  );
}
