'use client';

import { useState } from 'react';

// Plain <img> tag on purpose (not next/image) — a public Supabase Storage
// URL is already a final, ready-to-use image URL, so there's nothing for
// Next's image optimizer to add. Using it directly avoids optimizer/config
// issues that can make images fail only in production.
function Avatar({ name, imageUrl }) {
  const [failed, setFailed] = useState(false);

  if (imageUrl && !failed) {
    return (
      <img
        src={imageUrl}
        alt={name || 'Contact'}
        onError={() => {
          console.warn('Contact photo failed to load:', imageUrl);
          setFailed(true);
        }}
        className="h-20 w-20 flex-shrink-0 rounded-full object-cover ring-4 ring-brand-50"
      />
    );
  }
  return (
    <div className="flex h-20 w-20 flex-shrink-0 items-center justify-center rounded-full bg-brand-50 text-2xl font-bold text-brand-600 ring-4 ring-brand-50">
      {(name || '?').charAt(0).toUpperCase()}
    </div>
  );
}

export default function ContactCards({ contacts = [] }) {
  if (contacts.length === 0) return null;

  return (
    <div className="mb-8 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {contacts.map((c) => (
        <div
          key={c.id}
          className="flex flex-col items-center gap-3 rounded-2xl bg-white p-6 text-center shadow-sm ring-1 ring-black/5 transition hover:-translate-y-0.5 hover:shadow-md"
        >
          <Avatar name={c.name} imageUrl={c.image_url} />
          <div>
            <p className="text-base font-bold text-gray-900">{c.name}</p>
            {c.designation && <p className="text-sm font-medium text-brand-600">{c.designation}</p>}
          </div>
          <div className="flex flex-col gap-1.5 text-sm text-gray-600">
            {c.contact_no && (
              <a href={`tel:${c.contact_no}`} className="flex items-center justify-center gap-1.5 hover:text-brand-600">
                <svg className="h-4 w-4 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M3 5a2 2 0 012-2h2.28a1 1 0 011 .76l.72 3.13a1 1 0 01-.29.95l-1.4 1.4a12.06 12.06 0 006 6l1.4-1.4a1 1 0 01.95-.29l3.13.72a1 1 0 01.76 1V19a2 2 0 01-2 2h-1C9.72 21 3 14.28 3 6V5z"
                  />
                </svg>
                {c.contact_no}
              </a>
            )}
            {c.email && (
              <a href={`mailto:${c.email}`} className="flex items-center justify-center gap-1.5 break-all hover:text-brand-600">
                <svg className="h-4 w-4 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                  />
                </svg>
                {c.email}
              </a>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}
