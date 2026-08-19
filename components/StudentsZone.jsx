import Link from 'next/link';

export default function StudentsZone({ notes = [], whatsappNumber = '923000000000' }) {
  return (
    <div className="flex flex-col gap-6">
      {/* Students notes / PDFs */}
      <section className="rounded-xl bg-white p-4 shadow-sm ring-1 ring-black/5 md:p-6">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-bold text-gray-900 md:text-xl">Students Zone</h2>
          <Link href="/students-zone" className="text-xs font-semibold text-brand-600 hover:underline md:text-sm">
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

      {/* Paid services / WhatsApp banner */}
      <section className="flex flex-col items-start gap-3 rounded-xl bg-gradient-to-br from-green-600 to-green-500 p-5 text-white shadow-sm md:p-6">
        <h3 className="text-lg font-bold">Need Help Applying? 📝</h3>
        <p className="text-sm text-green-50">
          Get one-on-one help with job applications, form filling, and CV writing — book our paid service directly on WhatsApp.
        </p>
        <a
          href={`https://wa.me/${whatsappNumber}`}
          target="_blank"
          rel="noopener noreferrer"
          className="mt-1 inline-flex items-center gap-2 rounded-lg bg-white px-4 py-2 text-sm font-bold text-green-700 transition hover:bg-green-50"
        >
          <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 24 24">
            <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z" />
          </svg>
          Book on WhatsApp
        </a>
      </section>
    </div>
  );
}
