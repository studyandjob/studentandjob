import HomeIcon from './HomeIcons';

const STEPS = [
  { icon: 'search', title: '1. Search', text: 'Type a job title, department or city, or pick a category to see matching jobs.' },
  { icon: 'document', title: '2. Read the details', text: 'Check the qualification, last date and how to apply before you spend time on an application.' },
  { icon: 'check', title: '3. Apply the right way', text: 'Use the official apply link or address shown on the job and send your application before the deadline.' },
];

const WHY = [
  { icon: 'gift', title: 'Free for everyone', text: 'You never pay to see jobs or to use this website.' },
  { icon: 'clock', title: 'Last dates highlighted', text: 'Jobs closing today or tomorrow are shown first so you do not miss them.' },
  { icon: 'shield', title: 'No job-selling', text: 'We do not sell jobs or take money from candidates. Always apply through the official source.' },
];

export default function HomeInfo() {
  return (
    <>
      <section className="bg-gray-50">
        <div className="mx-auto max-w-7xl px-4 py-10 md:px-6 md:py-14">
          <div className="mb-8 text-center">
            <h2 className="font-serif text-2xl font-bold text-gray-900 md:text-3xl">How It Works</h2>
            <p className="mt-2 text-sm text-gray-600 md:text-base">Three simple steps from searching to applying.</p>
          </div>
          <ol className="grid gap-4 md:grid-cols-3 md:gap-6">
            {STEPS.map((s) => (
              <li key={s.title} className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-black/5">
                <span className="flex h-12 w-12 items-center justify-center rounded-xl bg-brand-600 text-white">
                  <HomeIcon name={s.icon} className="h-6 w-6" />
                </span>
                <h3 className="mt-4 text-base font-bold text-gray-900">{s.title}</h3>
                <p className="mt-1.5 text-sm leading-relaxed text-gray-600">{s.text}</p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      <section className="bg-white">
        <div className="mx-auto max-w-7xl px-4 py-10 md:px-6 md:py-14">
          <div className="mb-8 text-center">
            <h2 className="font-serif text-2xl font-bold text-gray-900 md:text-3xl">Why Use Online Jobs</h2>
          </div>
          <ul className="grid gap-4 md:grid-cols-3 md:gap-6">
            {WHY.map((w) => (
              <li key={w.title} className="flex gap-4 rounded-2xl border border-brand-100 bg-brand-50/60 p-5">
                <span className="flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-xl bg-white text-brand-700 shadow-sm">
                  <HomeIcon name={w.icon} className="h-6 w-6" />
                </span>
                <div>
                  <h3 className="text-base font-bold text-gray-900">{w.title}</h3>
                  <p className="mt-1 text-sm leading-relaxed text-gray-600">{w.text}</p>
                </div>
              </li>
            ))}
          </ul>
        </div>
      </section>
    </>
  );
}
