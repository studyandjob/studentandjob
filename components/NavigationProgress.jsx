'use client';

import { createContext, useContext, useEffect, useRef, useState } from 'react';
import { usePathname } from 'next/navigation';

// Tracks whether a same-tab internal link navigation is currently in
// flight, so any component anywhere on the page (e.g. the header logo) can
// show a loading indicator while Next.js fetches the next route.
//
// Why this exists: on Next.js App Router, clicking a <Link> to a page that
// fetches data on the server (every page here does — force-dynamic +
// Supabase) keeps the CURRENT page on screen with no visual feedback until
// the new page is ready. That's the "click a link, old page just sits there
// for a moment, then the new page appears" behaviour. This provider starts
// the spinner the instant a link is clicked and clears it the instant the
// URL actually changes (i.e. the new page has taken over).
const NavigationProgressContext = createContext(false);

export function useNavigationProgress() {
  return useContext(NavigationProgressContext);
}

export default function NavigationProgress({ children }) {
  const [isNavigating, setIsNavigating] = useState(false);
  const pathname = usePathname();
  const isFirstRender = useRef(true);
  const safetyTimeoutRef = useRef(null);

  // The pathname only updates once Next.js has actually swapped in the new
  // page, so this is the reliable "navigation finished" signal.
  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false;
      return;
    }
    setIsNavigating(false);
    if (safetyTimeoutRef.current) clearTimeout(safetyTimeoutRef.current);
  }, [pathname]);

  useEffect(() => {
    function handleClick(event) {
      // Only react to genuine, unmodified, same-tab left-clicks on an
      // internal link — never hijack ctrl/cmd-click, new-tab, download,
      // external, or hash/mailto/tel links.
      if (
        event.defaultPrevented ||
        event.button !== 0 ||
        event.metaKey ||
        event.ctrlKey ||
        event.shiftKey ||
        event.altKey
      ) {
        return;
      }

      const link = event.target.closest('a');
      if (!link) return;
      if (link.target === '_blank' || link.hasAttribute('download')) return;

      const href = link.getAttribute('href');
      if (!href || href.startsWith('#') || href.startsWith('mailto:') || href.startsWith('tel:')) return;

      let url;
      try {
        url = new URL(href, window.location.href);
      } catch {
        return;
      }
      if (url.origin !== window.location.origin) return; // external link

      // Clicking a link to the page already on screen isn't a navigation.
      if (url.pathname === window.location.pathname && url.search === window.location.search) return;

      setIsNavigating(true);

      // Safety net: if something prevents the pathname from ever changing
      // (broken link, route error, etc.), never leave the spinner stuck on.
      if (safetyTimeoutRef.current) clearTimeout(safetyTimeoutRef.current);
      safetyTimeoutRef.current = setTimeout(() => setIsNavigating(false), 6000);
    }

    document.addEventListener('click', handleClick);
    return () => {
      document.removeEventListener('click', handleClick);
      if (safetyTimeoutRef.current) clearTimeout(safetyTimeoutRef.current);
    };
  }, []);

  return (
    <NavigationProgressContext.Provider value={isNavigating}>
      {children}
    </NavigationProgressContext.Provider>
  );
}
