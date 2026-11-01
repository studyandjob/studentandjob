import { requirePage } from '@/lib/pageGuard';

export const dynamic = 'force-dynamic';

export default async function Layout({ children }) {
  await requirePage('about');
  return children;
}
