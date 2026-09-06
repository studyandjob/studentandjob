'use client';

import { useState } from 'react';

/**
 * Share button for an individual job's page. Uses the native share sheet
 * (navigator.share) on mobile/supporting browsers — the same "Share"
 * action candidates already know from WhatsApp/Instagram — and falls back
 * to copying the link on desktop browsers that don't support it.
 */
export default function JobShareButton({ title, url }) {
  const [copied, setCopied] = useState(false);

  async function handleShare() {
    if (typeof navigator !== 'undefined' && navigator.share) {
      try {
        await navigator.share({ title, url });
      } catch {
        // user cancelled the share sheet — nothing to do
      }
      return;
    }
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // clipboard blocked — silently ignore, link is still visible in the address bar
    }
  }

  return (
    <button
      onClick={handleShare}
      className="flex items-center gap-1.5 rounded-full border border-gray-200 px-3.5 py-2 text-xs font-semibold text-gray-600 transition active:scale-95 hover:border-brand-300 hover:text-brand-700"
    >
      <svg viewBox="0 0 24 24" fill="none" className="h-4 w-4" stroke="currentColor" strokeWidth="2">
        <circle cx="18" cy="5" r="3" />
        <circle cx="6" cy="12" r="3" />
        <circle cx="18" cy="19" r="3" />
        <line x1="8.6" y1="10.6" x2="15.4" y2="6.4" />
        <line x1="8.6" y1="13.4" x2="15.4" y2="17.6" />
      </svg>
      {copied ? 'Link Copied!' : 'Share'}
    </button>
  );
}
