'use client';

import { useState } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { PlusIcon } from '../icons';

const inputClass =
  'w-full rounded-[10px] border border-aline bg-[#FCFAF6] px-3.5 py-2.5 text-[0.9rem] text-aink outline-none transition focus:border-atl2 focus:ring-[3px] focus:ring-atl2/10';
const labelClass = 'mb-1.5 block text-[0.85rem] font-semibold text-aink';

const emptyForm = { name: '', email: '', password: '' };

export default function AddUser({ onCreated }) {
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  function update(name, value) {
    setForm((f) => ({ ...f, [name]: value }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    setSuccess('');
    if (!form.name.trim() || !form.email.trim() || form.password.length < 6) {
      setError('Name, email, and a password of at least 6 characters are required.');
      return;
    }
    setSaving(true);
    try {
      const { data: sessionData } = await supabase.auth.getSession();
      const token = sessionData?.session?.access_token;
      const res = await fetch('/api/staff/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify(form),
      });
      const body = await res.json();
      if (!res.ok) throw new Error(body.error || 'Could not create the staff account.');
      setSuccess(`"${body.user.name}" ka account ban gaya. Ab "Task Assignment" tab me unhe kaam assign karein.`);
      setForm(emptyForm);
      onCreated?.(body.user);
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="grid grid-cols-1 gap-3.5 rounded-xl bg-[#F5F9F8] p-4 sm:grid-cols-2">
      {error && (
        <p className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-600 sm:col-span-2">
          {error}
        </p>
      )}
      {success && (
        <p className="rounded-lg border border-green-200 bg-green-50 px-3 py-2 text-sm text-green-700 sm:col-span-2">
          {success}
        </p>
      )}

      <label className="sm:col-span-2">
        <span className={labelClass}>Staff Name</span>
        <input className={inputClass} placeholder="e.g. Ali Raza" value={form.name} onChange={(e) => update('name', e.target.value)} />
      </label>

      <label>
        <span className={labelClass}>Email (used to log in at /user)</span>
        <input
          type="email"
          className={inputClass}
          placeholder="staff@example.com"
          value={form.email}
          onChange={(e) => update('email', e.target.value)}
        />
      </label>

      <label>
        <span className={labelClass}>Password</span>
        <input
          type="text"
          className={inputClass}
          placeholder="At least 6 characters"
          value={form.password}
          onChange={(e) => update('password', e.target.value)}
        />
      </label>

      <div className="sm:col-span-2">
        <button
          type="submit"
          disabled={saving}
          className="inline-flex items-center gap-2 rounded-full px-6 py-2.5 text-sm font-semibold text-white shadow-[0_6px_18px_-6px_rgba(30,132,73,0.5)] transition hover:-translate-y-0.5 disabled:opacity-60"
          style={{ background: 'linear-gradient(135deg, #1E8449, #2E5AAC)' }}
        >
          <PlusIcon className="h-4 w-4" />
          {saving ? 'Creating...' : 'Create Staff Account'}
        </button>
        <p className="mt-2 text-xs text-amuted">
          Naya account by default kisi bhi module ko manage nahi kar sakta — banane ke baad "Task Assignment" tab me
          jaake unhe Job / Study Zone / Result / Scholarship me se koi bhi assign karein.
        </p>
      </div>
    </form>
  );
}
