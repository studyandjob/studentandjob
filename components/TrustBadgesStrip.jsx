const BADGES = [
  { label: '100% Free Resources', emoji: '🎁' },
  { label: 'Trusted by Thousands', emoji: '👥' },
  { label: 'Daily Job Updates', emoji: '🔔' },
  { label: 'Secure & Reliable', emoji: '🔒' },
];

export default function TrustBadgesStrip() {
  return (
    <div className="border-b border-gray-100 bg-white">
      <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-center gap-x-8 gap-y-3 px-4 py-5 md:px-6">
        {BADGES.map(({ label, emoji }) => (
          <span key={label} className="flex items-center gap-2 text-xs font-semibold text-gray-500 md:text-sm">
            <span aria-hidden="true">{emoji}</span>
            {label}
          </span>
        ))}
      </div>
    </div>
  );
}
