import Header from '@/components/Header';
import NewsTicker from '@/components/NewsTicker';
import Footer from '@/components/Footer';
import PageBanner from '@/components/PageBanner';
import { NotesBookIcon3D } from '@/components/Icons3D';
import { getSiteSettings, getNotes } from '@/lib/data';

export const dynamic = 'force-dynamic';

export async function generateMetadata() {
  const settings = await getSiteSettings();
  return { title: `Notes — ${settings.site_name || 'Education & Job Portal'}` };
}

export default async function StudyZoneNotesPage() {
  const [settings, notes] = await Promise.all([getSiteSettings(), getNotes()]);

  return (
    <>
      <NewsTicker text={settings.scrolling_news} />
      <Header siteName={settings.site_name} logoUrl={settings.logo_url} />

      <main className="flex-1 bg-gray-50">
        <PageBanner
          title="Notes"
          subtitle="Free notes and study material — download as PDF."
          icon={<NotesBookIcon3D className="h-9 w-9" />}
        />

        <div className="mx-auto max-w-5xl px-4 py-10 md:px-6 md:py-14">
          <div className="rounded-2xl bg-white p-4 shadow-sm ring-1 ring-black/5 md:p-6">
            <p className="mb-4 border-b border-gray-100 pb-4 text-sm text-gray-500">
              {notes.length} item{notes.length === 1 ? '' : 's'} available
            </p>

            {notes.length === 0 ? (
              <p className="py-10 text-center text-sm text-gray-500">No notes uploaded yet. Check back soon.</p>
            ) : (
              <ul className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {notes.map((note) => (
                  <li key={note.id}>
                    <a
                      href={note.file_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex h-full flex-col gap-1.5 rounded-lg border border-gray-100 p-4 transition hover:border-brand-200 hover:bg-brand-50"
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
            )}
          </div>
        </div>
      </main>

      <Footer siteName={settings.site_name} settings={settings} />
    </>
  );
}
