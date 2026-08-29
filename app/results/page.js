import Header from '@/components/Header';
import NewsTicker from '@/components/NewsTicker';
import Footer from '@/components/Footer';
import PageBanner from '@/components/PageBanner';
import { VerifiedBadgeIcon3D } from '@/components/Icons3D';
import { getSiteSettings, getResults } from '@/lib/data';

export const dynamic = 'force-dynamic';

export async function generateMetadata() {
  const settings = await getSiteSettings();
  return { title: `Results — ${settings.site_name || 'Education & Job Portal'}` };
}

function formatDate(dateStr) {
  if (!dateStr) return null;
  return new Date(dateStr).toLocaleDateString('en-US', { day: '2-digit', month: 'short', year: 'numeric' });
}

export default async function ResultsPage() {
  const [settings, results] = await Promise.all([getSiteSettings(), getResults()]);

  return (
    <>
      <NewsTicker text={settings.scrolling_news} />
      <Header siteName={settings.site_name} logoUrl={settings.logo_url} />

      <main className="flex-1 bg-gray-50">
        <PageBanner
          title="Results"
          subtitle="Latest exam and test results — check your result online."
          icon={<VerifiedBadgeIcon3D className="h-9 w-9" />}
        />

        <div className="mx-auto max-w-5xl px-4 py-10 md:px-6 md:py-14">
          <div className="rounded-2xl bg-white p-4 shadow-sm ring-1 ring-black/5 md:p-6">
            <p className="mb-4 border-b border-gray-100 pb-4 text-sm text-gray-500">
              {results.length} result{results.length === 1 ? '' : 's'} announced
            </p>

            {results.length === 0 ? (
              <p className="py-10 text-center text-sm text-gray-500">No results announced yet. Check back soon.</p>
            ) : (
              <ul className="divide-y divide-gray-100">
                {results.map((r) => (
                  <li key={r.id} className="flex flex-col gap-3 py-4 sm:flex-row sm:items-center sm:justify-between">
                    <div className="min-w-0">
                      <p className="text-sm font-semibold text-gray-800 md:text-base">{r.title}</p>
                      <p className="mt-1 text-xs text-gray-500 md:text-sm">
                        {r.board_or_department}
                        {r.result_date && (
                          <span className="ml-2 rounded bg-brand-50 px-1.5 py-0.5 font-medium text-brand-700">
                            Announced: {formatDate(r.result_date)}
                          </span>
                        )}
                      </p>
                    </div>
                    <a
                      href={r.result_link || '#'}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex-shrink-0 rounded-md bg-brand-600 px-4 py-2 text-center text-xs font-semibold text-white transition hover:bg-brand-700"
                    >
                      Check Result
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
