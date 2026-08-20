'use client';

import { createContext, useContext, useEffect, useRef, useState } from 'react';
import { usePathname } from 'next/navigation';
import PageLoadingOverlay from './PageLoadingOverlay';

// Tracks whether a same-tab internal link navigation is currently in
// flight, so a full-page loading overlay (see PageLoadingOverlay) can be
// shown centered on screen while Next.js fetches the next route.
//
// Why this exists: on Next.js App Router, clicking a <Link> to a page that
// fetches data on the server (every page here does — force-dynamic +
// Supabase) keeps the CURRENT page on screen with no visual feedback until
// the new page is ready. That's the "click a link, old page just sits there
// for a moment, then the new page appears" behaviour. This provider starts
// the overlay the instant a link is clicked and clears it the instant the
// URL actually changes (i.e. the new page has taken over).
//
// `setLogo` lets the currently-mounted Header register the site's current
// logo/name so the overlay (which lives here in the root layout, outside
// any single page) knows what to display in its center without doing its
// own separate data fetch.
const NavigationProgressContext = createContext({
  isNavigating: false,
  setLogo: () => {},
});

export function useNavigationProgress() {
  return useContext(NavigationProgressContext);
}

export default function NavigationProgress({ children }) {
  const [isNavigating, setIsNavigating] = useState(false);
  const [logo, setLogo] = useState({ siteName: '', logoUrl: '' });
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
      //
      // NOTE: this listener must run in the CAPTURE phase (see addEventListener
      // below). Next.js's <Link> calls event.preventDefault() in its own
      // onClick — which fires on the target element during the bubble phase —
      // so a normal (bubble-phase) document listener would always see
      // event.defaultPrevented === true and could never detect the click.
      if (
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
      // (broken link, route error, etc.), never leave the overlay stuck on.
      if (safetyTimeoutRef.current) clearTimeout(safetyTimeoutRef.current);
      safetyTimeoutRef.current = setTimeout(() => setIsNavigating(false), 6000);
    }

    // `true` = capture phase, so this runs before <Link>'s own click handler.
    document.addEventListener('click', handleClick, true);
    return () => {
      document.removeEventListener('click', handleClick, true);
      if (safetyTimeoutRef.current) clearTimeout(safetyTimeoutRef.current);
    };
  }, []);

  return (
    <NavigationProgressContext.Provider value={{ isNavigating, setLogo }}>
      {isNavigating && <PageLoadingOverlay siteName={logo.siteName} logoUrl={logo.logoUrl} />}
      {children}
    </NavigationProgressContext.Provider>
  );
}
