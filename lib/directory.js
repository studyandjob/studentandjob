// Pakistan Smart Business Directory — shared helpers.
// Used by server pages AND client components (same Supabase client as the
// rest of the site). Tables/functions: see sql/add_directory_phase1.sql.

import { supabase } from './supabaseClient';

// "pakistan" = virtual city meaning "all of Pakistan" in URLs
// (/directory/pakistan/hospitals). "business" is reserved for profile pages.
export const ALL_PAKISTAN_SLUG = 'pakistan';

export const RADIUS_OPTIONS = [1, 5, 10, 25, 50];
export const PAGE_SIZE = 24;

export const VERIFICATION_STATUSES = [
  { value: 'unverified', label: 'Unverified' },
  { value: 'pending', label: 'Pending Verification' },
  { value: 'verified', label: 'Verified' },
  { value: 'rejected', label: 'Rejected' },
  { value: 'suspended', label: 'Suspended' },
];

export const PROVINCES = [
  'Punjab',
  'Sindh',
  'Khyber Pakhtunkhwa',
  'Balochistan',
  'Islamabad Capital Territory',
  'Gilgit-Baltistan',
  'Azad Kashmir',
];

// Icon keys understood by components/HomeIcons.jsx
export const CATEGORY_ICONS = [
  'home', 'building', 'heart', 'shield', 'teacher', 'grad', 'users', 'briefcase',
  'document', 'pin', 'gift', 'money', 'bank', 'star', 'award', 'calendar',
];

