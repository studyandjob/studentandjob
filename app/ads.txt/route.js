import { getSiteSettings } from '@/lib/data';

export const dynamic = 'force-dynamic';

// Served at /ads.txt. Ad networks (AdSense etc.) ask for this file; the
// admin pastes its contents in Admin → Pages & Ads, so no redeploy is needed.
export async function GET() {
  const settings = await getSiteSettings();
  return new Response(settings.ads_txt || '', {
    headers: { 'Content-Type': 'text/plain; charset=utf-8' },
  });
}
