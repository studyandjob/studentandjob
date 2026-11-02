// Small, dependency-free line icons used by the redesigned home page.
const PATHS = {
  search: (<><circle cx="11" cy="11" r="7" /><path d="M21 21l-4.5-4.5" /></>),
  building: (<><rect x="5" y="3" width="14" height="18" rx="1" /><path d="M9 7h2M13 7h2M9 11h2M13 11h2M10 21v-4h4v4" /></>),
  briefcase: (<><rect x="3" y="7" width="18" height="13" rx="2" /><path d="M9 7V5a2 2 0 012-2h2a2 2 0 012 2v2M3 13h18" /></>),
  pin: (<><path d="M12 21s7-6.2 7-11a7 7 0 10-14 0c0 4.8 7 11 7 11z" /><circle cx="12" cy="10" r="2.5" /></>),
  clock: (<><circle cx="12" cy="12" r="9" /><path d="M12 7v5l3 2" /></>),
  shield: (<><path d="M12 3l8 3v6c0 4.5-3.2 8-8 9-4.8-1-8-4.5-8-9V6l8-3z" /><path d="M8.5 12l2.5 2.5 4.5-5" /></>),
  check: (<><circle cx="12" cy="12" r="9" /><path d="M8 12.5l3 3 5-6" /></>),
  document: (<><path d="M7 3h8l4 4v14H7z" /><path d="M15 3v4h4M10 12h6M10 16h6" /></>),
  bank: (<><path d="M3 9l9-5 9 5H3z" /><path d="M5 9v9M9.5 9v9M14.5 9v9M19 9v9M3 21h18" /></>),
  teacher: (<><path d="M2 9l10-5 10 5-10 5L2 9z" /><path d="M6 11.5V16c3 2.2 9 2.2 12 0v-4.5" /></>),
  gift: (<><rect x="3" y="8" width="18" height="4" rx="1" /><path d="M5 12v9h14v-9M12 8v13M12 8c-2.5 0-4-1-4-2.5S10 3 12 8zM12 8c2.5 0 4-1 4-2.5S14 3 12 8z" /></>),
  arrow: (<path d="M5 12h14M13 6l6 6-6 6" />),
  chevron: (<path d="M6 9l6 6 6-6" />),
  menu: (<path d="M4 7h16M4 12h16M4 17h16" />),
  close: (<path d="M6 6l12 12M18 6L6 18" />),
  star: (<path d="M12 3.5l2.6 5.4 5.9.8-4.3 4.1 1 5.9L12 16.9 6.8 19.7l1-5.9L3.5 9.7l5.9-.8L12 3.5z" />),
  home: (<><path d="M3 11.5L12 4l9 7.5" /><path d="M5.5 10v9.5h4.2V15h4.6v4.5h4.2V10" /></>),
  mail: (<><rect x="3" y="5" width="18" height="14" rx="2" /><path d="M3.5 7l8.5 6 8.5-6" /></>),
  grad: (<><path d="M2 9l10-5 10 5-10 5L2 9z" /><path d="M6 11.5V16c3 2.2 9 2.2 12 0v-4.5" /></>),
  calendar: (<><rect x="3.5" y="5" width="17" height="15" rx="2" /><path d="M3.5 10h17M8 3v4M16 3v4" /></>),
  money: (<><rect x="3" y="6" width="18" height="12" rx="2" /><circle cx="12" cy="12" r="2.5" /></>),
  users: (<><circle cx="9" cy="8" r="3.2" /><path d="M3 19c.6-3.3 3-5 6-5s5.4 1.7 6 5" /><path d="M16 5.2a3 3 0 010 5.6M18 14.3c1.6.6 2.7 2.1 3 4.7" /></>),
  award: (<><circle cx="12" cy="9" r="5" /><path d="M8.5 13.5L7 21l5-3 5 3-1.5-7.5" /></>),
  chevronRight: (<path d="M9 6l6 6-6 6" />),
  chevronLeft: (<path d="M15 6l-6 6 6 6" />),
  whatsapp: (<><path d="M4 20l1.3-4.2A8 8 0 1112 20a8 8 0 01-3.8-1L4 20z" /><path d="M9 9c.3 2 2 3.8 4 4.5l1-1.2 1.8.9c-.3 1-1.2 1.6-2.3 1.4C10.800 14 8.500 11.500 8.200 9.500c-.1-1 .5-1.800 1.400-2" /></>),
  heart: (<path d="M12 20s-7.500-4.600-7.500-10A4.300 4.300 0 0112 7.500 4.300 4.300 0 0119.500 10c0 5.400-7.500 10-7.500 10z" />),
};

export default function HomeIcon({ name, className = 'h-6 w-6' }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
    >
      {PATHS[name] || PATHS.briefcase}
    </svg>
  );
}
