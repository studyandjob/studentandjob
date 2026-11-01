'use client';

import { useEffect, useRef } from 'react';

/**
 * Renders an ad snippet pasted by the admin (AdSense, Adsterra, Monetag...).
 * React never runs <script> tags that arrive through innerHTML, so the
 * snippet is parsed into a fragment first — scripts inside a fragment
 * created this way DO execute when appended. Only admin-entered code is
 * ever passed in here.
 */
export default function AdCode({ html, className = '' }) {
  const ref = useRef(null);

  useEffect(() => {
    const el = ref.current;
    if (!el || !html) return undefined;
    el.innerHTML = '';
    try {
      el.appendChild(document.createRange().createContextualFragment(html));
    } catch (err) {
      console.error('Ad code failed to load:', err);
    }
    return () => {
      el.innerHTML = '';
    };
  }, [html]);

  if (!html || !html.trim()) return null;
  return <div ref={ref} className={className} />;
}
