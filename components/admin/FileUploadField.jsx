'use client';

import { useState, useRef } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { FileTextIcon } from './icons';

const labelClass = 'mb-1.5 block text-[0.85rem] font-semibold text-aink';

// Separate bucket from 'site-images' (logo/hero) since these are PDFs, not
// images — keeping them apart avoids one bucket's cleanup/rules affecting
// the other. See sql/storage_site_files.sql for the bucket + RLS policies.
const BUCKET = 'site-files';

async function uploadSiteFile(folder, file) {
  const ext = file.name.split('.').pop();
  const fileName = `${folder}/${crypto.randomUUID()}.${ext}`;
  const { error: uploadError } = await supabase.storage
    .from(BUCKET)
    .upload(fileName, file, { cacheControl: '3600', upsert: false });
  if (uploadError) throw uploadError;
  const { data } = supabase.storage.from(BUCKET).getPublicUrl(fileName);
  return data.publicUrl;
}

// Reusable "upload a PDF instead of typing a URL" control — same pattern
// as ImageUploadField, but for documents (Notes / Guess Papers / any file
// link field). Shows the uploaded file's name instead of an image preview,
// and reports the resulting public URL back to the parent form.
//
// @param {string} folder - subfolder within the shared bucket (e.g. 'notes')
// @param {string} fileUrl - current file URL (used to show "already uploaded" state)
// @param {string} label - field label shown above the control
// @param {string} accept - input accept attribute (defaults to PDFs)
// @param {Function} onUploaded - (url) => void, called with the new public URL
// @param {Function} onError - (message) => void
// @param {Function} onUploadingChange - (boolean) => void, so the parent form
//   can disable Save while an upload is still in flight.
export default function FileUploadField({
  folder,
  fileUrl,
  label = 'File',
  accept = 'application/pdf',
  onUploaded,
  onError,
  onUploadingChange,
}) {
  const [uploading, setUploading] = useState(false);
  const inputRef = useRef(null);

  async function handleFileChange(e) {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    onUploadingChange?.(true);
    try {
      const url = await uploadSiteFile(folder, file);
      onUploaded(url, file.name);
    } catch (err) {
      onError?.(err.message || 'File upload failed.');
    } finally {
      setUploading(false);
      onUploadingChange?.(false);
      if (inputRef.current) inputRef.current.value = '';
    }
  }

  // Best-effort "nice" file name from the URL, for the already-uploaded
  // state (the stored URL itself is a random uuid, not the original name).
  const shownName = fileUrl ? decodeURIComponent(fileUrl.split('/').pop() || fileUrl) : '';

  return (
    <div className="sm:col-span-2">
      <span className={labelClass}>{label}</span>
      <div className="flex items-center gap-4">
        <div className="flex h-[52px] w-[52px] flex-shrink-0 items-center justify-center rounded-lg bg-atl2/10 text-atl2 ring-2 ring-aline">
          <FileTextIcon className="h-6 w-6" />
        </div>
        <div className="min-w-0">
          <input ref={inputRef} type="file" accept={accept} onChange={handleFileChange} className="hidden" />
          <button
            type="button"
            disabled={uploading}
            onClick={() => inputRef.current?.click()}
            className="flex items-center gap-2 rounded-full border border-atl2/30 bg-atl2/10 px-4 py-2 text-xs font-semibold text-atl2 transition hover:bg-atl2 hover:text-white disabled:opacity-60"
          >
            <FileTextIcon className="h-3.5 w-3.5" />
            {uploading ? 'Uploading...' : fileUrl ? 'Change File' : 'Upload PDF'}
          </button>
          {fileUrl ? (
            <p className="mt-1.5 truncate text-xs text-amuted" title={shownName}>
              Uploaded: {shownName}
            </p>
          ) : (
            <p className="mt-1.5 text-xs text-amuted">PDF, uploaded directly — saved automatically.</p>
          )}
        </div>
      </div>
    </div>
  );
}
