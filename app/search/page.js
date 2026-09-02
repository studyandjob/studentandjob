import Header from '@/components/Header';
import NewsTicker from '@/components/NewsTicker';
import Footer from '@/components/Footer';
import PageBanner from '@/components/PageBanner';
import SearchBar from '@/components/SearchBar';
import SearchJobsGrid from '@/components/SearchJobsGrid';
import { SearchIcon3D } from '@/components/Icons3D';
import {
  getSiteSettings,
  getJobs,
  getNotes,
  getResults,
  getScholarships,
  getStudyMaterials,
  getStudyClasses,
  getStudySubjects,
} from '@/lib/data';
import { isJobOpen, isScholarshipOpen } from '@/lib/jobStatus';
import { matchesQuery } from '@/lib/searchMatch';

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

// Category filter chips — reflected in the `type` query param. "All" (no
// param) shows every section that has matches, same as before this was
// added; picking one just scrolls the same results down to that section
// (all sections are still computed, nothing re-fetched) so this never
// breaks the underlying search.
const CATEGORY_FILTERS = [
  { key: 'all', label: 'All' },
  { key: 'jobs', label: 'Jobs' },
  { key: 'scholarships', label: 'Scholarships' },
  { key: 'notes', label: 'Notes' },
  { key: 'papers', label: 'Past Papers' },
  { key: 'results', label: 'Results' },
];

function formatDate(dateStr) {
  if (!dateStr) return null;
  return new Date(dateStr).toLocaleDateString('en-US', { day: '2-digit', month: 'short', year: 'numeric' });
}

export default async function SearchPage({ searchParams }) {
  const q = (searchParams?.q || '').trim();
  const ql = q.toLowerCase();
  const activeFilter = CATEGORY_FILTERS.some((f) => f.key === searchParams?.type) ? searchParams.type : 'all';

  const [settings, allJobs, allNotes, allResults, allScholarships, allMaterials, classes, subjects] = await Promise.all([
    getSiteSettings(),
    getJobs(),
    getNotes(),
    getResults(),
    getScholarships(),
    getStudyMaterials(),
    getStudyClasses(),
    getStudySubjects(),
  ]);

  function subjectName(id) {
    return subjects.find((s) => s.id === id)?.subject_name;
  }
  function className(id) {
    return classes.find((c) => c.id === id)?.class_name;
  }

  const jobs = ql
    ? allJobs.filter(
        (j) => isJobOpen(j) && matchesQuery([j.title, j.department, j.city, j.sector, j.job_type, j.category], ql)
      )
    : [];
  const notes = ql ? allNotes.filter((n) => matchesQuery([n.title, n.category], ql)) : [];
  const results = ql ? allResults.filter((r) => matchesQuery([r.title, r.board_or_department], ql)) : [];
  const scholarships = ql ? allScholarships.filter((s) => isScholarshipOpen(s) && matchesQuery([s.title, s.provider], ql)) : [];
  // Past Papers / Guess Papers (study_materials) — previously not part of
  // global search at all, even though the homepage search box explicitly
  // promises "past papers" and "study resources".
  const papers = ql
    ? allMaterials.filter((m) =>
        matchesQuery([m.title, subjectName(m.subject_id), className(m.class_id), String(m.year || '')], ql)
      )
    : [];

  const totalCount = jobs.length + notes.length + results.length + scholarships.length + papers.length;

  const sectionVisible = (key) => activeFilter === 'all' || activeFilter === key;

  return (
    <>
      <NewsTicker text={settings.scrolling_news} />
      <Header siteName={settings.site_name} logoUrl={settings.logo_url} />

      <main className="flex-1 bg-gray-50">
        <PageBanner
          title="Search"
          subtitle={q ? `Results for "${q}"` : 'Search jobs, notes, results & scholarships'}
          icon={<SearchIcon3D className="h-9 w-9" />}
        />

        <div className="mx-auto max-w-6xl px-4 py-8 md:px-6 md:py-10">
          <div className="mx-auto mb-8 max-w-xl">
            <SearchBar showCategoryLinks={false} />
          </div>

          {!q ? (
            <p className="py-10 text-center text-sm text-gray-500">
              Type something above to search jobs, scholarships, notes, past papers and results.
            </p>
          ) : totalCount === 0 ? (
            <div className="rounded-2xl bg-white py-16 text-center shadow-sm ring-1 ring-black/5">
              <p className="text-sm text-gray-500">No matches found for &ldquo;{q}&rdquo;. Try a different keyword.</p>
            </div>
          ) : (
            <div className="flex flex-col gap-6">
              <div className="flex flex-wrap items-center gap-2">
                {CATEGORY_FILTERS.map((f) => (
                  <a
                    key={f.key}
                    href={`/search?q=${encodeURIComponent(q)}${f.key === 'all' ? '' : `&type=${f.key}`}`}
                    className={`rounded-full px-3.5 py-1.5 text-xs font-semibold transition ${
                      activeFilter === f.key
                        ? 'bg-brand-600 text-white'
                        : 'bg-white text-gray-600 ring-1 ring-inset ring-gray-200 hover:bg-brand-50 hover:text-brand-700'
                    }`}
                  >
                    {f.label}
                  </a>
                ))}
              </div>

              <p className="text-sm text-gray-500">
                {totalCount} result{totalCount === 1 ? '' : 's'} found for &ldquo;{q}&rdquo;
              </p>

              {jobs.length > 0 && sectionVisible('jobs') && (
                <section>
                  <h2 className="mb-4 text-lg font-bold text-gray-900">Jobs ({jobs.length})</h2>
                  <SearchJobsGrid jobs={jobs} />
                </section>
              )}

              {papers.length > 0 && sectionVisible('papers') && (
                <section>
                  <h2 className="mb-4 text-lg font-bold text-gray-900">Past &amp; Guess Papers ({papers.length})</h2>
                  <ul className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
                    {papers.map((m) => (
                      <li key={m.id}>
                        <a
                          href={m.file_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex h-full flex-col gap-1.5 rounded-lg border border-gray-100 bg-white p-4 shadow-sm transition hover:border-brand-200 hover:bg-brand-50"
                        >
                          <span className="inline-block w-fit rounded bg-brand-50 px-2 py-0.5 text-xs font-semibold uppercase text-brand-600">
                            {m.material_type === 'old_paper' ? 'Past Paper' : 'Guess Paper'}
                          </span>
                          <span className="text-sm font-medium text-gray-800">{m.title}</span>
                          {(className(m.class_id) || subjectName(m.subject_id)) && (
                            <span className="text-xs text-gray-500">
                              {[className(m.class_id), subjectName(m.subject_id), m.year].filter(Boolean).join(' · ')}
                            </span>
                          )}
                          <span className="mt-auto text-xs font-semibold text-brand-600">Download PDF →</span>
                        </a>
                      </li>
                    ))}
                  </ul>
                </section>
              )}

              {notes.length > 0 && sectionVisible('notes') && (
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
                          <span className="inline-block w-fit rounded bg-brand-50 px-2 py-0.5 text-xs font-semibold uppercase text-brand-600">
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

              {results.length > 0 && sectionVisible('results') && (
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
                  </div>
                </section>
              )}

              {scholarships.length > 0 && sectionVisible('scholarships') && (
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

      <Footer siteName={settings.site_name} settings={settings} />
    </>
  );
}
