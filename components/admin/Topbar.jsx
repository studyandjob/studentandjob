import { MenuIcon } from './icons';

export default function Topbar({ title, onMenuClick }) {
  return (
    <div className="sticky top-0 z-30 flex h-[62px] flex-shrink-0 items-center gap-4 border-b border-aline bg-white px-4 md:px-6">
      <button
        onClick={onMenuClick}
        className="flex items-center justify-center text-lg text-aink md:hidden"
        aria-label="Open menu"
      >
        <MenuIcon className="h-6 w-6" />
      </button>
      <h2 className="flex-1 font-serif text-lg font-bold text-atl">{title}</h2>
      <span className="hidden items-center gap-1.5 rounded-full border border-brand-200 bg-brand-50 px-3.5 py-1.5 text-[0.82rem] font-semibold text-brand-700 sm:flex">
        Admin
      </span>
    </div>
  );
}
