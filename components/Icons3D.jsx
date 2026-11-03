/**
 * Icons3D.jsx
 * -----------------------------------------------------------------------
 * Airbnb-style flat icons. The file and export names are unchanged (so no
 * page needs editing), but the glossy 3D art has been replaced by clean
 * line icons that take their colour from the surrounding text colour
 * (`currentColor`), so they follow the active theme automatically.
 * Social-media icons are flat brand-colour marks.
 * Size them with h-/w- classes exactly as before.
 * -----------------------------------------------------------------------
 */

function Line({ className = 'h-6 w-6', children }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      {children}
    </svg>
  );
}

const make = (paths) => {
  const Icon = (props) => <Line {...props}>{paths}</Line>;
  return Icon;
};

export const VerifiedBadgeIcon3D = make(
  <>
    <path d="M12 3l8 3v6c0 4.5-3.2 8-8 9-4.8-1-8-4.5-8-9V6l8-3z" />
    <path d="M8.5 12l2.5 2.5 4.5-5" />
  </>
);
export const NotesBookIcon3D = make(
  <>
    <path d="M5 4.5A1.5 1.5 0 016.5 3H19v15H6.5A1.5 1.5 0 005 19.5v-15z" />
    <path d="M5 19.5A1.5 1.5 0 006.5 21H19v-3M9 8h6M9 12h6" />
  </>
);
export const DailyUpdateIcon3D = make(
  <>
    <rect x="3.5" y="5" width="17" height="15" rx="2" />
    <path d="M3.5 10h17M8 3v4M16 3v4M12 13v3l2 1" />
  </>
);
export const SupportIcon3D = make(
  <>
    <path d="M4 14v-2a8 8 0 0116 0v2" />
    <rect x="3" y="14" width="4" height="6" rx="1.5" />
    <rect x="17" y="14" width="4" height="6" rx="1.5" />
    <path d="M19 20c0 1.200-1.500 2-4 2" />
  </>
);
export const GiftIcon3D = make(
  <>
    <rect x="3" y="8" width="18" height="4" rx="1" />
    <path d="M5 12v9h14v-9M12 8v13M12 8c-2.500 0-4-1-4-2.500S10 3 12 8zM12 8c2.500 0 4-1 4-2.500S14 3 12 8z" />
  </>
);
export const SearchIcon3D = make(
  <>
    <circle cx="11" cy="11" r="7" />
    <path d="M21 21l-4.500-4.500" />
  </>
);
export const BriefcaseIcon3D = make(
  <>
    <rect x="3" y="7" width="18" height="13" rx="2" />
    <path d="M9 7V5a2 2 0 012-2h2a2 2 0 012 2v2M3 13h18" />
  </>
);
export const StarIcon3D = make(<path d="M12 3.500l2.600 5.400 5.900.8-4.300 4.100 1 5.900L12 16.900 6.800 19.700l1-5.900L3.500 9.700l5.900-.8L12 3.500z" />);
export const PhoneIcon3D = make(<path d="M5 4h4l2 5-2.500 1.500a11 11 0 005 5L15 13l5 2v4a2 2 0 01-2 2A16 16 0 013 6a2 2 0 012-2z" />);
export const MailIcon3D = make(
  <>
    <rect x="3" y="5" width="18" height="14" rx="2" />
    <path d="M3.500 7l8.500 6 8.500-6" />
  </>
);
export const ChatBubbleIcon3D = make(
  <>
    <path d="M4 20l1.300-4.200A8 8 0 1112 20a8 8 0 01-3.800-1L4 20z" />
    <path d="M9 11h6M9 14h4" />
  </>
);
export const ChevronDownIcon3D = make(<path d="M6 9l6 6 6-6" />);
export const FilterIcon3D = make(<path d="M4 6h16M7 12h10M10 18h4" />);
export const MenuIcon3D = make(<path d="M4 7h16M4 12h16M4 17h16" />);
export const CloseIcon3D = make(<path d="M6 6l12 12M18 6L6 18" />);
export const DocumentIcon3D = make(
  <>
    <path d="M7 3h8l4 4v14H7z" />
    <path d="M15 3v4h4M10 12h6M10 16h6" />
  </>
);
export const MapPinIcon3D = make(
  <>
    <path d="M12 21s7-6.200 7-11a7 7 0 10-14 0c0 4.800 7 11 7 11z" />
    <circle cx="12" cy="10" r="2.500" />
  </>
);
export const BuildingIcon3D = make(
  <>
    <rect x="5" y="3" width="14" height="18" rx="1" />
    <path d="M9 7h2M13 7h2M9 11h2M13 11h2M10 21v-4h4v4" />
  </>
);
export const ArrowRightIcon3D = make(<path d="M5 12h14M13 6l6 6-6 6" />);

