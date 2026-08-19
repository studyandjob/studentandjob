import Header from '@/components/Header';
import NewsTicker from '@/components/NewsTicker';
import Footer from '@/components/Footer';
import PageBanner from '@/components/PageBanner';
import { getSiteSettings, getJobs } from '@/lib/data';

export const dynamic = 'force-dynamic';

export async function generateMetadata() {
  const settings = await getSiteSettings();
  return { title: `Jobs — ${settings.site_name || 'Education & Job Portal'}` };
}

function formatDate(dateStr) {
  if (!dateStr) return null;
  return new Date(dateStr).toLocaleDateString('en-US', { day: '2-digit', month: 'short', year: 'numeric' });
}

export default async function JobsPage() {
  const [settings, jobs] = await Promise.all([getSiteSettings(), getJobs()]);

  return (
    <>
      <NewsTicker text={settings.scrolling_news} />
      <Header siteName={settings.site_name} logoUrl={settings.logo_url} />

      <main className="flex-1 bg-gray-50">
        <PageBanner
          title="Government & Private Jobs"
          subtitle="Browse the latest job postings, updated regularly."
          icon={
            <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
            </svg>
          }
        />

        <div className="mx-auto max-w-5xl px-4 py-10 md:px-6 md:py-14">
          <div className="rounded-2xl bg-white p-4 shadow-sm ring-1 ring-black/5 md:p-6">
            <p className="mb-4 border-b border-gray-100 pb-4 text-sm text-gray-500">
              {jobs.length} job{jobs.length === 1 ? '' : 's'} currently listed
            </p>

            {jobs.length === 0 ? (
              <p className="py-10 text-center text-sm text-gray-500">No jobs posted yet. Check back soon.</p>
            ) : (
              <ul className="divide-y divide-gray-100">
                {jobs.map((job) => (
                  <li key={job.id} className="flex flex-col gap-3 py-4 sm:flex-row sm:items-center sm:justify-between">
                    <div className="min-w-0">
                      <p className="text-sm font-semibold text-gray-800 md:text-base">{job.title}</p>
                      <p className="mt-1 text-xs text-gray-500 md:text-sm">
                        {job.department}
                        {job.last_date && (
                          <span className="ml-2 rounded bg-red-50 px-1.5 py-0.5 font-medium text-red-600">
                            Last date: {formatDate(job.last_date)}
                          </span>
                        )}
                      </p>
                    </div>
                    <a
                      href={job.apply_link || '#'}
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

      <Footer siteName={settings.site_name} />
    </>
  );
}
