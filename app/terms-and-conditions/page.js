import StaticPageContent from '@/components/StaticPageContent';
import { getSiteSettings } from '@/lib/data';

export const dynamic = 'force-dynamic';

export async function generateMetadata() {
  const settings = await getSiteSettings();
  return { title: `Terms & Conditions — ${settings.site_name || 'Education & Job Portal'}` };
}

export default function TermsPage() {
  return <StaticPageContent slug="terms-and-conditions" fallbackTitle="Terms & Conditions" />;
}
