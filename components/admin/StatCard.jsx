const COLOR_MAP = {
  teal: 'text-atl',
  gold: 'text-agold',
  coral: 'text-acoral',
  blue: 'text-accent-600',
  green: 'text-brand-600',
  purple: 'text-accent-600',
};

export default function StatCard({ icon: IconCmp, value, label, color = 'teal', onClick }) {
  const colorClass = COLOR_MAP[color] || COLOR_MAP.teal;

  const Comp = onClick ? 'button' : 'div';

  return (
    <Comp
      onClick={onClick}
      className={`flex w-full items-center gap-3.5 rounded-[14px] border border-aline bg-white p-4 text-left transition ${
        onClick ? 'cursor-pointer hover:-translate-y-0.5 hover:shadow-lg' : ''
      }`}
    >
      <IconCmp className={`h-7 w-7 flex-shrink-0 opacity-85 ${colorClass}`} />
      <div className="flex flex-col">
        <span className={`font-serif text-xl font-bold sm:text-2xl ${colorClass}`}>{value}</span>
        <small className="mt-0.5 text-xs text-amuted">{label}</small>
      </div>
    </Comp>
  );
}
