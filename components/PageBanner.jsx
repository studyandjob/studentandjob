export default function PageBanner({ title, subtitle, icon }) {
  return (
    <div className="relative overflow-hidden bg-gradient-to-br from-brand-700 via-brand-600 to-brand-500 text-white">
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.07]"
        style={{
          backgroundImage: 'radial-gradient(circle at 2px 2px, white 1px, transparent 0)',
          backgroundSize: '28px 28px',
        }}
      />
      <div className="relative mx-auto max-w-7xl px-4 py-10 md:px-6 md:py-14">
        <div className="flex items-center gap-3">
          {icon && (
            <span className="flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-xl bg-white/15 backdrop-blur-sm">
              {icon}
            </span>
          )}
          <div>
            <h1 className="text-2xl font-extrabold tracking-tight md:text-3xl">{title}</h1>
            {subtitle && <p className="mt-1 text-sm text-brand-50/90 md:text-base">{subtitle}</p>}
          </div>
        </div>
      </div>
      <div
        className="absolute inset-x-0 bottom-0 h-8 bg-gray-50"
        style={{ clipPath: 'ellipse(70% 100% at 50% 100%)' }}
      />
    </div>
  );
}
