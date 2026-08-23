import Header from '@/components/Header';
import NewsTicker from '@/components/NewsTicker';
import Footer from '@/components/Footer';
import PageBanner from '@/components/PageBanner';
import { getSiteSettings, getPage } from '@/lib/data';

// Shared renderer for the editable static/legal pages (About Us, Privacy
// Policy, Disclaimer, Terms & Conditions). Content is stored in the
// `site_pages` table and edited from the Admin Dashboard → Pages tab.
export default async function StaticPageContent({ slug, fallbackTitle }) {
  const [settings, page] = await Promise.all([getSiteSettings(), getPage(slug)]);
  const title = page?.title || fallbackTitle;
  const content = page?.content || '';

  return (
    <>
      <NewsTicker text={settings.scrolling_news} />
      <Header siteName={settings.site_name} logoUrl={settings.logo_url} />

      <main className="flex-1 bg-gray-50">
        <PageBanner title={title} />

        <div className="mx-auto max-w-3xl px-4 py-10 md:px-6 md:py-14">
          <div className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-black/5 md:p-10">
            {content ? (
              <div className="whitespace-pre-wrap text-sm leading-7 text-gray-700 md:text-base">{content}</div>
            ) : (
              <p className="text-sm text-gray-500">This page has no content yet.</p>
            )}
          </div>
        </div>
      </main>

      <Footer siteName={settings.site_name} settings={settings} />
    </>
  );
}
