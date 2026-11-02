import HomeIcon from './HomeIcons';
import HomeSection from './HomeSection';

const FAQS = [
  {
    q: 'How do I apply for a government job in Pakistan?',
    a: 'Open the job, read the qualification and last date, then follow the apply method shown: an online link, or an application sent by post to the address in the advertisement. Always keep copies of your CNIC, degrees and photographs ready.',
  },
  {
    q: 'Is Online Jobs free to use?',
    a: 'Yes. Searching and reading jobs on this website is completely free. We never ask candidates for money.',
  },
  {
    q: 'Do you give jobs or take application fees?',
    a: 'No. We are an information website, not an employer or agency. If anyone asks you for money in our name, please do not pay and tell us through the Contact page.',
  },
  {
    q: 'How do I know a job is still open?',
    a: 'Each job shows its last date. Jobs that have passed their last date are removed from the open list, so you only see jobs you can still apply for.',
  },
  {
    q: 'What should I check before I apply?',
    a: 'Check the age limit, required qualification, last date and the official apply link or address. Confirm the details on the employer\'s own advertisement or website, because dates and rules can change.',
  },
];

export default function HomeFaq() {
  const schema = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: FAQS.map((f) => ({
      '@type': 'Question',
      name: f.q,
      acceptedAnswer: { '@type': 'Answer', text: f.a },
    })),
  };

  return (
    <section className="border-t border-gray-200">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }} />
      <div className="mx-auto max-w-7xl px-4 py-10 md:px-6 md:py-12">
        <HomeSection title="Frequently asked questions">
          <div className="grid items-start gap-3 md:grid-cols-2">
            {FAQS.map((f) => (
              <details key={f.q} className="group rounded-2xl border border-gray-200 bg-white transition hover:shadow-card">
                <summary className="flex min-h-[56px] cursor-pointer list-none items-center justify-between gap-3 px-5 py-3.5 text-sm font-semibold text-gray-900 md:text-base [&::-webkit-details-marker]:hidden">
                  {f.q}
                  <HomeIcon name="chevron" className="h-5 w-5 flex-shrink-0 text-gray-700 transition group-open:rotate-180" />
                </summary>
                <p className="px-5 pb-5 text-sm leading-relaxed text-gray-600">{f.a}</p>
              </details>
            ))}
          </div>
        </HomeSection>
      </div>
    </section>
  );
}
