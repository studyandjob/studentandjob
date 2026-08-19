export default function NewsTicker({ text }) {
  if (!text) return null;

  return (
    <div className="flex items-center bg-brand-700 text-white">
      <span className="z-10 flex-shrink-0 bg-brand-600 px-3 py-2 text-xs font-bold uppercase tracking-wide md:text-sm">
        Latest News
      </span>
      <div className="relative flex-1 overflow-hidden whitespace-nowrap py-2">
        <span className="inline-block animate-marquee px-4 text-xs md:text-sm">{text}</span>
      </div>
    </div>
  );
}
