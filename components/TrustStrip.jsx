const ITEMS = [
  {
    label: 'Verified Job Postings',
    gradient: 'from-brand-400 to-brand-700',
    icon: (
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
    ),
  },
  {
    label: 'Free Notes & Papers',
    gradient: 'from-accent-500 to-accent-700',
    icon: (
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
    ),
  },
  {
    label: 'Daily Updates',
    gradient: 'from-brand-500 to-accent-600',
    icon: (
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
    ),
  },
  {
    label: 'Application Support',
    gradient: 'from-accent-500 to-brand-600',
    icon: (
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a4 4 0 00-3-3.87M9 20H4v-2a4 4 0 013-3.87m6-1.13a4 4 0 10-4-4 4 4 0 004 4zm6 0a4 4 0 10-4-4" />
    ),
  },
];

export default function TrustStrip() {
  return (
    <div className="border-b border-gray-100 bg-white">
      <div className="mx-auto grid max-w-7xl grid-cols-2 gap-4 px-4 py-6 sm:grid-cols-4 md:gap-6 md:px-6 md:py-8">
        {ITEMS.map((item) => (
          <div key={item.label} className="flex flex-col items-center gap-2.5 text-center sm:flex-row sm:text-left">
            {/* 3D-style badge: gradient fill + inset highlight/shadow bevel +
                a drifting glare layer gives a glossy, raised "app icon" look
                instead of a flat tinted circle. */}
            <span
              className={`relative flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br shadow-[inset_0_1.5px_1.5px_rgba(255,255,255,0.5),inset_0_-3px_5px_rgba(0,0,0,0.28),0_6px_12px_-4px_rgba(0,0,0,0.35)] transition-transform duration-300 hover:-translate-y-0.5 ${item.gradient}`}
            >
              <span className="pointer-events-none absolute inset-x-1 top-1 h-1/2 rounded-full bg-white/25 blur-[3px]" />
              <svg className="relative h-5 w-5 text-white drop-shadow-[0_1px_1px_rgba(0,0,0,0.25)]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                {item.icon}
              </svg>
            </span>
            <span className="text-xs font-semibold text-gray-700 md:text-sm">{item.label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
