import Header from '@/components/Header';
import NewsTicker from '@/components/NewsTicker';
import Footer from '@/components/Footer';
import PageBanner from '@/components/PageBanner';
import StatsStrip from '@/components/StatsStrip';
import ContactCards from '@/components/ContactCards';
import RichContent from '@/components/RichContent';
import {
  BriefcaseIcon3D,
  NotesBookIcon3D,
  GraduationCapIcon3D,
  VerifiedBadgeIcon3D,
  ShieldCheckIcon3D,
} from '@/components/Icons3D';
import { getSiteSettings, getPage, getHomeStats, getContacts } from '@/lib/data';

export const dynamic = 'force-dynamic';

export async function generateMetadata() {
  const settings = await getSiteSettings();
  return { title: `About Us — ${settings.site_name || 'Education & Job Portal'}` };
}

// What the platform actually offers — mirrors the four stats below so a
// visitor immediately understands what each number represents.
const OFFERINGS = [
  {
    title: 'Government & Private Jobs',
    body: 'Every open position is verified before it goes live, with a clear deadline, sector and city so nothing slips through.',
    Icon: BriefcaseIcon3D,
  },
  {
    title: 'Free Notes & Past Papers',
    body: 'Class notes, guess papers and past papers for major boards — downloadable at no cost, updated as new material comes in.',
    Icon: NotesBookIcon3D,
  },
  {
    title: 'Scholarships',
    body: 'Local and international scholarships in one list, with the real application deadline so you never miss a cutoff.',
    Icon: GraduationCapIcon3D,
  },
  {
    title: 'Results, As They\u2019re Announced',
    body: 'Exam and test results are posted the same day boards and commissions announce them, with a direct link to check yours.',
    Icon: VerifiedBadgeIcon3D,
  },
];

export default async function AboutUsPage() {
  const [settings, page, stats, contacts] = await Promise.all([
    getSiteSettings(),
    getPage('about-us'),
    getHomeStats(),
    getContacts(),
  ]);

  const siteName = settings.site_name || 'Pak Study And Jobs';
  const story =
    page?.content ||
    `${siteName} started as a simple idea: government job ads, results and study material were scattered across dozens of pages, group chats and outdated blogs. We built one place that stays current — every listing is checked before it's posted, and closed jobs or expired scholarships come down automatically instead of sitting there misleading someone.`;

  return (
    <>
      <NewsTicker text={settings.scrolling_news} />
      <Header siteName={settings.site_name} logoUrl={settings.logo_url} />

      <main className="flex-1 bg-gray-50">
        <PageBanner
          title="About Us"
          subtitle={`Why ${siteName} exists, and what you'll find here.`}
          icon={<ShieldCheckIcon3D className="h-9 w-9" />}
        />

        {/* Story — pulled from Admin \u2192 Pages \u2192 About Us if the admin has
            written one, otherwise a sensible default so the page is never
            empty. */}
        <div className="mx-auto max-w-3xl px-4 pt-10 md:px-6 md:pt-14">
          <div className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-black/5 md:p-10">
            <h2 className="mb-3 font-serif text-lg font-bold text-gray-900 md:text-xl">Our Story</h2>
            <RichContent text={story} />
          </div>
        </div>

        {/* What we offer */}
        <div className="mx-auto max-w-7xl px-4 py-10 md:px-6 md:py-14">
          <div className="mb-6 text-center md:mb-8">
            <h2 className="font-serif text-xl font-bold text-gray-900 md:text-2xl">What You&rsquo;ll Find Here</h2>
            <p className="mt-1 text-sm text-gray-500">Four things, kept current, in one place.</p>
          </div>
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {OFFERINGS.map(({ title, body, Icon }) => (
              <div
                key={title}
                className="flex flex-col gap-3 rounded-2xl border border-gray-100 bg-white p-5 shadow-sm ring-1 ring-black/5 transition hover:-translate-y-0.5 hover:shadow-md"
              >
                <span className="flex h-11 w-11 items-center justify-center">
                  <Icon className="h-full w-full" />
                </span>
                <h3 className="text-sm font-bold text-gray-900 md:text-base">{title}</h3>
                <p className="text-xs leading-relaxed text-gray-600 md:text-sm">{body}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Real, live numbers — same source as the homepage stats strip */}
        <StatsStrip stats={stats} />

        {/* Team — only renders if the admin has added contacts */}
        {contacts.length > 0 && (
          <div className="mx-auto max-w-7xl px-4 py-10 md:px-6 md:py-14">
            <div className="mb-6 text-center md:mb-8">
              <h2 className="font-serif text-xl font-bold text-gray-900 md:text-2xl">Who You&rsquo;re Talking To</h2>
              <p className="mt-1 text-sm text-gray-500">The team behind {siteName}.</p>
            </div>
            <ContactCards contacts={contacts} />
          </div>
        )}
      </main>

      <Footer siteName={settings.site_name} settings={settings} />
    </>
  );
}
