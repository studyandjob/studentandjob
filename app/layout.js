import './globals.css';
import { supabase } from '@/lib/supabaseClient';
import NavigationProgress from '@/components/NavigationProgress';

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
    <html lang="en">
      <body className="min-h-screen flex flex-col antialiased">
        <NavigationProgress>{children}</NavigationProgress>
      </body>
    </html>
  );
}
