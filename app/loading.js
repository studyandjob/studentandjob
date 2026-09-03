import PageLoadingOverlay from '@/components/PageLoadingOverlay';

// Next.js automatically wraps each route segment in a Suspense boundary
// and renders this file as the fallback while the segment's server work
// (here: the homepage's Supabase fetches) is still in flight — including
// on a hard refresh / typed URL / new tab, not just client-side <Link>
// navigations (those are already covered by NavigationProgress +
// PageLoadingOverlay).
//
// At this point the real site_name/logo_url haven't loaded yet (that's
// exactly the DB fetch this screen is covering for), so PageLoadingOverlay
// would otherwise fall back to a generic first-letter avatar. Hardcoding
// the site's actual current logo/name here instead means the real
// branding shows instantly on first paint rather than a placeholder.
// NOTE: if the admin uploads a new logo or changes the site name in
// Admin -> Site Settings, update these two constants to match — this
// file can't read the database before it renders.
const FALLBACK_SITE_NAME = 'Online Jobs and Study';
const FALLBACK_LOGO_URL =
  'https://uddrgvvdpwgbcndbdoka.supabase.co/storage/v1/object/public/site-images/logo/b9c0cc70-f31f-4495-bd8b-f1a537511cce.jfif';

export default function Loading() {
  return <PageLoadingOverlay siteName={FALLBACK_SITE_NAME} logoUrl={FALLBACK_LOGO_URL} />;
}

