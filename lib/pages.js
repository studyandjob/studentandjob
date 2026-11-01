// Single source of truth for which public pages exist and whether the admin
// can switch them off. The admin's "Pages & Ads" tab writes a
// { [key]: boolean } object into site_settings.page_visibility; everything
// else (menus, footer, sitemap, route guards) reads it through the helpers
// below — so a page that is switched off disappears everywhere at once but
// its code and data stay in the project for later.

export const PAGE_DEFS = [
  { key: 'home', label: 'Home', paths: ['/'], locked: true, defaultOn: true },
  { key: 'jobs', label: 'Jobs', paths: ['/jobs'], locked: true, defaultOn: true },
  { key: 'contact', label: 'Contact Us', paths: ['/contact'], locked: true, defaultOn: true },
  { key: 'privacy', label: 'Privacy Policy', paths: ['/privacy-policy'], locked: true, defaultOn: true },
  { key: 'terms', label: 'Terms & Conditions', paths: ['/terms-and-conditions'], locked: true, defaultOn: true },
  { key: 'disclaimer', label: 'Disclaimer', paths: ['/disclaimer'], locked: true, defaultOn: true },
  { key: 'about', label: 'About Us', paths: ['/about-us'], locked: false, defaultOn: true },
  { key: 'study-zone', label: 'Study Zone (notes, past papers, tests)', paths: ['/study-zone'], locked: false, defaultOn: false },
  { key: 'students-zone', label: 'Students Zone', paths: ['/students-zone'], locked: false, defaultOn: false },
  { key: 'results', label: 'Results', paths: ['/results'], locked: false, defaultOn: false },
  { key: 'scholarships', label: 'Scholarships', paths: ['/scholarships'], locked: false, defaultOn: false },
  { key: 'vip', label: 'VIP Portal', paths: ['/vip'], locked: false, defaultOn: false },
  { key: 'application-support', label: 'Application Support (paid WhatsApp service)', paths: ['/application-support'], locked: false, defaultOn: false },
];

/** Returns { [key]: boolean } for every page. Locked pages are always on;
 * a page the admin has never touched falls back to its default. */
export function resolveVisibility(settings) {
  const stored =
    settings?.page_visibility && typeof settings.page_visibility === 'object' ? settings.page_visibility : {};
  const out = {};
  for (const def of PAGE_DEFS) {
    out[def.key] = def.locked ? true : def.key in stored ? Boolean(stored[def.key]) : def.defaultOn;
  }
  return out;
}

export function isPageEnabled(settings, key) {
  return resolveVisibility(settings)[key] !== false;
}
