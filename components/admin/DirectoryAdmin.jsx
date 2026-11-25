'use client';

import { useState } from 'react';
import DirectoryManager from './DirectoryManager';
import DirectoryCategoriesManager from './DirectoryCategoriesManager';
import DirectoryCitiesManager from './DirectoryCitiesManager';
import DirectoryVerificationManager from './DirectoryVerificationManager';

const TABS = [
  { id: 'businesses', label: 'Businesses' },
  { id: 'categories', label: 'Categories' },
  { id: 'cities', label: 'Cities & Areas' },
  { id: 'verified', label: 'Verified Badges' },
];

// Admin → Business Directory. Categories / cities / areas live here so the
// Businesses form always sees the latest lists without a page reload.
export default function DirectoryAdmin({ initialBusinesses = [], initialCategories = [], initialCities = [], initialAreas = [] }) {
  const [tab, setTab] = useState('businesses');
  const [categories, setCategories] = useState(initialCategories);
  const [cities, setCities] = useState(initialCities);
  const [areas, setAreas] = useState(initialAreas);

  return (
    <div className="flex flex-col gap-5">
      <div className="flex flex-wrap gap-2">
        {TABS.map((t) => (
          <button
            key={t.id}
            type="button"
            onClick={() => setTab(t.id)}
            className={`rounded-full border px-4 py-2 text-sm font-semibold transition ${
              tab === t.id ? 'border-atl2 bg-atl2 text-white' : 'border-aline bg-white text-aink hover:bg-acream'
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {tab === 'businesses' && (
        <DirectoryManager initialRows={initialBusinesses} categories={categories} cities={cities} areas={areas} />
      )}
      {tab === 'categories' && <DirectoryCategoriesManager categories={categories} setCategories={setCategories} />}
      {tab === 'verified' && <DirectoryVerificationManager />}
      {tab === 'cities' && (
        <DirectoryCitiesManager cities={cities} setCities={setCities} areas={areas} setAreas={setAreas} />
      )}
    </div>
  );
}
