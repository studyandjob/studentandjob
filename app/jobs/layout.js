import { requirePage } from '@/lib/pageGuard';

// Jobs can now be switched off in Admin → Pages & Ads (the site is
// directory-first). Reads the live setting on every request.
export const dynamic = 'force-dynamic';

export default async function Layout({ children }) {
  await requirePage('jobs');
  return children;
}
