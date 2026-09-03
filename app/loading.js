import PageLoadingOverlay from '@/components/PageLoadingOverlay';

// Next.js automatically wraps each route segment in a Suspense boundary
// and renders this file as the fallback while the segment's server work
// (here: the homepage's Supabase fetches) is still in flight — including
// on a hard refresh / typed URL / new tab, not just client-side <Link>
// navigations (those are already covered by NavigationProgress +
// PageLoadingOverlay). No siteName/logoUrl is available yet at this
// point (that data is exactly what's still loading), so this renders
// PageLoadingOverlay's built-in generic fallback state (first-letter
// badge + "Loading" text) — same visual design, just without the final
// site branding until the real page takes over.
export default function Loading() {
  return <PageLoadingOverlay siteName="" logoUrl="" />;
}
