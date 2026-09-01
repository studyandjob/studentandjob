import Link from 'next/link';
import { GraduationCapIcon3D, DocumentIcon3D, NotesBookIcon3D } from './Icons3D';
import WhatsAppServiceCard from './WhatsAppServiceCard';

const STUDY_ZONE_LINKS = [
  { href: '/study-zone/test', icon: GraduationCapIcon3D, title: 'Start Online Test / Papers' },
  { href: '/study-zone/materials?type=guess_paper', icon: DocumentIcon3D, title: 'Guess Papers & Suggestions' },
  { href: '/study-zone/materials?type=old_paper', icon: NotesBookIcon3D, title: 'Previous / Old Papers' },
  { href: '/study-zone/notes', icon: NotesBookIcon3D, title: 'Notes' },
];

export default function StudentsZone({ settings = {} }) {
  return (
    <div className="flex flex-col gap-6">
      {/* Study Zone quick links — same 4 options as the full /study-zone
          page (Test, Guess Papers, Old Papers, Notes), shown here as a
          compact list so visitors don't have to leave the homepage to see
          what's available. This replaces the old separate "Study Zone —
          Notes" box, which just duplicated the "Notes" link below and sat
          empty until notes were uploaded. */}
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
            <li key={href} className="flex items-center gap-3 py-3">
              <span className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-lg bg-brand-50">
                <Icon className="h-6 w-6" />
              </span>
              <span className="flex-1 truncate text-sm font-semibold text-gray-800">{title}</span>
              <Link
                href={href}
                className="flex min-h-[40px] flex-shrink-0 items-center justify-center rounded-md border border-gray-200 px-3.5 py-2 text-xs font-semibold text-gray-600 transition active:scale-95 hover:border-brand-200 hover:text-brand-700"
              >
                View
              </Link>
            </li>
          ))}
        </ul>
      </section>

      {/* Paid application-support service — same settings-driven card
          (title, price, features, refund-policy link) shown on the /jobs
          page and job details modal, so the offer is consistent everywhere
          instead of homepage showing a separate, simplified version. */}
      {settings?.wa_service_enabled && <WhatsAppServiceCard settings={settings} />}
    </div>
  );
}
