import Header from '@/components/Header';
import NewsTicker from '@/components/NewsTicker';
import Footer from '@/components/Footer';
import PageBanner from '@/components/PageBanner';
import { GraduationCapIcon3D } from '@/components/Icons3D';
import { getSiteSettings, getScholarships } from '@/lib/data';

export const dynamic = 'force-dynamic';

export async function generateMetadata() {
  const settings = await getSiteSettings();
  return { title: `Scholarships — ${settings.site_name || 'Education & Job Portal'}` };
}

function formatDate(dateStr) {
  if (!dateStr) return null;
  return new Date(dateStr).toLocaleDateString('en-US', { day: '2-digit', month: 'short', year: 'numeric' });
}

export default async function ScholarshipsPage() {
  const [settings, scholarships] = await Promise.all([getSiteSettings(), getScholarships()]);

  return (
    <>
      <NewsTicker text={settings.scrolling_news} />
      <Header siteName={settings.site_name} logoUrl={settings.logo_url} />

      <main className="flex-1 bg-gray-50">
        <PageBanner
          title="Scholarships"
          subtitle="Local and international scholarships for students."
          icon={<GraduationCapIcon3D className="h-9 w-9" />}
        />

        <div className="mx-auto max-w-5xl px-4 py-10 md:px-6 md:py-14">
          <div className="rounded-2xl bg-white p-4 shadow-sm ring-1 ring-black/5 md:p-6">
            <p className="mb-4 border-b border-gray-100 pb-4 text-sm text-gray-500">
              {scholarships.length} scholarship{scholarships.length === 1 ? '' : 's'} available
            </p>

            {scholarships.length === 0 ? (
              <p className="py-10 text-center text-sm text-gray-500">No scholarships posted yet. Check back soon.</p>
            ) : (
              <ul className="divide-y divide-gray-100">
                {scholarships.map((s) => (
                  <li key={s.id} className="flex flex-col gap-3 py-4 sm:flex-row sm:items-center sm:justify-between">
                    <div className="min-w-0">
                      <p className="text-sm font-semibold text-gray-800 md:text-base">{s.title}</p>
                      <p className="mt-1 text-xs text-gray-500 md:text-sm">
                        {s.provider}
                        {s.deadline && (
                          <span className="ml-2 rounded bg-red-50 px-1.5 py-0.5 font-medium text-red-600">
                            Deadline: {formatDate(s.deadline)}
                          </span>
                        )}
                      </p>
                    </div>
                    <a
                      href={s.apply_link || '#'}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex-shrink-0 rounded-md bg-brand-600 px-4 py-2 text-center text-xs font-semibold text-white transition hover:bg-brand-700"
                    >
                      Apply Now
                    </a>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      </main>

      <Footer siteName={settings.site_name} settings={settings} />
    </>
  );
}
