// Glossy "Verified Business" badge. Callers decide when to show it
// (see isVerified() in lib/directory.js — status must be verified AND not expired).
export default function VerifiedBadge({ className = '', compact = false }) {
  return (
    <span
      title="Verified Business — admin ne is business ki maujoodgi aur contact details check ki hain"
      className={`inline-flex items-center gap-1 rounded-full bg-gradient-to-b from-sky-400 to-blue-600 font-semibold text-white shadow-[inset_0_1px_0_rgba(255,255,255,0.5),0_2px_8px_-2px_rgba(37,99,235,0.55)] ${
        compact ? 'px-2 py-0.5 text-[10px]' : 'px-2.5 py-1 text-xs'
      } ${className}`}
    >
      <svg viewBox="0 0 24 24" className={compact ? 'h-3 w-3' : 'h-3.5 w-3.5'} fill="none" aria-hidden="true">
        <path d="M12 2.5l2.4 1.7 2.9-.2 1.1 2.7 2.5 1.5-.7 2.8 1.3 2.6-2 2.1-.2 2.9-2.8.9-1.8 2.3-2.7-1.1-2.7 1.1-1.8-2.3-2.8-.9-.2-2.9-2-2.1 1.3-2.6-.7-2.8 2.5-1.5 1.1-2.7 2.9.2z" fill="#fff" fillOpacity="0.28" />
        <path d="M8 12.3l2.7 2.7L16.2 9.5" stroke="#fff" strokeWidth="2.3" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
      Verified
    </span>
  );
}
