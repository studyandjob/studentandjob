'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabaseClient';
import AdminLogin from '@/components/admin/AdminLogin';
import Sidebar from '@/components/admin/Sidebar';
import Topbar from '@/components/admin/Topbar';
import WelcomeCard from '@/components/admin/WelcomeCard';
import StatCard from '@/components/admin/StatCard';
import SettingsForm from '@/components/admin/SettingsForm';
import ListManager from '@/components/admin/ListManager';
import MessagesManager from '@/components/admin/MessagesManager';
import ContactsManager from '@/components/admin/ContactsManager';
import PagesManager from '@/components/admin/PagesManager';
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
} from '@/components/admin/icons';

// Titles shown in the Topbar — one per menu item in the Sidebar, mirroring
// every page that exists on the public website.
const TAB_TITLES = {
  dashboard: 'Dashboard',
  settings: 'Site Settings',
  slides: 'Hero Slides',
  jobs: 'Jobs',
  notes: 'Students Zone',
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
  const [loadingData, setLoadingData] = useState(true);
  const [activeTab, setActiveTab] = useState('dashboard');
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => setSession(data.session));
    const { data: listener } = supabase.auth.onAuthStateChange((_event, sess) => setSession(sess));
    return () => listener.subscription.unsubscribe();
  }, []);

  useEffect(() => {
    if (!session) return;
    (async () => {
      setLoadingData(true);
      const [{ data: s }, { data: sl }, { data: j }, { data: n }, { data: r }, { data: sc }, { data: m }, { data: c }, { data: p }] =
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
    return <AdminLogin onLoggedIn={setSession} />;
  }

  const unreadMessages = messages.filter((m) => !m.is_read).length;

  return (
    <div className="flex min-h-screen bg-[#F0F4F3]">
      <Sidebar
        activeTab={activeTab}
        onTabChange={setActiveTab}
        open={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        siteName={settings?.site_name}
        onLogout={handleLogout}
        unreadMessages={unreadMessages}
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
                    <StatCard icon={BookIcon} value={notes.length} label="Student Notes" color="coral" onClick={() => setActiveTab('notes')} />
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
                  </div>
                </div>
              )}

              {activeTab === 'settings' && <SettingsForm settings={settings} />}

              {activeTab === 'slides' && (
                <ListManager
                  title="Hero Slides"
                  description="Slides shown on the home page banner, in display order."
                  icon={ImageIcon}
                  table="hero_slides"
                  initialRows={slides}
                  fields={[
                    { name: 'title', label: 'Title', required: true },
                    { name: 'image_url', label: 'Image URL', required: true, placeholder: 'https://...' },
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

              {activeTab === 'jobs' && (
                <ListManager
                  title="Jobs"
                  description="Government / private job postings shown on the home page and Jobs listing."
                  icon={BriefcaseIcon}
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
                      <p className="font-semibold text-aink">{row.title}</p>
                      <p className="text-xs text-amuted">
                        {row.department} {row.last_date && `· Last date: ${row.last_date}`}
                      </p>
                    </div>
                  )}
                />
              )}

              {activeTab === 'notes' && (
                <ListManager
                  title="Students Zone (Notes / Guess Papers)"
                  description="PDFs and notes shown in the Students Zone section."
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
