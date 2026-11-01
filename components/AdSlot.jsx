import AdCode from './AdCode';

/** A labelled ad placement. Renders nothing at all until the admin has
 * pasted ad code for that slot, so empty slots never leave a gap. */
export default function AdSlot({ html, className = '' }) {
  if (!html || !html.trim()) return null;
  return (
    <div className={`my-6 text-center ${className}`}>
      <p className="mb-1 text-[11px] text-gray-400">Advertisement</p>
      <AdCode html={html} className="flex min-h-[90px] justify-center overflow-hidden" />
    </div>
  );
}
