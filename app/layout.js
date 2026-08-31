import { Public_Sans, Noto_Nastaliq_Urdu, Fraunces } from 'next/font/google';
import './globals.css';
import { supabase } from '@/lib/supabaseClient';
import NavigationProgress from '@/components/NavigationProgress';
import TextThemeStyle from '@/components/TextThemeStyle';
import { ThemeProvider } from '@/contexts/ThemeContext';

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

export async function generateMetadata() {
  // Same ordering fix as app/page.js and lib/data.js — without it this could
  // read a stale row and show the wrong browser-tab title.
  const { data } = await supabase
    .from('site_settings')
    .select('*')
    .order('updated_at', { ascending: false, nullsFirst: false })
    .limit(1)
    .maybeSingle();
  return {
    title: data?.site_name || 'Education & Job Portal',
    description: data?.sub_heading || 'Government jobs, results, notes and scholarships in one place.',
  };
}

export default function RootLayout({ children }) {
  return (
    <html lang="en" className={`${publicSans.variable} ${notoNastaliqUrdu.variable} ${fraunces.variable}`}>
      <body className="min-h-screen flex flex-col antialiased font-sans">
        <ThemeProvider>
          <TextThemeStyle />
          <NavigationProgress>{children}</NavigationProgress>
        </ThemeProvider>
      </body>
    </html>
  );
}
