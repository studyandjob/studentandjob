'use client';

import {
  HomeIcon,
  SettingsIcon,
  LogOutIcon,
  ImageIcon,
  BriefcaseIcon,
  BookIcon,
  ClipboardCheckIcon,
  AwardIcon,
  MailIcon,
  IdCardIcon,
  FileTextIcon,
  Share2Icon,
  CloseIcon,
  GraduationCapIcon,
  PaletteIcon,
} from './icons';

// One nav item per public-facing page — kept in the same order as the
// site's main menu so the admin dashboard mirrors the live website.
const NAV_ITEMS = [
  { id: 'dashboard', label: 'Dashboard', icon: HomeIcon },
  { id: 'settings', label: 'Site Settings', icon: SettingsIcon },
  { id: 'texttheme', label: 'Text Theme', icon: PaletteIcon },
  { id: 'social', label: 'Social Media', icon: Share2Icon },
  { id: 'slides', label: 'Hero Slides', icon: ImageIcon },
  { id: 'jobs', label: 'Jobs', icon: BriefcaseIcon },
  { id: 'members', label: 'Portal Requests', icon: IdCardIcon, badgeKey: 'pendingMembers' },
  { id: 'notes', label: 'Students Zone', icon: BookIcon },
  { id: 'studyzone', label: 'Study Zone (AI)', icon: GraduationCapIcon },
  { id: 'results', label: 'Results', icon: ClipboardCheckIcon },
  { id: 'scholarships', label: 'Scholarships', icon: AwardIcon },
  { id: 'messages', label: 'Contact Messages', icon: MailIcon, badgeKey: 'unreadMessages' },
  { id: 'contacts', label: 'Contact Us', icon: IdCardIcon },
  { id: 'pages', label: 'Pages (About / Legal)', icon: FileTextIcon },
];

export default function Sidebar({ activeTab, onTabChange, open, onClose, siteName, logoUrl, onLogout, unreadMessages = 0, pendingMembers = 0 }) {
  const badgeValues = { unreadMessages, pendingMembers };
  function handleSelect(id) {
    onTabChange(id);
    onClose();
  }

  return (
    <>
      {/* Mobile overlay */}
      {open && (
        <div
          onClick={onClose}
          className="fixed inset-0 z-40 bg-black/45 backdrop-blur-[2px] md:hidden"
          aria-hidden="true"
        />
      )}

      <aside
        className={`fixed left-0 top-0 z-50 flex h-screen w-[240px] flex-shrink-0 flex-col overflow-y-auto border-r border-aline bg-white transition-transform duration-300 md:translate-x-0 ${
          open ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="flex flex-shrink-0 items-center justify-between gap-2.5 border-b border-aline px-[18px] py-5">
          <div className="flex items-center gap-2.5">
            {logoUrl ? (
              // Plain <img> on purpose (not next/image) — same reasoning as
              // everywhere else this project shows an uploaded image.
              <img
                src={logoUrl}
                alt={siteName || 'Logo'}
                className="h-[38px] w-[38px] flex-shrink-0 rounded-full border-2 border-atl2 object-cover"
              />
            ) : (
              <div className="flex h-[38px] w-[38px] flex-shrink-0 items-center justify-center rounded-full bg-atl2 text-sm font-bold text-white">
                {(siteName || 'A').charAt(0)}
              </div>
            )}
            <div className="flex min-w-0 flex-col">
              <span className="truncate font-serif text-sm font-bold text-atl">{siteName || 'Admin'}</span>
              <small className="text-[0.7rem] text-amuted">Dashboard</small>
            </div>
          </div>
          <button onClick={onClose} className="text-amuted hover:text-aink md:hidden" aria-label="Close menu">
            <CloseIcon className="h-5 w-5" />
          </button>
        </div>

        <nav className="flex flex-1 flex-col gap-1 p-2.5">
          {NAV_ITEMS.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            const badgeValue = item.badgeKey ? badgeValues[item.badgeKey] : 0;
            return (
              <button
                key={item.id}
                onClick={() => handleSelect(item.id)}
                className={`flex w-full items-center gap-3 rounded-[10px] px-3.5 py-3 text-left text-sm font-medium transition ${
                  isActive ? 'bg-atl2/10 text-atl2' : 'text-aink/75 hover:bg-acream hover:text-atl'
                }`}
              >
                <Icon className="h-[18px] w-[18px] flex-shrink-0" />
                <span className="flex-1">{item.label}</span>
                {badgeValue > 0 && (
                  <span className="flex h-5 min-w-[20px] flex-shrink-0 items-center justify-center rounded-full bg-acoral px-1.5 text-[0.68rem] font-bold text-white">
                    {badgeValue}
                  </span>
                )}
              </button>
            );
          })}

          <div className="my-2 border-t border-aline" />

          <button
            onClick={onLogout}
            className="flex w-full items-center gap-3 rounded-[10px] border border-red-200 bg-red-50 px-3.5 py-3 text-left text-sm font-medium text-red-600 transition hover:bg-red-100"
          >
            <LogOutIcon className="h-[18px] w-[18px] flex-shrink-0" />
            <span>Logout</span>
          </button>
        </nav>
      </aside>
    </>
  );
}
