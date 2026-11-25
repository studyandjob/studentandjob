// Bahawalpur Local Business Directory — shared helpers (categories, areas,
// WhatsApp links, data fetching). Table: businesses_table
// (see sql/add_business_directory.sql).

import { supabase } from './supabaseClient';

export const DIRECTORY_CATEGORIES = [
  'Doctors',
  'Academies',
  'Restaurants',
  'Shops',
  'Repair',
  'Plumber / Electrician',
  'Other',
];

export const DIRECTORY_AREAS = [
  'Bahawalpur',
  'Khairpur Tamewali',
  'Ahmedpur East',
  'Hasilpur',
  'Yazman',
  'Uch Sharif',
  'Other',
];

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

// Featured businesses first, then admin's display order, then newest.
function sortBusinesses(rows) {
  return [...rows].sort((a, b) => {
    if (Boolean(b.is_featured) !== Boolean(a.is_featured)) return b.is_featured ? 1 : -1;
    const ao = a.display_order ?? 0;
    const bo = b.display_order ?? 0;
    if (ao !== bo) return ao - bo;
    return new Date(b.created_at || 0) - new Date(a.created_at || 0);
  });
}

export async function getBusinesses() {
  const { data } = await supabase.from('businesses_table').select('*').eq('is_active', true);
  return sortBusinesses(data || []);
}

export async function getBusinessById(id) {
  if (!id) return null;
  const { data } = await supabase
    .from('businesses_table')
    .select('*')
    .eq('id', id)
    .eq('is_active', true)
    .maybeSingle();
  return data || null;
}
