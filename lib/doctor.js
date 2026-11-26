// Doctor profile — constants and helpers shared by the registration wizard,
// the admin editor and the public profile page.

export const GENDERS = [
  { value: 'male', label: 'Male' },
  { value: 'female', label: 'Female' },
  { value: 'other', label: 'Other' },
];

export const PROFESSIONAL_TITLES = ['Dr.', 'Prof. Dr.', 'Assoc. Prof. Dr.', 'Asst. Prof. Dr.', 'Brig. Dr.', 'Col. Dr.', 'Hakeem', 'Dr. (Homeopathic)'];

export const PRIMARY_DEGREES = ['MBBS', 'BDS', 'BAMS', 'BEMS', 'Pharm-D', 'DPT', 'DVM', 'Other'];

export const POSTGRADUATE_SUGGESTIONS = ['FCPS', 'MS', 'MD', 'MCPS', 'MRCP', 'FRCP', 'MRCS', 'FRCS', 'MPH', 'PhD', 'Diploma', 'Fellowship'];

export const SPECIALIZATIONS = [
  'General Physician', 'Family Medicine', 'Internal Medicine', 'Pediatrics', 'Gynecology & Obstetrics',
  'General Surgery', 'Orthopedics', 'Cardiology', 'Dermatology', 'ENT (Ear, Nose & Throat)', 'Ophthalmology (Eye)',
  'Dentistry', 'Neurology', 'Neurosurgery', 'Psychiatry', 'Psychology', 'Urology', 'Nephrology', 'Gastroenterology',
  'Pulmonology (Chest)', 'Endocrinology & Diabetes', 'Oncology', 'Radiology', 'Pathology', 'Anesthesiology',
  'Physical Medicine & Rehabilitation', 'Physiotherapy', 'Plastic Surgery', 'Pediatric Surgery', 'Rheumatology',
  'Hematology', 'Infectious Diseases', 'Emergency Medicine', 'Nutrition & Dietetics', 'Homeopathy', 'Hakeem (Tibb)', 'Other',
];

export const DOCTOR_LANGUAGES = ['Urdu', 'English', 'Punjabi', 'Saraiki', 'Sindhi', 'Pashto', 'Balochi', 'Hindko', 'Arabic'];

export const CLINIC_TYPES = [
  { value: 'private_clinic', label: 'Private Clinic' },
  { value: 'private_hospital', label: 'Private Hospital' },
  { value: 'government_hospital', label: 'Government Hospital' },
  { value: 'teaching_hospital', label: 'Teaching Hospital' },
  { value: 'diagnostic_center', label: 'Diagnostic Center' },
  { value: 'online', label: 'Online Only' },
  { value: 'other', label: 'Other' },
];

export const REGISTRATION_STATUSES = [
  { value: 'unknown', label: 'Select status' },
  { value: 'active', label: 'Active' },
  { value: 'renewal', label: 'Under renewal' },
  { value: 'expired', label: 'Expired' },
  { value: 'suspended', label: 'Suspended' },
];

export const PMDC_VERIFICATION = [
  { value: 'pending', label: 'Pending' },
  { value: 'verified', label: 'Verified' },
  { value: 'rejected', label: 'Rejected' },
];

export const LISTING_STATUSES = [
  { value: 'draft', label: 'Draft' },
  { value: 'pending', label: 'Pending approval' },
  { value: 'published', label: 'Published' },
  { value: 'rejected', label: 'Rejected' },
];

export const DAYS = [
  ['mon', 'Monday'],
  ['tue', 'Tuesday'],
  ['wed', 'Wednesday'],
  ['thu', 'Thursday'],
  ['fri', 'Friday'],
  ['sat', 'Saturday'],
  ['sun', 'Sunday'],
];

export function defaultSchedule() {
  const s = {};
  for (const [key] of DAYS) s[key] = { closed: key === 'sun', open: '09:00', close: '17:00' };
  return s;
}

export function emptyClinic(isPrimary = false) {
  return {
    id: null,
    clinic_name: '',
    clinic_type: 'private_clinic',
    address: '',
    country: 'Pakistan',
    province: '',
    city_id: '',
    area_id: '',
    map_link: '',
    latitude: '',
    longitude: '',
    phone: '',
    whatsapp: '',
    email: '',
    website: '',
    booking_link: '',
    consultation_fee: '',
    followup_fee: '',
    appointment_required: false,
    online_consultation: false,
    home_visit: false,
    emergency_services: false,
    schedule: defaultSchedule(),
    break_start: '',
    break_end: '',
    is_primary: isPrimary,
  };
}

export function emptyDoctor() {
  return {
    gender: '',
    professional_title: 'Dr.',
    short_intro: '',
    biography: '',
    languages: [],
    degree: 'MBBS',
    degree_institution: '',
    graduation_year: '',
    postgraduate_qualifications: [],
    additional_certifications: '',
    medical_training: '',
    main_specialization: '',
    sub_specialization: '',
    medical_services: [],
    conditions_treated: [],
    procedures_performed: [],
    experience_years: '',
    current_designation: '',
    current_institution: '',
    previous_institutions: '',
    professional_memberships: '',
    awards: '',
    facebook_url: '',
    instagram_url: '',
    linkedin_url: '',
    youtube_url: '',
    seo_title: '',
    seo_description: '',
  };
}

export function emptyRegistration() {
  return { pmdc_number: '', registration_status: 'unknown', verification_status: 'pending', verification_date: '', verified_by: '', admin_note: '' };
}

/** "09:00" / "09:00:00" -> "9:00 AM" */
export function formatTime(t) {
  if (!t) return '';
  const [h, m] = String(t).split(':');
  const hour = Number(h);
  if (Number.isNaN(hour)) return '';
  const suffix = hour >= 12 ? 'PM' : 'AM';
  return `${((hour + 11) % 12) + 1}:${(m || '00').slice(0, 2)} ${suffix}`;
}

/** Short human summary of a weekly schedule, e.g. "Mon–Sat 9:00 AM – 5:00 PM". */
export function scheduleSummary(schedule) {
  if (!schedule) return '';
  const groups = [];
  for (const [key, label] of DAYS) {
    const d = schedule[key];
    if (!d || d.closed || !d.open || !d.close) continue;
    const range = `${formatTime(d.open)} – ${formatTime(d.close)}`;
    const last = groups[groups.length - 1];
    if (last && last.range === range && last.lastIndex === DAYS.findIndex(([k]) => k === key) - 1) {
      last.end = label.slice(0, 3);
      last.lastIndex += 1;
    } else {
      groups.push({ range, start: label.slice(0, 3), end: null, lastIndex: DAYS.findIndex(([k]) => k === key) });
    }
  }
  return groups.map((g) => `${g.end ? `${g.start}–${g.end}` : g.start} ${g.range}`).join(', ');
}

/** "a, b ,c" -> ["a","b","c"] (de-duplicated) */
export function splitTags(text) {
  return [...new Set(String(text || '').split(/[,\n]/).map((x) => x.trim()).filter(Boolean))];
}

export const emptyToNull = (v) => (v === '' || v === undefined ? null : v);
export const numOrNull = (v) => (v === '' || v === null || v === undefined || Number.isNaN(Number(v)) ? null : Number(v));
