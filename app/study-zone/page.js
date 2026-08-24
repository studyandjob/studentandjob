import Link from 'next/link';
import Header from '@/components/Header';
import NewsTicker from '@/components/NewsTicker';
import Footer from '@/components/Footer';
import PageBanner from '@/components/PageBanner';
import { GraduationCapIcon3D, DocumentIcon3D, NotesBookIcon3D } from '@/components/Icons3D';
import { getSiteSettings } from '@/lib/data';

export const dynamic = 'force-dynamic';

export async function generateMetadata() {
  const settings = await getSiteSettings();
  return { title: `Study Zone — ${settings.site_name || 'Education & Job Portal'}` };
}

const CARDS = [
  {
    href: '/study-zone/test',
    icon: GraduationCapIcon3D,
    title: 'Start Online Test / Papers',
    description: 'Pick your class and subject and take a randomized, timed test — MCQs, one question at a time, just like FPSC/PPSC.',
    cta: 'Start a Test',
  },
  {
    href: '/study-zone/materials?type=guess_paper',
    icon: DocumentIcon3D,
    title: 'Guess Papers & Suggestions',
    description: 'Class-wise and subject-wise important questions and exam suggestions, ready to view or download.',
    cta: 'View Guess Papers',
  },
  {
    href: '/study-zone/materials?type=old_paper',
    icon: NotesBookIcon3D,
    title: 'Previous / Old Papers',
    description: 'Browse past exam papers by class, so you know exactly what to expect.',
    cta: 'View Old Papers',
  },
];

export default async function StudyZonePage() {
  const settings = await getSiteSettings();

  return (
    <>
      <NewsTicker text={settings.scrolling_news} />
      <Header siteName={settings.site_name} logoUrl={settings.logo_url} />

      <main className="flex-1 bg-gray-50">
        <PageBanner
          title="Study Zone"
          subtitle="AI-powered practice tests, guess papers and old papers — all in one place."
          icon={<GraduationCapIcon3D className="h-9 w-9" />}
        />

        <div className="mx-auto max-w-6xl px-4 py-10 md:px-6 md:py-14">
          <div className="grid grid-cols-1 gap-5 md:grid-cols-3">
            {CARDS.map((card) => {
              const Icon = card.icon;
              return (
                <Link
                  key={card.href}
                  href={card.href}
                  className="group flex flex-col gap-3 rounded-2xl bg-white p-6 shadow-sm ring-1 ring-black/5 transition hover:-translate-y-1 hover:shadow-md"
                >
                  <span className="flex h-14 w-14 items-center justify-center rounded-xl bg-brand-50">
                    <Icon className="h-9 w-9" />
                  </span>
                  <h2 className="text-lg font-bold text-gray-900">{card.title}</h2>
                  <p className="flex-1 text-sm text-gray-500">{card.description}</p>
                  <span className="inline-flex w-fit items-center gap-1 text-sm font-semibold text-brand-600 group-hover:underline">
                    {card.cta} →
                  </span>
                </Link>
              );
            })}
          </div>
        </div>
      </main>

      <Footer siteName={settings.site_name} settings={settings} />
    </>
  );
}
