export default function NewsTicker({ text }) {
  if (!text) return null;

  return (
    <div className="flex items-center border-b border-brand-100 bg-white text-aink">
      <span className="z-10 flex-shrink-0 rounded-r-md bg-brand-600 px-3 py-2 text-xs font-bold uppercase tracking-wide text-white md:text-sm">
        Latest News
      </span>
      <div className="relative flex-1 overflow-hidden whitespace-nowrap py-2">
        <span className="inline-block animate-marquee px-4 text-xs text-gray-700 md:text-sm">{text}</span>
      </div>
    </div>
  );
}
