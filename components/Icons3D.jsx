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

import Art3D from './Art3D';

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

export const VerifiedBadgeIcon3D = (p) => <Art3D name="shield" className={p.className || 'h-8 w-8'} />;
export const NotesBookIcon3D = (p) => <Art3D name="book" className={p.className || 'h-8 w-8'} />;
export const DailyUpdateIcon3D = (p) => <Art3D name="bell" className={p.className || 'h-8 w-8'} />;
export const SupportIcon3D = (p) => <Art3D name="phone" className={p.className || 'h-8 w-8'} />;
export const GiftIcon3D = (p) => <Art3D name="gift" className={p.className || 'h-8 w-8'} />;
export const SearchIcon3D = make(
  <>
    <circle cx="11" cy="11" r="7" />
    <path d="M21 21l-4.500-4.500" />
  </>
);
export const BriefcaseIcon3D = (p) => <Art3D name="briefcase" className={p.className || 'h-8 w-8'} />;
export const StarIcon3D = (p) => <Art3D name="star" className={p.className || 'h-8 w-8'} />;
export const PhoneIcon3D = (p) => <Art3D name="phone" className={p.className || 'h-8 w-8'} />;
export const MailIcon3D = (p) => <Art3D name="mail" className={p.className || 'h-8 w-8'} />;
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
export const DocumentIcon3D = (p) => <Art3D name="doc" className={p.className || 'h-8 w-8'} />;
export const MapPinIcon3D = make(
  <>
    <path d="M12 21s7-6.200 7-11a7 7 0 10-14 0c0 4.800 7 11 7 11z" />
    <circle cx="12" cy="10" r="2.500" />
  </>
);
export const BuildingIcon3D = (p) => <Art3D name="building" className={p.className || 'h-8 w-8'} />;
export const ArrowRightIcon3D = make(<path d="M5 12h14M13 6l6 6-6 6" />);

// Aliases kept from the original file
export const ShieldCheckIcon3D = VerifiedBadgeIcon3D;
export const CalendarClockIcon3D = DailyUpdateIcon3D;
export const WhatsappIcon3D = ChatBubbleIcon3D;

export const LockShieldIcon3D = (p) => <Art3D name="shield" className={p.className || 'h-8 w-8'} />;
export const GraduationCapIcon3D = (p) => <Art3D name="study" className={p.className || 'h-8 w-8'} />;

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
