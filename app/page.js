import Link from 'next/link';
import { supabase } from '@/lib/supabaseClient';
import Header from '@/components/Header';
import NewsTicker from '@/components/NewsTicker';
import HomeLead from '@/components/HomeLead';
import HomeCategories from '@/components/HomeCategories';
import HomeClosingSoon from '@/components/HomeClosingSoon';
import HomeLatestJobs from '@/components/HomeLatestJobs';
import HomeSidebar from '@/components/HomeSidebar';
import HomeInfo from '@/components/HomeInfo';
import HomeFaq from '@/components/HomeFaq';
import { getHeroSlides, getSiteSettings } from '@/lib/data';
import AdSlot from '@/components/AdSlot';
import Footer from '@/components/Footer';
import Art3D from '@/components/Art3D';
import HomeIcon from '@/components/HomeIcons';
import BusinessCard from '@/components/BusinessCard';
import HomeExplorer from '@/components/directory/HomeExplorer';
import CityGrid from '@/components/directory/CityGrid';
import VerifiedBadge from '@/components/directory/VerifiedBadge';
import { isJobOpen } from '@/lib/jobStatus';
import { resolveVisibility } from '@/lib/pages';
import {
  enrichBusinesses,
  getCounts,
  getDirectorySettings,
  getFeaturedBusinesses,
  getTaxonomy,
  getVerifiedBusinesses,
  toWaNumber,
} from '@/lib/directory';

// Cache homepage data for 60s so repeat visits load faster. Admin edits
// can take up to ~60s to appear on the live homepage.
export const revalidate = 60;

function SectionTitle({ children, href, linkLabel = 'Sab dekhein' }) {
  return (
    <div className="mb-4 flex items-end justify-between gap-3">
      <h2 className="text-xl font-semibold text-gray-900 md:text-2xl">{children}</h2>
      {href && (
        <Link href={href} className="whitespace-nowrap rounded-full px-3 py-1.5 text-sm font-semibold text-gray-900 hover:bg-surface-alt hover:underline">
          {linkLabel} ›
        </Link>
      )}
    </div>
  );
}

