'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabaseClient';
import StaffLogin from '@/components/admin/StaffLogin';
import Sidebar from '@/components/admin/Sidebar';
import Topbar from '@/components/admin/Topbar';
import WelcomeCard from '@/components/admin/WelcomeCard';
import ListManager from '@/components/admin/ListManager';
import JobsManager from '@/components/admin/JobsManager';
import StudyZoneManager from '@/components/admin/StudyZone/StudyZoneManager';
import { BriefcaseIcon, BookIcon, ClipboardCheckIcon, AwardIcon, GraduationCapIcon, HomeIcon } from '@/components/admin/icons';

// Same 4 modules as Admin → Users → Task Assignment. Each maps to the tab
// shown in the sidebar (if the logged-in staff member is assigned it) and
// the title shown in the Topbar.
const MODULE_NAV = {
  jobs: { id: 'jobs', label: 'Jobs', icon: BriefcaseIcon },
  studyzone: { id: 'studyzone', label: 'Study Zone', icon: GraduationCapIcon },
  results: { id: 'results', label: 'Results', icon: ClipboardCheckIcon },
  scholarships: { id: 'scholarships', label: 'Scholarships', icon: AwardIcon },
};

export default function StaffPortal() {
  const [session, setSession] = useState(undefined); // undefined = checking, null = logged out
  const [settings, setSettings] = useState(null);
  const [staffProfile, setStaffProfile] = useState(undefined); // undefined = checking, null = not a staff account
  const [modules, setModules] = useState([]);
  const [jobs, setJobs] = useState([]);
  const [notes, setNotes] = useState([]);
  const [results, setResults] = useState([]);
  const [scholarships, setScholarships] = useState([]);
  const [studyClasses, setStudyClasses] = useState([]);
  const [studySubjects, setStudySubjects] = useState([]);
  const [studyMaterials, setStudyMaterials] = useState([]);
  const [loadingData, setLoadingData] = useState(true);
  const [activeTab, setActiveTab] = useState('dashboard');
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => setSession(data.session));
    const { data: listener } = supabase.auth.onAuthStateChange((_event, sess) => setSession(sess));
    return () => listener.subscription.unsubscribe();
  }, []);

  useEffect(() => {
    if (session) return;
    supabase
      .from('site_settings')
      .select('site_name, logo_url')
      .order('updated_at', { ascending: false, nullsFirst: false })
      .limit(1)
      .maybeSingle()
      .then(({ data }) => {
        if (data) setSettings((prev) => prev || data);
      });
  }, [session]);

  // Once logged in: find out WHO this is (staff_users) and WHAT they're
  // allowed to touch (staff_permissions) — both scoped to "own row only"
  // by RLS, so this always reflects the truth even if the UI is stale.
  useEffect(() => {
    if (!session) return;
    (async () => {
      setLoadingData(true);
      const uid = session.user.id;
      const [{ data: s }, { data: profile }, { data: perms }] = await Promise.all([
        supabase.from('site_settings').select('*').order('updated_at', { ascending: false, nullsFirst: false }).limit(1).maybeSingle(),
        supabase.from('staff_users').select('*').eq('id', uid).maybeSingle(),
        supabase.from('staff_permissions').select('module').eq('user_id', uid),
      ]);
      setSettings(s);
      setStaffProfile(profile || null);
      const modList = (perms || []).map((p) => p.module);
      setModules(modList);

      if (profile) {
        const fetches = [];
        if (modList.includes('jobs')) fetches.push(supabase.from('jobs_table').select('*').order('created_at', { ascending: false }).then(({ data }) => setJobs(data || [])));
        if (modList.includes('studyzone')) {
          fetches.push(supabase.from('students_data').select('*').order('created_at', { ascending: false }).then(({ data }) => setNotes(data || [])));
          fetches.push(supabase.from('classes').select('*').order('display_order', { ascending: true }).then(({ data }) => setStudyClasses(data || [])));
          fetches.push(supabase.from('subjects').select('*').order('subject_name', { ascending: true }).then(({ data }) => setStudySubjects(data || [])));
          fetches.push(supabase.from('study_materials').select('*').order('created_at', { ascending: false }).then(({ data }) => setStudyMaterials(data || [])));
        }
        if (modList.includes('results')) fetches.push(supabase.from('results_table').select('*').order('created_at', { ascending: false }).then(({ data }) => setResults(data || [])));
        if (modList.includes('scholarships')) fetches.push(supabase.from('scholarships_table').select('*').order('created_at', { ascending: false }).then(({ data }) => setScholarships(data || [])));
        await Promise.all(fetches);
        setActiveTab((prev) => (prev === 'dashboard' ? modList[0] || 'dashboard' : prev));
      }
      setLoadingData(false);
    })();
  }, [session]);

  async function handleLogout() {
    await supabase.auth.signOut();
    setSession(null);
    setStaffProfile(undefined);
  }

  if (session === undefined) {
    return <div className="flex min-h-screen items-center justify-center bg-[#F0F4F3] text-amuted">Loading...</div>;
  }

  if (!session) {
    return <StaffLogin onLoggedIn={setSession} siteName={settings?.site_name} logoUrl={settings?.logo_url} />;
  }

  if (staffProfile === undefined || loadingData) {
    return <div className="flex min-h-screen items-center justify-center bg-[#F0F4F3] text-amuted">Loading...</div>;
  }

  if (staffProfile === null) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-[#F0F4F3] px-4 text-center">
        <p className="max-w-sm text-sm text-amuted">
          Ye account staff ke tor par register nahi hai, is liye ye portal access nahi kar sakta. Agar aap admin
          hain to <a href="/admin" className="font-semibold text-atl2 underline">/admin</a> se login karein, ya
          apne admin se apna staff account banwane ko kahein.
        </p>
        <button
          onClick={handleLogout}
          className="rounded-full border border-red-200 bg-red-50 px-5 py-2 text-sm font-semibold text-red-600 transition hover:bg-red-600 hover:text-white"
        >
          Logout
        </button>
      </div>
    );
  }

  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: HomeIcon },
    ...modules.map((m) => MODULE_NAV[m]).filter(Boolean),
  ];
  const tabTitle = activeTab === 'dashboard' ? 'Dashboard' : MODULE_NAV[activeTab]?.label || 'Dashboard';

  return (
    <div className="flex min-h-screen bg-[#F0F4F3]">
      <Sidebar
        activeTab={activeTab}
        onTabChange={setActiveTab}
        open={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        siteName={settings?.site_name}
        logoUrl={settings?.logo_url}
        onLogout={handleLogout}
        navItems={navItems}
        dashboardLabel="Staff Portal"
      />

      <main className="flex min-h-screen w-full flex-1 flex-col md:ml-[240px] md:w-[calc(100%-240px)]">
        <Topbar title={tabTitle} onMenuClick={() => setSidebarOpen(true)} badgeLabel="Staff" />

        <div className="w-full flex-1 p-4 sm:p-6">
          {activeTab === 'dashboard' && (
            <div className="flex flex-col gap-5">
              <WelcomeCard
                heading={staffProfile.name}
                siteName={settings?.site_name}
                subHeading="Aapko jo tasks assign kiye gaye hain, wo sidebar me dikh rahe hain."
              />
              {modules.length === 0 && (
                <p className="rounded-xl border border-aline bg-white px-4 py-6 text-center text-sm text-amuted">
                  Abhi tak koi task assign nahi hua. Apne admin se rabta karein.
                </p>
              )}
            </div>
          )}

          {activeTab === 'jobs' && modules.includes('jobs') && <JobsManager initialJobs={jobs} settings={settings} />}

          {activeTab === 'studyzone' && modules.includes('studyzone') && (
            <div className="flex flex-col gap-6">
              <StudyZoneManager initialClasses={studyClasses} initialSubjects={studySubjects} initialMaterials={studyMaterials} />

              <ListManager
                title="Notes"
                description="PDFs and notes shown in the Study Zone → Notes section."
                icon={BookIcon}
                table="students_data"
                initialRows={notes}
                fields={[
                  { name: 'title', label: 'Title', required: true },
                  { name: 'category', label: 'Category', placeholder: 'e.g. Guess Paper, Notes' },
                  { name: 'file_url', label: 'Upload PDF', type: 'file', fileFolder: 'notes', required: true },
                ]}
                renderRow={(row) => (
                  <div>
                    <p className="font-semibold text-aink">{row.title}</p>
                    <p className="text-xs text-amuted">{row.category}</p>
                  </div>
                )}
              />
            </div>
          )}

          {activeTab === 'results' && modules.includes('results') && (
            <ListManager
              title="Results"
              description="Exam / test results shown on the public Results page."
              icon={ClipboardCheckIcon}
              table="results_table"
              initialRows={results}
              fields={[
                { name: 'title', label: 'Result Title', required: true, placeholder: 'e.g. FA/FSc Annual Result 2026' },
                { name: 'board_or_department', label: 'Board / Department' },
                { name: 'result_date', label: 'Announced Date', type: 'date' },
                { name: 'result_link', label: 'Result Link', placeholder: 'https://...' },
              ]}
              renderRow={(row) => (
                <div>
                  <p className="font-semibold text-aink">{row.title}</p>
                  <p className="text-xs text-amuted">
                    {row.board_or_department} {row.result_date && `· Announced: ${row.result_date}`}
                  </p>
                </div>
              )}
            />
          )}

          {activeTab === 'scholarships' && modules.includes('scholarships') && (
            <ListManager
              title="Scholarships"
              description="Scholarship opportunities shown on the public Scholarships page."
              icon={AwardIcon}
              table="scholarships_table"
              initialRows={scholarships}
              fields={[
                { name: 'title', label: 'Scholarship Title', required: true },
                { name: 'provider', label: 'Provider / Organization' },
                { name: 'deadline', label: 'Application Deadline', type: 'date' },
                { name: 'apply_link', label: 'Apply Link', placeholder: 'https://...' },
              ]}
              renderRow={(row) => (
                <div>
                  <p className="font-semibold text-aink">{row.title}</p>
                  <p className="text-xs text-amuted">
                    {row.provider} {row.deadline && `· Deadline: ${row.deadline}`}
                  </p>
                </div>
              )}
            />
          )}
        </div>
      </main>
    </div>
  );
}
