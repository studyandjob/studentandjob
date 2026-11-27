'use client';

import { useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabaseClient';
import Art3D from '../Art3D';
import VerifiedBadge from '../directory/VerifiedBadge';
import { Banner } from './FormUI';
import { isVerified } from '@/lib/directory';

const STATUS = {
  draft: { label: 'Draft', cls: 'bg-gray-100 text-gray-700', hint: 'Abhi submit nahi hui' },
  pending: { label: 'Review mein', cls: 'bg-amber-100 text-amber-800', hint: 'Admin jaanch kar raha hai' },
  published: { label: 'Live', cls: 'bg-emerald-100 text-emerald-800', hint: 'Website par nazar aa rahi hai' },
  rejected: { label: 'Reject', cls: 'bg-red-100 text-red-700', hint: 'Tabdeeli karke dobara submit karein' },
  banned: { label: 'Band (Banned)', cls: 'bg-gray-800 text-white', hint: 'Admin ne yeh listing band kar di hai' },
};

export default function OwnerDashboard() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [rows, setRows] = useState(null);
  const [error, setError] = useState('');

  const load = useCallback(async () => {
    const { data: auth } = await supabase.auth.getUser();
    setEmail(auth?.user?.email || '');
    const { data, error: err } = await supabase
      .from('businesses_table')
      .select('id, name, slug, photo_url, profile_type, listing_status, admin_note, verification_status, verified_until, updated_at')
      .eq('owner_id', auth?.user?.id)
      .order('updated_at', { ascending: false });
    if (err) {
      setError(/does not exist|column/i.test(err.message) ? 'Setup baqi hai — admin ko sql/add_owner_and_doctor.sql run karni hai.' : err.message);
      return setRows([]);
    }
    setRows(data || []);
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  async function remove(b) {
    if (!confirm(`"${b.name}" delete karna hai? Yeh wapis nahi ho sakta.`)) return;
    const { data, error: err } = await supabase.from('businesses_table').delete().eq('id', b.id).select('id');
    if (err) return setError(err.message);
    if (!data?.length) return setError('Delete nahi hua. Live listing delete karne ke liye admin se rabta karein.');
    setRows((r) => r.filter((x) => x.id !== b.id));
  }

  async function signOut() {
    await supabase.auth.signOut();
    router.replace('/business/login');
  }

  return (
    <div>
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 md:text-3xl">Meri listings</h1>
          {email && <p className="mt-0.5 text-sm text-gray-500">{email}</p>}
        </div>
        <div className="flex gap-2">
          <Link href="/business/new" className="rounded-xl bg-gradient-to-b from-brand-500 to-brand-700 px-5 py-2.5 text-sm font-bold text-white shadow-[inset_0_1px_0_rgba(255,255,255,0.4)] hover:brightness-105">
            ＋ Naya business add karein
          </Link>
          <button type="button" onClick={signOut} className="rounded-xl border border-line bg-surface px-4 py-2.5 text-sm font-semibold text-gray-800 hover:bg-surface-alt">
            Logout
          </button>
        </div>
      </div>

      {error && <div className="mb-4"><Banner>{error}</Banner></div>}

      {rows === null ? (
        <p className="py-12 text-center text-sm text-gray-500">Load ho raha hai...</p>
      ) : rows.length === 0 ? (
        <div className="rounded-3xl border border-line bg-gradient-to-b from-surface to-surface-alt p-10 text-center shadow-card">
          <Art3D name="shop" className="mx-auto h-16 w-16" />
          <p className="mt-3 text-base font-semibold text-gray-800">Aap ne abhi koi business add nahi kiya</p>
          <p className="mt-1 text-sm text-gray-500">Category chunein, form bharein aur admin ke approve karne par aap ka business website par live ho jayega.</p>
          <Link href="/business/new" className="mt-5 inline-block rounded-xl bg-gradient-to-b from-brand-500 to-brand-700 px-6 py-3 text-sm font-bold text-white">Pehla business add karein</Link>
        </div>
      ) : (
        <ul className="space-y-3">
          {rows.map((b) => {
            const st = STATUS[b.listing_status] || STATUS.draft;
            return (
              <li key={b.id} className="flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-line bg-gradient-to-b from-surface to-surface-alt p-4 shadow-[inset_0_1px_0_rgba(255,255,255,0.9)]">
                <div className="flex min-w-0 flex-1 items-center gap-3.5">
                  {b.photo_url ? (
                    <img src={b.photo_url} alt="" className="h-16 w-16 flex-shrink-0 rounded-xl object-cover" />
                  ) : (
                    <div className="flex h-16 w-16 flex-shrink-0 items-center justify-center rounded-xl bg-brand-50">
                      <Art3D name={b.profile_type === 'doctor' ? 'doctor' : 'shop'} className="h-10 w-10" />
                    </div>
                  )}
                  <div className="min-w-0">
                    <p className="truncate text-base font-bold text-gray-900">{b.name}</p>
                    <div className="mt-1 flex flex-wrap items-center gap-1.5">
                      <span className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${st.cls}`}>{st.label}</span>
                      {isVerified(b) && <VerifiedBadge compact />}
                      {b.profile_type === 'doctor' && <span className="rounded-full bg-brand-50 px-2.5 py-0.5 text-xs font-semibold text-brand-700">Doctor profile</span>}
                    </div>
                    <p className="mt-1 text-xs text-gray-500">{st.hint}</p>
                    {(b.listing_status === 'rejected' || b.listing_status === 'banned') && b.admin_note && <p className="mt-1 text-xs font-medium text-red-600">Admin ka note: {b.admin_note}</p>}
                  </div>
                </div>
                <div className="flex flex-wrap gap-2">
                  {b.listing_status !== 'banned' && (
                    <Link href={`/business/edit/${b.id}`} className="rounded-xl border border-line bg-surface px-4 py-2 text-sm font-semibold text-gray-800 hover:bg-surface-alt">
                      {b.listing_status === 'draft' ? 'Jaari rakhein' : 'Edit'}
                    </Link>
                  )}
                  {b.listing_status === 'published' && (
                    <Link href={`/directory/business/${b.slug || b.id}`} className="rounded-xl border border-line bg-surface px-4 py-2 text-sm font-semibold text-gray-800 hover:bg-surface-alt">
                      Dekhein
                    </Link>
                  )}
                  {b.listing_status !== 'published' && (
                    <button type="button" onClick={() => remove(b)} className="rounded-xl px-3 py-2 text-sm font-semibold text-red-600 hover:bg-red-50">
                      Delete
                    </button>
                  )}
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
