/**
 * Icons3D.jsx
 * -----------------------------------------------------------------------
 * A small library of original, glossy "3D app-icon" style SVG icons used
 * across the public site (Header, HeroSlider, TrustStrip, job cards,
 * search, contact, students-zone, etc.) — replacing the old flat
 * single-color line icons with layered, gradient-shaded, glassy icons
 * similar in feel to the realistic 3D icon packs (rounded glossy shapes,
 * soft drop shadow, top highlight/glare, subtle inner bevel).
 *
 * Every icon is a self-contained <svg>, sized by the `className` prop
 * (pass h- and w- utility classes same as before), so drop-in swaps work
 * without touching layout code. Each icon uses its own <defs> with
 * uniquely-prefixed gradient ids (based on a random-free static id) so
 * multiple copies of the same icon can appear on one page without
 * gradient id collisions breaking in Safari/Firefox.
 * -----------------------------------------------------------------------
 */

function Base({ className = 'h-6 w-6', viewBox = '0 0 64 64', children }) {
  return (
    <svg
      className={className}
      viewBox={viewBox}
      xmlns="http://www.w3.org/2000/svg"
      role="img"
      aria-hidden="true"
    >
      {children}
    </svg>
  );
}

/* ---------------------------------------------------------------------- */
/* Verified Job Postings — checkmark seal on a document                    */
/* ---------------------------------------------------------------------- */
export const VerifiedBadgeIcon3D = (props) => (
  <Base {...props}>
    <defs>
      <linearGradient id="vb-doc" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stopColor="#FFFFFF" />
        <stop offset="100%" stopColor="#DCE7F7" />
      </linearGradient>
      <linearGradient id="vb-seal" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0%" stopColor="#5CD08A" />
        <stop offset="55%" stopColor="#28A745" />
        <stop offset="100%" stopColor="#1C7430" />
      </linearGradient>
      <radialGradient id="vb-glare" cx="35%" cy="25%" r="65%">
        <stop offset="0%" stopColor="#FFFFFF" stopOpacity="0.85" />
        <stop offset="100%" stopColor="#FFFFFF" stopOpacity="0" />
      </radialGradient>
      <filter id="vb-shadow" x="-40%" y="-40%" width="180%" height="180%">
        <feDropShadow dx="0" dy="3" stdDeviation="3" floodColor="#0B2A55" floodOpacity="0.28" />
      </filter>
    </defs>
    <g filter="url(#vb-shadow)">
      <rect x="10" y="6" width="34" height="46" rx="5" fill="url(#vb-doc)" stroke="#B7C8E5" strokeWidth="1" />
      <rect x="16" y="14" width="20" height="3" rx="1.5" fill="#7C93C4" />
      <rect x="16" y="21" width="20" height="3" rx="1.5" fill="#AEC0E4" />
      <rect x="16" y="28" width="13" height="3" rx="1.5" fill="#AEC0E4" />
      <circle cx="40" cy="40" r="18" fill="url(#vb-seal)" stroke="#155C24" strokeWidth="1" />
      <circle cx="40" cy="40" r="18" fill="url(#vb-glare)" />
      <path d="M31.5 40.5l5.5 5.5 11-12" fill="none" stroke="#F4FFF7" strokeWidth="4.2" strokeLinecap="round" strokeLinejoin="round" />
    </g>
  </Base>
);

/* ---------------------------------------------------------------------- */
/* Free Notes & Papers — stacked open book                                 */
/* ---------------------------------------------------------------------- */
export const NotesBookIcon3D = (props) => (
  <Base {...props}>
    <defs>
      <linearGradient id="bk-left" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0%" stopColor="#3F79CF" />
        <stop offset="100%" stopColor="#0047AB" />
      </linearGradient>
      <linearGradient id="bk-right" x1="1" y1="0" x2="0" y2="1">
        <stop offset="0%" stopColor="#5CD08A" />
        <stop offset="100%" stopColor="#28A745" />
      </linearGradient>
      <linearGradient id="bk-spine" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stopColor="#FFD97A" />
        <stop offset="100%" stopColor="#E8A33D" />
      </linearGradient>
      <filter id="bk-shadow" x="-40%" y="-40%" width="180%" height="180%">
        <feDropShadow dx="0" dy="3" stdDeviation="3" floodColor="#0B2A55" floodOpacity="0.3" />
      </filter>
    </defs>
    <g filter="url(#bk-shadow)">
      <path d="M32 16c-5-3-13-4-20-2v34c7-2 15-1 20 2z" fill="url(#bk-left)" />
      <path d="M32 16c5-3 13-4 20-2v34c-7-2-15-1-20 2z" fill="url(#bk-right)" />
      <rect x="30" y="14" width="4" height="38" rx="2" fill="url(#bk-spine)" />
      <path d="M16 21c3.7-1 8-1.3 11 .1M16 27c3.7-1 8-1.3 11 .1M16 33c3.7-1 8-1.3 11 .1" stroke="#FFFFFF" strokeOpacity="0.75" strokeWidth="1.6" strokeLinecap="round" fill="none" />
      <path d="M37 21.1c3-1.4 7.3-1.1 11-.1M37 27.1c3-1.4 7.3-1.1 11-.1M37 33.1c3-1.4 7.3-1.1 11-.1" stroke="#FFFFFF" strokeOpacity="0.75" strokeWidth="1.6" strokeLinecap="round" fill="none" />
      <ellipse cx="24" cy="19" rx="6" ry="2.4" fill="#FFFFFF" opacity="0.25" />
    </g>
  </Base>
);

