import StaticPageContent from '@/components/StaticPageContent';
import { getSiteSettings } from '@/lib/data';

export const dynamic = 'force-dynamic';

export async function generateMetadata() {
  const settings = await getSiteSettings();
  return { title: `About Us — ${settings.site_name || 'Education & Job Portal'}` };
}

export default function AboutUsPage() {
  return <StaticPageContent slug="about-us" fallbackTitle="About Us" />;
}
