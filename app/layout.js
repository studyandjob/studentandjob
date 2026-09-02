import { Public_Sans, Noto_Nastaliq_Urdu, Fraunces } from 'next/font/google';
import './globals.css';
import { supabase } from '@/lib/supabaseClient';
import NavigationProgress from '@/components/NavigationProgress';
import MobileBottomNav from '@/components/MobileBottomNav';
import TextThemeStyle from '@/components/TextThemeStyle';
import { ThemeProvider } from '@/contexts/ThemeContext';
import { DEFAULT_TEXT_THEME_ID, TEXT_THEMES } from '@/lib/textThemes';
import { DEFAULT_THEME_ID, THEMES, buildAccentScale, buildShadeScale, hexToRgbTriplet } from '@/lib/themes';

// --- Anti-flash boot script ------------------------------------------
// Both TextThemeStyle and ThemeContext apply their saved theme inside a
// React `useEffect`, which only runs AFTER the first paint. On a hard/
// fresh page load (typing the URL, refreshing, opening in a new tab —
// exactly how most visitors land on the Home page) the browser paints
// once with the default colors, then a beat later swaps to the saved
// theme. On a client-side <Link> navigation (e.g. Home -> Jobs) the vars
// are already sitting on <html> from the previous page, so no flash is
// visible there. That mismatch is what reads as "theme shows on the Jobs
// page but not on Home".
//
// Fix: pre-compute every theme's CSS variables at build time (below) and
// run a tiny synchronous script in <head>, BEFORE the page paints, that
// reads the same localStorage keys the two client components already use
// and sets the variables immediately. TextThemeStyle/ThemeContext still
// run afterwards to (a) handle visitors with no localStorage entry yet
// and (b) sync the site-wide Supabase default — they just no longer have
// anything to visibly "fix", so every page (Home included) is correct on
// the very first frame.
const TEXT_THEME_VARS = Object.fromEntries(
  TEXT_THEMES.map((theme) => [theme.id, theme.shades])
);

const BRAND_THEME_VARS = Object.fromEntries(
  THEMES.map((theme) => [
    theme.id,
    {
      brand: Object.fromEntries(
        Object.entries(buildShadeScale(theme.primary)).map(([step, hex]) => [step, hexToRgbTriplet(hex)])
      ),
      accent: Object.fromEntries(
        Object.entries(buildAccentScale(theme.accent)).map(([step, hex]) => [step, hexToRgbTriplet(hex)])
      ),
      bg: theme.background,
      text: theme.text,
    },
  ])
);

const THEME_BOOT_SCRIPT = `(function(){try{
  var d=document.documentElement;
  var TT=${JSON.stringify(TEXT_THEME_VARS)};
  var BT=${JSON.stringify(BRAND_THEME_VARS)};
  var tId=localStorage.getItem('psj-text-theme')||'${DEFAULT_TEXT_THEME_ID}';
  var tt=TT[tId]||TT['${DEFAULT_TEXT_THEME_ID}'];
  for(var k in tt){d.style.setProperty('--text-'+k,tt[k]);}
  d.dataset.textTheme=tId;
  var bId=localStorage.getItem('psj-active-theme')||'${DEFAULT_THEME_ID}';
  var bt=BT[bId]||BT['${DEFAULT_THEME_ID}'];
  for(var k2 in bt.brand){d.style.setProperty('--brand-'+k2,bt.brand[k2]);}
  for(var k3 in bt.accent){d.style.setProperty('--accent-'+k3,bt.accent[k3]);}
  d.style.setProperty('--color-bg',bt.bg);
  d.style.setProperty('--color-text',bt.text);
  d.dataset.theme=bId;
}catch(e){}})();`;

// English/Latin body font used across the whole public site.
const publicSans = Public_Sans({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700', '800'],
  variable: '--font-public-sans',
});

// Display/headline serif — the same face the admin dashboard already uses
// for its wordmark and page titles (see app/admin/layout.js). Loading it
// here too means the public site's brand name and big headlines share the
// same distinctive typographic voice as the admin panel, instead of the
// whole site reading as one flat sans-serif block.
const fraunces = Fraunces({
  subsets: ['latin'],
  weight: ['600', '700'],
  variable: '--font-fraunces',
});