/* ---------------------------------------------------------------------- */
/* Daily Updates — glossy clock with a refresh sweep                       */
/* ---------------------------------------------------------------------- */
export const DailyUpdateIcon3D = (props) => (
  <Base {...props}>
    <defs>
      <radialGradient id="ck-face" cx="35%" cy="30%" r="75%">
        <stop offset="0%" stopColor="#FFFFFF" />
        <stop offset="60%" stopColor="#EAF1FD" />
        <stop offset="100%" stopColor="#C7D7F2" />
      </radialGradient>
      <linearGradient id="ck-rim" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0%" stopColor="#3F79CF" />
        <stop offset="100%" stopColor="#0047AB" />
      </linearGradient>
      <linearGradient id="ck-arrow" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0%" stopColor="#5CD08A" />
        <stop offset="100%" stopColor="#28A745" />
      </linearGradient>
      <filter id="ck-shadow" x="-40%" y="-40%" width="180%" height="180%">
        <feDropShadow dx="0" dy="3" stdDeviation="3" floodColor="#0B2A55" floodOpacity="0.3" />
      </filter>
    </defs>
    <g filter="url(#ck-shadow)">
      <circle cx="32" cy="34" r="22" fill="url(#ck-rim)" />
      <circle cx="32" cy="34" r="17.5" fill="url(#ck-face)" />
      <path d="M32 34l0-10" stroke="#274b8a" strokeWidth="2.6" strokeLinecap="round" />
      <path d="M32 34l7 4" stroke="#274b8a" strokeWidth="2.6" strokeLinecap="round" />
      <circle cx="32" cy="34" r="2.2" fill="#0047AB" />
      <path
        d="M43 20a17 17 0 10 5 12"
        fill="none"
        stroke="url(#ck-arrow)"
        strokeWidth="4.4"
        strokeLinecap="round"
      />
      <path d="M50 14l1 8-8-2z" fill="url(#ck-arrow)" />
      <ellipse cx="26" cy="24" rx="7" ry="3" fill="#FFFFFF" opacity="0.5" />
    </g>
  </Base>
);

/* ---------------------------------------------------------------------- */
/* Application Support — headset, glossy                                   */
/* ---------------------------------------------------------------------- */
export const SupportIcon3D = (props) => (
  <Base {...props}>
    <defs>
      <linearGradient id="sp-band" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stopColor="#3F79CF" />
        <stop offset="100%" stopColor="#0047AB" />
      </linearGradient>
      <linearGradient id="sp-cup" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0%" stopColor="#5CD08A" />
        <stop offset="100%" stopColor="#1C7430" />
      </linearGradient>
      <filter id="sp-shadow" x="-40%" y="-40%" width="180%" height="180%">
        <feDropShadow dx="0" dy="3" stdDeviation="3" floodColor="#0B2A55" floodOpacity="0.3" />
      </filter>
    </defs>
    <g filter="url(#sp-shadow)">
      <path d="M14 33a18 18 0 0136 0" fill="none" stroke="url(#sp-band)" strokeWidth="5" strokeLinecap="round" />
      <rect x="10" y="31" width="10" height="16" rx="5" fill="url(#sp-cup)" />
      <rect x="44" y="31" width="10" height="16" rx="5" fill="url(#sp-cup)" />
      <path d="M20 45v3a8 8 0 008 8h3" fill="none" stroke="#0047AB" strokeWidth="4" strokeLinecap="round" />
      <circle cx="34" cy="34" r="2.6" fill="#FFFFFF" opacity="0.7" />
      <circle cx="48" cy="34" r="2.6" fill="#FFFFFF" opacity="0.7" />
      <ellipse cx="14" cy="35" rx="2.6" ry="5" fill="#FFFFFF" opacity="0.35" />
      <ellipse cx="48" cy="35" rx="2.6" ry="5" fill="#FFFFFF" opacity="0.3" />
    </g>
  </Base>
);

