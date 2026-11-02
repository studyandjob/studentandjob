export default function NewsTicker({ text }) {
  if (!text) return null;

  return (
    <div className="border-b border-brand-100 bg-brand-50">
      <div className="mx-auto flex max-w-7xl items-center gap-3 px-4 py-2 md:px-6">
        <span className="z-10 flex-shrink-0 rounded-full bg-brand-600 px-3 py-1 text-[11px] font-bold uppercase tracking-wide text-white">
          Latest news
        </span>
        <div className="relative flex-1 overflow-hidden whitespace-nowrap">
          <span className="inline-block animate-marquee text-xs font-medium text-brand-900 md:text-sm">{text}</span>
        </div>
      </div>
    </div>
  );
}
