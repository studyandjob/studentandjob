/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: '**' }, // allow any https image host (logo_url, hero images, etc.)
    ],
    // Serve remote images (Supabase Storage URLs) as-is, without routing them
    // through Next's built-in /_next/image optimizer. That optimizer only
    // works reliably on Vercel or a fully-configured Node server; on many
    // other hosts (shared hosting, cPanel, some VPS setups) it silently
    // fails in production even though it works fine locally with `next dev`
    // — which is exactly why an image can look fine in local/admin testing
    // but not show up on the live deployed site.
    unoptimized: true,
  },
};

module.exports = nextConfig;
