import { redirect } from 'next/navigation';
import { getSiteSettings } from '@/lib/data';
import { isPageEnabled } from '@/lib/pages';

/** Server-side guard used by each switchable section's layout.js. If the
 * admin has switched the page off, visitors (and old Google links) are sent
 * to /jobs instead of seeing it. Temporary (307) on purpose — the page can
 * be switched back on at any time. */
export async function requirePage(key) {
  const settings = await getSiteSettings();
  if (!isPageEnabled(settings, key)) redirect('/jobs');
}