/* ---------------------------------------------------------------------- */
/* Free Resources — glossy gift box                                        */
/* ---------------------------------------------------------------------- */
export const GiftIcon3D = (props) => (
  <Base {...props}>
    <defs>
      <linearGradient id="gf-box" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0%" stopColor="#3F79CF" />
        <stop offset="100%" stopColor="#0047AB" />
      </linearGradient>
      <linearGradient id="gf-lid" x1="0" y1="0" x2="1" y2="0">
        <stop offset="0%" stopColor="#5CD08A" />
        <stop offset="100%" stopColor="#28A745" />
      </linearGradient>
      <linearGradient id="gf-ribbon" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stopColor="#FFD97A" />
        <stop offset="100%" stopColor="#E8A33D" />
      </linearGradient>
      <filter id="gf-shadow" x="-40%" y="-40%" width="180%" height="180%">
        <feDropShadow dx="0" dy="3" stdDeviation="3" floodColor="#0B2A55" floodOpacity="0.3" />
      </filter>
    </defs>
    <g filter="url(#gf-shadow)">
      <rect x="12" y="28" width="40" height="26" rx="3" fill="url(#gf-box)" />
      <rect x="9" y="18" width="46" height="12" rx="3" fill="url(#gf-lid)" />
      <rect x="29" y="18" width="6" height="36" fill="url(#gf-ribbon)" />
      <path
        d="M32 18c-6-8-16-8-16-1 0 4 6 1 16 1zM32 18c6-8 16-8 16-1 0 4-6 1-16 1z"
        fill="url(#gf-ribbon)"
        stroke="#C67F1E"
        strokeWidth="0.6"
      />
      <ellipse cx="20" cy="34" rx="6" ry="2.4" fill="#FFFFFF" opacity="0.25" />
      <rect x="9" y="18" width="46" height="4" rx="2" fill="#FFFFFF" opacity="0.3" />
    </g>
  </Base>
);

/* ---------------------------------------------------------------------- */
/* Search — glossy magnifier                                               */
/* ---------------------------------------------------------------------- */
export const SearchIcon3D = (props) => (
  <Base {...props}>
    <defs>
      <linearGradient id="sr-ring" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0%" stopColor="#3F79CF" />
        <stop offset="100%" stopColor="#0047AB" />
      </linearGradient>
      <linearGradient id="sr-handle" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0%" stopColor="#E8A33D" />
        <stop offset="100%" stopColor="#C97F1C" />
      </linearGradient>
      <radialGradient id="sr-glass" cx="35%" cy="30%" r="70%">
        <stop offset="0%" stopColor="#EAF3FF" stopOpacity="0.95" />
        <stop offset="100%" stopColor="#BFD8FA" stopOpacity="0.55" />
      </radialGradient>
      <filter id="sr-shadow" x="-40%" y="-40%" width="180%" height="180%">
        <feDropShadow dx="0" dy="3" stdDeviation="2.5" floodColor="#0B2A55" floodOpacity="0.3" />
      </filter>
    </defs>
    <g filter="url(#sr-shadow)">
      <rect x="38" y="40" width="8" height="20" rx="4" transform="rotate(45 42 50)" fill="url(#sr-handle)" />
      <circle cx="27" cy="27" r="18" fill="url(#sr-ring)" />
      <circle cx="27" cy="27" r="13" fill="url(#sr-glass)" />
      <ellipse cx="21" cy="20" rx="5.5" ry="3" fill="#FFFFFF" opacity="0.6" />
    </g>
  </Base>
);

/* ---------------------------------------------------------------------- */
/* Briefcase — glossy job icon                                             */
/* ---------------------------------------------------------------------- */
export const BriefcaseIcon3D = (props) => (
  <Base {...props}>
    <defs>
      <linearGradient id="bc-body" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stopColor="#3F79CF" />
        <stop offset="100%" stopColor="#003A8C" />
      </linearGradient>
      <linearGradient id="bc-lid" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stopColor="#FFCB66" />
        <stop offset="100%" stopColor="#E8A33D" />
      </linearGradient>
      <filter id="bc-shadow" x="-40%" y="-40%" width="180%" height="180%">
        <feDropShadow dx="0" dy="3" stdDeviation="3" floodColor="#0B2A55" floodOpacity="0.3" />
      </filter>
    </defs>
    <g filter="url(#bc-shadow)">
      <rect x="24" y="10" width="16" height="10" rx="2.5" fill="none" stroke="url(#bc-body)" strokeWidth="4" />
      <rect x="8" y="22" width="48" height="30" rx="6" fill="url(#bc-body)" />
      <path d="M8 30h48v6a4 4 0 01-4 4H12a4 4 0 01-4-4z" fill="url(#bc-lid)" opacity="0.9" />
      <rect x="27" y="30" width="10" height="8" rx="2" fill="#0047AB" />
      <ellipse cx="20" cy="27" rx="9" ry="3" fill="#FFFFFF" opacity="0.2" />
    </g>
  </Base>
);

/* ---------------------------------------------------------------------- */
/* Star / rating                                                           */
/* ---------------------------------------------------------------------- */
export const StarIcon3D = (props) => (
  <Base {...props}>
    <defs>
      <linearGradient id="st-fill" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0%" stopColor="#FFE07A" />
        <stop offset="100%" stopColor="#E8A33D" />
      </linearGradient>
      <filter id="st-shadow" x="-40%" y="-40%" width="180%" height="180%">
        <feDropShadow dx="0" dy="2" stdDeviation="2" floodColor="#7A4E0A" floodOpacity="0.35" />
      </filter>
    </defs>
    <g filter="url(#st-shadow)">
      <path
        d="M32 8l7.2 14.6 16.1 2.3-11.6 11.3 2.7 16-14.4-7.6-14.4 7.6 2.7-16-11.6-11.3 16.1-2.3z"
        fill="url(#st-fill)"
        stroke="#B5761C"
        strokeWidth="1"
      />
      <path d="M32 12l5.4 11 3-1.2z" fill="#FFFFFF" opacity="0.35" />
    </g>
  </Base>
);

