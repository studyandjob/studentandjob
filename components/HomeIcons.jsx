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
