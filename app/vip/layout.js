import { requirePage } from '@/lib/pageGuard';

// Reads the live "Pages & Ads" switch on every request so turning this page
// off in the admin dashboard takes effect immediately.
export const dynamic = 'force-dynamic';

export default async function Layout({ children }) {
  await requirePage('vip');
  return children;
}