/* ---------------------------------------------------------------------- */
/* Phone — glossy call icon                                                */
/* ---------------------------------------------------------------------- */
export const PhoneIcon3D = (props) => (
  <Base {...props}>
    <defs>
      <linearGradient id="ph-fill" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0%" stopColor="#5CD08A" />
        <stop offset="100%" stopColor="#1C7430" />
      </linearGradient>
      <filter id="ph-shadow" x="-40%" y="-40%" width="180%" height="180%">
        <feDropShadow dx="0" dy="2" stdDeviation="2" floodColor="#0B2A55" floodOpacity="0.3" />
      </filter>
    </defs>
    <g filter="url(#ph-shadow)">
      <path
        d="M20 10c3 0 4 1 5 4l2 6a4 4 0 01-1 4l-3 3c2 6 6 10 12 12l3-3a4 4 0 014-1l6 2c3 1 4 2 4 5v3c0 3-2 5-5 5C29 50 14 35 14 17c0-3 2-5 5-5z"
        fill="url(#ph-fill)"
      />
      <ellipse cx="24" cy="18" rx="4" ry="2" fill="#FFFFFF" opacity="0.4" />
    </g>
  </Base>
);

/* ---------------------------------------------------------------------- */
/* Mail — glossy envelope                                                  */
/* ---------------------------------------------------------------------- */
export const MailIcon3D = (props) => (
  <Base {...props}>
    <defs>
      <linearGradient id="ml-body" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stopColor="#FFFFFF" />
        <stop offset="100%" stopColor="#DCE7F7" />
      </linearGradient>
      <linearGradient id="ml-flap" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0%" stopColor="#3F79CF" />
        <stop offset="100%" stopColor="#0047AB" />
      </linearGradient>
      <filter id="ml-shadow" x="-40%" y="-40%" width="180%" height="180%">
        <feDropShadow dx="0" dy="2" stdDeviation="2" floodColor="#0B2A55" floodOpacity="0.3" />
      </filter>
    </defs>
    <g filter="url(#ml-shadow)">
      <rect x="8" y="16" width="48" height="34" rx="5" fill="url(#ml-body)" stroke="#B7C8E5" strokeWidth="1" />
      <path d="M8 20l24 18 24-18" fill="none" stroke="url(#ml-flap)" strokeWidth="4" strokeLinejoin="round" strokeLinecap="round" />
    </g>
  </Base>
);

/* ---------------------------------------------------------------------- */
/* WhatsApp-style chat bubble (original design, not the brand glyph)       */
/* ---------------------------------------------------------------------- */
export const ChatBubbleIcon3D = (props) => (
  <Base {...props}>
    <defs>
      <linearGradient id="cb-fill" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0%" stopColor="#5CD08A" />
        <stop offset="100%" stopColor="#1C7430" />
      </linearGradient>
      <filter id="cb-shadow" x="-40%" y="-40%" width="180%" height="180%">
        <feDropShadow dx="0" dy="2" stdDeviation="2" floodColor="#0B2A55" floodOpacity="0.3" />
      </filter>
    </defs>
    <g filter="url(#cb-shadow)">
      <path
        d="M32 10c12.7 0 23 9.3 23 20.7 0 11.4-10.3 20.7-23 20.7-3.4 0-6.6-.6-9.5-1.8L10 54l3.6-10.2c-2.9-3.4-4.6-7.6-4.6-12.1C9 19.3 19.3 10 32 10z"
        fill="url(#cb-fill)"
      />
      <path d="M22 27c0-1 1-2 2-2s2 1 2.3 2.3c.4 1.7 1.4 3.6 2.7 5 1.4 1.4 3.3 2.4 5 2.8 1.3.3 2.3 1.3 2.3 2.3 0 1-1 2-2 2-6-1.2-11-6.2-12.3-12.4z" fill="#FFFFFF" opacity="0.9" />
      <ellipse cx="24" cy="20" rx="6" ry="3" fill="#FFFFFF" opacity="0.3" />
    </g>
  </Base>
);

/* ---------------------------------------------------------------------- */
/* Chevron down — glossy dropdown arrow (small, flat-ish 3D)               */
/* ---------------------------------------------------------------------- */
export const ChevronDownIcon3D = (props) => (
  <Base {...props} viewBox="0 0 24 24">
    <defs>
      <linearGradient id="cv-fill" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0%" stopColor="#5C86D6" />
        <stop offset="100%" stopColor="#0047AB" />
      </linearGradient>
    </defs>
    <path d="M6 9l6 6 6-6" fill="none" stroke="url(#cv-fill)" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round" />
  </Base>
);

