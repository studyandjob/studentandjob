/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: '**' }, // allow any https image host (logo_url, hero images, etc.)
    ],
  },
};

module.exports = nextConfig;
