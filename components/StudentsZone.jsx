import Link from 'next/link';
import { NotesBookIcon3D } from './Icons3D';
import WhatsAppServiceCard from './WhatsAppServiceCard';

export default function StudentsZone({ notes = [], settings = {} }) {
  return (
    <div className="flex flex-col gap-6">
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
