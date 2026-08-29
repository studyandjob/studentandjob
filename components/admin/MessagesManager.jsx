'use client';

import { useState } from 'react';
import { supabase } from '@/lib/supabaseClient';
import AdminCard from './AdminCard';
import { MailIcon, TrashIcon, EyeIcon } from './icons';

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

// Read-only list (with view/delete) — messages are submitted by visitors via
// the public Contact Us form, so there's no "Add" form here. Unread messages
// are highlighted; opening a message marks it as read.
export default function MessagesManager({ initialRows = [] }) {
  const [rows, setRows] = useState(
    [...initialRows].sort((a, b) => {
      // Unread first, newest first within each group.
      if (!!a.is_read !== !!b.is_read) return a.is_read ? 1 : -1;
      return new Date(b.created_at) - new Date(a.created_at);
    })
  );
  const [openId, setOpenId] = useState(null);
  const [error, setError] = useState('');

  const unreadCount = rows.filter((r) => !r.is_read).length;

  async function handleView(row) {
    const isOpen = openId === row.id;
    setOpenId(isOpen ? null : row.id);

    if (isOpen || row.is_read) return;

    // Mark as read the first time it's opened.
    const { error } = await supabase.from('contact_messages').update({ is_read: true }).eq('id', row.id);
    if (error) {
      setError(error.message);
      return;
    }
    setRows((prev) => prev.map((r) => (r.id === row.id ? { ...r, is_read: true } : r)));
  }

  async function handleDelete(id) {
    if (!confirm('Delete this message? This cannot be undone.')) return;
    const { data, error } = await supabase.from('contact_messages').delete().eq('id', id).select();
    if (error) {
      setError(error.message);
      return;
    }
    if (!data || data.length === 0) {
      setError('Delete did not go through — your admin session may have expired. Please log out and back in, then try again.');
      return;
    }
    setRows((prev) => prev.filter((r) => r.id !== id));
  }

  return (
    <AdminCard
      title="Contact Messages"
      description={`Messages submitted by visitors through the public Contact Us page.${
        unreadCount > 0 ? ` (${unreadCount} unread)` : ''
      }`}
      icon={MailIcon}
    >
      {error && <p className="mb-4 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-600">{error}</p>}

      {rows.length === 0 ? (
        <p className="py-6 text-center text-sm text-amuted">No messages yet.</p>
      ) : (
        <ul className="flex flex-col gap-2.5">
          {rows.map((row) => {
            const isOpen = openId === row.id;
            const unread = !row.is_read;
            return (
              <li
                key={row.id}
                className={`rounded-xl border px-4 py-3 transition hover:shadow-sm ${
                  unread
                    ? 'border-atl2/40 bg-[#F5F9F8] hover:border-atl2'
                    : 'border-aline bg-white hover:border-brand-200'
                }`}
              >
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <button
                    onClick={() => handleView(row)}
                    className="flex min-w-0 flex-1 items-start gap-2.5 text-left text-sm text-aink"
                  >
                    {unread && (
                      <span
                        className="mt-1.5 h-2 w-2 flex-shrink-0 rounded-full bg-atl2"
                        title="Unread"
                        aria-label="Unread"
                      />
                    )}
                    <span className="min-w-0 flex-1">
                      <p className={unread ? 'font-bold text-aink' : 'font-semibold text-aink'}>
                        {row.name} <span className="font-normal text-amuted">— {row.subject || 'No subject'}</span>
                        {unread && (
                          <span className="ml-2 inline-block rounded-full bg-atl2/15 px-2 py-0.5 text-[0.65rem] font-bold uppercase tracking-wide text-atl2">
                            New
                          </span>
                        )}
                      </p>
                      <p className="text-xs text-amuted">
                        {row.email} · {formatDateTime(row.created_at)}
                      </p>
                    </span>
                  </button>
                  <div className="flex flex-shrink-0 items-center gap-2">
                    <button
                      onClick={() => handleView(row)}
                      className="flex items-center gap-1.5 rounded-full border border-atl2/30 bg-atl2/10 px-3.5 py-1.5 text-xs font-semibold text-atl2 transition hover:bg-atl2 hover:text-white"
                    >
                      <EyeIcon className="h-3.5 w-3.5" />
                      View
                    </button>
                    <button
                      onClick={() => handleDelete(row.id)}
                      className="flex items-center gap-1.5 rounded-full border border-red-200 bg-red-50 px-3.5 py-1.5 text-xs font-semibold text-red-600 transition hover:bg-red-600 hover:text-white"
                    >
                      <TrashIcon className="h-3.5 w-3.5" />
                      Delete
                    </button>
                  </div>
                </div>
                {isOpen && (
                  <div className="mt-3 rounded-lg bg-white p-3.5 text-sm text-aink ring-1 ring-black/5">
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
