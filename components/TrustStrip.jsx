import { VerifiedBadgeIcon3D, NotesBookIcon3D, DailyUpdateIcon3D, SupportIcon3D } from './Icons3D';

const ITEMS = [
  { label: 'Verified Sources', Icon: VerifiedBadgeIcon3D },
  { label: 'Daily Updates', Icon: DailyUpdateIcon3D },
  { label: 'Free Study Resources', Icon: NotesBookIcon3D },
  { label: 'Easy Applications', Icon: SupportIcon3D },
];

export default function TrustStrip() {
  return (
    <div className="border-b border-gray-100 bg-white">
      <div className="mx-auto max-w-7xl px-4 py-8 md:px-6 md:py-10">
        <h2 className="mb-6 text-center text-xl font-extrabold text-gray-900 md:mb-8 md:text-2xl">
          Why Online Jobs &amp; Study?
        </h2>
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-4 md:gap-6">
          {ITEMS.map(({ label, Icon }) => (
            <div key={label} className="flex flex-col items-center gap-2.5 text-center sm:flex-row sm:text-left">
              {/* Full realistic 3D icon — glossy, gradient-shaded, own drop
                  shadow — swapped in for the old flat tinted-circle badge. */}
              <span className="relative flex h-12 w-12 flex-shrink-0 items-center justify-center transition-transform duration-300 hover:-translate-y-0.5">
                <Icon className="h-full w-full" />
              </span>
              <span className="text-xs font-semibold text-gray-700 md:text-sm">{label}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
