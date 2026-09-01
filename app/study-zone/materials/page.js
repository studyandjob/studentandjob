import Link from 'next/link';
import Header from '@/components/Header';
import NewsTicker from '@/components/NewsTicker';
import Footer from '@/components/Footer';
import PageBanner from '@/components/PageBanner';
import { DocumentIcon3D, NotesBookIcon3D } from '@/components/Icons3D';
import { getSiteSettings, getStudyClasses, getStudySubjects, getStudyMaterials } from '@/lib/data';

export const dynamic = 'force-dynamic';

const TYPE_META = {
  guess_paper: { title: 'Guess Papers & Suggestions', icon: DocumentIcon3D },
  old_paper: { title: 'Previous / Old Papers', icon: NotesBookIcon3D },
};

export async function generateMetadata({ searchParams }) {
  const settings = await getSiteSettings();
  const type = searchParams?.type === 'old_paper' ? 'old_paper' : 'guess_paper';
  return { title: `${TYPE_META[type].title} — ${settings.site_name || 'Education & Job Portal'}` };
}

export default async function StudyMaterialsPage({ searchParams }) {
  const type = searchParams?.type === 'old_paper' ? 'old_paper' : 'guess_paper';
  const classId = searchParams?.class || '';
  const meta = TYPE_META[type];
  const Icon = meta.icon;

  const [settings, classes, subjects, materials] = await Promise.all([
    getSiteSettings(),
    getStudyClasses(),
    getStudySubjects(),
    getStudyMaterials(type, classId || undefined),
  ]);

  function subjectName(id) {
    return subjects.find((s) => s.id === id)?.subject_name;
  }
  function classQuery(cid) {
    const params = new URLSearchParams({ type });
    if (cid) params.set('class', cid);
    return `/study-zone/materials?${params.toString()}`;
  }

  return (
    <>
      <NewsTicker text={settings.scrolling_news} />
      <Header siteName={settings.site_name} logoUrl={settings.logo_url} />

      <main className="flex-1 bg-gray-50">
        <PageBanner title={meta.title} subtitle="Class-wise and subject-wise, ready to view or download." icon={<Icon className="h-9 w-9" />} />

        <div className="mx-auto max-w-5xl px-4 py-10 md:px-6 md:py-14">
          {/* Type switch */}
          <div className="mb-5 flex gap-2">
            <Link
              href={`/study-zone/materials?type=guess_paper${classId ? `&class=${classId}` : ''}`}
              className={`rounded-full px-4 py-2 text-sm font-semibold transition ${
                type === 'guess_paper' ? 'bg-brand-600 text-white' : 'bg-white text-gray-600 ring-1 ring-black/5'
              }`}
            >
              Guess Papers
            </Link>
            <Link
              href={`/study-zone/materials?type=old_paper${classId ? `&class=${classId}` : ''}`}
              className={`rounded-full px-4 py-2 text-sm font-semibold transition ${
                type === 'old_paper' ? 'bg-brand-600 text-white' : 'bg-white text-gray-600 ring-1 ring-black/5'
              }`}
            >
              Old Papers
            </Link>
          </div>

          {/* Class filter */}
          {classes.length > 0 && (
            <div className="mb-6 flex flex-wrap gap-2">
              <Link
                href={classQuery('')}
                className={`rounded-full px-3.5 py-1.5 text-xs font-semibold transition ${
                  !classId ? 'bg-gray-800 text-white' : 'bg-white text-gray-500 ring-1 ring-black/5'
                }`}
              >
                All Classes
              </Link>
              {classes.map((c) => (
                <Link
                  key={c.id}
                  href={classQuery(c.id)}
                  className={`rounded-full px-3.5 py-1.5 text-xs font-semibold transition ${
                    classId === c.id ? 'bg-gray-800 text-white' : 'bg-white text-gray-500 ring-1 ring-black/5'
                  }`}
                >
                  {c.class_name}
                </Link>
              ))}
            </div>
          )}

          <div className="rounded-2xl bg-white p-4 shadow-sm ring-1 ring-black/5 md:p-6">
            <p className="mb-4 border-b border-gray-100 pb-4 text-sm text-gray-500">
              {materials.length} item{materials.length === 1 ? '' : 's'} available
            </p>

            {materials.length === 0 ? (
              <p className="py-10 text-center text-sm text-gray-500">Nothing here yet. Check back soon.</p>
            ) : (
              <ul className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {materials.map((m) => (
                  <li key={m.id}>
                    <a
                      href={m.file_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex h-full flex-col gap-1.5 rounded-lg border border-gray-100 p-4 transition hover:border-brand-200 hover:bg-brand-50"
                    >
                      <span className="inline-block w-fit rounded bg-brand-50 px-2 py-0.5 text-xs font-semibold uppercase text-brand-600">
                        {subjectName(m.subject_id) || 'General'} {m.year ? `· ${m.year}` : ''}
                      </span>
                      <span className="text-sm font-medium text-gray-800">{m.title}</span>
                      <span className="mt-auto text-xs font-semibold text-brand-600">View / Download →</span>
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
