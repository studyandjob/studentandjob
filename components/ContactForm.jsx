'use client';

import { useState } from 'react';
import { supabase } from '@/lib/supabaseClient';

const inputClass =
  'w-full rounded-lg border border-gray-200 bg-gray-50 px-3.5 py-3 text-sm text-gray-800 outline-none transition focus:border-brand-500 focus:ring-[3px] focus:ring-brand-500/10';
const labelClass = 'mb-1.5 block text-sm font-semibold text-gray-700';

const emptyForm = { name: '', email: '', phone: '', subject: '', message: '' };

export default function ContactForm() {
  const [form, setForm] = useState(emptyForm);
  const [sending, setSending] = useState(false);
  const [status, setStatus] = useState(null); // 'success' | 'error' | null
  const [errorMsg, setErrorMsg] = useState('');

  function update(name, value) {
    setForm((f) => ({ ...f, [name]: value }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setSending(true);
    setStatus(null);
    setErrorMsg('');

    const { error } = await supabase.from('contact_messages').insert({
      name: form.name,
      email: form.email,
      phone: form.phone,
      subject: form.subject,
      message: form.message,
    });

    setSending(false);
    if (error) {
      setStatus('error');
      setErrorMsg(error.message);
      return;
    }
    setStatus('success');
    setForm(emptyForm);
  }

  return (
    <form onSubmit={handleSubmit} className="grid grid-cols-1 gap-4 sm:grid-cols-2">
      {status === 'success' && (
        <p className="rounded-lg border border-emerald-200 bg-emerald-50 px-3.5 py-2.5 text-sm text-emerald-700 sm:col-span-2">
          Thanks — your message has been sent. We'll get back to you soon.
        </p>
      )}
      {status === 'error' && (
        <p className="rounded-lg border border-rose-200 bg-rose-50 px-3.5 py-2.5 text-sm text-rose-600 sm:col-span-2">
          {errorMsg || 'Something went wrong. Please try again.'}
        </p>
      )}

      <label className="block">
        <span className={labelClass}>Full Name</span>
        <input
          required
          value={form.name}
          onChange={(e) => update('name', e.target.value)}
          placeholder="Your name"
          className={inputClass}
        />
      </label>

      <label className="block">
        <span className={labelClass}>Email</span>
        <input
          type="email"
          required
          value={form.email}
          onChange={(e) => update('email', e.target.value)}
          placeholder="you@example.com"
          className={inputClass}
        />
      </label>

      <label className="block">
        <span className={labelClass}>Phone (optional)</span>
        <input
          value={form.phone}
          onChange={(e) => update('phone', e.target.value)}
          placeholder="03xx-xxxxxxx"
          className={inputClass}
        />
      </label>

      <label className="block">
        <span className={labelClass}>Subject</span>
        <input
          value={form.subject}
          onChange={(e) => update('subject', e.target.value)}
          placeholder="What is this about?"
          className={inputClass}
        />
      </label>

      <label className="block sm:col-span-2">
        <span className={labelClass}>Message</span>
        <textarea
          required
          rows={5}
          value={form.message}
          onChange={(e) => update('message', e.target.value)}
          placeholder="Write your message..."
          className={inputClass}
        />
      </label>

      <div className="sm:col-span-2">
        <button
          type="submit"
          disabled={sending}
          className="inline-flex items-center gap-2 rounded-lg bg-brand-600 px-6 py-3 text-sm font-semibold text-white transition hover:bg-brand-700 disabled:opacity-60"
        >
          {sending ? 'Sending...' : 'Send Message'}
        </button>
      </div>
    </form>
  );
}
