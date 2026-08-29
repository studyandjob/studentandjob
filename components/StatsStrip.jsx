import { BriefcaseIcon3D, NotesBookIcon3D, GraduationCapIcon3D, VerifiedBadgeIcon3D } from './Icons3D';

function formatCount(n) {
  if (n >= 1000) return `${(n / 1000).toFixed(n % 1000 === 0 ? 0 : 1)}k+`;
  return n > 0 ? `${n}+` : '0';
}

export default function StatsStrip({ stats }) {
  const items = [
    { label: 'Jobs Posted', value: stats.jobs, Icon: BriefcaseIcon3D },
    { label: 'Notes & Papers', value: stats.notes, Icon: NotesBookIcon3D },
    { label: 'Scholarships Listed', value: stats.scholarships, Icon: GraduationCapIcon3D },
    { label: 'Results Announced', value: stats.results, Icon: VerifiedBadgeIcon3D },
  ];

  return (
    <div className="border-y border-gray-100 bg-white">
      <div className="mx-auto grid max-w-7xl grid-cols-2 gap-6 px-4 py-10 sm:grid-cols-4 md:gap-8 md:px-6 md:py-14">
        {items.map(({ label, value, Icon }) => (
          <div key={label} className="flex flex-col items-center gap-2 text-center">
            <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-brand-50 text-brand-600">
              <Icon className="h-6 w-6" />
            </span>
            <span className="font-serif text-2xl font-bold text-brand-700 md:text-3xl">{formatCount(value)}</span>
            <span className="text-xs font-medium text-gray-500 md:text-sm">{label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
