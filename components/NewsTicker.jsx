export default function NewsTicker({ text }) {
  if (!text) return null;

  return (
    <div className="flex items-center bg-brand-900 text-white">
      <span className="z-10 flex-shrink-0 bg-accent-500 px-3 py-2 text-xs font-bold text-white md:text-sm">
        Latest news
      </span>
      <div className="relative flex-1 overflow-hidden whitespace-nowrap py-2">
        <span className="inline-block animate-marquee px-4 text-xs text-white/90 md:text-sm">{text}</span>
      </div>
    </div>
  );
}
