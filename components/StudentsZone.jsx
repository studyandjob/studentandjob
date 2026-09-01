import Link from 'next/link';
import { NotesBookIcon3D, GraduationCapIcon3D, DocumentIcon3D, ArrowRightIcon3D } from './Icons3D';
import WhatsAppServiceCard from './WhatsAppServiceCard';

const STUDY_ZONE_LINKS = [
  { href: '/study-zone/test', icon: GraduationCapIcon3D, title: 'Start Online Test / Papers' },
  { href: '/study-zone/materials?type=guess_paper', icon: DocumentIcon3D, title: 'Guess Papers & Suggestions' },
  { href: '/study-zone/materials?type=old_paper', icon: NotesBookIcon3D, title: 'Previous / Old Papers' },
  { href: '/study-zone/notes', icon: NotesBookIcon3D, title: 'Notes' },
];

export default function StudentsZone({ notes = [], settings = {} }) {
  return (
    <div className="flex flex-col gap-6">
      {/* Study Zone quick links — same 4 options as the full /study-zone
          page (Test, Guess Papers, Old Papers, Notes), shown here as a
          compact list so visitors don't have to leave the homepage to see
          what's available. */}
      <section className="rounded-2xl bg-white p-4 shadow-sm ring-1 ring-black/5 md:p-6">
        <div className="mb-4 flex items-center justify-between border-b border-gray-100 pb-4">
          <div className="flex items-center gap-2.5">
            <span className="flex h-9 w-9 items-center justify-center">
              <GraduationCapIcon3D className="h-8 w-8" />
            </span>
            <h2 className="text-base font-bold text-gray-900 md:text-lg">Study Zone</h2>
          </div>
          <Link href="/study-zone" className="text-xs font-semibold text-brand-600 hover:underline md:text-sm">
            View all →
          </Link>
        </div>

        <ul className="flex flex-col divide-y divide-gray-100">
          {STUDY_ZONE_LINKS.map(({ href, icon: Icon, title }) => (
            <li key={href}>
              <Link
                href={href}
                className="flex items-center gap-3 py-3 transition hover:bg-brand-50/60 active:scale-[0.99]"
              >
                <span className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-lg bg-brand-50">
                  <Icon className="h-6 w-6" />
                </span>
                <span className="flex-1 text-sm font-semibold text-gray-800">{title}</span>
                <ArrowRightIcon3D className="h-4 w-4 flex-shrink-0 text-gray-300" />
              </Link>
            </li>
          ))}
        </ul>
      </section>

      {/* Students notes / PDFs */}
      <section className="rounded-2xl bg-white p-4 shadow-sm ring-1 ring-black/5 md:p-6">
        <div className="mb-4 flex items-center justify-between border-b border-gray-100 pb-4">
          <div className="flex items-center gap-2.5">
            <span className="flex h-9 w-9 items-center justify-center">
              <NotesBookIcon3D className="h-8 w-8" />
            </span>
            <h2 className="text-base font-bold text-gray-900 md:text-lg">Study Zone — Notes</h2>
          </div>
          <Link href="/study-zone/notes" className="text-xs font-semibold text-brand-600 hover:underline md:text-sm">
            View all →
          </Link>
        </div>

        {notes.length === 0 ? (
          <p className="py-8 text-center text-sm text-gray-500">No notes uploaded yet.</p>
        ) : (
          <ul className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            {notes.map((note) => (
              <li key={note.id}>
                <a
                  href={note.file_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex h-full flex-col gap-1 rounded-lg border border-gray-100 p-3 transition hover:border-brand-200 hover:bg-brand-50"
                >
                  <span className="inline-block w-fit rounded bg-brand-50 px-2 py-0.5 text-[10px] font-semibold uppercase text-brand-600">
                    {note.category || 'General'}
                  </span>
                  <span className="line-clamp-2 text-sm font-medium text-gray-800">{note.title}</span>
                </a>
              </li>
            ))}
          </ul>
        )}
      </section>

      {/* Paid application-support service — same settings-driven card
          (title, price, features, refund-policy link) shown on the /jobs
          page and job details modal, so the offer is consistent everywhere
          instead of homepage showing a separate, simplified version. */}
      {settings?.wa_service_enabled && <WhatsAppServiceCard settings={settings} />}
    </div>
  );
}
