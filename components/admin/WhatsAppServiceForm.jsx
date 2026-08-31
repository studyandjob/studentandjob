'use client';

import { useState } from 'react';
import { supabase } from '@/lib/supabaseClient';
import AdminCard from './AdminCard';
import { PhoneIcon, SaveIcon } from './icons';

const inputClass =
  'w-full rounded-[10px] border border-aline bg-[#FCFAF6] px-3.5 py-3 text-[0.93rem] text-aink outline-none transition focus:border-atl2 focus:ring-[3px] focus:ring-atl2/10';
const labelClass = 'mb-1.5 block text-[0.85rem] font-semibold text-aink';

export default function WhatsAppServiceForm({ settings }) {
  const [form, setForm] = useState({
    id: settings?.id,
    wa_service_enabled: settings?.wa_service_enabled ?? false,
    wa_service_title: settings?.wa_service_title || 'Application Support via WhatsApp',
    wa_service_price: settings?.wa_service_price || '',
    wa_service_description: settings?.wa_service_description || '',
    wa_service_features: settings?.wa_service_features || '',
    wa_service_terms: settings?.wa_service_terms || '',
    wa_service_whatsapp_number: settings?.wa_service_whatsapp_number || '',
    wa_service_cta_text: settings?.wa_service_cta_text || 'Chat on WhatsApp',
  });
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');

  function update(field, value) {
    setForm((f) => ({ ...f, [field]: value }));
  }

  async function handleSave(e) {
    e.preventDefault();
    if (form.wa_service_enabled) {
      if (!form.wa_service_price.trim()) {
        setMessage('Error: Price is required before you can turn this service ON — candidates must see the price up front.');
        return;
      }
      if (!form.wa_service_terms.trim()) {
        setMessage('Error: Refund / Terms text is required before you can turn this service ON.');
        return;
      }
      if (!form.wa_service_whatsapp_number.trim()) {
        setMessage('Error: A WhatsApp number is required before you can turn this service ON.');
        return;
      }
    }

    setSaving(true);
    setMessage('');
    const payload = { ...form, updated_at: new Date().toISOString() };

    let targetId = form.id;
    if (!targetId) {
      const { data: existing } = await supabase
        .from('site_settings')
        .select('id')
        .order('updated_at', { ascending: false, nullsFirst: false })
        .limit(1)
        .maybeSingle();
      targetId = existing?.id;
    }

    const { data, error } = targetId
      ? await supabase.from('site_settings').update(payload).eq('id', targetId).select()
      : await supabase.from('site_settings').insert(payload).select();

    setSaving(false);
    if (error) {
      setMessage(`Error: ${error.message}`);
      return;
    }
    if (!data || data.length === 0) {
      setMessage('Error: Save did not go through — your admin session may have expired. Please log out and back in, then try again.');
      return;
    }
    if (!form.id && data[0]?.id) update('id', data[0].id);
    setMessage('Saved successfully.');
  }

  return (
    <AdminCard
      title="WhatsApp Application-Support Service"
      description="A paid service where you help candidates fill and submit their job application over WhatsApp. Everything here — including whether it's shown at all — is fully in your control."
      icon={PhoneIcon}
    >
      <form onSubmit={handleSave} className="flex flex-col gap-5">
        {message && (
          <p
            className={`rounded-lg border px-3 py-2 text-sm ${
              message.startsWith('Error')
                ? 'border-red-200 bg-red-50 text-red-600'
                : 'border-brand-200 bg-brand-50 text-brand-700'
            }`}
          >
            {message}
          </p>
        )}

        {/* Master switch */}
        <label className="flex items-center justify-between gap-3 rounded-[12px] border border-aline bg-[#FCFAF6] px-4 py-3.5">
          <span>
            <span className="block text-sm font-semibold text-aink">Show this service on the website</span>
            <span className="block text-xs text-amuted">
              Off by default. Turn on only once price, terms and WhatsApp number below are filled in.
            </span>
          </span>
          <button
            type="button"
            onClick={() => update('wa_service_enabled', !form.wa_service_enabled)}
            className={`relative h-7 w-12 flex-shrink-0 rounded-full transition ${
              form.wa_service_enabled ? 'bg-atl' : 'bg-gray-300'
            }`}
            aria-pressed={form.wa_service_enabled}
          >
            <span
              className={`absolute top-1 h-5 w-5 rounded-full bg-white shadow transition ${
                form.wa_service_enabled ? 'left-6' : 'left-1'
              }`}
            />
          </button>
        </label>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <label>
            <span className={labelClass}>Service Title</span>
            <input
              type="text"
              value={form.wa_service_title}
              onChange={(e) => update('wa_service_title', e.target.value)}
              className={inputClass}
            />
          </label>

          <label>
            <span className={labelClass}>Price</span>
            <input
              type="text"
              value={form.wa_service_price}
              onChange={(e) => update('wa_service_price', e.target.value)}
              placeholder="e.g. Rs. 500 per application"
              className={inputClass}
            />
          </label>

          <label>
            <span className={labelClass}>WhatsApp Number</span>
            <input
              type="text"
              value={form.wa_service_whatsapp_number}
              onChange={(e) => update('wa_service_whatsapp_number', e.target.value)}
              placeholder="e.g. 923001234567"
              className={inputClass}
            />
          </label>

          <label>
            <span className={labelClass}>Button Text</span>
            <input
              type="text"
              value={form.wa_service_cta_text}
              onChange={(e) => update('wa_service_cta_text', e.target.value)}
              placeholder="e.g. Chat on WhatsApp"
              className={inputClass}
            />
          </label>
        </div>

        <label>
          <span className={labelClass}>Description</span>
          <textarea
            rows={3}
            value={form.wa_service_description}
            onChange={(e) => update('wa_service_description', e.target.value)}
            placeholder="A short paragraph explaining what this service is and who it's for."
            className={inputClass}
          />
        </label>

        <label>
          <span className={labelClass}>What's Included</span>
          <p className="mb-2 -mt-1 text-xs text-amuted">One item per line — shown to candidates as a checklist.</p>
          <textarea
            rows={4}
            value={form.wa_service_features}
            onChange={(e) => update('wa_service_features', e.target.value)}
            placeholder={'One item per line, e.g.\nForm filling assistance\nDocument checklist review\nSubmission confirmation screenshot'}
            className={inputClass}
          />
        </label>

        <label>
          <span className={labelClass}>Refund Policy / Terms & Conditions</span>
          <p className="mb-2 -mt-1 text-xs text-amuted">
            Shown in full to the candidate before they pay. Be specific — e.g. when a refund is/isn't available.
          </p>
          <textarea
            rows={6}
            value={form.wa_service_terms}
            onChange={(e) => update('wa_service_terms', e.target.value)}
            placeholder={
              'e.g.\n1. Payment must be made in advance via [method].\n2. If we are unable to submit your application, a full refund will be issued within 3 working days.\n3. No refund once the application has been successfully submitted on your behalf.\n4. Service fee does not cover any government/test/challan fee charged by the hiring organization.'
            }
            className={inputClass}
          />
        </label>

        <div className="flex flex-wrap items-center gap-3">
          <button
            type="submit"
            disabled={saving}
            className="inline-flex items-center gap-2 rounded-full px-6 py-2.5 text-sm font-semibold text-white shadow-[0_6px_18px_-6px_rgba(30,132,73,0.5)] transition hover:-translate-y-0.5 disabled:opacity-60"
            style={{ background: 'linear-gradient(135deg, #1E8449, #2E5AAC)' }}
          >
            <SaveIcon className="h-4 w-4" />
            {saving ? 'Saving...' : 'Save Service Settings'}
          </button>
        </div>
      </form>
    </AdminCard>
  );
}
