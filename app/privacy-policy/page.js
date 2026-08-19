import StaticPageContent from '@/components/StaticPageContent';
import { getSiteSettings } from '@/lib/data';

export const dynamic = 'force-dynamic';

export async function generateMetadata() {
  const settings = await getSiteSettings();
  return { title: `Privacy Policy — ${settings.site_name || 'Education & Job Portal'}` };
}

export default function PrivacyPolicyPage() {
  return <StaticPageContent slug="privacy-policy" fallbackTitle="Privacy Policy" />;
}
