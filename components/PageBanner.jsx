export default function PageBanner({ title, subtitle, icon }) {
  return (
    <div className="relative overflow-hidden border-b border-gray-100 bg-gradient-to-br from-brand-50 via-white to-accent-50/60">
      {/* Thin branded accent line at the very top — ties the banner back to
          the site's colors without a heavy full-bleed dark block that jumps
          abruptly after the white header. */}
      <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-brand-600 via-accent-500 to-brand-400" />
      <div className="relative mx-auto flex max-w-7xl items-center gap-3.5 px-4 py-8 md:px-6 md:py-11">
        {icon && (
          <span className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-brand-600 to-brand-700 text-white shadow-md shadow-brand-600/25">
            {icon}
          </span>
        )}
        <div>
          <h1 className="text-2xl font-serif font-bold tracking-tight text-gray-900 md:text-3xl">{title}</h1>
          {subtitle && <p className="mt-1 text-sm text-gray-600 md:text-base">{subtitle}</p>}
        </div>
      </div>
    </div>
  );
}
