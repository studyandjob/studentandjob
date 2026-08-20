'use client';

import { useState, useRef } from 'react';
import { supabase } from '@/lib/supabaseClient';
import AdminCard from './AdminCard';
import {
  IdCardIcon,
  PlusIcon,
  TrashIcon,
  EyeIcon,
  PencilIcon,
  PhoneIcon,
  MailIcon,
  UserCircleIcon,
  SaveIcon,
  ImageIcon,
} from './icons';

const inputClass =
  'w-full rounded-[10px] border border-aline bg-[#FCFAF6] px-3.5 py-3 text-[0.93rem] text-aink outline-none transition focus:border-atl2 focus:ring-[3px] focus:ring-atl2/10';
const labelClass = 'mb-1.5 block text-[0.85rem] font-semibold text-aink';

// Storage bucket that holds contact photos — create it once in Supabase
// (Storage > New bucket > name it "contact-images" and make it Public), or
// run the bucket-creation SQL provided alongside this project.
const BUCKET = 'contact-images';

const TEXT_FIELDS = [
  { name: 'name', label: 'Name', required: true, placeholder: 'e.g. Ali Raza' },
  { name: 'designation', label: 'Designation', placeholder: 'e.g. Admissions Officer' },
  { name: 'contact_no', label: 'Contact No', placeholder: '03xx-xxxxxxx' },
  { name: 'email', label: 'Email', placeholder: 'name@example.com' },
];

const emptyForm = { ...Object.fromEntries(TEXT_FIELDS.map((f) => [f.name, ''])), image_url: '' };

function Avatar({ name, imageUrl, size = 56 }) {
  const [failed, setFailed] = useState(false);

  if (imageUrl && !failed) {
    return (
      // Plain <img> on purpose (not next/image) — a public Supabase Storage
      // URL is already final and ready to use, so the Next optimizer adds
      // nothing and can only introduce config/production-only failures.
      <img
        src={imageUrl}
        alt={name || 'Contact'}
        onError={() => {
          // Surface the failing URL in the console so it's easy to see
          // *why* it failed (404 = wrong path, 400 = bucket not public,
          // 403 = missing storage read policy) via the Network tab.
          console.warn('Contact photo failed to load:', imageUrl);
          setFailed(true);
        }}
        className="flex-shrink-0 rounded-full object-cover ring-2 ring-aline"
        style={{ width: size, height: size }}
      />
    );
  }
  return (
    <div
      className="flex flex-shrink-0 items-center justify-center rounded-full bg-atl2/10 text-atl2 ring-2 ring-aline"
      style={{ width: size, height: size }}
    >
      <UserCircleIcon style={{ width: size * 0.62, height: size * 0.62 }} />
    </div>
  );
}

// Uploads a photo to Supabase Storage and returns its public URL.
async function uploadContactImage(file) {
  const ext = file.name.split('.').pop();
  const fileName = `${crypto.randomUUID()}.${ext}`;
  const { error: uploadError } = await supabase.storage
    .from(BUCKET)
    .upload(fileName, file, { cacheControl: '3600', upsert: false });
  if (uploadError) throw uploadError;
  const { data } = supabase.storage.from(BUCKET).getPublicUrl(fileName);
  return data.publicUrl;
}

// File-upload control — picks an image from disk, uploads it to Supabase
// Storage, and stores the resulting public URL (no manual URL typing).
// onUploadingChange lets the parent form disable Save/Add while a photo
// upload is still in flight, so a contact can never be submitted with a
// blank image_url just because the upload hadn't finished yet.
function ImageUploadField({ imageUrl, name, onUploaded, onError, onUploadingChange }) {
  const [uploading, setUploading] = useState(false);
  const inputRef = useRef(null);

  async function handleFileChange(e) {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    onUploadingChange?.(true);
    try {
      const url = await uploadContactImage(file);
      onUploaded(url);
    } catch (err) {
      onError(err.message || 'Image upload failed.');
    } finally {
      setUploading(false);
      onUploadingChange?.(false);
      if (inputRef.current) inputRef.current.value = '';
    }
  }

  return (
    <div className="sm:col-span-2">
      <span className={labelClass}>Photo</span>
      <div className="flex items-center gap-4">
        <Avatar name={name} imageUrl={imageUrl} size={64} />
        <div>
          <input
            ref={inputRef}
            type="file"
            accept="image/*"
            onChange={handleFileChange}
            className="hidden"
          />
          <button
            type="button"
            disabled={uploading}
            onClick={() => inputRef.current?.click()}
            className="flex items-center gap-2 rounded-full border border-atl2/30 bg-atl2/10 px-4 py-2 text-xs font-semibold text-atl2 transition hover:bg-atl2 hover:text-white disabled:opacity-60"
          >
            <ImageIcon className="h-3.5 w-3.5" />
            {uploading ? 'Uploading...' : imageUrl ? 'Change Photo' : 'Upload Photo'}
          </button>
          <p className="mt-1.5 text-[0.72rem] text-amuted">JPG or PNG, uploaded directly — saved automatically.</p>
        </div>
      </div>
    </div>
  );
}