// Aliases kept from the original file
export const ShieldCheckIcon3D = VerifiedBadgeIcon3D;
export const CalendarClockIcon3D = DailyUpdateIcon3D;
export const WhatsappIcon3D = ChatBubbleIcon3D;

export const LockShieldIcon3D = make(
  <>
    <path d="M12 3l8 3v6c0 4.500-3.200 8-8 9-4.800-1-8-4.500-8-9V6l8-3z" />
    <rect x="9" y="11" width="6" height="5" rx="1" />
    <path d="M10 11V9.500a2 2 0 014 0V11" />
  </>
);
export const GraduationCapIcon3D = make(
  <>
    <path d="M2 9l10-5 10 5-10 5L2 9z" />
    <path d="M6 11.500V16c3 2.200 9 2.200 12 0v-4.500" />
  </>
);

/* ---- Social: flat brand-colour marks ---------------------------------- */
function Social({ className = 'h-8 w-8', bg, children }) {
  return (
    <svg className={className} viewBox="0 0 32 32" aria-hidden="true">
      <rect width="32" height="32" rx="9" fill={bg} />
      {children}
    </svg>
  );
}
export const FacebookIcon3D = (p) => (
  <Social {...p} bg="#1877F2">
    <path fill="#fff" d="M17.500 26v-8.500h2.800l.5-3.400h-3.300v-2.100c0-1 .4-1.800 1.900-1.800h1.500V7.200c-.3 0-1.300-.2-2.500-.2-2.600 0-4.300 1.600-4.300 4.400v2.700H11.300v3.400h2.800V26h3.400z" />
  </Social>
);
export const InstagramIcon3D = (p) => (
  <Social {...p} bg="#E1306C">
    <rect x="8" y="8" width="16" height="16" rx="4.500" fill="none" stroke="#fff" strokeWidth="1.800" />
    <circle cx="16" cy="16" r="3.800" fill="none" stroke="#fff" strokeWidth="1.800" />
    <circle cx="21" cy="11" r="1.100" fill="#fff" />
  </Social>
);
export const YoutubeIcon3D = (p) => (
  <Social {...p} bg="#FF0000">
    <rect x="6.500" y="10" width="19" height="12" rx="4" fill="#fff" />
    <path d="M14 13l5 3-5 3z" fill="#FF0000" />
  </Social>
);
export const TiktokIcon3D = (p) => (
  <Social {...p} bg="#111111">
    <path fill="#fff" d="M18.500 7h-2.800v12.200a2.400 2.400 0 11-2.400-2.400c.3 0 .5 0 .8.100v-2.900a5.300 5.300 0 105.100 5.200v-6.200c1 .8 2.200 1.200 3.500 1.200v-2.800c-2 0-3.700-1.700-4.200-4.400z" />
  </Social>
);
export const XIcon3D = (p) => (
  <Social {...p} bg="#111111">
    <path fill="#fff" d="M18.900 8.500h2.200l-4.800 5.500 5.600 7.500h-4.400l-3.500-4.600-4 4.600H7.800l5.100-5.900-5.400-7.100H12l3.200 4.200 3.700-4.200zm-.8 11.700h1.200L11.500 9.700h-1.300l7.900 10.500z" />
  </Social>
);
export const LinkedinIcon3D = (p) => (
  <Social {...p} bg="#0A66C2">
    <path fill="#fff" d="M9 13h2.800v9H9v-9zm1.400-4.300a1.600 1.600 0 110 3.200 1.600 1.600 0 010-3.200zM13.800 13h2.700v1.200c.4-.7 1.300-1.400 2.700-1.400 2.800 0 3.300 1.800 3.300 4.200V22h-2.800v-4.400c0-1.100 0-2.400-1.500-2.400s-1.700 1.100-1.700 2.300V22h-2.700v-9z" />
  </Social>
);
