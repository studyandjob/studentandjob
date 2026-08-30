'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabaseClient';
import AdminLogin from '@/components/admin/AdminLogin';
import Sidebar from '@/components/admin/Sidebar';
import Topbar from '@/components/admin/Topbar';
import WelcomeCard from '@/components/admin/WelcomeCard';
import StatCard from '@/components/admin/StatCard';
import SettingsForm from '@/components/admin/SettingsForm';
import TextThemeManager from '@/components/admin/TextThemeManager';
import SocialMediaForm from '@/components/admin/SocialMediaForm';
import ListManager from '@/components/admin/ListManager';
import MessagesManager from '@/components/admin/MessagesManager';
import ContactsManager from '@/components/admin/ContactsManager';
import PagesManager from '@/components/admin/PagesManager';
import JobsManager from '@/components/admin/JobsManager';
import MembersManager from '@/components/admin/MembersManager';
import StudyZoneManager from '@/components/admin/StudyZone/StudyZoneManager';
import {
  ImageIcon,
  BriefcaseIcon,
  BookIcon,
  SettingsIcon,
  ClipboardCheckIcon,
  AwardIcon,
  MailIcon,
  IdCardIcon,
  FileTextIcon,
  Share2Icon,
  GraduationCapIcon,
} from '@/components/admin/icons';

// Titles shown in the Topbar — one per menu item in the Sidebar, mirroring
// every page that exists on the public website.
const TAB_TITLES = {
  dashboard: 'Dashboard',
  settings: 'Site Settings',
  texttheme: 'Text Theme',
  social: 'Social Media',
  slides: 'Hero Slides',
  jobs: 'Jobs',
  members: 'Admin Portal Requests',
  studyzone: 'Study Zone (Tests, Papers & Notes)',
  results: 'Results',
  scholarships: 'Scholarships',
  messages: 'Contact Messages',
  contacts: 'Contact Us',
  pages: 'Pages (About / Legal)',
};