function ContactEditForm({ contact, onCancel, onSaved, onError }) {
  const [form, setForm] = useState({
    name: contact.name || '',
    designation: contact.designation || '',
    image_url: contact.image_url || '',
    contact_no: contact.contact_no || '',
    email: contact.email || '',
  });
  const [saving, setSaving] = useState(false);
  const [photoUploading, setPhotoUploading] = useState(false);

  function update(name, value) {
    setForm((f) => ({ ...f, [name]: value }));
  }

  async function handleSave(e) {
    e.preventDefault();
    if (photoUploading) {
      onError('Photo is still uploading — please wait for it to finish.');
      return;
    }
    setSaving(true);
    const { data, error } = await supabase
      .from('site_contacts')
      .update(form)
      .eq('id', contact.id)
      .select()
      .maybeSingle();
    setSaving(false);
    if (error) {
      onError(error.message);
      return;
    }
    onSaved(data || { ...contact, ...form });
  }

  return (
    <form onSubmit={handleSave} className="grid grid-cols-1 gap-3 sm:grid-cols-2">
      <ImageUploadField
        imageUrl={form.image_url}
        name={form.name}
        onUploaded={(url) => update('image_url', url)}
        onError={onError}
        onUploadingChange={setPhotoUploading}
      />
      {TEXT_FIELDS.map((f) => (
        <label key={f.name} className="block">
          <span className={labelClass}>{f.label}</span>
          <input
            type={f.name === 'email' ? 'email' : 'text'}
            required={f.required}
            value={form[f.name]}
            onChange={(e) => update(f.name, e.target.value)}
            placeholder={f.placeholder}
            className={inputClass}
          />
        </label>
      ))}
      <div className="flex items-center gap-3 sm:col-span-2">
        <button
          type="submit"
          disabled={saving || photoUploading}
          className="inline-flex items-center gap-2 rounded-full px-5 py-2.5 text-sm font-semibold text-white shadow-[0_6px_18px_-6px_rgba(242,120,92,0.5)] transition hover:-translate-y-0.5 disabled:opacity-60"
          style={{ background: 'linear-gradient(135deg, #E8A33D, #F2785C)' }}
        >
          <SaveIcon className="h-4 w-4" />
          {saving ? 'Saving...' : photoUploading ? 'Uploading photo...' : 'Save Changes'}
        </button>
        <button
          type="button"
          onClick={onCancel}
          className="rounded-full border border-aline px-5 py-2.5 text-sm font-semibold text-amuted transition hover:bg-[#F5F9F8]"
        >
          Cancel
        </button>
      </div>
    </form>
  );
}

