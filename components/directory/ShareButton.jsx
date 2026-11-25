'use client';

import { useState } from 'react';
import HomeIcon from '../HomeIcons';

export default function ShareButton({ title }) {
  const [copied, setCopied] = useState(false);

  async function share() {
    const url = window.location.href;
    try {
      if (navigator.share) {
        await navigator.share({ title, url });
        return;
      }
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // user cancelled the share sheet — nothing to do
    }
  }

  return (
    <button
      type="button"
      onClick={share}
      className="inline-flex min-h-[46px] items-center justify-center gap-2 rounded-md border border-line px-5 py-2.5 text-sm font-semibold text-gray-800 transition active:scale-95 hover:bg-surface-alt"
    >
      <HomeIcon name="arrow" className="h-5 w-5" />
      {copied ? 'Link copy ho gaya' : 'Share'}
    </button>
  );
}
