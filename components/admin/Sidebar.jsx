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
  PaletteIcon,
  Share2Icon,
  CloseIcon,
} from './icons';

// One nav item per public-facing page — kept in the same order as the
// site's main menu so the admin dashboard mirrors the live website.
const NAV_ITEMS = [
  { id: 'dashboard', label: 'Dashboard', icon: HomeIcon },
  { id: 'settings', label: 'Site Settings', icon: SettingsIcon },
  { id: 'social', label: 'Social Media', icon: Share2Icon },
  { id: 'themes', label: 'Theme Settings', icon: PaletteIcon },
  { id: 'slides', label: 'Hero Slides', icon: ImageIcon },
  { id: 'jobs', label: 'Jobs', icon: BriefcaseIcon },
  { id: 'members', label: 'Portal Requests', icon: IdCardIcon, badgeKey: 'pendingMembers' },
  { id: 'notes', label: 'Students Zone', icon: BookIcon },
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
        className={`fixed left-0 top-0 z-50 flex h-screen w-[240px] flex-shrink-0 flex-col overflow-y-auto bg-atl transition-transform duration-300 md:translate-x-0 ${
          open ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="flex flex-shrink-0 items-center justify-between gap-2.5 border-b border-white/10 px-[18px] py-5">
          <div className="flex items-center gap-2.5">
            {logoUrl ? (
              // Plain <img> on purpose (not next/image) — same reasoning as
              // everywhere else this project shows an uploaded image.
              <img
                src={logoUrl}
                alt={siteName || 'Logo'}
                className="h-[38px] w-[38px] flex-shrink-0 rounded-full border-2 border-agold object-cover"
              />
            ) : (
              <div className="flex h-[38px] w-[38px] flex-shrink-0 items-center justify-center rounded-full border-2 border-agold bg-white/10 text-sm font-bold text-white">
                {(siteName || 'A').charAt(0)}
              </div>
            )}
            <div className="flex min-w-0 flex-col">
              <span className="truncate font-serif text-sm font-bold text-white">{siteName || 'Admin'}</span>
              <small className="text-[0.7rem] text-white/60">Dashboard</small>
            </div>
          </div>
          <button onClick={onClose} className="text-white/70 hover:text-white md:hidden" aria-label="Close menu">
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
                  isActive ? 'bg-white/15 text-white' : 'text-white/75 hover:bg-white/15 hover:text-white'
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

          <div className="my-2 border-t border-white/10" />

          <button
            onClick={onLogout}
            className="flex w-full items-center gap-3 rounded-[10px] border border-rose-400/20 bg-rose-500/15 px-3.5 py-3 text-left text-sm font-medium text-rose-100/90 transition hover:bg-rose-600/35 hover:text-white"
          >
            <LogOutIcon className="h-[18px] w-[18px] flex-shrink-0" />
            <span>Logout</span>
          </button>
        </nav>
      </aside>
    </>
  );
}
