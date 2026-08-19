import StaticPageContent from '@/components/StaticPageContent';
import { getSiteSettings } from '@/lib/data';

export const dynamic = 'force-dynamic';

export async function generateMetadata() {
  const settings = await getSiteSettings();
  return { title: `Disclaimer — ${settings.site_name || 'Education & Job Portal'}` };
}

export default function DisclaimerPage() {
  return <StaticPageContent slug="disclaimer" fallbackTitle="Disclaimer" />;
}
