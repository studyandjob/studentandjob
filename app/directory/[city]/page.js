import Link from 'next/link';
import { notFound, redirect } from 'next/navigation';
import Header from '@/components/Header';
import NewsTicker from '@/components/NewsTicker';
import Footer from '@/components/Footer';
import DirectoryExplorer from '@/components/directory/DirectoryExplorer';
import CategoryGrid from '@/components/directory/CategoryGrid';
import { getSiteSettings } from '@/lib/data';
import {
  ALL_PAKISTAN_SLUG,
  buildCategoryTree,
  businessPath,
  getBusinessBySlug,
  getBusinessIndex,
  getTaxonomy,
  searchBusinesses,
} from '@/lib/directory';

export const dynamic = 'force-dynamic';

async function resolveCity(slug) {
  const taxonomy = await getTaxonomy();
  if (slug === ALL_PAKISTAN_SLUG) return { taxonomy, city: null };
  const city = taxonomy.cities.find((c) => c.slug === slug) || null;
  return { taxonomy, city };
}

export async function generateMetadata({ params }) {
  const { city } = await resolveCity(params.city);
  if (!city && params.city !== ALL_PAKISTAN_SLUG) return { title: 'Directory' };
  const place = city ? city.name : 'Pakistan';
  return {
    title: `Businesses in ${place} — Hospitals, Doctors, Schools & More`,
    description: `${place} ke hospitals, doctors, schools, academies, hotels aur local businesses — phone, WhatsApp aur directions ke sath.`,
  };
}

export default async function CityPage({ params }) {
  const { taxonomy, city } = await resolveCity(params.city);

  if (!city && params.city !== ALL_PAKISTAN_SLUG) {
    // Old links were /directory/<business id> — send them to the new profile URL.
    const old = await getBusinessBySlug(params.city);
    if (old) redirect(businessPath(old));
    notFound();
  }

  const settings = await getSiteSettings();
  const [initial, index] = await Promise.all([
    searchBusinesses({ cityId: city?.id || null, sort: 'featured' }),
    getBusinessIndex(),
  ]);

  // Listings per category inside this city (for the category cards).
  const counts = {};
  for (const b of index) {
    if (city && b.city_id !== city.id) continue;
    if (b.category_id) counts[b.category_id] = (counts[b.category_id] || 0) + 1;
    if (b.subcategory_id) counts[b.subcategory_id] = (counts[b.subcategory_id] || 0) + 1;
  }

  const place = city ? city.name : 'Pakistan';
  const tops = buildCategoryTree(taxonomy.categories);

  return (
    <>
      <NewsTicker text={settings.show_news_ticker === false ? '' : settings.scrolling_news} />
      <Header siteName={settings.site_name} logoUrl={settings.logo_url} />

      <main className="flex-1 bg-surface">
        <div className="mx-auto max-w-7xl px-4 pt-8 md:px-6 md:pt-10">
          <nav className="mb-3 text-sm text-gray-500" aria-label="Breadcrumb">
            <Link href="/directory" className="hover:underline">Directory</Link> <span>/</span> <span className="text-gray-800">{place}</span>
          </nav>
          <h1 className="text-2xl font-bold tracking-tight text-gray-900 md:text-4xl">Businesses in {place}</h1>
          <p className="mt-1 text-sm text-gray-500 md:text-base">Category chunein ya neeche search karein.</p>
          <div className="mt-6">
            <CategoryGrid categories={tops} counts={counts} citySlug={city?.slug || null} />
          </div>
        </div>

        <DirectoryExplorer
          mode="listing"
          categories={taxonomy.categories}
          cities={taxonomy.cities}
          areas={taxonomy.areas}
          initialFilters={{ cityId: city?.id || '' }}
          initialData={initial}
          siteName={settings.site_name}
        />
      </main>

      <Footer siteName={settings.site_name} settings={settings} />
    </>
  );
}
