'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { supabase } from '@/lib/supabaseClient';
import Art3D from '../Art3D';
import ClinicEditor from './ClinicEditor';
import DocumentUploader from './DocumentUploader';
import PhotoUpload from './PhotoUpload';
import { Banner, ChipMulti, Field, SelectField, Section, TagInput, TextAreaField, TextField, Toggle, inputCls } from './FormUI';
import { artFor, buildCategoryTree, getTaxonomy, parseMapLink } from '@/lib/directory';
import {
  CLINIC_TYPES,
  DOCTOR_LANGUAGES,
  GENDERS,
  LISTING_STATUSES,
  PMDC_VERIFICATION,
  POSTGRADUATE_SUGGESTIONS,
  PRIMARY_DEGREES,
  PROFESSIONAL_TITLES,
  REGISTRATION_STATUSES,
  SPECIALIZATIONS,
  defaultSchedule,
  emptyClinic,
  emptyDoctor,
  emptyRegistration,
  emptyToNull,
  numOrNull,
  scheduleSummary,
} from '@/lib/doctor';

const EMPTY_BIZ = {
  name: '', category_id: '', subcategory_id: '', city_id: '', area_id: '', address: '', phone: '', whatsapp: '',
  timing: '', short_description: '', description: '', services: '', map_link: '', latitude: '', longitude: '', photo_url: '',
};
const EMPTY_ADMIN = { is_featured: false, display_order: '', admin_note: '' };

function stepsFor(type, adminMode) {
  if (type === 'doctor') {
    const s = [
      { id: 'category', label: 'Category' },
      { id: 'basic', label: 'Basic Information', part: 1 },
      { id: 'education', label: 'Education', part: 1 },
      { id: 'specialization', label: 'Specialization', part: 1 },
      { id: 'experience', label: 'Experience', part: 1 },
      { id: 'registration', label: 'PMDC Registration', part: 1 },
      { id: 'clinics', label: 'Clinics & Schedule', part: 2 },
      { id: 'patients', label: 'Patients & FAQs', part: 2 },
      { id: 'social', label: 'Social & SEO', part: 2 },
    ];
    if (adminMode) s.push({ id: 'admin', label: 'Admin & Status', part: 2 });
    s.push({ id: 'review', label: 'Review', part: 2 });
    return s;
  }
  if (type === 'general') {
    const s = [
      { id: 'category', label: 'Category' },
      { id: 'gbasic', label: 'Business Info' },
      { id: 'glocation', label: 'Location & Contact' },
    ];
    if (adminMode) s.push({ id: 'gadmin', label: 'Admin & Status' });
    s.push({ id: 'review', label: 'Review' });
    return s;
  }
  return [{ id: 'category', label: 'Category' }];
}

const hhmm = (t) => (t ? String(t).slice(0, 5) : '');

/**
 * Staged business registration. Choosing the category decides which form
 * opens: "Doctors & Clinics" -> the full two-part doctor profile; everything
 * else -> the general business form. Progress is saved at every step.
 * Used by owners (/business/new, /business/edit/[id]) and by the admin
 * (adminMode adds status / featured / PMDC verification controls).
 */