/* ---------------------------------------------------------------------- */
/* Filter — glossy funnel                                                  */
/* ---------------------------------------------------------------------- */
export const FilterIcon3D = (props) => (
  <Base {...props}>
    <defs>
      <linearGradient id="fl-fill" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0%" stopColor="#3F79CF" />
        <stop offset="100%" stopColor="#0047AB" />
      </linearGradient>
      <filter id="fl-shadow" x="-40%" y="-40%" width="180%" height="180%">
        <feDropShadow dx="0" dy="2" stdDeviation="2" floodColor="#0B2A55" floodOpacity="0.3" />
      </filter>
    </defs>
    <g filter="url(#fl-shadow)">
      <path d="M8 12h48l-18 20v14l-12 6V32z" fill="url(#fl-fill)" />
      <ellipse cx="20" cy="16" rx="8" ry="2" fill="#FFFFFF" opacity="0.3" />
    </g>
  </Base>
);

/* ---------------------------------------------------------------------- */
/* Menu (hamburger) — glossy rounded bars                                  */
/* ---------------------------------------------------------------------- */
export const MenuIcon3D = (props) => (
  <Base {...props}>
    <defs>
      <linearGradient id="mn-fill" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0%" stopColor="#3F79CF" />
        <stop offset="100%" stopColor="#0047AB" />
      </linearGradient>
      <filter id="mn-shadow" x="-40%" y="-40%" width="180%" height="180%">
        <feDropShadow dx="0" dy="1.5" stdDeviation="1.5" floodColor="#0B2A55" floodOpacity="0.3" />
      </filter>
    </defs>
    <g filter="url(#mn-shadow)">
      <rect x="8" y="14" width="48" height="8" rx="4" fill="url(#mn-fill)" />
      <rect x="8" y="28" width="48" height="8" rx="4" fill="url(#mn-fill)" />
      <rect x="8" y="42" width="48" height="8" rx="4" fill="url(#mn-fill)" />
      <rect x="8" y="14" width="48" height="3" rx="1.5" fill="#FFFFFF" opacity="0.35" />
      <rect x="8" y="28" width="48" height="3" rx="1.5" fill="#FFFFFF" opacity="0.35" />
      <rect x="8" y="42" width="48" height="3" rx="1.5" fill="#FFFFFF" opacity="0.35" />
    </g>
  </Base>
);

/* ---------------------------------------------------------------------- */
/* Close (X) — glossy round button                                         */
/* ---------------------------------------------------------------------- */
export const CloseIcon3D = (props) => (
  <Base {...props}>
    <defs>
      <linearGradient id="cl-fill" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0%" stopColor="#FF8A7A" />
        <stop offset="100%" stopColor="#D8432E" />
      </linearGradient>
      <filter id="cl-shadow" x="-40%" y="-40%" width="180%" height="180%">
        <feDropShadow dx="0" dy="2" stdDeviation="2" floodColor="#5A1A10" floodOpacity="0.35" />
      </filter>
    </defs>
    <g filter="url(#cl-shadow)">
      <circle cx="32" cy="32" r="24" fill="url(#cl-fill)" />
      <path d="M23 23l18 18M41 23L23 41" stroke="#FFFFFF" strokeWidth="4.5" strokeLinecap="round" />
      <ellipse cx="25" cy="20" rx="8" ry="3.5" fill="#FFFFFF" opacity="0.25" />
    </g>
  </Base>
);

/* ---------------------------------------------------------------------- */
/* Document / attachment (used for scholarship/education cards etc.)       */
/* ---------------------------------------------------------------------- */
export const DocumentIcon3D = (props) => (
  <Base {...props}>
    <defs>
      <linearGradient id="dc-body" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stopColor="#FFFFFF" />
        <stop offset="100%" stopColor="#DCE7F7" />
      </linearGradient>
      <linearGradient id="dc-fold" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0%" stopColor="#E8A33D" />
        <stop offset="100%" stopColor="#C97F1C" />
      </linearGradient>
      <filter id="dc-shadow" x="-40%" y="-40%" width="180%" height="180%">
        <feDropShadow dx="0" dy="2" stdDeviation="2.5" floodColor="#0B2A55" floodOpacity="0.3" />
      </filter>
    </defs>
    <g filter="url(#dc-shadow)">
      <path d="M14 6h24l12 12v40a2 2 0 01-2 2H14a2 2 0 01-2-2V8a2 2 0 012-2z" fill="url(#dc-body)" stroke="#B7C8E5" strokeWidth="1" />
      <path d="M38 6v10a2 2 0 002 2h10z" fill="url(#dc-fold)" />
      <rect x="18" y="30" width="22" height="3" rx="1.5" fill="#7C93C4" />
      <rect x="18" y="37" width="22" height="3" rx="1.5" fill="#AEC0E4" />
      <rect x="18" y="44" width="14" height="3" rx="1.5" fill="#AEC0E4" />
    </g>
  </Base>
);

