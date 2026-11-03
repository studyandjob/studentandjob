export default function PageBanner({ title, subtitle, icon }) {
  return (
    <div className="bg-surface">
      <div className="mx-auto flex max-w-[1760px] items-center gap-4 px-4 pb-4 pt-8 md:px-10 md:pb-6 md:pt-12">
        {icon && (
          <span className="flex h-14 w-14 flex-shrink-0 items-center justify-center rounded-2xl bg-brand-50 text-brand-600 md:h-16 md:w-16">
            <span className="flex h-9 w-9 items-center justify-center [&>svg]:h-full [&>svg]:w-full">{icon}</span>
          </span>
        )}
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-gray-900 md:text-4xl">{title}</h1>
          {subtitle && <p className="mt-1 text-sm text-gray-500 md:text-base">{subtitle}</p>}
        </div>
      </div>
    </div>
  );
}
