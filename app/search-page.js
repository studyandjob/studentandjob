import Header from '@/components/Header';
import NewsTicker from '@/components/NewsTicker';
import Footer from '@/components/Footer';
import PageBanner from '@/components/PageBanner';
import SearchBar from '@/components/SearchBar';
import SearchJobsGrid from '@/components/SearchJobsGrid';
import { getSiteSettings, getJobs, getNotes, getResults, getScholarships } from '@/lib/data';

// Re-fetch fresh data on every search (results/jobs/notes change often) and
// so `searchParams.q` is always read for the current request.
export const dynamic = 'force-dynamic';

export async function generateMetadata({ searchParams }) {
  const settings = await getSiteSettings();
  const q = searchParams?.q?.trim();
  return {
    title: q ? `Search: ${q} — ${settings.site_name || 'Education & Job Portal'}` : `Search — ${settings.site_name || 'Education & Job Portal'}`,
  };
}

function formatDate(dateStr) {
  if (!dateStr) return null;
  return new Date(dateStr).toLocaleDateString('en-US', { day: '2-digit', month: 'short', year: 'numeric' });
}

// Case-insensitive "does this record contain the search term" check across
// a handful of fields, joined into one string so a single .includes() covers
// all of them.
function matches(fields, q) {
  return fields.filter(Boolean).join(' ').toLowerCase().includes(q);
}

export default async function SearchPage({ searchParams }) {
  const q = (searchParams?.q || '').trim();
  const ql = q.toLowerCase();

  const [settings, allJobs, allNotes, allResults, allScholarships] = await Promise.all([
    getSiteSettings(),
    getJobs(),
    getNotes(),
    getResults(),
    getScholarships(),
  ]);

  const jobs = ql
    ? allJobs.filter((j) => j.status !== 'closed' && matches([j.title, j.department, j.city, j.sector, j.job_type], ql))
    : [];
  const notes = ql ? allNotes.filter((n) => matches([n.title, n.category], ql)) : [];
  const results = ql ? allResults.filter((r) => matches([r.title, r.board_or_department], ql)) : [];
  const scholarships = ql ? allScholarships.filter((s) => matches([s.title, s.provider], ql)) : [];

  const totalCount = jobs.length + notes.length + results.length + scholarships.length;

  return (
    <>
      <NewsTicker text={settings.scrolling_news} />
      <Header siteName={settings.site_name} logoUrl={settings.logo_url} />

      <main className="flex-1 bg-gray-50">
        <PageBanner
          title="Search"
          subtitle={q ? `Results for "${q}"` : 'Search jobs, notes, results & scholarships'}
          icon={
            <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M21 21l-4.35-4.35M11 19a8 8 0 100-16 8 8 0 000 16z"
              />
            </svg>
          }
        />

        <div className="mx-auto max-w-6xl px-4 py-8 md:px-6 md:py-10">
          <div className="mx-auto mb-8 max-w-xl">
            <SearchBar />
          </div>

          {!q ? (
            <p className="py-10 text-center text-sm text-gray-500">
              Type something above to search jobs, notes, results and scholarships.
            </p>
          ) : totalCount === 0 ? (
            <div className="rounded-2xl bg-white py-16 text-center shadow-sm ring-1 ring-black/5">
              <p className="text-sm text-gray-500">No matches found for &ldquo;{q}&rdquo;. Try a different keyword.</p>
            </div>
          ) : (
            <div className="flex flex-col gap-10">
              <p className="text-sm text-gray-500">
                {totalCount} result{totalCount === 1 ? '' : 's'} found for &ldquo;{q}&rdquo;
              </p>

              {jobs.length > 0 && (
                <section>
                  <h2 className="mb-4 text-lg font-bold text-gray-900">Jobs ({jobs.length})</h2>
                  <SearchJobsGrid jobs={jobs} />
                </section>
              )}

              {notes.length > 0 && (
                <section>
                  <h2 className="mb-4 text-lg font-bold text-gray-900">Notes &amp; Papers ({notes.length})</h2>
                  <ul className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
                    {notes.map((note) => (
                      <li key={note.id}>
                        <a
                          href={note.file_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex h-full flex-col gap-1.5 rounded-lg border border-gray-100 bg-white p-4 shadow-sm transition hover:border-brand-200 hover:bg-brand-50"
                        >
                          <span className="inline-block w-fit rounded bg-brand-50 px-2 py-0.5 text-[10px] font-semibold uppercase text-brand-600">
                            {note.category || 'General'}
                          </span>
                          <span className="text-sm font-medium text-gray-800">{note.title}</span>
                          <span className="mt-auto text-xs font-semibold text-brand-600">Download PDF →</span>
                        </a>
                      </li>
                    ))}
                  </ul>
                </section>
              )}

              {results.length > 0 && (
                <section>
                  <h2 className="mb-4 text-lg font-bold text-gray-900">Results ({results.length})</h2>
                  <div className="rounded-2xl bg-white p-4 shadow-sm ring-1 ring-black/5 md:p-6">
                    <ul className="divide-y divide-gray-100">
                      {results.map((r) => (
                        <li key={r.id} className="flex flex-col gap-3 py-4 sm:flex-row sm:items-center sm:justify-between">
                          <div className="min-w-0">
                            <p className="text-sm font-semibold text-gray-800 md:text-base">{r.title}</p>
                            <p className="mt-1 text-xs text-gray-500 md:text-sm">
                              {r.board_or_department}
                              {r.result_date && (
                                <span className="ml-2 rounded bg-emerald-50 px-1.5 py-0.5 font-medium text-emerald-700">
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
                  </div>
                </section>
              )}

              {scholarships.length > 0 && (
                <section>
                  <h2 className="mb-4 text-lg font-bold text-gray-900">Scholarships ({scholarships.length})</h2>
                  <div className="rounded-2xl bg-white p-4 shadow-sm ring-1 ring-black/5 md:p-6">
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
                  </div>
                </section>
              )}
            </div>
          )}
        </div>
      </main>

      <Footer siteName={settings.site_name} />
    </>
  );
}