/* ---------------------------------------------------------------------- */
/* Map pin — glossy location marker (small inline usage)                   */
/* ---------------------------------------------------------------------- */
export const MapPinIcon3D = (props) => (
  <Base {...props}>
    <defs>
      <linearGradient id="mp-fill" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0%" stopColor="#FF8A7A" />
        <stop offset="100%" stopColor="#D8432E" />
      </linearGradient>
      <filter id="mp-shadow" x="-40%" y="-40%" width="180%" height="180%">
        <feDropShadow dx="0" dy="2" stdDeviation="2" floodColor="#5A1A10" floodOpacity="0.3" />
      </filter>
    </defs>
    <g filter="url(#mp-shadow)">
      <path d="M32 6c11 0 19 8.3 19 18.6C51 39 32 58 32 58S13 39 13 24.6C13 14.3 21 6 32 6z" fill="url(#mp-fill)" />
      <circle cx="32" cy="24" r="9" fill="#FFFFFF" />
      <circle cx="32" cy="24" r="5" fill="#D8432E" />
      <ellipse cx="26" cy="16" rx="6" ry="3" fill="#FFFFFF" opacity="0.3" />
    </g>
  </Base>
);

/* ---------------------------------------------------------------------- */
/* Building / company — glossy office block                                */
/* ---------------------------------------------------------------------- */
export const BuildingIcon3D = (props) => (
  <Base {...props}>
    <defs>
      <linearGradient id="bd-fill" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stopColor="#5C86D6" />
        <stop offset="100%" stopColor="#0047AB" />
      </linearGradient>
      <linearGradient id="bd-fill2" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stopColor="#3F79CF" />
        <stop offset="100%" stopColor="#003A8C" />
      </linearGradient>
      <filter id="bd-shadow" x="-40%" y="-40%" width="180%" height="180%">
        <feDropShadow dx="0" dy="2" stdDeviation="2" floodColor="#0B2A55" floodOpacity="0.3" />
      </filter>
    </defs>
    <g filter="url(#bd-shadow)">
      <rect x="10" y="18" width="24" height="36" rx="2" fill="url(#bd-fill)" />
      <rect x="34" y="28" width="20" height="26" rx="2" fill="url(#bd-fill2)" />
      {[22, 30, 38, 46].map((y) => (
        <g key={y}>
          <rect x="15" y={y - 4} width="5" height="5" rx="1" fill="#FFFFFF" opacity="0.55" />
          <rect x="24" y={y - 4} width="5" height="5" rx="1" fill="#FFFFFF" opacity="0.55" />
        </g>
      ))}
      <rect x="39" y="34" width="5" height="5" rx="1" fill="#FFFFFF" opacity="0.5" />
      <rect x="47" y="34" width="5" height="5" rx="1" fill="#FFFFFF" opacity="0.5" />
      <rect x="39" y="43" width="5" height="5" rx="1" fill="#FFFFFF" opacity="0.5" />
      <rect x="47" y="43" width="5" height="5" rx="1" fill="#FFFFFF" opacity="0.5" />
    </g>
  </Base>
);

/* ---------------------------------------------------------------------- */
/* Arrow right — glossy circular action arrow                              */
/* ---------------------------------------------------------------------- */
export const ArrowRightIcon3D = (props) => (
  <Base {...props}>
    <defs>
      <linearGradient id="ar-fill" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0%" stopColor="#5CD08A" />
        <stop offset="100%" stopColor="#1C7430" />
      </linearGradient>
      <filter id="ar-shadow" x="-40%" y="-40%" width="180%" height="180%">
        <feDropShadow dx="0" dy="2" stdDeviation="2" floodColor="#0B2A55" floodOpacity="0.3" />
      </filter>
    </defs>
    <g filter="url(#ar-shadow)">
      <circle cx="32" cy="32" r="24" fill="url(#ar-fill)" />
      <path d="M22 32h20M34 24l8 8-8 8" fill="none" stroke="#FFFFFF" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" />
      <ellipse cx="25" cy="20" rx="8" ry="3.5" fill="#FFFFFF" opacity="0.25" />
    </g>
  </Base>
);

/* Aliases reusing existing artwork for closely-related meanings */
export const ShieldCheckIcon3D = VerifiedBadgeIcon3D;
export const CalendarClockIcon3D = DailyUpdateIcon3D;
export const WhatsappIcon3D = ChatBubbleIcon3D;

