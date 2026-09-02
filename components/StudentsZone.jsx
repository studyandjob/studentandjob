import Link from 'next/link';
import { GraduationCapIcon3D, DocumentIcon3D, NotesBookIcon3D } from './Icons3D';

const STUDY_ZONE_LINKS = [
  { href: '/study-zone/test', icon: GraduationCapIcon3D, title: 'Online Tests', description: 'Practice with topic-based, timed MCQ tests.' },
  { href: '/study-zone/materials?type=guess_paper', icon: DocumentIcon3D, title: 'Guess Papers', description: 'Important questions & exam suggestions.' },
  { href: '/study-zone/materials?type=old_paper', icon: NotesBookIcon3D, title: 'Past Papers', description: 'Previous exam papers, class-wise.' },
  { href: '/study-zone/notes', icon: NotesBookIcon3D, title: 'Notes', description: 'Free notes, ready to view or download.' },
];

export default function StudentsZone() {
  return (
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

      <ul className="flex flex-col gap-2.5">
        {STUDY_ZONE_LINKS.map(({ href, icon: Icon, title, description }) => (
          <li key={href}>
            <Link
              href={href}
              className="group flex items-center gap-3 rounded-xl border border-gray-100 bg-gray-50/60 p-3 transition hover:border-brand-200 hover:bg-brand-50"
            >
              <span className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-lg bg-white shadow-sm">
                <Icon className="h-6 w-6" />
              </span>
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-semibold text-gray-800 group-hover:text-brand-700">{title}</p>
                <p className="truncate text-xs text-gray-500">{description}</p>
              </div>
            </Link>
          </li>
        ))}
      </ul>
    </section>
  );
}
