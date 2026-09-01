import Link from 'next/link';

// A curated subset of JOB_CATEGORIES/JOB_TYPES — the ones a visitor is most
// likely to scan for on a homepage — each with an emoji for quick visual
// scanning. Links straight into /jobs pre-filtered (see PublicJobsBrowser's
// searchParams handling), so a tap here is a shortcut, not just a label.
const CATEGORIES = [
  { emoji: '🏛️', label: 'Government', href: '/jobs?jobType=Government' },
  { emoji: '🏭', label: 'Private', href: '/jobs?jobType=Private' },
  { emoji: '🏦', label: 'Banking', href: '/jobs?category=Banking%20%2F%20Finance' },
  { emoji: '👨‍🏫', label: 'Teaching', href: '/jobs?category=Teaching%20%2F%20Education' },
  { emoji: '💻', label: 'IT', href: '/jobs?category=Information%20Technology%20(IT)' },
  { emoji: '👮', label: 'Police', href: '/jobs?category=Police' },
  { emoji: '🏥', label: 'Healthcare', href: '/jobs?category=Healthcare%20%2F%20Medical' },
  { emoji: '🎓', label: 'Internships', href: '/jobs?category=Internships' },
];

export default function BrowseCategories() {
  return (
    <section className="border-b border-gray-100 bg-white">
      <div className="mx-auto max-w-7xl px-4 py-10 md:px-6 md:py-14">
        <div className="mb-6 md:mb-8">
          <h2 className="text-xl font-extrabold text-gray-900 md:text-2xl">Browse Jobs by Category</h2>
          <p className="mt-1 text-sm text-gray-500">Jump straight to the type of job you're looking for.</p>
        </div>

        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 md:gap-4">
          {CATEGORIES.map(({ emoji, label, href }) => (
            <Link
              key={label}
              href={href}
              className="flex flex-col items-center gap-2 rounded-2xl border border-gray-100 bg-gray-50 px-3 py-5 text-center transition active:scale-[0.97] hover:-translate-y-0.5 hover:border-brand-200 hover:bg-brand-50/60 hover:shadow-sm"
            >
              <span className="text-3xl">{emoji}</span>
              <span className="text-sm font-semibold text-gray-800">{label}</span>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
