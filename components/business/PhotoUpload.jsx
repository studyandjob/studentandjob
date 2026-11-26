'use client';

import { useRef, useState } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { Field } from './FormUI';

const MAX_BYTES = 5 * 1024 * 1024;
const TYPES = ['image/jpeg', 'image/png', 'image/webp'];

/** Uploads a photo to the public 'business-photos' bucket (into the user's own folder). */
export default function PhotoUpload({ label = 'Photo', value, onChange, onUploadingChange, hint }) {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const ref = useRef(null);

  async function pick(e) {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file) return;
    if (!TYPES.includes(file.type)) return setError('Sirf JPG, PNG ya WebP photo chunein.');
    if (file.size > MAX_BYTES) return setError('Photo 5 MB se choti honi chahiye.');
    setError('');
    setBusy(true);
    onUploadingChange?.(true);
    try {
      const { data: auth } = await supabase.auth.getUser();
      const uid = auth?.user?.id;
      if (!uid) throw new Error('Login expire ho gaya — dobara login karein.');
      const ext = (file.name.split('.').pop() || 'jpg').toLowerCase().replace(/[^a-z0-9]/g, '');
      const path = `${uid}/${crypto.randomUUID()}.${ext}`;
      const { error: err } = await supabase.storage.from('business-photos').upload(path, file, { cacheControl: '3600', upsert: false });
      if (err) throw err;
      onChange(supabase.storage.from('business-photos').getPublicUrl(path).data.publicUrl);
    } catch (err) {
      setError(err.message || 'Photo upload nahi ho saki.');
    } finally {
      setBusy(false);
      onUploadingChange?.(false);
    }
  }

  return (
    <Field label={label} hint={hint || 'JPG / PNG / WebP, 5 MB tak'}>
      <div className="flex items-center gap-4">
        <div className="flex h-24 w-24 flex-shrink-0 items-center justify-center overflow-hidden rounded-2xl border border-line bg-surface-alt text-xs text-gray-400">
          {value ? <img src={value} alt="" className="h-full w-full object-cover" /> : 'Koi photo nahi'}
        </div>
        <div className="flex flex-wrap gap-2">
          <button type="button" disabled={busy} onClick={() => ref.current?.click()} className="rounded-xl border border-line bg-surface px-4 py-2 text-sm font-semibold text-gray-800 hover:bg-surface-alt disabled:opacity-60">
            {busy ? 'Upload ho rahi hai...' : value ? 'Photo badlein' : 'Photo chunein'}
          </button>
          {value && !busy && (
            <button type="button" onClick={() => onChange('')} className="rounded-xl px-3 py-2 text-sm font-semibold text-red-600 hover:bg-red-50">
              Hatayein
            </button>
          )}
        </div>
        <input ref={ref} type="file" accept={TYPES.join(',')} onChange={pick} className="hidden" />
      </div>
      {error && <span className="mt-1.5 block text-xs text-red-600">{error}</span>}
    </Field>
  );
}
