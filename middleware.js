import { NextResponse } from 'next/server';
import { PAGE_DEFS, isPageEnabled } from '@/lib/pages';

// Sends visitors (and Google) away from pages the admin has switched off in
// Admin → Pages & Ads, with a real HTTP 307 redirect to /jobs. Each
// section's layout.js has the same check as a fallback.
//
// Only the switchable sections are matched, so Home, Jobs and Contact never
// pay for this lookup. The setting is cached for a few seconds per server
// instance, so a burst of requests makes one small database read.

export const config = {
  matcher: [
    '/about-us/:path*',
    '/study-zone/:path*',
    '/students-zone/:path*',
    '/results/:path*',
    '/scholarships/:path*',
    '/vip/:path*',
    '/application-support/:path*',
  ],
};

const CACHE_MS = 15000;
let cache = { at: 0, settings: null };

async function loadSettings() {
  if (cache.settings && Date.now() - cache.at < CACHE_MS) return cache.settings;
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !key) return null;
  try {
    const res = await fetch(
      `${url}/rest/v1/site_settings?select=page_visibility&order=updated_at.desc.nullslast&limit=1`,
      { headers: { apikey: key, Authorization: `Bearer ${key}` }, cache: 'no-store' }
    );
    if (!res.ok) return null;
    const rows = await res.json();
    cache = { at: Date.now(), settings: rows?.[0] || {} };
    return cache.settings;
  } catch {
    return null;
  }
}

export async function middleware(request) {
  const { pathname } = request.nextUrl;
  const def = PAGE_DEFS.find((d) => !d.locked || d.key === 'about'
    ? d.paths.some((p) => pathname === p || pathname.startsWith(`${p}/`))
    : false);
  if (!def) return NextResponse.next();

  const settings = await loadSettings();
  // If the lookup fails, let the request through; the layout guard decides.
  if (!settings) return NextResponse.next();

  if (!isPageEnabled(settings, def.key)) {
    return NextResponse.redirect(new URL('/jobs', request.url), 307);
  }
  return NextResponse.next();
}
