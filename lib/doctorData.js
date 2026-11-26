import { supabase } from './supabaseClient';
import { CLINIC_TYPES, DAYS, formatTime } from './doctor';

/** Everything the public doctor page needs. RLS only returns it for PUBLISHED listings. */
export async function getDoctorBundle(businessId) {
  const [p, c, f, r] = await Promise.all([
    supabase.from('doctor_profiles').select('*').eq('business_id', businessId).maybeSingle(),
    supabase.from('doctor_clinics').select('*').eq('business_id', businessId).order('display_order', { ascending: true }),
    supabase.from('doctor_faqs').select('*').eq('business_id', businessId).order('display_order', { ascending: true }),
    // Only returns something when the admin has VERIFIED the PMDC registration.
    supabase.rpc('directory_doctor_registration_public', { p_business_id: businessId }),
  ]);
  return { profile: p.data || null, clinics: c.data || [], faqs: f.data || [], registration: r.data || null };
}

export const clinicTypeLabel = (v) => CLINIC_TYPES.find((c) => c.value === v)?.label || '';

const SCHEMA_DAY = { mon: 'Monday', tue: 'Tuesday', wed: 'Wednesday', thu: 'Thursday', fri: 'Friday', sat: 'Saturday', sun: 'Sunday' };

/**
 * schema.org Physician. Only facts the doctor entered are included; the PMDC
 * identifier appears ONLY once the admin has verified it. No ratings are
 * invented (there is no review system yet).
 */
export function buildPhysicianJsonLd({ business, bundle, siteUrl, path, cities = [] }) {
  const { profile, clinics, registration } = bundle;
  const cityName = (id) => cities.find((c) => c.id === id)?.name;
  const clinicLd = (c) => ({
    '@type': 'MedicalClinic',
    name: c.clinic_name,
    ...(c.phone ? { telephone: c.phone } : {}),
    ...(c.website ? { url: c.website } : {}),
    address: {
      '@type': 'PostalAddress',
      streetAddress: c.address || undefined,
      addressLocality: cityName(c.city_id) || undefined,
      addressRegion: c.province || undefined,
      addressCountry: 'PK',
    },
    ...(c.latitude != null && c.longitude != null ? { geo: { '@type': 'GeoCoordinates', latitude: c.latitude, longitude: c.longitude } } : {}),
    openingHoursSpecification: DAYS.filter(([k]) => c.schedule?.[k] && !c.schedule[k].closed && c.schedule[k].open && c.schedule[k].close).map(([k]) => ({
      '@type': 'OpeningHoursSpecification',
      dayOfWeek: SCHEMA_DAY[k],
      opens: String(c.schedule[k].open).slice(0, 5),
      closes: String(c.schedule[k].close).slice(0, 5),
    })),
    ...(c.consultation_fee != null ? { priceRange: `PKR ${c.consultation_fee}` } : {}),
  });

  return {
    '@context': 'https://schema.org',
    '@type': 'Physician',
    name: business.name,
    url: `${siteUrl}${path}`,
    ...(business.photo_url ? { image: business.photo_url } : {}),
    ...(profile?.short_intro || profile?.biography ? { description: profile.short_intro || profile.biography } : {}),
    ...(profile?.main_specialization ? { medicalSpecialty: profile.main_specialization } : {}),
    ...(profile?.languages?.length ? { knowsLanguage: profile.languages } : {}),
    ...(profile?.degree_institution ? { alumniOf: { '@type': 'EducationalOrganization', name: profile.degree_institution } } : {}),
    ...(profile?.procedures_performed?.length ? { availableService: profile.procedures_performed.map((n) => ({ '@type': 'MedicalProcedure', name: n })) } : {}),
    ...(business.phone ? { telephone: business.phone } : {}),
    ...(registration?.pmdc_number ? { identifier: { '@type': 'PropertyValue', name: 'PMDC registration number', value: registration.pmdc_number } } : {}),
    ...(clinics.length ? { location: clinics.map(clinicLd) } : {}),
    sameAs: [profile?.facebook_url, profile?.instagram_url, profile?.linkedin_url, profile?.youtube_url].filter(Boolean),
  };
}

export function scheduleRows(schedule) {
  return DAYS.map(([k, label]) => {
    const d = schedule?.[k];
    if (!d || d.closed || !d.open || !d.close) return { label, text: 'Closed', closed: true };
    return { label, text: `${formatTime(d.open)} – ${formatTime(d.close)}`, closed: false };
  });
}
