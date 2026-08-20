'use client';

import { useState, useRef } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { ImageIcon } from './icons';

const labelClass = 'mb-1.5 block text-[0.85rem] font-semibold text-aink';

// Shared public bucket for site-wide images (logo, hero slides). Contact
// photos use their own separate 'contact-images' bucket (see
// ContactsManager.jsx) — kept separate since they're managed independently.
const BUCKET = 'site-images';

// Uploads an image to Supabase Storage and returns its public URL.
// `folder` keeps different image kinds organized within the one bucket,
// e.g. 'logo' or 'hero'.
async function uploadSiteImage(folder, file) {
  const ext = file.name.split('.').pop();
  const fileName = `${folder}/${crypto.randomUUID()}.${ext}`;
  const { error: uploadError } = await supabase.storage
    .from(BUCKET)
    .upload(fileName, file, { cacheControl: '3600', upsert: false });
  if (uploadError) throw uploadError;
  const { data } = supabase.storage.from(BUCKET).getPublicUrl(fileName);
  return data.publicUrl;
}

/**
 * Reusable "upload an image instead of typing a URL" control, used anywhere
 * the admin dashboard needs a logo or banner-style image (Site Settings'
 * Logo, Hero Slides' Image). Shows a live preview, uploads directly to
 * Supabase Storage on file select, and reports the resulting public URL
 * back to the parent form — no manual URL typing needed.
 *
 * @param {string} folder - subfolder within the shared bucket ('logo', 'hero')
 * @param {string} imageUrl - current image URL (for preview)
 * @param {string} label - field label shown above the control
 * @param {'rect'|'circle'} shape - preview shape
 * @param {number} previewSize - preview box size in px (square)
 * @param {Function} onUploaded - (url) => void, called with the new public URL
 * @param {Function} onError - (message) => void
 * @param {Function} onUploadingChange - (boolean) => void, so the parent form
 *   can disable Save while an upload is still in flight — this is what
 *   prevents a save going through with a blank image URL because the
 *   upload hadn't finished yet.
 */
export default function ImageUploadField({
  folder,
  imageUrl,
  label = 'Image',
  shape = 'rect',
  previewSize = 88,
  onUploaded,
  onError,
  onUploadingChange,
}) {
  const [uploading, setUploading] = useState(false);
  const [failed, setFailed] = useState(false);
  const inputRef = useRef(null);

  async function handleFileChange(e) {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    onUploadingChange?.(true);
    setFailed(false);
    try {
      const url = await uploadSiteImage(folder, file);
      onUploaded(url);
    } catch (err) {
      onError?.(err.message || 'Image upload failed.');
    } finally {
      setUploading(false);
      onUploadingChange?.(false);
      if (inputRef.current) inputRef.current.value = '';
    }
  }

  const shapeClass = shape === 'circle' ? 'rounded-full' : 'rounded-lg';

  return (
    <div className="sm:col-span-2">
      <span className={labelClass}>{label}</span>
      <div className="flex items-center gap-4">
        {imageUrl && !failed ? (
          // Plain <img> on purpose (not next/image) — a public Supabase
          // Storage URL is already final and ready to use, so the Next
          // optimizer adds nothing and can only introduce production-only
          // display failures.
          <img
            src={imageUrl}
            alt={label}
            onError={() => {
              console.warn(`${label} failed to load:`, imageUrl);
              setFailed(true);
            }}
            className={`flex-shrink-0 border border-aline object-cover ${shapeClass}`}
            style={{ width: previewSize, height: previewSize }}
          />
        ) : (
          <div
            className={`flex flex-shrink-0 items-center justify-center bg-atl2/10 text-atl2 ring-2 ring-aline ${shapeClass}`}
            style={{ width: previewSize, height: previewSize }}
          >
            <ImageIcon style={{ width: previewSize * 0.4, height: previewSize * 0.4 }} />
          </div>
        )}
        <div>
          <input ref={inputRef} type="file" accept="image/*" onChange={handleFileChange} className="hidden" />
          <button
            type="button"
            disabled={uploading}
            onClick={() => inputRef.current?.click()}
            className="flex items-center gap-2 rounded-full border border-atl2/30 bg-atl2/10 px-4 py-2 text-xs font-semibold text-atl2 transition hover:bg-atl2 hover:text-white disabled:opacity-60"
          >
            <ImageIcon className="h-3.5 w-3.5" />
            {uploading ? 'Uploading...' : imageUrl ? 'Change Image' : 'Upload Image'}
          </button>
          <p className="mt-1.5 text-[0.72rem] text-amuted">JPG or PNG, uploaded directly — saved automatically.</p>
        </div>
      </div>
    </div>
  );
}