// Admin manager for the contacts directory shown as cards on the public
// Contact Us page. Supports Add, View, Edit and Delete. Photos are uploaded
// directly to Supabase Storage (no manual image URL entry).
export default function ContactsManager({ initialRows = [] }) {
  const [rows, setRows] = useState(initialRows);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);
  const [photoUploading, setPhotoUploading] = useState(false);
  const [error, setError] = useState('');
  const [viewId, setViewId] = useState(null);
  const [editId, setEditId] = useState(null);

  function update(name, value) {
    setForm((f) => ({ ...f, [name]: value }));
  }

  async function handleAdd(e) {
    e.preventDefault();
    if (photoUploading) {
      setError('Photo is still uploading — please wait for it to finish before adding.');
      return;
    }
    setSaving(true);
    setError('');

    const { data, error } = await supabase.from('site_contacts').insert(form).select();

    setSaving(false);
    if (error) {
      setError(error.message);
      return;
    }
    setRows((prev) => [...(data || []), ...prev]);
    setForm(emptyForm);
  }

  async function handleDelete(id) {
    if (!confirm('Delete this contact? This cannot be undone.')) return;
    const { error } = await supabase.from('site_contacts').delete().eq('id', id);
    if (error) {
      setError(error.message);
      return;
    }
    setRows((prev) => prev.filter((r) => r.id !== id));
    if (viewId === id) setViewId(null);
    if (editId === id) setEditId(null);
  }

  return (
    <AdminCard
      title="Contact Us — Contacts"
      description="Contact persons shown as cards on the public Contact Us page (name, designation, photo, phone, email)."
      icon={IdCardIcon}
    >
      {error && <p className="mb-4 rounded-lg border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-600">{error}</p>}

      {/* Add form */}
      <form onSubmit={handleAdd} className="mb-6 grid grid-cols-1 gap-3.5 rounded-xl bg-[#F5F9F8] p-4 sm:grid-cols-2">
        <ImageUploadField
          imageUrl={form.image_url}
          name={form.name}
          onUploaded={(url) => update('image_url', url)}
          onError={setError}
          onUploadingChange={setPhotoUploading}
        />
        {TEXT_FIELDS.map((f) => (
          <label key={f.name} className="block">
            <span className={labelClass}>{f.label}</span>
            <input
              type={f.name === 'email' ? 'email' : 'text'}
              required={f.required}
              value={form[f.name]}
              onChange={(e) => update(f.name, e.target.value)}
              placeholder={f.placeholder}
              className={inputClass}
            />
          </label>
        ))}
        <div className="sm:col-span-2">
          <button
            type="submit"
            disabled={saving || photoUploading}
            className="inline-flex items-center gap-2 rounded-full px-6 py-2.5 text-sm font-semibold text-white shadow-[0_6px_18px_-6px_rgba(242,120,92,0.5)] transition hover:-translate-y-0.5 disabled:opacity-60"
            style={{ background: 'linear-gradient(135deg, #E8A33D, #F2785C)' }}
          >
            <PlusIcon className="h-4 w-4" />
            {saving ? 'Adding...' : photoUploading ? 'Uploading photo...' : 'Add Contact'}
          </button>
        </div>
      </form>

      {/* Card grid */}
      {rows.length === 0 ? (
        <p className="py-6 text-center text-sm text-amuted">No contacts added yet.</p>
      ) : (
        <ul className="grid grid-cols-1 gap-3.5 sm:grid-cols-2 lg:grid-cols-3">
          {rows.map((row) => {
            const isEditing = editId === row.id;
            const isViewing = viewId === row.id;
            return (
              <li
                key={row.id}
                className="rounded-xl border border-aline bg-white p-4 transition hover:border-emerald-200 hover:shadow-sm"
              >
                {isEditing ? (
                  <ContactEditForm
                    contact={row}
                    onCancel={() => setEditId(null)}
                    onError={setError}
                    onSaved={(updated) => {
                      setRows((prev) => prev.map((r) => (r.id === row.id ? updated : r)));
                      setEditId(null);
                    }}
                  />
                ) : (
                  <>
                    <div className="flex items-center gap-3">
                      <Avatar name={row.name} imageUrl={row.image_url} />
                      <div className="min-w-0 flex-1">
                        <p className="truncate font-semibold text-aink">{row.name}</p>
                        <p className="truncate text-xs text-amuted">{row.designation || '—'}</p>
                      </div>
                    </div>

                    {isViewing && (
                      <div className="mt-3 flex flex-col gap-1.5 rounded-lg bg-[#F5F9F8] p-3 text-sm text-aink">
                        <p className="flex items-center gap-2">
                          <PhoneIcon className="h-4 w-4 flex-shrink-0 text-atl2" />
                          <span>{row.contact_no || 'Not provided'}</span>
                        </p>
                        <p className="flex items-center gap-2">
                          <MailIcon className="h-4 w-4 flex-shrink-0 text-atl2" />
                          <span className="truncate">{row.email || 'Not provided'}</span>
                        </p>
                      </div>
                    )}

                    <div className="mt-3.5 flex flex-wrap items-center gap-2">
                      <button
                        onClick={() => setViewId(isViewing ? null : row.id)}
                        className="flex items-center gap-1.5 rounded-full border border-atl2/30 bg-atl2/10 px-3.5 py-1.5 text-xs font-semibold text-atl2 transition hover:bg-atl2 hover:text-white"
                      >
                        <EyeIcon className="h-3.5 w-3.5" />
                        View
                      </button>
                      <button
                        onClick={() => setEditId(row.id)}
                        className="flex items-center gap-1.5 rounded-full border border-agold/40 bg-agold/10 px-3.5 py-1.5 text-xs font-semibold text-[#9c6a1f] transition hover:bg-agold hover:text-white"
                      >
                        <PencilIcon className="h-3.5 w-3.5" />
                        Edit
                      </button>
                      <button
                        onClick={() => handleDelete(row.id)}
                        className="flex items-center gap-1.5 rounded-full border border-rose-200 bg-rose-50 px-3.5 py-1.5 text-xs font-semibold text-rose-600 transition hover:bg-rose-600 hover:text-white"
                      >
                        <TrashIcon className="h-3.5 w-3.5" />
                        Delete
                      </button>
                    </div>
                  </>
                )}
              </li>
            );
          })}
        </ul>
      )}
    </AdminCard>
  );
}