export default function AdminDashboard() {
  const [session, setSession] = useState(undefined); // undefined = checking, null = logged out
  const [settings, setSettings] = useState(null);
  const [slides, setSlides] = useState([]);
  const [jobs, setJobs] = useState([]);
  const [notes, setNotes] = useState([]);
  const [results, setResults] = useState([]);
  const [scholarships, setScholarships] = useState([]);
  const [messages, setMessages] = useState([]);
  const [contacts, setContacts] = useState([]);
  const [pages, setPages] = useState([]);
  const [memberRequests, setMemberRequests] = useState([]);
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

  // Fetch just enough site settings (name + logo) to brand the Login screen
  // itself, independent of the session check above — site_settings is
  // publicly readable, so this works before the admin is even logged in.
  // Skipped once logged in, since the full settings fetch below already
  // covers it (and stays fresher via the same query).
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

  useEffect(() => {
    if (!session) return;
    (async () => {
      setLoadingData(true);
      const [{ data: s }, { data: sl }, { data: j }, { data: n }, { data: r }, { data: sc }, { data: m }, { data: c }, { data: p }, { data: mr }, { data: sCls }, { data: sSub }, { data: sMat }] =
        await Promise.all([
          supabase.from('site_settings').select('*').order('updated_at', { ascending: false, nullsFirst: false }).limit(1).maybeSingle(),
          supabase.from('hero_slides').select('*').order('display_order', { ascending: true }),
          supabase.from('jobs_table').select('*').order('created_at', { ascending: false }),
          supabase.from('students_data').select('*').order('created_at', { ascending: false }),
          supabase.from('results_table').select('*').order('created_at', { ascending: false }),
          supabase.from('scholarships_table').select('*').order('created_at', { ascending: false }),
          supabase.from('contact_messages').select('*').order('created_at', { ascending: false }),
          supabase.from('site_contacts').select('*').order('display_order', { ascending: true }),
          supabase.from('site_pages').select('*').order('slug', { ascending: true }),
          supabase.from('member_requests').select('*, candidate_profiles(full_name, phone, whatsapp, email, city, photo_url)').order('created_at', { ascending: false }),
          supabase.from('classes').select('*').order('display_order', { ascending: true }),
          supabase.from('subjects').select('*').order('subject_name', { ascending: true }),
          supabase.from('study_materials').select('*').order('created_at', { ascending: false }),
        ]);
      setSettings(s);
      setSlides(sl || []);
      setJobs(j || []);
      setNotes(n || []);
      setResults(r || []);
      setScholarships(sc || []);
      setMessages(m || []);
      setContacts(c || []);
      setPages(p || []);
      setMemberRequests(mr || []);
      setStudyClasses(sCls || []);
      setStudySubjects(sSub || []);
      setStudyMaterials(sMat || []);
      setLoadingData(false);
    })();
  }, [session]);

  async function handleLogout() {
    await supabase.auth.signOut();
    setSession(null);
  }

  if (session === undefined) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#F0F4F3] text-amuted">Loading...</div>
    );
  }

  if (!session) {
    return <AdminLogin onLoggedIn={setSession} siteName={settings?.site_name} logoUrl={settings?.logo_url} />;
  }

  const unreadMessages = messages.filter((m) => !m.is_read).length;
  const pendingMembers = memberRequests.filter((r) => r.status === 'pending').length;

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
        unreadMessages={unreadMessages}
        pendingMembers={pendingMembers}
      />

      <main className="flex min-h-screen w-full flex-1 flex-col md:ml-[240px] md:w-[calc(100%-240px)]">
        <Topbar title={TAB_TITLES[activeTab]} onMenuClick={() => setSidebarOpen(true)} />

        <div className="w-full flex-1 p-4 sm:p-6">
          {loadingData ? (
            <p className="py-10 text-center text-sm text-amuted">Loading content...</p>
          ) : (
            <>
              {activeTab === 'dashboard' && (
                <div className="flex flex-col gap-5">
                  <WelcomeCard siteName={settings?.site_name} subHeading={settings?.sub_heading} />
                  <div className="grid grid-cols-2 gap-3.5 sm:grid-cols-4">
                    <StatCard icon={ImageIcon} value={slides.length} label="Hero Slides" color="gold" onClick={() => setActiveTab('slides')} />
                    <StatCard icon={BriefcaseIcon} value={jobs.length} label="Jobs Posted" color="teal" onClick={() => setActiveTab('jobs')} />
                    <StatCard
                      icon={IdCardIcon}
                      value={pendingMembers > 0 ? `${memberRequests.length} (${pendingMembers} new)` : memberRequests.length}
                      label="Portal Requests"
                      color="purple"
                      onClick={() => setActiveTab('members')}
                    />
                    <StatCard icon={BookIcon} value={notes.length} label="Study Notes" color="coral" onClick={() => setActiveTab('studyzone')} />
                    <StatCard
                      icon={GraduationCapIcon}
                      value={studyClasses.length}
                      label="Study Zone Classes"
                      color="green"
                      onClick={() => setActiveTab('studyzone')}
                    />
                    <StatCard icon={ClipboardCheckIcon} value={results.length} label="Results" color="green" onClick={() => setActiveTab('results')} />
                    <StatCard icon={AwardIcon} value={scholarships.length} label="Scholarships" color="purple" onClick={() => setActiveTab('scholarships')} />
                    <StatCard
                      icon={MailIcon}
                      value={unreadMessages > 0 ? `${messages.length} (${unreadMessages} new)` : messages.length}
                      label="Contact Messages"
                      color="blue"
                      onClick={() => setActiveTab('messages')}
                    />
                    <StatCard icon={IdCardIcon} value={contacts.length} label="Contact Us Entries" color="coral" onClick={() => setActiveTab('contacts')} />
                    <StatCard icon={FileTextIcon} value={pages.length} label="Static Pages" color="teal" onClick={() => setActiveTab('pages')} />
                    <StatCard icon={SettingsIcon} value={settings ? 'Set' : '—'} label="Site Settings" color="gold" onClick={() => setActiveTab('settings')} />
                    <StatCard
                      icon={Share2Icon}
                      value={
                        ['facebook_url', 'whatsapp_channel_url', 'instagram_url', 'youtube_url', 'tiktok_url', 'twitter_url', 'linkedin_url'].filter(
                          (f) => settings?.[f]
                        ).length
                      }
                      label="Social Links Set"
                      color="teal"
                      onClick={() => setActiveTab('social')}
                    />
                  </div>
                </div>
              )}

              {activeTab === 'settings' && <SettingsForm settings={settings} />}

              {activeTab === 'texttheme' && <TextThemeManager settings={settings} />}

              {activeTab === 'social' && <SocialMediaForm settings={settings} />}

              {activeTab === 'slides' && (
                <ListManager
                  title="Hero Slides"
                  description="Slides shown on the home page banner, in display order."
                  icon={ImageIcon}
                  table="hero_slides"
                  initialRows={slides}
                  fields={[
                    { name: 'title', label: 'Title', required: true },
                    { name: 'image_url', label: 'Slide Image', type: 'image', imageFolder: 'hero', required: true },
                    { name: 'link_url', label: 'Link URL (optional)', placeholder: 'https://...' },
                    { name: 'display_order', label: 'Display Order', type: 'number', placeholder: '1' },
                  ]}
                  renderRow={(row) => (
                    <div>
                      <p className="font-semibold text-aink">{row.title}</p>
                      <p className="text-xs text-amuted">Order: {row.display_order}</p>
                    </div>
                  )}
                />
              )}

              {activeTab === 'jobs' && <JobsManager initialJobs={jobs} settings={settings} />}

              {activeTab === 'members' && <MembersManager initialRequests={memberRequests} />}

              {activeTab === 'studyzone' && (
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
                      { name: 'file_url', label: 'File URL (PDF link)', required: true, placeholder: 'https://...' },
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

              {activeTab === 'results' && (
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

              {activeTab === 'scholarships' && (
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

              {activeTab === 'messages' && <MessagesManager initialRows={messages} />}

              {activeTab === 'contacts' && <ContactsManager initialRows={contacts} />}

              {activeTab === 'pages' && <PagesManager initialRows={pages} />}
            </>
          )}
        </div>
      </main>
    </div>
  );
}
