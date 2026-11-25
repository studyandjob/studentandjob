import Link from 'next/link';
import { notFound } from 'next/navigation';
import Header from '@/components/Header';
import NewsTicker from '@/components/NewsTicker';
import Footer from '@/components/Footer';
import DirectoryExplorer from '@/components/directory/DirectoryExplorer';
import { getSiteSettings } from '@/lib/data';
import { ALL_PAKISTAN_SLUG, businessPath, enrichBusinesses, getTaxonomy, landingPath, searchBusinesses } from '@/lib/directory';

export const dynamic = 'force-dynamic';

async function resolve(params) {
  const taxonomy = await getTaxonomy();
  const city = params.city === ALL_PAKISTAN_SLUG ? null : taxonomy.cities.find((c) => c.slug === params.city) || null;
  const category = taxonomy.categories.find((c) => c.slug === params.category) || null;
  const valid = (params.city === ALL_PAKISTAN_SLUG || city) && category;
  return { taxonomy, city, category, valid };
}

export async function generateMetadata({ params }) {
  const { city, category, valid } = await resolve(params);
  if (!valid) return { title: 'Directory' };
  const place = city ? city.name : 'Pakistan';
  return {
    title: `${category.name} in ${place}`,
    description: `${place} mein ${category.name} ki list — address, phone number, WhatsApp aur directions. Apne qareeb sab se behtar ${category.name} dhoondein.`,
  };
}

export default async function CityCategoryPage({ params }) {
  const { taxonomy, city, category, valid } = await resolve(params);
  if (!valid) notFound();

  const settings = await getSiteSettings();
  const initial = await searchBusinesses({ cityId: city?.id || null, categoryId: category.id, sort: 'featured' });

  const place = city ? city.name : 'Pakistan';
  const parent = category.parent_id ? taxonomy.categories.find((c) => c.id === category.parent_id) : null;
  const children = taxonomy.categories
    .filter((c) => c.parent_id === category.id)
    .sort((a, b) => (a.display_order ?? 0) - (b.display_order ?? 0));

  // Structured data for the list (names + links only — no invented ratings).
  const listed = enrichBusinesses(initial.rows, taxonomy);
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://onlinejobsandstudy.vercel.app';
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    name: `${category.name} in ${place}`,
    itemListElement: listed.map((b, i) => ({
      '@type': 'ListItem',
      position: i + 1,
      name: b.name,
      url: `${siteUrl}${businessPath(b)}`,
    })),
  };

  return (
    <>
      <NewsTicker text={settings.show_news_ticker === false ? '' : settings.scrolling_news} />
      <Header siteName={settings.site_name} logoUrl={settings.logo_url} />

      <main className="flex-1 bg-surface">
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, '\\u003c') }} />

        <div className="mx-auto max-w-7xl px-4 pt-8 md:px-6 md:pt-10">
          <nav className="mb-3 text-sm text-gray-500" aria-label="Breadcrumb">
            <Link href="/directory" className="hover:underline">Directory</Link> <span>/</span>{' '}
            <Link href={landingPath(city?.slug)} className="hover:underline">{place}</Link> <span>/</span>{' '}
            {parent && (
              <>
                <Link href={landingPath(city?.slug, parent.slug)} className="hover:underline">{parent.name}</Link> <span>/</span>{' '}
              </>
            )}
            <span className="text-gray-800">{category.name}</span>
          </nav>
          <h1 className="text-2xl font-bold tracking-tight text-gray-900 md:text-4xl">
            {category.name} in {place}
          </h1>

          {children.length > 0 && (
            <div className="mt-4 flex flex-wrap gap-2">
              {children.map((c) => (
                <Link
                  key={c.id}
                  href={landingPath(city?.slug, c.slug)}
                  className="rounded-full border border-line bg-surface px-3.5 py-1.5 text-sm font-medium text-gray-700 hover:bg-surface-alt"
                >
                  {c.name}
                </Link>
              ))}
            </div>
          )}
        </div>

        <DirectoryExplorer
          mode="listing"
          categories={taxonomy.categories}
          cities={taxonomy.cities}
          areas={taxonomy.areas}
          initialFilters={{ cityId: city?.id || '', categoryId: category.id }}
          initialData={initial}
          siteName={settings.site_name}
        />
      </main>

      <Footer siteName={settings.site_name} settings={settings} />
    </>
  );
}