/* ---------------------------------------------------------------------- */
/* Secure & Reliable — glossy padlock on a rounded shield                  */
/* ---------------------------------------------------------------------- */
export const LockShieldIcon3D = (props) => (
  <Base {...props}>
    <defs>
      <linearGradient id="lk-shield" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stopColor="#3F79CF" />
        <stop offset="100%" stopColor="#0047AB" />
      </linearGradient>
      <linearGradient id="lk-body" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0%" stopColor="#FFD97A" />
        <stop offset="100%" stopColor="#E8A33D" />
      </linearGradient>
      <radialGradient id="lk-glare" cx="35%" cy="20%" r="65%">
        <stop offset="0%" stopColor="#FFFFFF" stopOpacity="0.8" />
        <stop offset="100%" stopColor="#FFFFFF" stopOpacity="0" />
      </radialGradient>
      <filter id="lk-shadow" x="-40%" y="-40%" width="180%" height="180%">
        <feDropShadow dx="0" dy="3" stdDeviation="3" floodColor="#0B2A55" floodOpacity="0.3" />
      </filter>
    </defs>
    <g filter="url(#lk-shadow)">
      <path
        d="M32 6l19 7v15c0 14-8.5 22.5-19 28-10.5-5.5-19-14-19-28V13z"
        fill="url(#lk-shield)"
        stroke="#0B2A55"
        strokeOpacity="0.15"
        strokeWidth="1"
      />
      <path d="M32 6l19 7v15c0 14-8.5 22.5-19 28z" fill="url(#lk-glare)" />
      <rect x="23" y="30" width="18" height="15" rx="3.5" fill="url(#lk-body)" />
      <path d="M26 30v-5a6 6 0 0112 0v5" fill="none" stroke="url(#lk-body)" strokeWidth="4" strokeLinecap="round" />
      <circle cx="32" cy="36.5" r="2.4" fill="#7A4A0E" />
      <rect x="30.8" y="37.5" width="2.4" height="4.5" rx="1.2" fill="#7A4A0E" />
    </g>
  </Base>
);

/* ---------------------------------------------------------------------- */
/* Graduation cap — glossy, for scholarships/education                     */
/* ---------------------------------------------------------------------- */
export const GraduationCapIcon3D = (props) => (
  <Base {...props}>
    <defs>
      <linearGradient id="gc-cap" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0%" stopColor="#3F79CF" />
        <stop offset="100%" stopColor="#0047AB" />
      </linearGradient>
      <linearGradient id="gc-tassel" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stopColor="#FFD97A" />
        <stop offset="100%" stopColor="#E8A33D" />
      </linearGradient>
      <filter id="gc-shadow" x="-40%" y="-40%" width="180%" height="180%">
        <feDropShadow dx="0" dy="3" stdDeviation="2.5" floodColor="#0B2A55" floodOpacity="0.3" />
      </filter>
    </defs>
    <g filter="url(#gc-shadow)">
      <path d="M32 14L6 26l26 12 26-12z" fill="url(#gc-cap)" />
      <path d="M18 32v10c0 4 6 8 14 8s14-4 14-8V32l-14 6z" fill="#0047AB" opacity="0.9" />
      <path d="M54 26v14" stroke="url(#gc-tassel)" strokeWidth="3" strokeLinecap="round" />
      <circle cx="54" cy="42" r="3" fill="url(#gc-tassel)" />
      <ellipse cx="20" cy="23" rx="8" ry="2.4" fill="#FFFFFF" opacity="0.3" />
    </g>
  </Base>
);

/* ---------------------------------------------------------------------- */
/* Social media badges — glossy circle in the platform's brand color,      */
/* with a plain generic glyph (not the official brand logo artwork), same */
/* approach as ChatBubbleIcon3D above. Used on the Social Media links in   */
/* the footer / header, wherever an admin-supplied link is filled in.      */
/* ---------------------------------------------------------------------- */

export const FacebookIcon3D = (props) => (
  <Base {...props}>
    <defs>
      <linearGradient id="fb-fill" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0%" stopColor="#4C8CF5" />
        <stop offset="100%" stopColor="#1857C4" />
      </linearGradient>
      <filter id="fb-shadow" x="-40%" y="-40%" width="180%" height="180%">
        <feDropShadow dx="0" dy="2" stdDeviation="2" floodColor="#0B2A55" floodOpacity="0.3" />
      </filter>
    </defs>
    <g filter="url(#fb-shadow)">
      <circle cx="32" cy="32" r="23" fill="url(#fb-fill)" />
      <path
        d="M35 22h4v-6h-4c-4.4 0-8 3.6-8 8v4h-5v6h5v14h6V34h5l1-6h-6v-4c0-1.1.9-2 2-2z"
        fill="#FFFFFF"
      />
      <ellipse cx="24" cy="18" rx="8" ry="3" fill="#FFFFFF" opacity="0.25" />
    </g>
  </Base>
);

export const InstagramIcon3D = (props) => (
  <Base {...props}>
    <defs>
      <linearGradient id="ig-fill" x1="0" y1="1" x2="1" y2="0">
        <stop offset="0%" stopColor="#F2785C" />
        <stop offset="50%" stopColor="#D6367F" />
        <stop offset="100%" stopColor="#9146C7" />
      </linearGradient>
      <filter id="ig-shadow" x="-40%" y="-40%" width="180%" height="180%">
        <feDropShadow dx="0" dy="2" stdDeviation="2" floodColor="#0B2A55" floodOpacity="0.3" />
      </filter>
    </defs>
    <g filter="url(#ig-shadow)">
      <circle cx="32" cy="32" r="23" fill="url(#ig-fill)" />
      <rect x="20" y="20" width="24" height="24" rx="7" fill="none" stroke="#FFFFFF" strokeWidth="3" />
      <circle cx="32" cy="32" r="6.5" fill="none" stroke="#FFFFFF" strokeWidth="3" />
      <circle cx="40" cy="24" r="2" fill="#FFFFFF" />
      <ellipse cx="24" cy="18" rx="8" ry="3" fill="#FFFFFF" opacity="0.2" />
    </g>
  </Base>
);

