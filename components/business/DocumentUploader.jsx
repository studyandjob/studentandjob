'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { Banner } from './FormUI';

const MAX_BYTES = 8 * 1024 * 1024;
const TYPES = ['application/pdf', 'image/jpeg', 'image/png', 'image/webp'];

/**
 * PRIVATE supporting documents (PMDC certificate etc.). Files go to the
 * private 'doctor-documents' bucket — never public. Only the uploader and the
 * admin can open them (via short-lived signed links).
 */
export default function DocumentUploader({ businessId, canUpload = true }) {
  const [docs, setDocs] = useState([]);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const ref = useRef(null);

  const load = useCallback(async () => {
    if (!businessId) return;
    const { data } = await supabase.from('doctor_documents').select('*').eq('business_id', businessId).order('created_at', { ascending: false });
    setDocs(data || []);
  }, [businessId]);

  useEffect(() => {
    load();
  }, [load]);

  async function upload(e) {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file) return;
    if (!TYPES.includes(file.type)) return setError('Sirf PDF ya photo (JPG/PNG/WebP) upload karein.');
    if (file.size > MAX_BYTES) return setError('File 8 MB se choti honi chahiye.');
    setError('');
    setBusy(true);
    try {
      const { data: auth } = await supabase.auth.getUser();
      const uid = auth?.user?.id;
      if (!uid) throw new Error('Login expire ho gaya — dobara login karein.');
      const ext = (file.name.split('.').pop() || 'pdf').toLowerCase().replace(/[^a-z0-9]/g, '');
      const path = `${uid}/${businessId}/${crypto.randomUUID()}.${ext}`;
      const { error: upErr } = await supabase.storage.from('doctor-documents').upload(path, file, { upsert: false });
      if (upErr) throw upErr;
      const { error: rowErr } = await supabase.from('doctor_documents').insert({ business_id: businessId, file_path: path, file_name: file.name.slice(0, 120) });
      if (rowErr) {
        await supabase.storage.from('doctor-documents').remove([path]);
        throw rowErr;
      }
      await load();
    } catch (err) {
      setError(err.message || 'Upload nahi ho saka.');
    } finally {
      setBusy(false);
    }
  }

  async function open(doc) {
    setError('');
    const { data, error: err } = await supabase.storage.from('doctor-documents').createSignedUrl(doc.file_path, 60);
    if (err || !data?.signedUrl) return setError('File kholi nahi ja saki.');
    window.open(data.signedUrl, '_blank', 'noopener');
  }

  async function remove(doc) {
    if (!confirm('Yeh document delete karna hai?')) return;
    await supabase.storage.from('doctor-documents').remove([doc.file_path]);
    const { error: err } = await supabase.from('doctor_documents').delete().eq('id', doc.id);
    if (err) return setError(err.message);
    setDocs((d) => d.filter((x) => x.id !== doc.id));
  }

  if (!businessId) return <Banner kind="warn">Documents upload karne se pehle &quot;Save &amp; Continue&quot; dabayein, taake profile save ho jaye.</Banner>;

  return (
    <div className="space-y-3">
      <p className="text-sm text-gray-600">
        🔒 Yeh documents <strong>private</strong> hain — website par kabhi nahi dikhte, sirf admin verification ke liye dekhta hai.
      </p>
      {error && <Banner>{error}</Banner>}
      {docs.length > 0 && (
        <ul className="space-y-2">
          {docs.map((d) => (
            <li key={d.id} className="flex flex-wrap items-center justify-between gap-2 rounded-xl border border-line bg-surface px-3.5 py-2.5 text-sm">
              <span className="min-w-0 truncate font-medium text-gray-800">{d.file_name || 'Document'}</span>
              <span className="flex gap-2">
                <button type="button" onClick={() => open(d)} className="rounded-lg border border-line px-3 py-1.5 text-xs font-semibold text-gray-800 hover:bg-surface-alt">
                  Kholein
                </button>
                {canUpload && (
                  <button type="button" onClick={() => remove(d)} className="rounded-lg px-3 py-1.5 text-xs font-semibold text-red-600 hover:bg-red-50">
                    Delete
                  </button>
                )}
              </span>
            </li>
          ))}
        </ul>
      )}
      {canUpload && (
        <>
          <button type="button" disabled={busy} onClick={() => ref.current?.click()} className="rounded-xl border border-dashed border-line-strong bg-surface px-4 py-3 text-sm font-semibold text-gray-800 hover:bg-surface-alt disabled:opacity-60">
            {busy ? 'Upload ho raha hai...' : '＋ PMDC certificate / document upload karein'}
          </button>
          <input ref={ref} type="file" accept={TYPES.join(',')} onChange={upload} className="hidden" />
        </>
      )}
    </div>
  );
}
