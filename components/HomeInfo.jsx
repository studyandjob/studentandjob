import HomeSection from './HomeSection';

const STEPS = [
  { title: 'Search', text: 'Type a job title, department or city, or choose a category.' },
  { title: 'Read the details', text: 'Check the qualification, last date and how to apply before you spend time on an application.' },
  { title: 'Apply the official way', text: 'Use the apply link or address shown on the job and send your application before the deadline.' },
];

export default function HomeInfo() {
  return (
    <section className="border-t border-gray-200 bg-white">
      <div className="mx-auto max-w-7xl px-4 py-10 md:px-6 md:py-12">
        <HomeSection title="How to apply, in three steps">
          <ol className="mt-5 grid gap-6 md:grid-cols-3">
            {STEPS.map((s, i) => (
              <li key={s.title} className="flex gap-4">
                <span className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-md bg-brand-600 font-serif text-lg font-bold text-white">
                  {i + 1}
                </span>
                <div>
                  <h3 className="font-serif text-base font-bold text-brand-900">{s.title}</h3>
                  <p className="mt-1 text-sm leading-relaxed text-gray-600">{s.text}</p>
                </div>
              </li>
            ))}
          </ol>
          <p className="mt-8 rounded-md border border-accent-100 bg-accent-50 px-4 py-3 text-sm text-gray-700">
            This website is free to use. We do not sell jobs and we never ask candidates for money. Always confirm the
            details on the employer&apos;s own advertisement.
          </p>
        </HomeSection>
      </div>
    </section>
  );
}