// ---------------------------------------------------------------- directory home
async function DirectoryHome({ settings }) {
  const [taxonomy, counts, featuredRaw, verifiedRaw, dirSettings] = await Promise.all([
    getTaxonomy(),
    getCounts(),
    getFeaturedBusinesses(8),
    getVerifiedBusinesses(8),
    getDirectorySettings(),
  ]);

  const featured = enrichBusinesses(featuredRaw, taxonomy);
  const featuredIds = new Set(featured.map((b) => b.id));
  const verified = enrichBusinesses(verifiedRaw, taxonomy).filter((b) => !featuredIds.has(b.id));
  const popularCities = taxonomy.cities.filter((c) => c.is_popular);

  const waNumber = toWaNumber(settings.wa_service_whatsapp_number);
  const addLink = waNumber
    ? `https://wa.me/${waNumber}?text=${encodeURIComponent('Assalam o Alaikum, main apna business directory mein add karwana chahta hoon.')}`
    : '/contact';

  return (
    <>
      <NewsTicker text={settings.show_news_ticker === false ? '' : settings.scrolling_news} />
      <Header siteName={settings.site_name} logoUrl={settings.logo_url} />

      <main className="flex-1 bg-surface">
        <HomeExplorer categories={taxonomy.categories} cities={taxonomy.cities} areas={taxonomy.areas} siteName={settings.site_name}>
          {featured.length > 0 && (
            <section>
              <SectionTitle>Featured Businesses</SectionTitle>
              <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5">
                {featured.map((b) => (
                  <BusinessCard key={b.id} business={b} siteName={settings.site_name} />
                ))}
              </div>
            </section>
          )}

          {verified.length > 0 && (
            <section>
              <SectionTitle>
                <span className="inline-flex flex-wrap items-center gap-2.5">
                  Verified Businesses <VerifiedBadge />
                </span>
              </SectionTitle>
              <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5">
                {verified.map((b) => (
                  <BusinessCard key={b.id} business={b} siteName={settings.site_name} />
                ))}
              </div>
            </section>
          )}

          {popularCities.length > 0 && (
            <section>
              <SectionTitle href="/directory">Popular Cities</SectionTitle>
              <CityGrid cities={popularCities} counts={counts.cities} />
            </section>
          )}

          <section className="grid gap-4 md:grid-cols-3">
            {[
              ['pin', 'Aap ke qareeb', 'Location se nearest school, hospital, doctor aur hotel seconds mein.'],
              ['shield', 'Verified businesses', 'Verified badge wale businesses ki maujoodgi aur contact details admin ne check ki hoti hain.'],
              ['phone', 'Seedha rabta', 'Ek tap mein call ya WhatsApp order — beech mein koi nahi.'],
            ].map(([art, title, text]) => (
              <div key={title} className="flex items-start gap-3.5 rounded-3xl border border-line bg-gradient-to-b from-surface to-surface-alt p-5 shadow-[inset_0_1px_0_rgba(255,255,255,0.9),0_8px_22px_-14px_rgba(0,0,0,0.3)]">
                <Art3D name={art} className="h-12 w-12 flex-shrink-0" />
                <div>
                  <h3 className="text-base font-semibold text-gray-900">{title}</h3>
                  <p className="mt-1 text-sm text-gray-600">{text}</p>
                </div>
              </div>
            ))}
          </section>

          <section className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-brand-500 to-brand-800 p-6 text-white shadow-[inset_0_1px_0_rgba(255,255,255,0.35),0_20px_40px_-20px_rgba(0,0,0,0.5)] md:p-10">
            <div className="pointer-events-none absolute -right-16 -top-20 h-64 w-64 rounded-full bg-white/15 blur-2xl" />
            <div className="relative flex flex-col items-start justify-between gap-5 md:flex-row md:items-center">
              <div className="max-w-2xl">
                <h2 className="text-2xl font-bold md:text-3xl">Apna business list karwayein</h2>
                <p className="mt-2 text-sm text-white/90 md:text-base">
                  Apne shehar ke customers tak pahunchein.
                  {dirSettings?.verified_enabled
                    ? ' Verified badge lagwa kar aur zyada bharosa aur search mein behtar jagah payein.'
                    : ''}
                </p>
              </div>
              <a
                href={addLink}
                target={waNumber ? '_blank' : undefined}
                rel={waNumber ? 'noopener noreferrer' : undefined}
                className="inline-flex min-h-[48px] items-center gap-2 rounded-xl bg-white px-6 py-3 text-sm font-bold text-gray-900 shadow-[0_10px_24px_-10px_rgba(0,0,0,0.5)] transition active:scale-95 hover:bg-white/90"
              >
                <HomeIcon name={waNumber ? 'whatsapp' : 'arrow'} className="h-5 w-5" />
                Add Your Business
              </a>
            </div>
          </section>
        </HomeExplorer>
      </main>

      <Footer siteName={settings.site_name} settings={settings} />
    </>
  );
}

// ---------------------------------------------------------------- classic jobs home
// Shown only when the Directory page is switched OFF in Admin → Pages & Ads,
// so the old jobs home is never lost.
async function JobsHome({ settings }) {
  const [{ data: jobs }, slides] = await Promise.all([
    supabase.from('jobs_table').select('*').order('created_at', { ascending: false }).limit(30),
    getHeroSlides(),
  ]);
  const allOpenJobs = (jobs || []).filter(isJobOpen);
  const latestJobs = allOpenJobs.slice(0, 12);

  return (
    <>
      <NewsTicker text={settings.show_news_ticker === false ? '' : settings.scrolling_news} />
      <Header siteName={settings.site_name} logoUrl={settings.logo_url} />

      <main className="flex-1 bg-surface">
        <div className="mx-auto max-w-[1760px] space-y-8 px-4 py-4 md:space-y-10 md:px-10 md:py-6">
          <HomeLead slides={slides || []} slideSpeed={settings.hero_slide_speed} />
          <HomeCategories />
          <HomeClosingSoon jobs={allOpenJobs} />
          <HomeLatestJobs jobs={latestJobs} />
          <AdSlot html={settings.ad_code_list} />
          <HomeSidebar settings={{ ...settings, ad_code_list: '' }} />
        </div>

        <HomeInfo />
        <HomeFaq />
      </main>

      <Footer siteName={settings.site_name} settings={settings} />
    </>
  );
}

export default async function HomePage() {
  const settings = (await getSiteSettings()) || {};
  const directoryOn = resolveVisibility(settings).directory;
  return directoryOn ? <DirectoryHome settings={settings} /> : <JobsHome settings={settings} />;
}
