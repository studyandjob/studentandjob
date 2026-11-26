import Link from 'next/link';
import Header from '@/components/Header';
import NewsTicker from '@/components/NewsTicker';
import Footer from '@/components/Footer';
import HomeIcon from '@/components/HomeIcons';
import BusinessCard from '@/components/BusinessCard';
import DirectoryExplorer from '@/components/directory/DirectoryExplorer';
import CategoryGrid from '@/components/directory/CategoryGrid';
import CityGrid from '@/components/directory/CityGrid';
import { getSiteSettings } from '@/lib/data';
import {
  buildCategoryTree,
  enrichBusinesses,
  slugify,
  getCounts,
  getFeaturedBusinesses,
  getRecentBusinesses,
  getTaxonomy,
} from '@/lib/directory';

export const dynamic = 'force-dynamic';

export async function generateMetadata() {
  const settings = await getSiteSettings();
  return {
    title: `Pakistan Business Directory — Discover Businesses Near You | ${settings.site_name || 'Local Directory'}`,
    description:
      'Pakistan bhar ke hospitals, doctors, schools, academies, hotels, properties aur local businesses apne qareeb dhoondein. Phone, WhatsApp aur directions ke sath.',
  };
}

function Section({ title, href, linkLabel, children }) {
  return (
    <section className="mb-12">
      <div className="mb-4 flex items-center justify-between gap-3">
        <h2 className="text-lg font-bold text-gray-900 md:text-2xl">{title}</h2>
        {href && (
          <Link href={href} className="text-sm font-semibold text-brand-600 hover:underline">
            {linkLabel || 'Sab dekhein'} →
          </Link>
        )}
      </div>
      {children}
    </section>
  );
}

export default async function DirectoryPage({ searchParams }) {
  const [settings, taxonomy, counts, featuredRaw, recentRaw] = await Promise.all([
    getSiteSettings(),
    getTaxonomy(),
    getCounts(),
    getFeaturedBusinesses(8),
    getRecentBusinesses(8),
  ]);

  const tops = buildCategoryTree(taxonomy.categories);

  // From the header search: /directory?q=...&city=...&near=1
  const q = typeof searchParams?.q === 'string' ? searchParams.q.slice(0, 80) : '';
  const cityText = typeof searchParams?.city === 'string' ? searchParams.city.trim().toLowerCase() : '';
  const cityMatch = cityText
    ? taxonomy.cities.find((c) => c.slug === slugify(cityText) || c.name.toLowerCase() === cityText) ||
      taxonomy.cities.find((c) => c.name.toLowerCase().includes(cityText))
    : null;
  const autoLocate = searchParams?.near === '1';
  const featured = enrichBusinesses(featuredRaw, taxonomy);
  const featuredIds = new Set(featured.map((b) => b.id));
  const recent = enrichBusinesses(recentRaw, taxonomy).filter((b) => !featuredIds.has(b.id)).slice(0, 8);
  const popularCities = taxonomy.cities.filter((c) => c.is_popular);


  return (
    <>
      <NewsTicker text={settings.show_news_ticker === false ? '' : settings.scrolling_news} />
      <Header siteName={settings.site_name} logoUrl={settings.logo_url} />

      <main className="flex-1 bg-surface">
        <DirectoryExplorer
          mode="hub"
          initialQuery={q}
          initialFilters={{ cityId: cityMatch?.id || '' }}
          autoLocate={autoLocate}
          categories={taxonomy.categories}
          cities={taxonomy.cities}
          areas={taxonomy.areas}
          siteName={settings.site_name}
        >
          <Section title="Popular Categories">
            <CategoryGrid categories={tops} counts={counts.categories} />
          </Section>

          {featured.length > 0 && (
            <Section title="Featured Businesses">
              <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                {featured.map((b) => (
                  <BusinessCard key={b.id} business={b} siteName={settings.site_name} />
                ))}
              </div>
            </Section>
          )}

          {recent.length > 0 && (
            <Section title="Recently Added">
              <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                {recent.map((b) => (
                  <BusinessCard key={b.id} business={b} siteName={settings.site_name} />
                ))}
              </div>
            </Section>
          )}

          {featured.length === 0 && recent.length === 0 && (
            <div className="mb-12 rounded-2xl border border-line bg-surface p-10 text-center shadow-card">
              <p className="text-base font-semibold text-gray-700">Directory jald shuru ho rahi hai</p>
              <p className="mt-1.5 text-sm text-gray-500">Local businesses yahan nazar aane lagenge.</p>
            </div>
          )}

          <Section title="Explore Popular Cities">
            <CityGrid cities={popularCities} counts={counts.cities} />
          </Section>

          <div className="flex flex-col items-center justify-between gap-4 rounded-3xl border border-line bg-gradient-to-b from-surface to-surface-alt p-6 text-center shadow-[inset_0_1px_0_rgba(255,255,255,0.9)] md:flex-row md:text-left">
            <div>
              <p className="text-base font-bold text-gray-900">Apna business list karwana chahte hain?</p>
              <p className="mt-1 text-sm text-gray-600">Email se account banayein, apni profile bharein — admin approve karega to website par live ho jayegi.</p>
            </div>
            <Link
              href="/business/register"
              className="inline-flex min-h-[44px] items-center justify-center gap-2 rounded-xl bg-gradient-to-b from-brand-500 to-brand-700 px-5 py-2.5 text-sm font-semibold text-white shadow-[inset_0_1px_0_rgba(255,255,255,0.4)] transition active:scale-95 hover:brightness-105"
            >
              <HomeIcon name="building" className="h-5 w-5" />
              Add Your Business
            </Link>
          </div>
        </DirectoryExplorer>
      </main>

      <Footer siteName={settings.site_name} settings={settings} />
    </>
  );
}
