'use client';

import { useState } from 'react';
import ImageUploadField from './ImageUploadField';
import TagSelect from '../shared/TagSelect';
import { SECTORS, JOB_TYPES, APPLICATION_MODES, JOB_CATEGORIES, EDUCATION_LEVELS, SKILLS_LIST } from '@/lib/matching';

const inputClass =
  'w-full rounded-[10px] border border-aline bg-[#FCFAF6] px-3.5 py-3 text-[0.93rem] text-aink outline-none transition focus:border-atl2 focus:ring-[3px] focus:ring-atl2/10';
const labelClass = 'mb-1.5 block text-[0.85rem] font-semibold text-aink';

const EMPTY_JOB = {
  title: '',
  department: '',
  sector: 'Federal',
  job_type: 'Government',
  category: JOB_CATEGORIES[0],
  city: '',
  last_date: '',
  apply_link: '',
  ad_image_url: '',
  application_mode: 'Online',
  postal_address: '',
  required_documents: '',
  fee_details: '',
  whatsapp_number: '',
  education_required: [],
  skills_required: [],
  status: 'active',
};

/**
 * Add/Edit Job form. Uncontrolled about persistence — the parent
 * (JobsManager) passes onSubmit and decides whether it's an insert or
 * update.
 */
export default function JobForm({ initialJob, onSubmit, onCancel, saving }) {
  const [form, setForm] = useState(() => ({ ...EMPTY_JOB, ...(initialJob || {}) }));
  const [error, setError] = useState('');
  const [imageUploading, setImageUploading] = useState(false);

  const showManualFields = form.job_type === 'Government' || form.application_mode === 'Manual/By Post';

  function update(name, val) {
    setForm((f) => ({ ...f, [name]: val }));
  }

  function handleSubmit(e) {
    e.preventDefault();
    if (imageUploading) {
      setError('The ad image is still uploading — please wait a moment.');
      return;
    }
    if (!form.title.trim()) {
      setError('Job Title is required.');
      return;
    }
    setError('');
    onSubmit(form);
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-5">
      {error && (
        <p className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-600">{error}</p>
      )}

      {/* --- Sector + Job Type --- */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <label>
          <span className={labelClass}>Job Sector</span>
          <select value={form.sector} onChange={(e) => update('sector', e.target.value)} className={inputClass}>
            {SECTORS.map((s) => (
              <option key={s.value} value={s.value}>
                {s.label}
              </option>
            ))}
          </select>
        </label>

        <label>
          <span className={labelClass}>Job Type</span>
          <div className="flex gap-2 rounded-[10px] border border-aline bg-[#FCFAF6] p-1">
            {JOB_TYPES.map((t) => (
              <button
                key={t}
                type="button"
                onClick={() => update('job_type', t)}
                className={`flex-1 rounded-lg px-3 py-2.5 text-sm font-semibold transition ${
                  form.job_type === t ? 'bg-atl text-white' : 'text-amuted hover:text-aink'
                }`}
              >
                {t} Jobs
              </button>
            ))}
          </div>
        </label>
      </div>

      {/* --- Basic fields --- */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <label className="sm:col-span-2">
          <span className={labelClass}>Job Title</span>
          <input
            type="text"
            required
            value={form.title}
            onChange={(e) => update('title', e.target.value)}
            placeholder="e.g. Junior Clerk (BPS-11)"
            className={inputClass}
          />
        </label>

        <label>
          <span className={labelClass}>Department / Organization</span>
          <input
            type="text"
            value={form.department}
            onChange={(e) => update('department', e.target.value)}
            placeholder="e.g. Government of Punjab"
            className={inputClass}
          />
        </label>

        <label>
          <span className={labelClass}>Job Category</span>
          <select value={form.category} onChange={(e) => update('category', e.target.value)} className={inputClass}>
            {JOB_CATEGORIES.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
        </label>

        <label>
          <span className={labelClass}>Location / City</span>
          <input
            type="text"
            value={form.city}
            onChange={(e) => update('city', e.target.value)}
            placeholder="e.g. Lahore"
            className={inputClass}
          />
        </label>

        <label>
          <span className={labelClass}>Last Date to Apply</span>
          <input
            type="date"
            value={form.last_date || ''}
            onChange={(e) => update('last_date', e.target.value)}
            className={inputClass}
          />
        </label>

        <label>
          <span className={labelClass}>Application Mode</span>
          <select
            value={form.application_mode}
            onChange={(e) => update('application_mode', e.target.value)}
            className={inputClass}
          >
            {APPLICATION_MODES.map((m) => (
              <option key={m} value={m}>
                {m}
              </option>
            ))}
          </select>
        </label>

        <label>
          <span className={labelClass}>Official Apply Link</span>
          <input
            type="url"
            value={form.apply_link}
            onChange={(e) => update('apply_link', e.target.value)}
            placeholder="https://..."
            className={inputClass}
          />
        </label>

        <label>
          <span className={labelClass}>WhatsApp Number (for inquiries)</span>
          <input
            type="text"
            value={form.whatsapp_number}
            onChange={(e) => update('whatsapp_number', e.target.value)}
            placeholder="e.g. 923001234567"
            className={inputClass}
          />
        </label>
      </div>

      <div>
        <span className={labelClass}>Ad Image / PDF URL</span>
        <input
          type="url"
          value={form.ad_image_url}
          onChange={(e) => update('ad_image_url', e.target.value)}
          placeholder="https://... (image or PDF link)"
          className={inputClass}
        />
        <p className="mb-1 mt-2 text-xs text-amuted">Or upload an image directly:</p>
        <ImageUploadField
          folder="job_ads"
          imageUrl={form.ad_image_url}
          label=""
          onUploaded={(url) => update('ad_image_url', url)}
          onError={setError}
          onUploadingChange={setImageUploading}
        />
      </div>

      {/* --- Structured dropdowns for AI matching --- */}
      <div className="grid grid-cols-1 gap-4">
        <div>
          <span className={labelClass}>Education Required</span>
          <p className="mb-2 -mt-1 text-xs text-amuted">Used to auto-match this job with candidate profiles.</p>
          <TagSelect
            options={EDUCATION_LEVELS}
            value={form.education_required}
            onChange={(v) => update('education_required', v)}
            placeholder="Add custom qualification…"
          />
        </div>

        <div>
          <span className={labelClass}>Skills Required</span>
          <p className="mb-2 -mt-1 text-xs text-amuted">Used to auto-match this job with candidate profiles.</p>
          <TagSelect
            options={SKILLS_LIST}
            value={form.skills_required}
            onChange={(v) => update('skills_required', v)}
            placeholder="Add custom skill…"
          />
        </div>
      </div>

      {/* --- Conditional manual-application fields --- */}
      {showManualFields && (
        <div className="rounded-[12px] border border-agold/40 bg-agold/5 p-4">
          <p className="mb-3 text-sm font-semibold text-atl">
            Manual / By-Post details <span className="font-normal text-amuted">(shown because this is a Government job or a Manual/By-Post application)</span>
          </p>
          <div className="flex flex-col gap-4">
            <label>
              <span className={labelClass}>Postal Address</span>
              <textarea
                rows={2}
                value={form.postal_address}
                onChange={(e) => update('postal_address', e.target.value)}
                placeholder="Address to send the application by post"
                className={inputClass}
              />
            </label>
            <label>
              <span className={labelClass}>Required Documents Checklist</span>
              <textarea
                rows={3}
                value={form.required_documents}
                onChange={(e) => update('required_documents', e.target.value)}
                placeholder={'One item per line, e.g.\nCNIC copy\n2 passport size photographs\nAttested degree/certificates'}
                className={inputClass}
              />
            </label>
            <label>
              <span className={labelClass}>Fee / Challan Details</span>
              <textarea
                rows={2}
                value={form.fee_details}
                onChange={(e) => update('fee_details', e.target.value)}
                placeholder="e.g. Rs. 500 via bank challan, deposit slip required with application"
                className={inputClass}
              />
            </label>
          </div>
        </div>
      )}

      <div className="flex gap-3">
        <button
          type="submit"
          disabled={saving}
          className="rounded-full bg-atl px-6 py-3 text-sm font-semibold text-white transition hover:bg-atl2 disabled:opacity-60"
        >
          {saving ? 'Saving…' : initialJob ? 'Update Job' : 'Publish Job'}
        </button>
        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            className="rounded-full border border-aline px-6 py-3 text-sm font-semibold text-amuted transition hover:text-aink"
          >
            Cancel
          </button>
        )}
      </div>
    </form>
  );
}