export function slugify(text) {
  return String(text || '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
export const isUuid = (v) => UUID_RE.test(String(v || ''));

// ---------------------------------------------------------------- phone / WhatsApp

/** Pakistani number -> wa.me format. 0300 1234567 / +92 300 1234567 -> 923001234567 */
export function toWaNumber(raw) {
  let n = String(raw || '').replace(/\D/g, '');
  if (!n) return '';
  if (n.startsWith('0092')) n = n.slice(2);
  if (n.startsWith('0')) n = `92${n.slice(1)}`;
  return n;
}

/** WhatsApp "order / inquiry" link with a ready-made message. */
export function businessWaLink(business, siteName) {
  const number = toWaNumber(business?.whatsapp || business?.phone);
  if (!number) return '';
  const text = `Assalam o Alaikum, main ${siteName || 'website'} par aap ka "${business.name}" dekh kar rabta kar raha hoon. Mujhe order / maloomat chahiye.`;
  return `https://wa.me/${number}?text=${encodeURIComponent(text)}`;
}

export function telLink(phone) {
  const n = String(phone || '').replace(/[^\d+]/g, '');
  return n ? `tel:${n}` : '';
}

// ---------------------------------------------------------------- location

const toRad = (d) => (d * Math.PI) / 180;

export function distanceKm(lat1, lng1, lat2, lng2) {
  const a =
    Math.sin(toRad(lat2 - lat1) / 2) ** 2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(toRad(lng2 - lng1) / 2) ** 2;
  return 2 * 6371 * Math.asin(Math.sqrt(a));
}

/** Nearest city from our own table — no coordinates are sent to any third party. */
export function nearestCity(lat, lng, cities) {
  let best = null;
  let bestD = Infinity;
  for (const c of cities || []) {
    if (c.latitude == null || c.longitude == null) continue;
    const d = distanceKm(lat, lng, c.latitude, c.longitude);
    if (d < bestD) {
      bestD = d;
      best = c;
    }
  }
  return best ? { city: best, km: bestD } : null;
}

export function formatDistance(km) {
  if (km == null || Number.isNaN(Number(km))) return '';
  const n = Number(km);
  return n < 1 ? `${Math.max(Math.round(n * 1000), 50)} m` : `${n < 10 ? n.toFixed(1) : Math.round(n)} km`;
}

/** Pull lat/lng out of a pasted Google Maps / OpenStreetMap link. */
export function parseMapLink(url) {
  const s = String(url || '');
  const patterns = [
    /@(-?\d{1,3}\.\d+),(-?\d{1,3}\.\d+)/,
    /!3d(-?\d{1,3}\.\d+)!4d(-?\d{1,3}\.\d+)/,
    /[?&](?:q|query|ll|destination)=(-?\d{1,3}\.\d+)(?:,|%2C)(-?\d{1,3}\.\d+)/,
    /#map=\d+\/(-?\d{1,3}\.\d+)\/(-?\d{1,3}\.\d+)/,
    /[?&]mlat=(-?\d{1,3}\.\d+)&mlon=(-?\d{1,3}\.\d+)/,
  ];
  for (const re of patterns) {
    const m = s.match(re);
    if (m) {
      const lat = Number(m[1]);
      const lng = Number(m[2]);
      if (Math.abs(lat) <= 90 && Math.abs(lng) <= 180) return { lat, lng };
    }
  }
  return null;
}

/** Plain link (no API key needed) that opens turn-by-turn directions. */
export function directionsLink(business) {
  if (business?.latitude != null && business?.longitude != null) {
    return `https://www.google.com/maps/dir/?api=1&destination=${business.latitude},${business.longitude}`;
  }
  return business?.map_link || '';
}

// ---------------------------------------------------------------- taxonomy

export function landingPath(citySlug, categorySlug) {
  const c = citySlug || ALL_PAKISTAN_SLUG;
  return categorySlug ? `/directory/${c}/${categorySlug}` : `/directory/${c}`;
}

export function businessPath(business) {
  return `/directory/business/${business.slug || business.id}`;
}

/** Top-level categories, each with a `children` array, in display order. */
export function buildCategoryTree(categories) {
  const sorted = [...(categories || [])].sort(
    (a, b) => (a.display_order ?? 0) - (b.display_order ?? 0) || String(a.name).localeCompare(String(b.name))
  );
  const tops = sorted.filter((c) => !c.parent_id).map((c) => ({ ...c, children: [] }));
  const byId = Object.fromEntries(tops.map((t) => [t.id, t]));
  for (const c of sorted) if (c.parent_id && byId[c.parent_id]) byId[c.parent_id].children.push(c);
  return tops;
}

export async function getTaxonomy() {
  const [cats, cities, areas] = await Promise.all([
    supabase.from('directory_categories').select('*').eq('is_active', true).order('display_order', { ascending: true }),
    supabase.from('directory_cities').select('*').eq('is_active', true).order('display_order', { ascending: true }),
    supabase.from('directory_areas').select('*').order('display_order', { ascending: true }),
  ]);
  return { categories: cats.data || [], cities: cities.data || [], areas: areas.data || [] };
}

export async function getCounts() {
  const { data } = await supabase.rpc('directory_counts');
  return { categories: data?.categories || {}, cities: data?.cities || {} };
}

/** Adds readable names (category_label, city_label, ...) to raw business rows. */
export function enrichBusinesses(rows, taxonomy) {
  const cat = Object.fromEntries((taxonomy.categories || []).map((c) => [c.id, c]));
  const city = Object.fromEntries((taxonomy.cities || []).map((c) => [c.id, c]));
  const area = Object.fromEntries((taxonomy.areas || []).map((a) => [a.id, a]));
  return (rows || []).map((b) => ({
    ...b,
    category_label: cat[b.category_id]?.name || b.category || '',
    category_slug: cat[b.category_id]?.slug || '',
    subcategory_label: cat[b.subcategory_id]?.name || '',
    subcategory_slug: cat[b.subcategory_id]?.slug || '',
    city_label: city[b.city_id]?.name || b.area || '',
    city_slug: city[b.city_id]?.slug || '',
    area_label: area[b.area_id]?.name || '',
  }));
}

// ---------------------------------------------------------------- business data

/** One call for nearby / search / filter / sort — runs inside the database. */
export async function searchBusinesses(filters = {}) {
  const { data, error } = await supabase.rpc('directory_search', {
    p_lat: filters.lat ?? null,
    p_lng: filters.lng ?? null,
    p_radius_km: filters.radiusKm ?? null,
    p_city_id: filters.cityId || null,
    p_area_id: filters.areaId || null,
    p_category_id: filters.categoryId || null,
    p_q: filters.q || null,
    p_verified_only: Boolean(filters.verifiedOnly),
    p_sort: filters.sort || 'featured',
    p_limit: filters.limit || PAGE_SIZE,
    p_offset: filters.offset || 0,
  });
  if (error) return { total: 0, rows: [], error: error.message };
  return { total: data?.total || 0, rows: data?.rows || [] };
}

export async function getFeaturedBusinesses(limit = 8) {
  const { data } = await supabase
    .from('businesses_table')
    .select('*')
    .eq('is_active', true)
    .eq('listing_status', 'published')
    .eq('is_featured', true)
    .order('display_order', { ascending: true })
    .order('created_at', { ascending: false })
    .limit(limit);
  return data || [];
}

export async function getRecentBusinesses(limit = 8) {
  const { data } = await supabase
    .from('businesses_table')
    .select('*')
    .eq('is_active', true)
    .eq('listing_status', 'published')
    .order('created_at', { ascending: false })
    .limit(limit);
  return data || [];
}

/** Profile lookup by clean slug; old links that used the raw id keep working. */
export async function getBusinessBySlug(slugOrId) {
  if (!slugOrId) return null;
  let { data } = await supabase.from('businesses_table').select('*').eq('slug', slugOrId).eq('is_active', true)
    .eq('listing_status', 'published').maybeSingle();
  if (!data && isUuid(slugOrId)) {
    ({ data } = await supabase.from('businesses_table').select('*').eq('id', slugOrId).eq('is_active', true)
    .eq('listing_status', 'published').maybeSingle());
  }
  return data || null;
}

/** Minimal rows for sitemap + per-city category counts. */
export async function getBusinessIndex() {
  const { data } = await supabase
    .from('businesses_table')
    .select('id, slug, created_at, city_id, category_id, subcategory_id')
    .eq('is_active', true)
    .eq('listing_status', 'published');
  return data || [];
}

// ---------------------------------------------------------------- verified badge

export const PAYMENT_METHODS = [
  { value: 'jazzcash', label: 'JazzCash' },
  { value: 'easypaisa', label: 'Easypaisa' },
  { value: 'bank', label: 'Bank transfer' },
  { value: 'other', label: 'Other' },
];

/** A badge counts only while status is "verified" AND it has not expired. */
export function isVerified(business) {
  if (!business) return false;
  if (typeof business.is_verified === 'boolean') return business.is_verified; // computed by the database
  if (business.verification_status !== 'verified') return false;
  return !business.verified_until || new Date(business.verified_until) > new Date();
}

export async function getDirectorySettings() {
  const { data } = await supabase.from('directory_settings').select('*').eq('id', 1).maybeSingle();
  return data || null;
}

// ---------------------------------------------------------------- category art

// Category slug -> Airbnb-style illustrated icon in components/Art3D.jsx
export const CATEGORY_ART = {
  schools: 'teacher',
  'colleges-universities': 'study',
  academies: 'book',
  hospitals: 'hospital',
  'hotels-accommodation': 'hotel',
  doctors: 'doctor',
  'advocates-legal': 'scales',
  'homes-properties': 'home',
  'factories-industries': 'factory',
  'parks-recreation': 'park',
  'restaurants-food': 'restaurant',
  'shops-retail': 'shop',
  'repair-services': 'repair',
  other: 'star',
};

/** Order of the home-page tabs and rows. Anything else follows by display order. */
export const HOME_CATEGORY_ORDER = [
  'schools',
  'colleges-universities',
  'academies',
  'hospitals',
  'hotels-accommodation',
  'doctors',
  'advocates-legal',
];

export function artFor(slug, fallback = 'building') {
  return CATEGORY_ART[slug] || fallback;
}

/** Businesses whose paid/manual badge is currently active (not expired). */
export async function getVerifiedBusinesses(limit = 8) {
  const { data } = await supabase
    .from('businesses_table')
    .select('*')
    .eq('is_active', true)
    .eq('listing_status', 'published')
    .eq('verification_status', 'verified')
    .or(`verified_until.is.null,verified_until.gt.${new Date().toISOString()}`)
    .order('is_featured', { ascending: false })
    .order('display_order', { ascending: true })
    .order('created_at', { ascending: false })
    .limit(limit);
  return data || [];
}
