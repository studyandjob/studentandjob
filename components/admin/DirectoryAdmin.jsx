'use client';

import { useCallback, useEffect, useState } from 'react';
import { supabase } from '@/lib/supabaseClient';
import DirectoryManager from './DirectoryManager';
import DirectoryCategoriesManager from './DirectoryCategoriesManager';
import DirectoryCitiesManager from './DirectoryCitiesManager';
import DirectoryVerificationManager from './DirectoryVerificationManager';
import DirectoryApprovalsManager from './DirectoryApprovalsManager';
import DirectoryDoctorsManager from './DirectoryDoctorsManager';
import DirectoryReportsManager from './DirectoryReportsManager';
import BusinessWizard from '../business/BusinessWizard';

// Admin → Business Directory. Categories / cities / areas live here so the
// forms always see the latest lists without a page reload. The same staged
// wizard owners use also opens here (with admin-only controls) to review and
// edit any profile.
export default function DirectoryAdmin({ initialBusinesses = [], initialCategories = [], initialCities = [], initialAreas = [] }) {
  const [tab, setTab] = useState('businesses');
  const [categories, setCategories] = useState(initialCategories);
  const [cities, setCities] = useState(initialCities);
  const [areas, setAreas] = useState(initialAreas);
  const [wizard, setWizard] = useState(null); // { id: string | null }
  const [version, setVersion] = useState(0); // bump to reload lists after the wizard
  const [pending, setPending] = useState(0);

  const countPending = useCallback(async () => {
    const { count } = await supabase.from('businesses_table').select('id', { count: 'exact', head: true }).eq('listing_status', 'pending');
    setPending(count || 0);
  }, []);

  useEffect(() => {
    countPending();
  }, [countPending, version]);

  const tabs = [
    { id: 'businesses', label: 'Businesses' },
    { id: 'approvals', label: `Approvals${pending ? ` (${pending})` : ''}` },
    { id: 'doctors', label: 'Doctors' },
    { id: 'reports', label: 'Reports & Claims' },
    { id: 'categories', label: 'Categories' },
    { id: 'cities', label: 'Cities & Areas' },
    { id: 'verified', label: 'Verified Badges' },
  ];

  const exitWizard = () => {
    setWizard(null);
    setVersion((v) => v + 1);
  };

  if (wizard) {
    return (
      <div className="flex flex-col gap-4">
        <button type="button" onClick={exitWizard} className="self-start rounded-full border border-aline bg-white px-5 py-2 text-sm font-semibold text-aink hover:bg-acream">
          ← Wapis list par
        </button>
        <div className="rounded-2xl bg-white p-4 md:p-6">
          <BusinessWizard key={wizard.id || 'new'} businessId={wizard.id} adminMode onExit={exitWizard} />
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-5">
      <div className="flex flex-wrap gap-2">
        {tabs.map((t) => (
          <button
            key={t.id}
            type="button"
            onClick={() => setTab(t.id)}
            className={`rounded-full border px-4 py-2 text-sm font-semibold transition ${tab === t.id ? 'border-atl2 bg-atl2 text-white' : 'border-aline bg-white text-aink hover:bg-acream'}`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {tab === 'businesses' && <DirectoryManager key={version} initialRows={initialBusinesses} categories={categories} cities={cities} areas={areas} onFullEdit={(id) => setWizard({ id })} />}
      {tab === 'approvals' && <DirectoryApprovalsManager key={version} onReview={(id) => setWizard({ id })} onChanged={countPending} />}
      {tab === 'doctors' && <DirectoryDoctorsManager key={version} onEdit={(id) => setWizard({ id })} onNew={() => setWizard({ id: null })} />}
      {tab === 'reports' && <DirectoryReportsManager />}
      {tab === 'categories' && <DirectoryCategoriesManager categories={categories} setCategories={setCategories} />}
      {tab === 'cities' && <DirectoryCitiesManager cities={cities} setCities={setCities} areas={areas} setAreas={setAreas} />}
      {tab === 'verified' && <DirectoryVerificationManager />}
    </div>
  );
}
