import './globals.css';
import { supabase } from '@/lib/supabaseClient';

export async function generateMetadata() {
  const { data } = await supabase.from('site_settings').select('*').limit(1).maybeSingle();
  return {
    title: data?.site_name || 'Education & Job Portal',
    description: data?.sub_heading || 'Government jobs, results, notes and scholarships in one place.',
  };
}

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className="min-h-screen flex flex-col antialiased">{children}</body>
    </html>
  );
}
