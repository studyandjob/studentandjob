import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { getSiteSettings } from '@/lib/data';

// Common page frame (header + footer) for the business-owner portal.
export default async function BusinessShell({ children, wide = false }) {
  const settings = (await getSiteSettings()) || {};
  return (
    <>
      <Header siteName={settings.site_name} logoUrl={settings.logo_url} />
      <main className="flex-1 bg-surface">
        <div className={`mx-auto px-4 py-8 md:px-6 md:py-12 ${wide ? 'max-w-5xl' : 'max-w-md'}`}>{children}</div>
      </main>
      <Footer siteName={settings.site_name} settings={settings} />
    </>
  );
}