export default function BusinessWizard({ businessId = null, adminMode = false, onExit, exitHref = '/business/dashboard' }) {
  const [taxonomy, setTaxonomy] = useState({ categories: [], cities: [], areas: [] });
  const [loading, setLoading] = useState(true);
  const [missing, setMissing] = useState(false);

  const [id, setId] = useState(businessId);
  const [type, setType] = useState(null); // 'doctor' | 'general'
  const [biz, setBiz] = useState(EMPTY_BIZ);
  const [adm, setAdm] = useState(EMPTY_ADMIN);
  const [status, setStatus] = useState('draft'); // listing_status
  const [doc, setDoc] = useState(emptyDoctor());
  const [reg, setReg] = useState(emptyRegistration());
  const [clinics, setClinics] = useState([emptyClinic(true)]);
  const [faqs, setFaqs] = useState([]);
  const [removed, setRemoved] = useState({ clinics: [], faqs: [] });
  const [ownerEmail, setOwnerEmail] = useState('');

  const [step, setStep] = useState(0);
  const [maxStep, setMaxStep] = useState(0);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');
  const [done, setDone] = useState(null); // 'submitted' | 'saved'

  const steps = useMemo(() => stepsFor(type, adminMode), [type, adminMode]);
  const current = steps[Math.min(step, steps.length - 1)];
  const tree = useMemo(() => buildCategoryTree(taxonomy.categories), [taxonomy.categories]);

  // ---------------------------------------------------------------- load
  const load = useCallback(async () => {
    setLoading(true);
    const tx = await getTaxonomy();
    setTaxonomy(tx);
    if (businessId) {
      const { data: b } = await supabase.from('businesses_table').select('*').eq('id', businessId).maybeSingle();
      if (!b) {
        setMissing(true);
        setLoading(false);
        return;
      }
      const isDoctor = b.profile_type === 'doctor';
      setType(isDoctor ? 'doctor' : 'general');
      setStatus(b.listing_status || 'draft');
      setAdm({ is_featured: Boolean(b.is_featured), display_order: b.display_order ?? '', admin_note: b.admin_note || '' });
      let name = b.name || '';
      if (isDoctor) {
        const [p, r, c, f] = await Promise.all([
          supabase.from('doctor_profiles').select('*').eq('business_id', businessId).maybeSingle(),
          supabase.from('doctor_registration').select('*').eq('business_id', businessId).maybeSingle(),
          supabase.from('doctor_clinics').select('*').eq('business_id', businessId).order('display_order', { ascending: true }),
          supabase.from('doctor_faqs').select('*').eq('business_id', businessId).order('display_order', { ascending: true }),
        ]);
        const base = emptyDoctor();
        if (p.data) {
          const d = { ...base };
          for (const k of Object.keys(base)) {
            const v = p.data[k];
            d[k] = Array.isArray(base[k]) ? v || [] : v ?? '';
          }
          setDoc(d);
          const title = d.professional_title;
          if (title && name.toLowerCase().startsWith(`${title.toLowerCase()} `)) name = name.slice(title.length + 1);
        }
        if (r.data) setReg({ ...emptyRegistration(), ...Object.fromEntries(Object.entries(r.data).map(([k, v]) => [k, v ?? ''])) });
        if (c.data?.length) {
          setClinics(
            c.data.map((x) => ({
              ...emptyClinic(),
              ...Object.fromEntries(Object.entries(x).map(([k, v]) => [k, v ?? ''])),
              appointment_required: x.appointment_required, online_consultation: x.online_consultation,
              home_visit: x.home_visit, emergency_services: x.emergency_services, is_primary: x.is_primary,
              schedule: { ...defaultSchedule(), ...(x.schedule || {}) },
              break_start: hhmm(x.break_start), break_end: hhmm(x.break_end),
            }))
          );
        }
        setFaqs((f.data || []).map((x) => ({ id: x.id, question: x.question, answer: x.answer })));
      }
      setBiz({
        ...EMPTY_BIZ,
        ...Object.fromEntries(Object.keys(EMPTY_BIZ).map((k) => [k, b[k] ?? ''])),
        name,
      });
      if (adminMode) {
        const { data: em } = await supabase.rpc('directory_owner_email', { p_business_id: businessId });
        setOwnerEmail(em || '');
      }
      setStep(1); // an existing profile skips the category step
      setMaxStep(99);
    }
    setLoading(false);
  }, [businessId, adminMode]);

  useEffect(() => {
    load();
  }, [load]);

  // ---------------------------------------------------------------- helpers
  const setB = (k, v) => setBiz((p) => ({ ...p, [k]: v }));
  const setD = (k, v) => setDoc((p) => ({ ...p, [k]: v }));
  const setR = (k, v) => setReg((p) => ({ ...p, [k]: v }));
  const setA = (k, v) => setAdm((p) => ({ ...p, [k]: v }));
  const topSelected = tree.find((t) => t.id === biz.category_id);

  function chooseCategory(top) {
    setBiz((p) => ({ ...p, category_id: top.id, subcategory_id: '' }));
    setType(top.slug === 'doctors' ? 'doctor' : 'general');
  }

  function displayName() {
    const n = biz.name.trim();
    const t = doc.professional_title?.trim();
    if (type !== 'doctor' || !t) return n;
    return n.toLowerCase().startsWith(t.toLowerCase()) ? n : `${t} ${n}`;
  }

  // ---------------------------------------------------------------- validation
  function validate(stepId) {
    const num = (v, label, min = 0, max = 1e9) => (v !== '' && (Number.isNaN(Number(v)) || Number(v) < min || Number(v) > max) ? `${label} sahi number likhein.` : '');
    switch (stepId) {
      case 'category':
        return biz.category_id ? '' : 'Pehle apni category chunein.';
      case 'basic':
        if (!biz.name.trim()) return 'Doctor ka poora naam likhein.';
        if (!doc.professional_title) return 'Professional title chunein.';
        if (!doc.gender) return 'Gender chunein.';
        if (!doc.short_intro.trim()) return 'Chhota taaruf (short introduction) likhein.';
        return '';
      case 'education':
        if (!doc.degree) return 'Primary medical degree chunein.';
        if (!doc.degree_institution.trim()) return 'University / institution ka naam likhein.';
        if (doc.graduation_year !== '' && (Number(doc.graduation_year) < 1940 || Number(doc.graduation_year) > new Date().getFullYear())) return 'Graduation year sahi likhein.';
        return '';
      case 'specialization':
        return doc.main_specialization ? '' : 'Main specialization chunein.';
      case 'experience':
        return num(doc.experience_years, 'Experience (saal)', 0, 80);
      case 'registration':
        return reg.pmdc_number.trim() ? '' : 'PMDC registration number likhein.';
      case 'clinics': {
        if (clinics.length === 0) return 'Kam az kam ek clinic / hospital add karein.';
        for (const [i, c] of clinics.entries()) {
          const n = `Clinic ${i + 1}`;
          if (!c.clinic_name.trim()) return `${n}: naam likhein.`;
          if (!c.address.trim()) return `${n}: address likhein.`;
          if (!c.city_id) return `${n}: shehar chunein.`;
          if (!c.phone.trim()) return `${n}: phone number likhein.`;
          const e = num(c.consultation_fee, `${n}: consultation fee`) || num(c.followup_fee, `${n}: follow-up fee`);
          if (e) return e;
          const hasLat = String(c.latitude).trim() !== '';
          const hasLng = String(c.longitude).trim() !== '';
          if (hasLat !== hasLng) return `${n}: latitude aur longitude dono bharein ya dono khali chhorein.`;
          if (hasLat && (Math.abs(Number(c.latitude)) > 90 || Math.abs(Number(c.longitude)) > 180 || Number.isNaN(Number(c.latitude)) || Number.isNaN(Number(c.longitude)))) return `${n}: GPS coordinates sahi nahi.`;
        }
        return '';
      }
      case 'patients':
        for (const f of faqs) if ((f.question.trim() && !f.answer.trim()) || (!f.question.trim() && f.answer.trim())) return 'Har FAQ ka sawal aur jawab dono likhein (ya FAQ hatayein).';
        return '';
      case 'social':
        if (doc.seo_title.length > 70) return 'SEO title 70 huroof se chhota rakhein.';
        if (doc.seo_description.length > 170) return 'SEO description 170 huroof se chhoti rakhein.';
        return '';
      case 'gbasic':
        return biz.name.trim() ? '' : 'Business ka naam likhein.';
      case 'glocation':
        if (!biz.city_id) return 'Shehar chunein.';
        if (!biz.address.trim()) return 'Address likhein.';
        if (!biz.phone.trim() && !biz.whatsapp.trim()) return 'Phone ya WhatsApp number likhein.';
        {
          const hasLat = String(biz.latitude).trim() !== '';
          const hasLng = String(biz.longitude).trim() !== '';
          if (hasLat !== hasLng) return 'Latitude aur longitude dono bharein ya dono khali chhorein.';
          if (hasLat && (Math.abs(Number(biz.latitude)) > 90 || Math.abs(Number(biz.longitude)) > 180)) return 'GPS coordinates sahi nahi.';
        }
        return '';
      default:
        return '';
    }
  }

  // ---------------------------------------------------------------- save
  function bizPayload(submit) {
    const isDoctor = type === 'doctor';
    const cat = taxonomy.categories.find((c) => c.id === biz.category_id);
    const primary = clinics[0];
    const cityId = isDoctor ? primary?.city_id : biz.city_id;
    const city = taxonomy.cities.find((c) => c.id === cityId);
    const lat = isDoctor ? primary?.latitude : biz.latitude;
    const lng = isDoctor ? primary?.longitude : biz.longitude;
    const p = {
      name: displayName(),
      category_id: biz.category_id || null,
      subcategory_id: biz.subcategory_id || null,
      category: cat?.name || null,
      area: city?.name || null,
      city_id: cityId || null,
      area_id: (isDoctor ? primary?.area_id : biz.area_id) || null,
      address: emptyToNull((isDoctor ? primary?.address : biz.address)?.trim?.() ?? ''),
      phone: emptyToNull((isDoctor ? primary?.phone : biz.phone)?.trim?.() ?? ''),
      whatsapp: emptyToNull((isDoctor ? primary?.whatsapp : biz.whatsapp)?.trim?.() ?? ''),
      map_link: emptyToNull((isDoctor ? primary?.map_link : biz.map_link)?.trim?.() ?? ''),
      latitude: numOrNull(lat),
      longitude: numOrNull(lng),
      photo_url: biz.photo_url || null,
      profile_type: isDoctor ? 'doctor' : 'general',
    };
    if (isDoctor) {
      p.timing = emptyToNull(scheduleSummary(primary?.schedule));
      p.short_description = emptyToNull(doc.short_intro.trim());
      p.description = emptyToNull(doc.biography.trim());
      p.services = emptyToNull([doc.main_specialization, doc.sub_specialization, ...doc.medical_services].filter(Boolean).join('\n'));
    } else {
      p.timing = emptyToNull(biz.timing.trim());
      p.short_description = emptyToNull(biz.short_description.trim());
      p.description = emptyToNull(biz.description.trim());
      p.services = emptyToNull(biz.services.trim());
    }
    if (adminMode) {
      p.listing_status = status;
      p.is_featured = Boolean(adm.is_featured);
      p.display_order = Number(adm.display_order) || 0;
      p.admin_note = emptyToNull(adm.admin_note.trim());
    } else {
      // A profile already waiting for review stays in review while it is edited;
      // a live listing stays live (the database enforces that too).
      p.listing_status = submit || status === 'pending' ? 'pending' : 'draft';
    }
    return p;
  }

  async function persist({ submit = false } = {}) {
    // 1. business row
    const payload = bizPayload(submit);
    let bizId = id;
    if (bizId) {
      const { data, error: err } = await supabase.from('businesses_table').update(payload).eq('id', bizId).select('id, listing_status').maybeSingle();
      if (err) throw err;
      if (!data) throw new Error('Save nahi hua — login expire ho gaya ho sakta hai. Dobara login karein.');
      setStatus(data.listing_status);
    } else {
      const { data, error: err } = await supabase.from('businesses_table').insert(payload).select('id, listing_status').single();
      if (err) throw err;
      bizId = data.id;
      setId(bizId);
      setStatus(data.listing_status);
    }

    // 2. doctor tables
    if (type === 'doctor') {
      const profile = {
        business_id: bizId,
        gender: doc.gender || null,
        professional_title: emptyToNull(doc.professional_title),
        short_intro: emptyToNull(doc.short_intro.trim()),
        biography: emptyToNull(doc.biography.trim()),
        languages: doc.languages,
        degree: emptyToNull(doc.degree),
        degree_institution: emptyToNull(doc.degree_institution.trim()),
        graduation_year: numOrNull(doc.graduation_year),
        postgraduate_qualifications: doc.postgraduate_qualifications,
        additional_certifications: emptyToNull(doc.additional_certifications.trim()),
        medical_training: emptyToNull(doc.medical_training.trim()),
        main_specialization: emptyToNull(doc.main_specialization),
        sub_specialization: emptyToNull(doc.sub_specialization.trim()),
        medical_services: doc.medical_services,
        conditions_treated: doc.conditions_treated,
        procedures_performed: doc.procedures_performed,
        experience_years: numOrNull(doc.experience_years),
        current_designation: emptyToNull(doc.current_designation.trim()),
        current_institution: emptyToNull(doc.current_institution.trim()),
        previous_institutions: emptyToNull(doc.previous_institutions.trim()),
        professional_memberships: emptyToNull(doc.professional_memberships.trim()),
        awards: emptyToNull(doc.awards.trim()),
        facebook_url: emptyToNull(doc.facebook_url.trim()),
        instagram_url: emptyToNull(doc.instagram_url.trim()),
        linkedin_url: emptyToNull(doc.linkedin_url.trim()),
        youtube_url: emptyToNull(doc.youtube_url.trim()),
        seo_title: emptyToNull(doc.seo_title.trim()),
        seo_description: emptyToNull(doc.seo_description.trim()),
      };
      const r1 = await supabase.from('doctor_profiles').upsert(profile, { onConflict: 'business_id' });
      if (r1.error) throw r1.error;

      const registration = { business_id: bizId, pmdc_number: emptyToNull(reg.pmdc_number.trim()), registration_status: reg.registration_status || 'unknown' };
      if (adminMode) {
        registration.verification_status = reg.verification_status;
        registration.verification_date = emptyToNull(reg.verification_date);
        registration.verified_by = emptyToNull(String(reg.verified_by).trim());
        registration.admin_note = emptyToNull(String(reg.admin_note).trim());
      }
      const r2 = await supabase.from('doctor_registration').upsert(registration, { onConflict: 'business_id' });
      if (r2.error) throw r2.error;

      // clinics (insert / update / delete)
      if (removed.clinics.length) {
        const { error: e } = await supabase.from('doctor_clinics').delete().in('id', removed.clinics);
        if (e) throw e;
      }
      const savedClinics = [];
      for (const [i, c] of clinics.entries()) {
        const row = {
          business_id: bizId,
          clinic_name: c.clinic_name.trim(),
          clinic_type: emptyToNull(c.clinic_type),
          address: emptyToNull(c.address.trim()),
          country: c.country.trim() || 'Pakistan',
          province: emptyToNull(c.province),
          city_id: c.city_id || null,
          area_id: c.area_id || null,
          map_link: emptyToNull(c.map_link.trim()),
          latitude: numOrNull(c.latitude),
          longitude: numOrNull(c.longitude),
          phone: emptyToNull(c.phone.trim()),
          whatsapp: emptyToNull(c.whatsapp.trim()),
          email: emptyToNull(c.email.trim()),
          website: emptyToNull(c.website.trim()),
          booking_link: emptyToNull(c.booking_link.trim()),
          consultation_fee: numOrNull(c.consultation_fee),
          followup_fee: numOrNull(c.followup_fee),
          appointment_required: c.appointment_required,
          online_consultation: c.online_consultation,
          home_visit: c.home_visit,
          emergency_services: c.emergency_services,
          schedule: c.schedule,
          break_start: emptyToNull(c.break_start),
          break_end: emptyToNull(c.break_end),
          is_primary: i === 0,
          display_order: i,
        };
        if (c.id) {
          const { error: e } = await supabase.from('doctor_clinics').update(row).eq('id', c.id);
          if (e) throw e;
          savedClinics.push(c);
        } else {
          const { data, error: e } = await supabase.from('doctor_clinics').insert(row).select('id').single();
          if (e) throw e;
          savedClinics.push({ ...c, id: data.id });
        }
      }
      setClinics(savedClinics);

      // FAQs
      if (removed.faqs.length) {
        const { error: e } = await supabase.from('doctor_faqs').delete().in('id', removed.faqs);
        if (e) throw e;
      }
      const savedFaqs = [];
      for (const [i, f] of faqs.filter((x) => x.question.trim() && x.answer.trim()).entries()) {
        const row = { business_id: bizId, question: f.question.trim(), answer: f.answer.trim(), display_order: i };
        if (f.id) {
          const { error: e } = await supabase.from('doctor_faqs').update(row).eq('id', f.id);
          if (e) throw e;
          savedFaqs.push(f);
        } else {
          const { data, error: e } = await supabase.from('doctor_faqs').insert(row).select('id').single();
          if (e) throw e;
          savedFaqs.push({ ...f, id: data.id });
        }
      }
      setFaqs(savedFaqs);
      setRemoved({ clinics: [], faqs: [] });
    }
    return bizId;
  }

  async function run(fn) {
    setError('');
    setNotice('');
    if (uploading) return setError('Upload abhi chal raha hai — khatam hone ka intezar karein.');
    setSaving(true);
    try {
      await fn();
    } catch (err) {
      const m = err?.message || 'Save nahi ho saka.';
      setError(/row-level security/i.test(m) ? 'Is action ki ijazat nahi — dobara login karke koshish karein.' : m);
    } finally {
      setSaving(false);
    }
  }

  const goTo = (i) => {
    setStep(i);
    setMaxStep((m) => Math.max(m, i));
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  function next() {
    const err = validate(current.id);
    if (err) return setError(err);
    if (current.id === 'category') {
      setError('');
      return goTo(1);
    }
    run(async () => {
      await persist();
      setNotice('Progress save ho gayi.');
      goTo(step + 1);
    });
  }

  function saveDraft() {
    if (current.id === 'category') return setError('Pehle category chunein.');
    if (!biz.name.trim() && !id) return setError('Draft save karne ke liye pehle naam likhein.');
    run(async () => {
      await persist();
      setNotice('Draft save ho gaya — aap baad mein wapis aa kar jaari rakh sakte hain.');
    });
  }

  function submitAll() {
    for (const [i, s] of steps.entries()) {
      const err = validate(s.id);
      if (err) {
        goTo(i);
        return setError(err);
      }
    }
    run(async () => {
      await persist({ submit: true });
      setDone(adminMode || status === 'published' ? 'saved' : 'submitted');
    });
  }

  // ---------------------------------------------------------------- render bits
  if (loading) return <p className="py-16 text-center text-sm text-gray-500">Load ho raha hai...</p>;
  if (missing)
    return (
      <div className="rounded-3xl border border-line bg-surface p-10 text-center">
        <p className="font-semibold text-gray-800">Yeh profile nahi mili ya aap ki nahi hai.</p>
        <Link href={exitHref} className="mt-4 inline-block rounded-xl bg-brand-600 px-5 py-2.5 text-sm font-semibold text-white">Wapis jayein</Link>
      </div>
    );

  if (done) {
    return (
      <div className="mx-auto max-w-xl rounded-3xl border border-line bg-gradient-to-b from-surface to-surface-alt p-8 text-center shadow-card">
        <Art3D name="shield" className="mx-auto h-16 w-16" />
        <h2 className="mt-3 text-2xl font-bold text-gray-900">{done === 'submitted' ? 'Submit ho gaya!' : 'Save ho gaya!'}</h2>
        <p className="mt-2 text-sm text-gray-600">
          {done === 'submitted'
            ? 'Aap ki profile admin ke review mein hai. Approve hote hi website par nazar aane lagegi.'
            : 'Aap ki tabdeeliyan save ho gayi hain.'}
        </p>
        <div className="mt-6 flex flex-wrap justify-center gap-3">
          {onExit ? (
            <button type="button" onClick={onExit} className="rounded-xl bg-gradient-to-b from-brand-500 to-brand-700 px-6 py-3 text-sm font-semibold text-white">Wapis jayein</button>
          ) : (
            <Link href={exitHref} className="rounded-xl bg-gradient-to-b from-brand-500 to-brand-700 px-6 py-3 text-sm font-semibold text-white">Meri listings dekhein</Link>
          )}
          <button type="button" onClick={() => setDone(null)} className="rounded-xl border border-line bg-surface px-6 py-3 text-sm font-semibold text-gray-800 hover:bg-surface-alt">Dobara edit karein</button>
        </div>
      </div>
    );
  }

  const isLast = current.id === 'review';
  const partLabel = current.part === 1 ? 'Part 1 — Personal & Professional Information' : current.part === 2 ? 'Part 2 — Clinic, Hospital & Patient Information' : '';

  function renderStep() {
    switch (current.id) {
      case 'category':
        return (
          <Section title="Aap ka business kis category ka hai?" subtitle="Category chunne par us ke mutabiq form khulta hai. Doctor ke liye mukammal professional profile form hai.">
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:col-span-2 lg:grid-cols-4">
              {tree.map((t) => {
                const on = biz.category_id === t.id;
                return (
                  <button
                    key={t.id}
                    type="button"
                    onClick={() => chooseCategory(t)}
                    aria-pressed={on}
                    className={`flex flex-col items-center gap-2 rounded-2xl border p-4 text-center transition hover:-translate-y-0.5 ${
                      on ? 'border-brand-600 bg-brand-50 ring-2 ring-brand-600/30' : 'border-line bg-surface hover:bg-surface-alt'
                    }`}
                  >
                    <Art3D name={artFor(t.slug)} className="h-12 w-12" />
                    <span className="text-sm font-semibold leading-tight text-gray-900">{t.name}</span>
                  </button>
                );
              })}
            </div>
            {topSelected && topSelected.children.length > 0 && (
              <SelectField
                label="Subcategory (optional)"
                className="md:col-span-2"
                value={biz.subcategory_id}
                onChange={(v) => setB('subcategory_id', v)}
                options={topSelected.children.map((c) => ({ value: c.id, label: c.name }))}
              />
            )}
            {type === 'doctor' && <div className="md:col-span-2"><Banner kind="warn">Doctor profile mein PMDC registration number zaroori hai. Verified badge sirf admin ki jaanch ke baad lagta hai.</Banner></div>}
          </Section>
        );

      // ------------------------------------------------ DOCTOR — PART 1
      case 'basic':
        return (
          <Section title="A. Basic Information" subtitle="Patients sab se pehle yeh dekhte hain.">
            <SelectField label="Professional title" required value={doc.professional_title} onChange={(v) => setD('professional_title', v)} options={PROFESSIONAL_TITLES} />
            <TextField label="Doctor ka poora naam" required value={biz.name} onChange={(v) => setB('name', v)} placeholder="e.g. Ayesha Khan" hint="Title (Dr.) alag chuna gaya hai — naam mein na likhein." />
            <SelectField label="Gender" required value={doc.gender} onChange={(v) => setD('gender', v)} options={GENDERS} />
            <PhotoUpload label="Profile photo" value={biz.photo_url} onChange={(v) => setB('photo_url', v)} onUploadingChange={setUploading} />
            <TextAreaField label="Chhota taaruf (Short introduction)" required rows={2} maxLength={300} className="md:col-span-2" value={doc.short_intro} onChange={(v) => setD('short_intro', v)} hint={`${doc.short_intro.length}/300 — search results mein dikhta hai`} />
            <TextAreaField label="Tafseeli biography" rows={6} className="md:col-span-2" value={doc.biography} onChange={(v) => setD('biography', v)} />
            <ChipMulti label="Zubanein jo aap bolte hain" className="md:col-span-2" options={DOCTOR_LANGUAGES} values={doc.languages} onChange={(v) => setD('languages', v)} />
          </Section>
        );
      case 'education':
        return (
          <Section title="B. Education & Qualifications">
            <SelectField label="Primary medical degree" required value={doc.degree} onChange={(v) => setD('degree', v)} options={PRIMARY_DEGREES} />
            <TextField label="University / Institution" required value={doc.degree_institution} onChange={(v) => setD('degree_institution', v)} />
            <TextField label="Graduation year" type="number" min="1940" max={new Date().getFullYear()} value={doc.graduation_year} onChange={(v) => setD('graduation_year', v)} />
            <TagInput label="Postgraduate qualifications" values={doc.postgraduate_qualifications} onChange={(v) => setD('postgraduate_qualifications', v)} suggestions={POSTGRADUATE_SUGGESTIONS} placeholder="e.g. FCPS (Cardiology)" />
            <TextAreaField label="Additional certifications" rows={3} className="md:col-span-2" value={doc.additional_certifications} onChange={(v) => setD('additional_certifications', v)} />
            <TextAreaField label="Medical training" rows={3} className="md:col-span-2" value={doc.medical_training} onChange={(v) => setD('medical_training', v)} />
          </Section>
        );
      case 'specialization':
        return (
          <Section title="C. Specialization">
            <SelectField label="Main specialization" required value={doc.main_specialization} onChange={(v) => setD('main_specialization', v)} options={SPECIALIZATIONS} />
            <TextField label="Sub-specialization" value={doc.sub_specialization} onChange={(v) => setD('sub_specialization', v)} placeholder="e.g. Interventional Cardiology" />
            <TagInput label="Medical services" className="md:col-span-2" values={doc.medical_services} onChange={(v) => setD('medical_services', v)} placeholder="e.g. ECG, Echocardiography" />
            <TagInput label="Conditions treated" className="md:col-span-2" values={doc.conditions_treated} onChange={(v) => setD('conditions_treated', v)} placeholder="e.g. Hypertension" />
            <TagInput label="Procedures performed" className="md:col-span-2" values={doc.procedures_performed} onChange={(v) => setD('procedures_performed', v)} placeholder="e.g. Angiography" />
          </Section>
        );
      case 'experience':
        return (
          <Section title="D. Professional Experience">
            <TextField label="Total experience (saal)" type="number" min="0" max="80" value={doc.experience_years} onChange={(v) => setD('experience_years', v)} />
            <TextField label="Current designation" value={doc.current_designation} onChange={(v) => setD('current_designation', v)} placeholder="e.g. Consultant Cardiologist" />
            <TextField label="Current hospital / institution" className="md:col-span-2" value={doc.current_institution} onChange={(v) => setD('current_institution', v)} />
            <TextAreaField label="Previous hospitals / institutions" rows={3} className="md:col-span-2" value={doc.previous_institutions} onChange={(v) => setD('previous_institutions', v)} />
            <TextAreaField label="Professional memberships" rows={2} value={doc.professional_memberships} onChange={(v) => setD('professional_memberships', v)} />
            <TextAreaField label="Awards & achievements" rows={2} value={doc.awards} onChange={(v) => setD('awards', v)} />
          </Section>
        );
      case 'registration':
        return (
          <Section title="E. Medical Registration (PMDC)" subtitle="PMDC number aur documents private hain. Public profile par number tabhi dikhta hai jab admin verify kar de.">
            <TextField label="PMDC registration number" required value={reg.pmdc_number} onChange={(v) => setR('pmdc_number', v)} placeholder="e.g. 12345-P" />
            <SelectField label="Registration status" value={reg.registration_status} onChange={(v) => setR('registration_status', v)} options={REGISTRATION_STATUSES} placeholder="" />
            <div className="rounded-2xl border border-line bg-surface p-4 md:col-span-2">
              <p className="text-sm font-semibold text-gray-900">Verification status</p>
              <p className="mt-1 text-sm text-gray-600">
                {reg.verification_status === 'verified' ? '✅ Verified' : reg.verification_status === 'rejected' ? '❌ Rejected' : '⏳ Pending — admin jaanch karega'}
                {reg.verification_date ? ` (${reg.verification_date})` : ''}
              </p>
              <p className="mt-1 text-xs text-gray-500">Yeh status sirf admin badal sakta hai. PMDC number badalne par dobara verification hoti hai.</p>
            </div>
            <div className="md:col-span-2">
              <Field label="Supporting documents (private)">
                <DocumentUploader businessId={id} />
              </Field>
            </div>
          </Section>
        );

      // ------------------------------------------------ DOCTOR — PART 2
      case 'clinics':
        return (
          <div className="space-y-5">
            <Banner kind="warn">Aap kai clinics / hospitals add kar sakte hain. Pehla clinic &quot;Main location&quot; hai — directory search mein wahi use hota hai.</Banner>
            {clinics.map((c, i) => (
              <ClinicEditor
                key={c.id || `new-${i}`}
                clinic={c}
                index={i}
                cities={taxonomy.cities}
                areas={taxonomy.areas}
                canRemove={clinics.length > 1}
                onChange={(nc) => setClinics((arr) => arr.map((x, j) => (j === i ? nc : x)))}
                onRemove={() => {
                  if (c.id) setRemoved((r) => ({ ...r, clinics: [...r.clinics, c.id] }));
                  setClinics((arr) => arr.filter((_, j) => j !== i));
                }}
              />
            ))}
            <button type="button" onClick={() => setClinics((arr) => [...arr, emptyClinic(false)])} className="w-full rounded-2xl border border-dashed border-line-strong bg-surface px-4 py-4 text-sm font-semibold text-gray-800 hover:bg-surface-alt">
              ＋ Ek aur clinic / hospital add karein
            </button>
          </div>
        );
      case 'patients':
        return (
          <Section title="E. Patient Information" subtitle="Patients ke aam sawalon ke jawab likhein.">
            <div className="space-y-4 md:col-span-2">
              {faqs.map((f, i) => (
                <div key={f.id || `f-${i}`} className="rounded-2xl border border-line bg-surface p-4">
                  <TextField label={`Sawal ${i + 1}`} value={f.question} onChange={(v) => setFaqs((a) => a.map((x, j) => (j === i ? { ...x, question: v } : x)))} maxLength={300} />
                  <div className="mt-3">
                    <TextAreaField label="Jawab" rows={3} value={f.answer} onChange={(v) => setFaqs((a) => a.map((x, j) => (j === i ? { ...x, answer: v } : x)))} maxLength={2000} />
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      if (f.id) setRemoved((r) => ({ ...r, faqs: [...r.faqs, f.id] }));
                      setFaqs((a) => a.filter((_, j) => j !== i));
                    }}
                    className="mt-2 text-sm font-semibold text-red-600 hover:underline"
                  >
                    Hatayein
                  </button>
                </div>
              ))}
              <button type="button" onClick={() => setFaqs((a) => [...a, { id: null, question: '', answer: '' }])} className="w-full rounded-2xl border border-dashed border-line-strong bg-surface px-4 py-3 text-sm font-semibold text-gray-800 hover:bg-surface-alt">
                ＋ FAQ add karein
              </button>
              <Banner kind="warn">Patient reviews aur average rating abhi shamil nahi — reviews ka system alag se aayega. Rating khud ba khud reviews se calculate hogi.</Banner>
            </div>
          </Section>
        );
      case 'social':
        return (
          <Section title="F. Social Media & SEO" subtitle="Sab optional hai. Profile ka URL naam se khud ban jata hai.">
            <TextField label="Facebook URL" type="url" value={doc.facebook_url} onChange={(v) => setD('facebook_url', v)} placeholder="https://facebook.com/..." />
            <TextField label="Instagram URL" type="url" value={doc.instagram_url} onChange={(v) => setD('instagram_url', v)} placeholder="https://instagram.com/..." />
            <TextField label="LinkedIn URL" type="url" value={doc.linkedin_url} onChange={(v) => setD('linkedin_url', v)} placeholder="https://linkedin.com/in/..." />
            <TextField label="YouTube URL" type="url" value={doc.youtube_url} onChange={(v) => setD('youtube_url', v)} placeholder="https://youtube.com/..." />
            <TextField label="SEO title" className="md:col-span-2" maxLength={70} value={doc.seo_title} onChange={(v) => setD('seo_title', v)} hint={`${doc.seo_title.length}/70 — khali chhorein to khud ban jayega`} />
            <TextAreaField label="SEO description" rows={2} className="md:col-span-2" maxLength={170} value={doc.seo_description} onChange={(v) => setD('seo_description', v)} hint={`${doc.seo_description.length}/170`} />
          </Section>
        );

      // ------------------------------------------------ GENERAL
      case 'gbasic':
        return (
          <Section title="Business ki maloomat">
            <TextField label="Business ka naam" required className="md:col-span-2" value={biz.name} onChange={(v) => setB('name', v)} />
            <TextField label="Short description" className="md:col-span-2" maxLength={160} value={biz.short_description} onChange={(v) => setB('short_description', v)} hint="Ek line ka taaruf — card par dikhta hai" />
            <TextAreaField label="Tafseeli description" rows={4} className="md:col-span-2" value={biz.description} onChange={(v) => setB('description', v)} />
            <TextAreaField label="Services / Menu (ek line = ek item)" rows={4} className="md:col-span-2" value={biz.services} onChange={(v) => setB('services', v)} />
            <PhotoUpload label="Business photo" value={biz.photo_url} onChange={(v) => setB('photo_url', v)} onUploadingChange={setUploading} />
          </Section>
        );
      case 'glocation':
        return (
          <Section title="Location & Contact">
            <GeneralLocation biz={biz} setB={setB} cities={taxonomy.cities} areas={taxonomy.areas} />
          </Section>
        );

      // ------------------------------------------------ ADMIN
      case 'admin':
      case 'gadmin':
        return (
          <Section title="Admin & Profile Management" subtitle="Yeh hissa sirf admin ko nazar aata hai.">
            <SelectField label="Profile status" value={status} onChange={setStatus} options={LISTING_STATUSES} placeholder="" />
            <TextField label="Display order (chhota number pehle)" type="number" value={adm.display_order} onChange={(v) => setA('display_order', v)} />
            <Toggle label="Featured profile" checked={adm.is_featured} onChange={(v) => setA('is_featured', v)} />
            <Field label="Profile owner">
              <p className="rounded-xl border border-line bg-surface px-3.5 py-3 text-sm text-gray-700">{ownerEmail || (id ? 'Admin (koi owner nahi)' : 'Admin')}</p>
            </Field>
            <TextAreaField label="Admin note (reject karne par owner ko dikhta hai)" rows={2} className="md:col-span-2" value={adm.admin_note} onChange={(v) => setA('admin_note', v)} />
            {type === 'doctor' && (
              <>
                <h4 className="text-sm font-bold text-gray-900 md:col-span-2">PMDC verification</h4>
                <SelectField label="Verification status" value={reg.verification_status} onChange={(v) => setR('verification_status', v)} options={PMDC_VERIFICATION} placeholder="" />
                <TextField label="Verification date" type="date" value={reg.verification_date} onChange={(v) => setR('verification_date', v)} />
                <TextField label="Verified by" value={reg.verified_by} onChange={(v) => setR('verified_by', v)} placeholder="Admin ka naam" />
                <TextField label="Verification note" value={reg.admin_note} onChange={(v) => setR('admin_note', v)} />
                <div className="md:col-span-2">
                  <Field label="Owner ke upload kiye private documents">
                    <DocumentUploader businessId={id} canUpload={false} />
                  </Field>
                </div>
                <p className="text-xs text-gray-500 md:col-span-2">Dhyan: PMDC number ki asal jaanch PMDC ke official record se khud karein. Jab tak aap &quot;Verified&quot; na karein, public page par registration verified nahi dikhai deti.</p>
              </>
            )}
          </Section>
        );

      case 'review':
        return <ReviewSummary />;
      default:
        return null;
    }
  }

  function ReviewSummary() {
    const rows = [
      ['Naam', displayName() || '—'],
      ...(type === 'doctor'
        ? [
            ['Specialization', doc.main_specialization || '—'],
            ['Degree', [doc.degree, doc.degree_institution].filter(Boolean).join(' — ') || '—'],
            ['Clinics', `${clinics.length}`],
            ['PMDC number', reg.pmdc_number || '—'],
            ['FAQs', `${faqs.filter((f) => f.question.trim()).length}`],
          ]
        : [
            ['Shehar', taxonomy.cities.find((c) => c.id === biz.city_id)?.name || '—'],
            ['Phone', biz.phone || biz.whatsapp || '—'],
          ]),
    ];
    return (
      <Section title="Aakhri jaiza" subtitle={adminMode ? 'Save karne par tabdeeliyan foran lagoo ho jati hain.' : 'Sab theek hai to Submit karein. Admin approve karega to website par live ho jayegi.'}>
        <dl className="grid grid-cols-1 gap-2 md:col-span-2 md:grid-cols-2">
          {rows.map(([k, v]) => (
            <div key={k} className="rounded-xl border border-line bg-surface px-4 py-3">
              <dt className="text-xs font-semibold uppercase tracking-wide text-gray-500">{k}</dt>
              <dd className="mt-0.5 text-sm font-medium text-gray-900">{v}</dd>
            </div>
          ))}
        </dl>
        {!adminMode && status === 'published' && <div className="md:col-span-2"><Banner kind="success">Aap ki listing live hai — tabdeeliyan save karte hi nazar aati hain.</Banner></div>}
        {!adminMode && status === 'rejected' && adm.admin_note && <div className="md:col-span-2"><Banner>Admin ka note: {adm.admin_note}</Banner></div>}
        {!adminMode && status === 'pending' && <div className="md:col-span-2"><Banner kind="warn">Aap ki profile pehle se review mein hai. Dobara submit karne se review mein hi rahegi.</Banner></div>}
      </Section>
    );
  }

  return (
    <div className="mx-auto max-w-4xl">
      {/* progress */}
      <nav aria-label="Steps" className="mb-5 overflow-x-auto pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        <ol className="flex min-w-max gap-2">
          {steps.map((s, i) => {
            const active = i === step;
            const reachable = i <= maxStep && (i === 0 ? !id : true);
            return (
              <li key={s.id}>
                <button
                  type="button"
                  disabled={!reachable || (i === 0 && Boolean(id))}
                  onClick={() => reachable && goTo(i)}
                  aria-current={active ? 'step' : undefined}
                  className={`flex items-center gap-2 rounded-full border px-3.5 py-1.5 text-xs font-semibold transition md:text-sm ${
                    active ? 'border-brand-600 bg-brand-600 text-white shadow-[inset_0_1px_0_rgba(255,255,255,0.35)]' : reachable ? 'border-line bg-surface text-gray-800 hover:bg-surface-alt' : 'border-line bg-surface-alt text-gray-400'
                  }`}
                >
                  <span className={`flex h-5 w-5 items-center justify-center rounded-full text-[11px] ${active ? 'bg-white/25' : 'bg-gray-200 text-gray-700'}`}>{i + 1}</span>
                  {s.label}
                </button>
              </li>
            );
          })}
        </ol>
      </nav>

      {partLabel && <p className="mb-3 text-xs font-bold uppercase tracking-wider text-brand-700">{partLabel}</p>}
      <div className="space-y-4">
        {error && <Banner>{error}</Banner>}
        {notice && !error && <Banner kind="success">{notice}</Banner>}
        {renderStep()}
      </div>

      {/* actions */}
      <div className="sticky bottom-0 z-10 -mx-4 mt-6 flex flex-wrap items-center justify-between gap-3 border-t border-line bg-surface/95 px-4 py-3 backdrop-blur md:static md:mx-0 md:rounded-2xl md:border md:px-5">
        <button type="button" onClick={() => goTo(Math.max(0, step - 1))} disabled={step === 0 || saving || (step === 1 && Boolean(id))} className="rounded-xl border border-line bg-surface px-5 py-2.5 text-sm font-semibold text-gray-800 hover:bg-surface-alt disabled:opacity-40">
          ← Wapis
        </button>
        <div className="flex flex-wrap gap-2">
          {current.id !== 'category' && !isLast && (
            <button type="button" onClick={saveDraft} disabled={saving} className="rounded-xl border border-line bg-surface px-5 py-2.5 text-sm font-semibold text-gray-800 hover:bg-surface-alt disabled:opacity-60">
              {saving ? 'Saving...' : 'Draft save karein'}
            </button>
          )}
          {isLast ? (
            <button type="button" onClick={submitAll} disabled={saving || uploading} className="rounded-xl bg-gradient-to-b from-brand-500 to-brand-700 px-7 py-2.5 text-sm font-bold text-white shadow-[inset_0_1px_0_rgba(255,255,255,0.4),0_8px_18px_-8px_rgba(0,0,0,0.5)] hover:brightness-105 disabled:opacity-60">
              {saving ? 'Saving...' : adminMode || status === 'published' ? 'Changes save karein' : 'Approval ke liye submit karein'}
            </button>
          ) : (
            <button type="button" onClick={next} disabled={saving || uploading} className="rounded-xl bg-gradient-to-b from-brand-500 to-brand-700 px-7 py-2.5 text-sm font-bold text-white shadow-[inset_0_1px_0_rgba(255,255,255,0.4),0_8px_18px_-8px_rgba(0,0,0,0.5)] hover:brightness-105 disabled:opacity-60">
              {saving ? 'Saving...' : uploading ? 'Upload ho raha hai...' : 'Save & Continue →'}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

/** Location + contact block for non-doctor businesses. */
function GeneralLocation({ biz, setB, cities, areas }) {
  const [note, setNote] = useState('');
  const cityAreas = areas.filter((a) => a.city_id === biz.city_id);
  const popular = cities.filter((c) => c.is_popular);
  const others = cities.filter((c) => !c.is_popular).sort((a, b) => a.name.localeCompare(b.name));

  function fromLink() {
    const found = parseMapLink(biz.map_link);
    if (!found) return setNote('Is link mein coordinates nahi mile. Poora Google Maps link paste karein.');
    setNote(`Coordinates mil gaye: ${found.lat}, ${found.lng}`);
    setB('latitude', String(found.lat));
    setB('longitude', String(found.lng));
  }
  function mine() {
    if (!('geolocation' in navigator)) return setNote('Is browser mein location support nahi hai.');
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setNote('Aap ki current location bhar di gayi — yeh tab theek hai jab aap business par hon.');
        setB('latitude', pos.coords.latitude.toFixed(6));
        setB('longitude', pos.coords.longitude.toFixed(6));
      },
      () => setNote('Location nahi mil saki. Maps link use karein.'),
      { enableHighAccuracy: true, timeout: 12000 }
    );
  }

  return (
    <>
      <Field label="Shehar" required>
        <select value={biz.city_id} onChange={(e) => { setB('city_id', e.target.value); setB('area_id', ''); }} className={inputCls}>
          <option value="">— shehar chunein —</option>
          {popular.length > 0 && <optgroup label="Popular cities">{popular.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}</optgroup>}
          <optgroup label="Baqi cities">{others.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}</optgroup>
        </select>
      </Field>
      <SelectField label="Area / Locality" value={biz.area_id} onChange={(v) => setB('area_id', v)} options={cityAreas.map((a) => ({ value: a.id, label: a.name }))} disabled={cityAreas.length === 0} placeholder={cityAreas.length === 0 ? 'Is shehar ke area abhi nahi' : '— optional —'} />
      <TextAreaField label="Mukammal address" required rows={2} className="md:col-span-2" value={biz.address} onChange={(v) => setB('address', v)} />
      <TextField label="Phone number" type="tel" value={biz.phone} onChange={(v) => setB('phone', v)} placeholder="0300 1234567" />
      <TextField label="WhatsApp number (Order button)" type="tel" value={biz.whatsapp} onChange={(v) => setB('whatsapp', v)} placeholder="Khali ho to phone use hoga" />
      <TextField label="Timing" className="md:col-span-2" value={biz.timing} onChange={(v) => setB('timing', v)} placeholder="Mon-Sat, 9am - 9pm" />
      <div className="rounded-2xl border border-line bg-surface p-4 md:col-span-2">
        <p className="mb-3 text-sm font-semibold text-gray-900">Map location (&quot;mere qareeb&quot; search ke liye)</p>
        <TextField label="Google Maps link" value={biz.map_link} onChange={(v) => setB('map_link', v)} />
        <div className="mt-3 grid grid-cols-2 gap-3">
          <TextField label="Latitude" inputMode="decimal" value={biz.latitude} onChange={(v) => setB('latitude', v)} />
          <TextField label="Longitude" inputMode="decimal" value={biz.longitude} onChange={(v) => setB('longitude', v)} />
        </div>
        <div className="mt-3 flex flex-wrap gap-2">
          <button type="button" onClick={fromLink} className="rounded-xl border border-line bg-surface px-3.5 py-2 text-sm font-semibold text-gray-800 hover:bg-surface-alt">Link se coordinates</button>
          <button type="button" onClick={mine} className="rounded-xl border border-line bg-surface px-3.5 py-2 text-sm font-semibold text-gray-800 hover:bg-surface-alt">Meri current location</button>
        </div>
        {note && <p className="mt-2 text-xs text-gray-600">{note}</p>}
      </div>
    </>
  );
}
