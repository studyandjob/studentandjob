'use client';

import { useMemo, useState } from 'react';
import HomeIcon from './HomeIcons';
import BusinessCard from './BusinessCard';
import { DIRECTORY_CATEGORIES } from '@/lib/directory';

// Search + category chips + area filter, all client-side over the list the
// server page already fetched (a local directory stays small enough).
export default function DirectoryBrowser({ businesses = [], siteName }) {
  const [query, setQuery] = useState('');
  const [category, setCategory] = useState('All');
  const [area, setArea] = useState('All');

  // Only offer categories/areas that actually have listings.
  const categories = useMemo(
    () => DIRECTORY_CATEGORIES.filter((c) => businesses.some((b) => b.category === c)),
    [businesses]
  );
  const areas = useMemo(() => [...new Set(businesses.map((b) => b.area).filter(Boolean))].sort(), [businesses]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return businesses.filter((b) => {
      if (category !== 'All' && b.category !== category) return false;
      if (area !== 'All' && b.area !== area) return false;
      if (!q) return true;
      return [b.name, b.category, b.area, b.address, b.description, b.services]
        .filter(Boolean)
        .some((v) => String(v).toLowerCase().includes(q));
    });
  }, [businesses, query, category, area]);

  const chip = (active) =>
    `flex-shrink-0 rounded-full border px-3.5 py-1.5 text-sm font-medium transition ${
      active ? 'border-brand-600 bg-brand-600 text-white' : 'border-line bg-surface text-gray-700 hover:bg-surface-alt'
    }`;

  return (
    <>
      <div className="mb-6 flex flex-col gap-3 md:flex-row">
        <label className="relative flex-1">
          <span className="sr-only">Search businesses</span>
          <HomeIcon name="search" className="pointer-events-none absolute left-3.5 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
          <input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Doctor, academy, restaurant ya naam search karein..."
            className="w-full rounded-xl border border-line bg-surface py-3 pl-11 pr-4 text-sm text-gray-900 outline-none focus:border-brand-600 focus:ring-2 focus:ring-brand-600/20"
          />
        </label>
        <select
          value={area}
          onChange={(e) => setArea(e.target.value)}
          aria-label="Filter by area"
          className="rounded-xl border border-line bg-surface px-4 py-3 text-sm text-gray-900 outline-none focus:border-brand-600 md:w-56"
        >
          <option value="All">Sab areas</option>
          {areas.map((a) => (
            <option key={a} value={a}>
              {a}
            </option>
          ))}
        </select>
      </div>

      <div className="-mx-4 mb-6 flex gap-2 overflow-x-auto px-4 pb-1 md:mx-0 md:flex-wrap md:px-0">
        <button type="button" onClick={() => setCategory('All')} className={chip(category === 'All')}>
          All
        </button>
        {categories.map((c) => (
          <button key={c} type="button" onClick={() => setCategory(c)} className={chip(category === c)}>
            {c}
          </button>
        ))}
      </div>

      <p className="mb-4 text-sm text-gray-500">
        {filtered.length} business{filtered.length === 1 ? '' : 'es'} mile
      </p>

      {filtered.length === 0 ? (
        <div className="rounded-2xl border border-line bg-surface p-10 text-center shadow-card">
          <p className="text-base font-semibold text-gray-700">Koi business nahi mila</p>
          <p className="mt-1.5 text-sm text-gray-500">Search ya filter badal kar dobara try karein.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {filtered.map((b) => (
            <BusinessCard key={b.id} business={b} siteName={siteName} />
          ))}
        </div>
      )}
    </>
  );
}
