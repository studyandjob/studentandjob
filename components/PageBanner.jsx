export default function PageBanner({ title, subtitle, icon }) {
  return (
    <div className="relative overflow-hidden border-b border-gray-100 bg-white">
      <div className="relative mx-auto flex max-w-7xl items-center gap-3.5 px-4 py-8 md:px-6 md:py-11">
        {icon && (
          <span className="relative flex h-16 w-16 flex-shrink-0 items-center justify-center rounded-2xl border border-gray-100 bg-gradient-to-br from-brand-100 to-brand-50 text-brand-600">
            <span className="absolute inset-2 rounded-full bg-white/60 blur-md" aria-hidden="true" />
            <span className="relative flex h-11 w-11 items-center justify-center [&>svg]:h-full [&>svg]:w-full">{icon}</span>
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