// Dedicated Urdu font. Loaded once here and added as a fallback in
// tailwind.config.js's `sans` stack, so ANY Urdu/Arabic-script text
// anywhere on the site — headings, tags like "وفاقی/پنجاب", job titles,
// etc. — automatically renders with this font instead of whatever
// default Urdu font (or none) happens to be installed on the visitor's
// device/browser.
const notoNastaliqUrdu = Noto_Nastaliq_Urdu({
  subsets: ['arabic'],
  weight: ['400', '600', '700'],
  variable: '--font-urdu',
});

// Production URL — used for metadataBase (so relative OG/canonical URLs
// resolve correctly) and as the canonical/OG url itself. Overridable via
// env for staging/custom-domain deployments without touching code.
const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://onlinejobsandstudy.vercel.app';

// Generic, natural (not stuffed) keywords describing what this site
// actually is — jobs + education resources for Pakistan. These describe
// the real, existing site sections (Jobs, Scholarships, Study Zone,
// Results, Notes/Past Papers), not invented features.
const SITE_KEYWORDS = [
  'Pakistan jobs',
  'latest jobs in Pakistan',
  'government jobs Pakistan',
  'scholarships in Pakistan',
  'study resources',
  'online tests',
  'past papers',
  'student resources',
];

export async function generateMetadata() {
  // Same ordering fix as app/page.js and lib/data.js — without it this could
  // read a stale row and show the wrong browser-tab title.
  const { data } = await supabase
    .from('site_settings')
    .select('*')
    .order('updated_at', { ascending: false, nullsFirst: false })
    .limit(1)
    .maybeSingle();

  const siteName = data?.site_name || 'Education & Job Portal';
  const description = data?.sub_heading || 'Government jobs, results, notes and scholarships in one place.';
  // logo_url is whatever the admin actually uploaded — used as-is for the
  // OG image so social previews never show a placeholder/fake graphic.
  const ogImage = data?.logo_url || undefined;

  return {
    metadataBase: new URL(SITE_URL),
    title: { default: siteName, template: `%s — ${siteName}` },
    description,
    keywords: SITE_KEYWORDS,
    alternates: { canonical: '/' },
    robots: { index: true, follow: true },
    openGraph: {
      type: 'website',
      url: '/',
      siteName,
      title: siteName,
      description,
      locale: 'en_PK',
      images: ogImage ? [{ url: ogImage }] : undefined,
    },
    twitter: {
      card: ogImage ? 'summary_large_image' : 'summary',
      title: siteName,
      description,
      images: ogImage ? [ogImage] : undefined,
    },
  };
}

export default async function RootLayout({ children }) {
  // Reused for JSON-LD structured data below — same query generateMetadata
  // already runs, so the site's actual (admin-set) name/logo drives the
  // schema too instead of a hardcoded organization name.
  const { data: settings } = await supabase
    .from('site_settings')
    .select('site_name, logo_url')
    .order('updated_at', { ascending: false, nullsFirst: false })
    .limit(1)
    .maybeSingle();

  const websiteSchema = {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: settings?.site_name || 'Education & Job Portal',
    url: SITE_URL,
    ...(settings?.logo_url ? { image: settings.logo_url } : {}),
  };

  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={`${publicSans.variable} ${notoNastaliqUrdu.variable} ${fraunces.variable}`}
    >
      <head>
        {/* Structured data (Organization/WebSite) — real fields only,
            driven by whatever the admin has actually set in Website
            Settings. Helps search engines show a richer result without
            asserting anything the site can't back up. */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteSchema) }}
        />
        {/* Runs before first paint on every page (Home included) so the
            saved text/brand theme is correct from frame one — see the
            comment above THEME_BOOT_SCRIPT. */}
        <script dangerouslySetInnerHTML={{ __html: THEME_BOOT_SCRIPT }} />
      </head>
      <body className="min-h-screen flex flex-col antialiased font-sans pb-16 md:pb-0">
        <ThemeProvider>
          <TextThemeStyle />
          <NavigationProgress>{children}</NavigationProgress>
          <MobileBottomNav />
        </ThemeProvider>
      </body>
    </html>
  );
}