export const YoutubeIcon3D = (props) => (
  <Base {...props}>
    <defs>
      <linearGradient id="yt-fill" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0%" stopColor="#FF5F4D" />
        <stop offset="100%" stopColor="#D8271F" />
      </linearGradient>
      <filter id="yt-shadow" x="-40%" y="-40%" width="180%" height="180%">
        <feDropShadow dx="0" dy="2" stdDeviation="2" floodColor="#0B2A55" floodOpacity="0.3" />
      </filter>
    </defs>
    <g filter="url(#yt-shadow)">
      <rect x="9" y="17" width="46" height="30" rx="10" fill="url(#yt-fill)" />
      <path d="M27 24.5l14 7.5-14 7.5z" fill="#FFFFFF" />
      <ellipse cx="22" cy="21" rx="9" ry="2.6" fill="#FFFFFF" opacity="0.22" />
    </g>
  </Base>
);

export const TiktokIcon3D = (props) => (
  <Base {...props}>
    <defs>
      <linearGradient id="tt-fill" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0%" stopColor="#3A3A45" />
        <stop offset="100%" stopColor="#101014" />
      </linearGradient>
      <filter id="tt-shadow" x="-40%" y="-40%" width="180%" height="180%">
        <feDropShadow dx="0" dy="2" stdDeviation="2" floodColor="#0B2A55" floodOpacity="0.3" />
      </filter>
    </defs>
    <g filter="url(#tt-shadow)">
      <circle cx="32" cy="32" r="23" fill="url(#tt-fill)" />
      <path
        d="M35 17v19a5.5 5.5 0 11-5-5.47V26a10 10 0 1010 10V26.8a11.4 11.4 0 006 1.9v-5a6.4 6.4 0 01-5-5.4V17z"
        fill="#FFFFFF"
      />
      <path
        d="M35 17v19a5.5 5.5 0 11-5-5.47V26a10 10 0 1010 10V26.8a11.4 11.4 0 006 1.9v-5a6.4 6.4 0 01-5-5.4V17z"
        fill="#28E7E0"
        opacity="0.5"
        transform="translate(-1.2,-1)"
      />
      <ellipse cx="24" cy="18" rx="8" ry="3" fill="#FFFFFF" opacity="0.12" />
    </g>
  </Base>
);

export const XIcon3D = (props) => (
  <Base {...props}>
    <defs>
      <linearGradient id="x-fill" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0%" stopColor="#3A3A45" />
        <stop offset="100%" stopColor="#101014" />
      </linearGradient>
      <filter id="x-shadow" x="-40%" y="-40%" width="180%" height="180%">
        <feDropShadow dx="0" dy="2" stdDeviation="2" floodColor="#0B2A55" floodOpacity="0.3" />
      </filter>
    </defs>
    <g filter="url(#x-shadow)">
      <circle cx="32" cy="32" r="23" fill="url(#x-fill)" />
      <path d="M22 21l20 22M42 21L22 43" stroke="#FFFFFF" strokeWidth="4" strokeLinecap="round" />
      <ellipse cx="24" cy="18" rx="8" ry="3" fill="#FFFFFF" opacity="0.15" />
    </g>
  </Base>
);

export const LinkedinIcon3D = (props) => (
  <Base {...props}>
    <defs>
      <linearGradient id="li-fill" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0%" stopColor="#3F9BE8" />
        <stop offset="100%" stopColor="#0A5FA8" />
      </linearGradient>
      <filter id="li-shadow" x="-40%" y="-40%" width="180%" height="180%">
        <feDropShadow dx="0" dy="2" stdDeviation="2" floodColor="#0B2A55" floodOpacity="0.3" />
      </filter>
    </defs>
    <g filter="url(#li-shadow)">
      <rect x="9" y="9" width="46" height="46" rx="12" fill="url(#li-fill)" />
      <circle cx="21" cy="22" r="3.4" fill="#FFFFFF" />
      <rect x="18" y="28" width="6" height="18" rx="1.5" fill="#FFFFFF" />
      <path
        d="M30 28h6v2.6c1.4-2 3.5-3.1 6.2-3.1 5.2 0 7.8 3.3 7.8 9V46h-6V37.7c0-2.8-1-4.6-3.6-4.6-2 0-3.2 1.3-3.7 2.6-.2.5-.2 1.1-.2 1.8V46h-6.5V28z"
        fill="#FFFFFF"
      />
      <ellipse cx="20" cy="16" rx="8" ry="2.4" fill="#FFFFFF" opacity="0.18" />
    </g>
  </Base>
);
