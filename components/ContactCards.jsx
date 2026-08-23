'use client';

import { useState } from 'react';
import { PhoneIcon3D, MailIcon3D } from './Icons3D';

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
                <PhoneIcon3D className="h-4 w-4 flex-shrink-0" />
                {c.contact_no}
              </a>
            )}
            {c.email && (
              <a href={`mailto:${c.email}`} className="flex items-center justify-center gap-1.5 break-all hover:text-brand-600">
                <MailIcon3D className="h-4 w-4 flex-shrink-0" />
                {c.email}
              </a>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}
