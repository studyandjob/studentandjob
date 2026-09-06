const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://onlinejobsandstudy.vercel.app';

/** Next.js robots.js convention — served at /robots.txt. Blocks the admin
 * dashboard and API routes from being crawled/indexed; everything public
 * is allowed. */
export default function robots() {
  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: ['/admin', '/api'],
    },
    sitemap: `${SITE_URL}/sitemap.xml`,
  };
}
