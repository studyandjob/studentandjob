import HomeSection from './HomeSection';
import ChannelCta from './ChannelCta';
import AdSlot from './AdSlot';
import HomeIcon from './HomeIcons';

const CHECKLIST = [
  'Read the age limit and the required qualification.',
  'Note the last date and the time zone of the deadline.',
  'Keep your CNIC, degrees and photographs ready.',
  'Apply only through the official link or address.',
  'Never pay anyone to get a job.',
];

/** Lower-page helper blocks: application checklist + WhatsApp channel + ad. (Categories now live in the chip row.) */
export default function HomeSidebar({ settings = {} }) {
  return (
    <aside className="grid items-start gap-6 md:grid-cols-2" aria-label="Helpful information">
      <HomeSection title="Before you apply">
        <ul className="space-y-3 rounded-2xl border border-gray-200 bg-white p-5 text-sm text-gray-700 shadow-card">
          {CHECKLIST.map((t) => (
            <li key={t} className="flex gap-3">
              <HomeIcon name="check" className="mt-0.5 h-5 w-5 flex-shrink-0 text-brand-600" />
              <span className="leading-snug">{t}</span>
            </li>
          ))}
        </ul>
      </HomeSection>

      <div className="space-y-6">
        <ChannelCta settings={settings} />
        <AdSlot html={settings.ad_code_list} />
      </div>
    </aside>
  );
}
