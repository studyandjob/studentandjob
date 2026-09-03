// Full-page navigation loading overlay. Shown by NavigationProgress while a
// link click is being navigated to. Blurs the current page behind it and
// shows the site logo centered on screen with a continuous circular motion
// (two rings spinning in opposite directions) around it, the site name
// animating in below it, and a sliding indeterminate loading bar underneath.
export default function PageLoadingOverlay({ siteName, logoUrl }) {
  const displayName = siteName || 'Loading';

  return (
    <div
      className="fixed inset-0 z-[999] flex flex-col items-center justify-center gap-5 bg-white/60 backdrop-blur-md transition-opacity duration-200"
      role="status"
      aria-live="polite"
      aria-label="Loading page"
    >
      {/* Logo + rotating rings */}
      <div className="relative flex h-40 w-40 items-center justify-center md:h-48 md:w-48">
        {/* Outer dashed ring — slow rotation, opposite direction */}
        <span className="absolute inset-0 animate-spin-reverse-slow rounded-full border-[3px] border-dashed border-brand-500/70" />

        {/* Inner solid ring — faster rotation, standard direction */}
        <span className="absolute inset-4 animate-spin rounded-full border-[5px] border-brand-600 border-t-transparent" />

        <div className="relative flex h-20 w-20 items-center justify-center animate-pulse-soft md:h-24 md:w-24">
          {logoUrl ? (
            <img
              src={logoUrl}
              alt={siteName || 'Loading'}
              className="h-20 w-20 rounded-full object-cover shadow-lg ring-4 ring-white md:h-24 md:w-24"
            />
          ) : (
            <div className="flex h-20 w-20 items-center justify-center rounded-full bg-brand-600 text-3xl font-bold text-white shadow-lg ring-4 ring-white md:h-24 md:w-24 md:text-4xl">
              {(siteName || 'P').charAt(0)}
            </div>
          )}
        </div>
      </div>

      {/* Site name: outer wrapper handles the one-time entrance (fade +
          slide up), inner <p> handles a continuous soft pulse for as long
          as the overlay stays on screen. Two separate elements on purpose —
          Tailwind's `animate-*` utilities each set the CSS `animation`
          shorthand, so stacking two of them on the SAME element just has
          one override the other instead of combining. */}
      <div className="animate-fade-in-up px-4">
        <p className="animate-pulse-soft text-center text-xl font-bold text-gray-800 md:text-2xl">
          {displayName}
        </p>
      </div>

      {/* Indeterminate sliding loading bar */}
      <div className="h-2 w-48 overflow-hidden rounded-full bg-gray-200 md:w-64">
        <div className="h-full w-1/3 animate-loading-bar rounded-full bg-gradient-to-r from-brand-500 to-brand-700" />
      </div>
    </div>
  );
}
