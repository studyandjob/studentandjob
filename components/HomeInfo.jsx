import HomeSection from './HomeSection';

const STEPS = [
  { title: 'Search', text: 'Type a job title, department or city, or choose a category.' },
  { title: 'Read the details', text: 'Check the qualification, last date and how to apply before you spend time on an application.' },
  { title: 'Apply the official way', text: 'Use the apply link or address shown on the job and send your application before the deadline.' },
];

export default function HomeInfo() {
  return (
    <section>
      <div className="mx-auto max-w-7xl px-4 py-10 md:px-6 md:py-12">
        <HomeSection title="How to apply, in three steps">
          <ol className="grid gap-4 md:grid-cols-3 md:gap-6">
            {STEPS.map((s, i) => (
              <li key={s.title} className="rounded-2xl border border-gray-200 bg-white p-6 shadow-card">
                <span className="flex h-11 w-11 items-center justify-center rounded-full bg-brand-600 text-lg font-bold text-white">
                  {i + 1}
                </span>
                <h3 className="mt-4 text-lg font-bold text-gray-900">{s.title}</h3>
                <p className="mt-1.5 text-sm leading-relaxed text-gray-600">{s.text}</p>
              </li>
            ))}
          </ol>
          <p className="mt-6 rounded-2xl bg-gray-50 px-5 py-4 text-sm text-gray-700">
            This website is free to use. We do not sell jobs and we never ask candidates for money. Always confirm the
            details on the employer&apos;s own advertisement.
          </p>
        </HomeSection>
      </div>
    </section>
  );
}
