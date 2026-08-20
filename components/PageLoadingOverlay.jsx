// Full-page navigation loading overlay. Shown by NavigationProgress while a
// link click is being navigated to. Blurs the current page behind it and
// shows the site logo centered on screen with a continuous circular motion
// (two rings spinning in opposite directions) around it.
export default function PageLoadingOverlay({ siteName, logoUrl }) {
  return (
    <div
      className="fixed inset-0 z-[999] flex items-center justify-center bg-white/60 backdrop-blur-md transition-opacity duration-200"
      role="status"
      aria-live="polite"
      aria-label="Loading page"
    >
      <div className="relative flex h-32 w-32 items-center justify-center">
        {/* Outer dashed ring — slow rotation, opposite direction */}
        <span className="absolute inset-0 animate-spin-reverse-slow rounded-full border-2 border-dashed border-brand-500/70" />

        {/* Inner solid ring — faster rotation, standard direction */}
        <span className="absolute inset-3 animate-spin rounded-full border-4 border-brand-600 border-t-transparent" />

        {/* Small accent dot orbiting is skipped in favor of a simple pulse
            on the logo itself, which reads more clearly at small sizes */}
        <div className="relative flex h-16 w-16 items-center justify-center animate-pulse-soft">
          {logoUrl ? (
            <img
              src={logoUrl}
              alt={siteName || 'Loading'}
              className="h-16 w-16 rounded-full object-cover shadow-lg ring-4 ring-white"
            />
          ) : (
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-brand-600 text-2xl font-bold text-white shadow-lg ring-4 ring-white">
              {(siteName || 'P').charAt(0)}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
