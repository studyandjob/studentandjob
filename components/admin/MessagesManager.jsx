'use client';

import { useState } from 'react';
import { supabase } from '@/lib/supabaseClient';
import AdminCard from './AdminCard';
import { MailIcon, TrashIcon } from './icons';

function formatDateTime(dateStr) {
  if (!dateStr) return '';
  return new Date(dateStr).toLocaleString('en-US', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

// Read-only list (with delete) — messages are submitted by visitors via the
// public Contact Us form, so there's no "Add" form here.
export default function MessagesManager({ initialRows = [] }) {
  const [rows, setRows] = useState(initialRows);
  const [openId, setOpenId] = useState(null);
  const [error, setError] = useState('');

  async function handleDelete(id) {
    if (!confirm('Delete this message? This cannot be undone.')) return;
    const { error } = await supabase.from('contact_messages').delete().eq('id', id);
    if (error) {
      setError(error.message);
      return;
    }
    setRows((prev) => prev.filter((r) => r.id !== id));
  }

  return (
    <AdminCard
      title="Contact Messages"
      description="Messages submitted by visitors through the public Contact Us page."
      icon={MailIcon}
    >
      {error && <p className="mb-4 rounded-lg border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-600">{error}</p>}

      {rows.length === 0 ? (
        <p className="py-6 text-center text-sm text-amuted">No messages yet.</p>
      ) : (
        <ul className="flex flex-col gap-2.5">
          {rows.map((row) => {
            const isOpen = openId === row.id;
            return (
              <li
                key={row.id}
                className="rounded-xl border border-aline bg-white px-4 py-3 transition hover:border-emerald-200 hover:shadow-sm"
              >
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <button
                    onClick={() => setOpenId(isOpen ? null : row.id)}
                    className="min-w-0 flex-1 text-left text-sm text-aink"
                  >
                    <p className="font-semibold text-aink">
                      {row.name} <span className="font-normal text-amuted">— {row.subject || 'No subject'}</span>
                    </p>
                    <p className="text-xs text-amuted">
                      {row.email} · {formatDateTime(row.created_at)}
                    </p>
                  </button>
                  <button
                    onClick={() => handleDelete(row.id)}
                    className="flex flex-shrink-0 items-center gap-1.5 rounded-full border border-rose-200 bg-rose-50 px-3.5 py-1.5 text-xs font-semibold text-rose-600 transition hover:bg-rose-600 hover:text-white"
                  >
                    <TrashIcon className="h-3.5 w-3.5" />
                    Delete
                  </button>
                </div>
                {isOpen && (
                  <div className="mt-3 rounded-lg bg-[#F5F9F8] p-3.5 text-sm text-aink">
                    {row.phone && <p className="mb-2 text-xs text-amuted">Phone: {row.phone}</p>}
                    <p className="whitespace-pre-wrap">{row.message}</p>
                  </div>
                )}
              </li>
            );
          })}
        </ul>
      )}
    </AdminCard>
  );
}
