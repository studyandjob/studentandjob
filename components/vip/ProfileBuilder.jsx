'use client';

import { useState } from 'react';
import { supabase } from '@/lib/supabaseClient';
import TagSelect from '../shared/TagSelect';
import { SECTORS, EDUCATION_LEVELS, SKILLS_LIST } from '@/lib/matching';

const inputClass =
  'w-full rounded-lg border border-gray-200 bg-gray-50 px-3.5 py-2.5 text-sm text-gray-900 outline-none transition focus:border-brand-500 focus:ring-2 focus:ring-brand-100';
const labelClass = 'mb-1.5 block text-sm font-semibold text-gray-800';

function emptyEducationRow() {
  return { level: EDUCATION_LEVELS[0], degree: '', institute: '', year: '', marks: '' };
}
function emptyExperienceRow() {
  return { title: '', organization: '', duration: '', description: '' };
}

export default function ProfileBuilder({ profile, onSaved }) {
  const [form, setForm] = useState(() => ({
    full_name: profile?.full_name || '',
    father_name: profile?.father_name || '',
    cnic: profile?.cnic || '',
    dob: profile?.dob || '',
    gender: profile?.gender || '',
    phone: profile?.phone || '',
    whatsapp: profile?.whatsapp || '',
    email: profile?.email || '',
    city: profile?.city || '',
    address: profile?.address || '',
    sector_preference: profile?.sector_preference || '',
    photo_url: profile?.photo_url || '',
    summary: profile?.summary || '',
    education: profile?.education?.length ? profile.education : [emptyEducationRow()],
    skills: profile?.skills || [],
    experience: profile?.experience?.length ? profile.experience : [emptyExperienceRow()],
  }));
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  function update(name, value) {
    setForm((f) => ({ ...f, [name]: value }));
  }

  function updateEducationRow(i, field, value) {
    setForm((f) => {
      const rows = [...f.education];
      rows[i] = { ...rows[i], [field]: value };
      return { ...f, education: rows };
    });
  }

  function updateExperienceRow(i, field, value) {
    setForm((f) => {
      const rows = [...f.experience];
      rows[i] = { ...rows[i], [field]: value };
      return { ...f, experience: rows };
    });
  }

  async function handlePhotoUpload(e) {
    const file = e.target.files?.[0];
    if (!file) return;
    const { data: userData } = await supabase.auth.getUser();
    const path = `photos/${userData.user.id}-${Date.now()}.${file.name.split('.').pop()}`;
    const { error: uploadError } = await supabase.storage.from('vip_uploads').upload(path, file, { upsert: true });
    if (uploadError) {
      setError(uploadError.message);
      return;
    }
    const { data } = supabase.storage.from('vip_uploads').getPublicUrl(path);
    update('photo_url', data.publicUrl);
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setSaving(true);
    setError('');
    setSuccess('');

    const educationLevels = [...new Set(form.education.map((r) => r.level).filter(Boolean))];

    const { data: userData } = await supabase.auth.getUser();
    const payload = {
      user_id: userData.user.id,
      ...form,
      education_levels: educationLevels,
      updated_at: new Date().toISOString(),
    };

    const { data, error: upsertError } = await supabase
      .from('candidate_profiles')
      .upsert(payload, { onConflict: 'user_id' })
      .select()
      .single();

    setSaving(false);
    if (upsertError) {
      setError(upsertError.message);
      return;
    }
    setSuccess('Profile saved! Your job matches and CV are now up to date.');
    onSaved?.(data);
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-6">
      {error && <p className="rounded-lg border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-600">{error}</p>}
      {success && (
        <p className="rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm text-emerald-700">{success}</p>
      )}

      {/* Personal info */}
      <section>
        <h3 className="mb-3 text-base font-bold text-gray-900">Personal Information</h3>
        <div className="mb-4 flex items-center gap-4">
          {form.photo_url ? (
            <img src={form.photo_url} alt="" className="h-16 w-16 rounded-full object-cover" />
          ) : (
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-brand-50 text-lg font-bold text-brand-600">
              {(form.full_name || 'U').charAt(0)}
            </div>
          )}
          <label className="cursor-pointer rounded-full border border-brand-200 bg-brand-50 px-4 py-2 text-xs font-semibold text-brand-600 hover:bg-brand-100">
            Upload Photo
            <input type="file" accept="image/*" className="hidden" onChange={handlePhotoUpload} />
          </label>
        </div>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <label>
            <span className={labelClass}>Full Name</span>
            <input required value={form.full_name} onChange={(e) => update('full_name', e.target.value)} className={inputClass} />
          </label>
          <label>
            <span className={labelClass}>Father Name</span>
            <input value={form.father_name} onChange={(e) => update('father_name', e.target.value)} className={inputClass} />
          </label>
          <label>
            <span className={labelClass}>CNIC</span>
            <input value={form.cnic} onChange={(e) => update('cnic', e.target.value)} placeholder="xxxxx-xxxxxxx-x" className={inputClass} />
          </label>
          <label>
            <span className={labelClass}>Date of Birth</span>
            <input type="date" value={form.dob} onChange={(e) => update('dob', e.target.value)} className={inputClass} />
          </label>
          <label>
            <span className={labelClass}>Gender</span>
            <select value={form.gender} onChange={(e) => update('gender', e.target.value)} className={inputClass}>
              <option value="">Select…</option>
              <option>Male</option>
              <option>Female</option>
              <option>Other</option>
            </select>
          </label>
          <label>
            <span className={labelClass}>City</span>
            <input value={form.city} onChange={(e) => update('city', e.target.value)} className={inputClass} />
          </label>
          <label>
            <span className={labelClass}>Phone</span>
            <input value={form.phone} onChange={(e) => update('phone', e.target.value)} className={inputClass} />
          </label>
          <label>
            <span className={labelClass}>WhatsApp</span>
            <input value={form.whatsapp} onChange={(e) => update('whatsapp', e.target.value)} className={inputClass} />
          </label>
          <label>
            <span className={labelClass}>Email</span>
            <input type="email" value={form.email} onChange={(e) => update('email', e.target.value)} className={inputClass} />
          </label>
          <label>
            <span className={labelClass}>Preferred Sector</span>
            <select value={form.sector_preference} onChange={(e) => update('sector_preference', e.target.value)} className={inputClass}>
              <option value="">Any</option>
              {SECTORS.map((s) => (
                <option key={s.value} value={s.value}>
                  {s.label}
                </option>
              ))}
            </select>
          </label>
          <label className="sm:col-span-2">
            <span className={labelClass}>Address</span>
            <input value={form.address} onChange={(e) => update('address', e.target.value)} className={inputClass} />
          </label>
          <label className="sm:col-span-2">
            <span className={labelClass}>Profile Summary (shown at the top of your CV)</span>
            <textarea rows={3} value={form.summary} onChange={(e) => update('summary', e.target.value)} className={inputClass} />
          </label>
        </div>
      </section>

      {/* Education */}
      <section>
        <div className="mb-3 flex items-center justify-between">
          <h3 className="text-base font-bold text-gray-900">Education</h3>
          <button
            type="button"
            onClick={() => update('education', [...form.education, emptyEducationRow()])}
            className="text-xs font-semibold text-brand-600 hover:underline"
          >
            + Add Qualification
          </button>
        </div>
        <div className="flex flex-col gap-4">
          {form.education.map((row, i) => (
            <div key={i} className="grid grid-cols-1 gap-3 rounded-lg border border-gray-200 p-3 sm:grid-cols-2">
              <label>
                <span className={labelClass}>Level</span>
                <select value={row.level} onChange={(e) => updateEducationRow(i, 'level', e.target.value)} className={inputClass}>
                  {EDUCATION_LEVELS.map((lvl) => (
                    <option key={lvl} value={lvl}>
                      {lvl}
                    </option>
                  ))}
                </select>
              </label>
              <label>
                <span className={labelClass}>Degree / Major</span>
                <input value={row.degree} onChange={(e) => updateEducationRow(i, 'degree', e.target.value)} className={inputClass} />
              </label>
              <label>
                <span className={labelClass}>Institute</span>
                <input value={row.institute} onChange={(e) => updateEducationRow(i, 'institute', e.target.value)} className={inputClass} />
              </label>
              <label>
                <span className={labelClass}>Year</span>
                <input value={row.year} onChange={(e) => updateEducationRow(i, 'year', e.target.value)} className={inputClass} />
              </label>
              <label className="sm:col-span-2">
                <span className={labelClass}>Marks / GPA</span>
                <input value={row.marks} onChange={(e) => updateEducationRow(i, 'marks', e.target.value)} className={inputClass} />
              </label>
              {form.education.length > 1 && (
                <button
                  type="button"
                  onClick={() => update('education', form.education.filter((_, idx) => idx !== i))}
                  className="text-left text-xs font-semibold text-rose-500 hover:underline sm:col-span-2"
                >
                  Remove
                </button>
              )}
            </div>
          ))}
        </div>
      </section>

      {/* Skills */}
      <section>
        <h3 className="mb-3 text-base font-bold text-gray-900">Skills</h3>
        <TagSelect options={SKILLS_LIST} value={form.skills} onChange={(v) => update('skills', v)} placeholder="Add custom skill…" />
      </section>

      {/* Experience */}
      <section>
        <div className="mb-3 flex items-center justify-between">
          <h3 className="text-base font-bold text-gray-900">Experience</h3>
          <button
            type="button"
            onClick={() => update('experience', [...form.experience, emptyExperienceRow()])}
            className="text-xs font-semibold text-brand-600 hover:underline"
          >
            + Add Experience
          </button>
        </div>
        <div className="flex flex-col gap-4">
          {form.experience.map((row, i) => (
            <div key={i} className="grid grid-cols-1 gap-3 rounded-lg border border-gray-200 p-3 sm:grid-cols-2">
              <label>
                <span className={labelClass}>Job Title</span>
                <input value={row.title} onChange={(e) => updateExperienceRow(i, 'title', e.target.value)} className={inputClass} />
              </label>
              <label>
                <span className={labelClass}>Organization</span>
                <input value={row.organization} onChange={(e) => updateExperienceRow(i, 'organization', e.target.value)} className={inputClass} />
              </label>
              <label>
                <span className={labelClass}>Duration</span>
                <input
                  value={row.duration}
                  onChange={(e) => updateExperienceRow(i, 'duration', e.target.value)}
                  placeholder="e.g. Jan 2022 – Present"
                  className={inputClass}
                />
              </label>
              <label className="sm:col-span-2">
                <span className={labelClass}>Description</span>
                <textarea rows={2} value={row.description} onChange={(e) => updateExperienceRow(i, 'description', e.target.value)} className={inputClass} />
              </label>
              {form.experience.length > 1 && (
                <button
                  type="button"
                  onClick={() => update('experience', form.experience.filter((_, idx) => idx !== i))}
                  className="text-left text-xs font-semibold text-rose-500 hover:underline sm:col-span-2"
                >
                  Remove
                </button>
              )}
            </div>
          ))}
        </div>
      </section>

      <button
        type="submit"
        disabled={saving}
        className="self-start rounded-full bg-brand-600 px-6 py-3 text-sm font-semibold text-white transition hover:bg-brand-700 disabled:opacity-60"
      >
        {saving ? 'Saving…' : 'Save Profile'}
      </button>
    </form>
  );
}
