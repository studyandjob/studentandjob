'use client';

import { useState } from 'react';
import { supabase } from '@/lib/supabaseClient';
import ProfileBuilder from './ProfileBuilder';
import CVPreview from './CVPreview';
import JobMatches from './JobMatches';
import MembershipCard from './MembershipCard';
import ExtraServices from './ExtraServices';

const TABS = [
  { id: 'jobs', label: 'Matching Jobs' },
  { id: 'profile', label: 'My Profile' },
  { id: 'cv', label: 'My CV' },
  { id: 'membership', label: 'Membership' },
  { id: 'services', label: 'Extra Services' },
];

export default function VipDashboard({ session, initialProfile, jobs, initialRequest, siteName }) {
  const [tab, setTab] = useState('jobs');
  const [profile, setProfile] = useState(initialProfile);
  const [request, setRequest] = useState(initialRequest);
  const isMember = request?.status === 'active';

  async function handleLogout() {
    await supabase.auth.signOut();
    window.location.href = '/';
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="sticky top-0 z-30 border-b border-gray-200 bg-white">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3 sm:px-6">
          <div>
            <p className="text-sm font-bold text-gray-900">{siteName || 'Job Portal'} VIP</p>
            <p className="text-xs text-gray-500">{profile?.full_name || session.user.email}</p>
          </div>
          <div className="flex items-center gap-3">
            {isMember && (
              <span className="rounded-full bg-brand-100 px-3 py-1 text-xs font-bold text-brand-700">VIP Active</span>
            )}
            <button onClick={handleLogout} className="text-sm font-semibold text-gray-500 hover:text-gray-800">
              Logout
            </button>
          </div>
        </div>
        <nav className="mx-auto flex max-w-6xl gap-1 overflow-x-auto px-4 pb-2 sm:px-6">
          {TABS.map((t) => (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              className={`flex-shrink-0 rounded-full px-4 py-2 text-sm font-semibold transition ${
                tab === t.id ? 'bg-brand-600 text-white' : 'text-gray-500 hover:bg-gray-100'
              }`}
            >
              {t.label}
            </button>
          ))}
        </nav>
      </header>

      <main className="mx-auto max-w-6xl px-4 py-8 sm:px-6">
        {tab === 'jobs' && <JobMatches jobs={jobs} profile={profile} />}

        {tab === 'profile' && (
          <div className="mx-auto max-w-3xl rounded-2xl bg-white p-6 shadow-sm ring-1 ring-black/5 sm:p-8">
            <ProfileBuilder profile={profile} onSaved={setProfile} />
          </div>
        )}

        {tab === 'cv' && <CVPreview profile={profile} />}

        {tab === 'membership' && (
          <div className="mx-auto max-w-md">
            <MembershipCard userId={session.user.id} profileId={profile?.id} currentRequest={request} onRequested={setRequest} />
          </div>
        )}

        {tab === 'services' && <ExtraServices />}
      </main>
    </div>
  );
}
