'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabaseClient';
import AdminLogin from '@/components/admin/AdminLogin';
import SettingsForm from '@/components/admin/SettingsForm';
import ListManager from '@/components/admin/ListManager';

export default function AdminDashboard() {
  const [session, setSession] = useState(undefined); // undefined = checking, null = logged out
  const [settings, setSettings] = useState(null);
  const [slides, setSlides] = useState([]);
  const [jobs, setJobs] = useState([]);
  const [notes, setNotes] = useState([]);
  const [loadingData, setLoadingData] = useState(true);

  // Check for an existing session on mount, and listen for changes
  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => setSession(data.session));
    const { data: listener } = supabase.auth.onAuthStateChange((_event, sess) => setSession(sess));
    return () => listener.subscription.unsubscribe();
  }, []);

  // Once logged in, load all editable content
  useEffect(() => {
    if (!session) return;
    (async () => {
      setLoadingData(true);
      const [{ data: s }, { data: sl }, { data: j }, { data: n }] = await Promise.all([
        supabase.from('site_settings').select('*').limit(1).maybeSingle(),
        supabase.from('hero_slides').select('*').order('display_order', { ascending: true }),
        supabase.from('jobs_table').select('*').order('created_at', { ascending: false }),
        supabase.from('students_data').select('*').order('created_at', { ascending: false }),
      ]);
      setSettings(s);
      setSlides(sl || []);
      setJobs(j || []);
      setNotes(n || []);
      setLoadingData(false);
    })();
  }, [session]);

  async function handleLogout() {
    await supabase.auth.signOut();
    setSession(null);
  }

  if (session === undefined) {
    return <div className="flex min-h-screen items-center justify-center text-gray-500">Loading...</div>;
  }

  if (!session) {
    return <AdminLogin onLoggedIn={setSession} />;
  }

  return (
    <div className="min-h-screen bg-gray-100 pb-16">
      <div className="sticky top-0 z-10 flex items-center justify-between bg-white px-4 py-4 shadow-sm md:px-8">
        <h1 className="text-lg font-bold text-gray-900 md:text-xl">Admin Dashboard</h1>
        <button
          onClick={handleLogout}
          className="rounded-md border border-gray-300 px-4 py-1.5 text-sm font-medium text-gray-600 hover:bg-gray-50"
        >
          Log Out
        </button>
      </div>

      <div className="mx-auto mt-6 flex max-w-4xl flex-col gap-6 px-4 md:px-8">
        {loadingData ? (
          <p className="text-center text-sm text-gray-500">Loading content...</p>
        ) : (
          <>
            <SettingsForm settings={settings} />

            <ListManager
              title="Hero Slides"
              description="Slides shown on the home page banner, in display order."
              table="hero_slides"
              initialRows={slides}
              orderBy="display_order"
              fields={[
                { name: 'title', label: 'Title', required: true },
                { name: 'image_url', label: 'Image URL', required: true, placeholder: 'https://...' },
                { name: 'link_url', label: 'Link URL (optional)', placeholder: 'https://...' },
                { name: 'display_order', label: 'Display Order', type: 'number', placeholder: '1' },
              ]}
              renderRow={(row) => (
                <div>
                  <p className="font-semibold text-gray-800">{row.title}</p>
                  <p className="text-xs text-gray-500">Order: {row.display_order}</p>
                </div>
              )}
            />

            <ListManager
              title="Jobs"
              description="Government / private job postings shown on the home page and Jobs listing."
              table="jobs_table"
              initialRows={jobs}
              fields={[
                { name: 'title', label: 'Job Title', required: true },
                { name: 'department', label: 'Department' },
                { name: 'last_date', label: 'Last Date to Apply', type: 'date' },
                { name: 'apply_link', label: 'Apply Link', placeholder: 'https://...' },
              ]}
              renderRow={(row) => (
                <div>
                  <p className="font-semibold text-gray-800">{row.title}</p>
                  <p className="text-xs text-gray-500">
                    {row.department} {row.last_date && `· Last date: ${row.last_date}`}
                  </p>
                </div>
              )}
            />

            <ListManager
              title="Students Zone (Notes / Guess Papers)"
              description="PDFs and notes shown in the Students Zone section."
              table="students_data"
              initialRows={notes}
              fields={[
                { name: 'title', label: 'Title', required: true },
                { name: 'category', label: 'Category', placeholder: 'e.g. Guess Paper, Notes' },
                { name: 'file_url', label: 'File URL (PDF link)', required: true, placeholder: 'https://...' },
              ]}
              renderRow={(row) => (
                <div>
                  <p className="font-semibold text-gray-800">{row.title}</p>
                  <p className="text-xs text-gray-500">{row.category}</p>
                </div>
              )}
            />
          </>
        )}
      </div>
    </div>
  );
}
