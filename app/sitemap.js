import { getJobs } from '@/lib/data';

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://onlinejobsandstudy.vercel.app';

const STATIC_PAGES = [
  { path: '', priority: 1, changeFrequency: 'daily' },
  { path: '/jobs', priority: 0.9, changeFrequency: 'hourly' },
  { path: '/scholarships', priority: 0.7, changeFrequency: 'daily' },
  { path: '/results', priority: 0.6, changeFrequency: 'daily' },
  { path: '/students-zone', priority: 0.6, changeFrequency: 'weekly' },
  { path: '/study-zone', priority: 0.6, changeFrequency: 'weekly' },
  { path: '/vip', priority: 0.5, changeFrequency: 'weekly' },
  { path: '/about-us', priority: 0.3, changeFrequency: 'monthly' },
  { path: '/contact', priority: 0.3, changeFrequency: 'monthly' },
  { path: '/application-support', priority: 0.3, changeFrequency: 'monthly' },
  { path: '/privacy-policy', priority: 0.1, changeFrequency: 'yearly' },
  { path: '/terms-and-conditions', priority: 0.1, changeFrequency: 'yearly' },
  { path: '/disclaimer', priority: 0.1, changeFrequency: 'yearly' },
];

/**
 * Next.js sitemap convention (app/sitemap.js) — served at /sitemap.xml.
 * Includes every job's own /jobs/[id] page (the main reason this exists:
 * without it those pages have no other link Google would find them
 * through besides crawling the client-rendered job list) plus
 * scholarships/results so those get picked up too.
 */
export default async function sitemap() {
  const jobs = await getJobs();

  const staticEntries = STATIC_PAGES.map((p) => ({
    url: `${SITE_URL}${p.path}`,
    changeFrequency: p.changeFrequency,
    priority: p.priority,
  }));

  const jobEntries = jobs.map((job) => ({
    url: `${SITE_URL}/jobs/${job.id}`,
    lastModified: job.created_at ? new Date(job.created_at) : undefined,
    changeFrequency: 'daily',
    priority: 0.8,
  }));

  // Scholarships/results are currently shown via modals with no individual
  // URL yet — only their listing pages (in STATIC_PAGES above) are
  // included until those get their own /scholarships/[id] pages too.
  return [...staticEntries, ...jobEntries];
}
