/**
 * Illustrations.jsx
 * -----------------------------------------------------------------------
 * Airbnb-style illustrated icons: soft, multi-colour flat artwork instead of
 * thin outline icons. Used for the home category row, the header tabs and the
 * "photo" area of every job card (so cards look like listing photos).
 *
 *   <Illustration kind="bank" className="h-10 w-10" />
 *   <JobScene kind={kindForJob(job)} />
 *
 * Colours: a small fixed palette (coral, teal, amber, charcoal) plus the
 * active theme's brand colour (`fill-brand-500`) for the main accent.
 * -----------------------------------------------------------------------
 */

const C = {
  teal: '#00A699',
  tealSoft: '#B9E8E3',
  amber: '#FFB400',
  amberDark: '#E39E00',
  amberSoft: '#FFE39A',
  orange: '#FC642D',
  ink: '#484848',
  navy: '#3F4E73',
  line: '#E4E4E4',
  white: '#FFFFFF',
};

const ART = {
  // Government building with columns and a flag
  gov: (
    <>
      <ellipse cx="32" cy="57" rx="26" ry="3" fill="#000" opacity=".08" />
      <rect x="5" y="51" width="54" height="5" rx="2" fill="#D9D9D9" />
      <rect x="9" y="47" width="46" height="5" rx="1.5" fill="#EDEDED" />
      <rect x="10" y="22" width="44" height="5" rx="1.5" className="fill-brand-200" />
      <path d="M32 9L7 22h50L32 9z" className="fill-brand-500" />
      <circle cx="32" cy="18" r="3" fill={C.white} />
      {[13, 22.5, 32, 41.5, 51].map((x) => (
        <rect key={x} x={x - 2.5} y="28" width="5" height="19" rx="1.5" fill={C.white} stroke="#F2C5CD" strokeWidth="1" />
      ))}
      <rect x="31.2" y="2" width="1.6" height="8" fill={C.ink} />
      <path d="M32.8 2.5h9l-2 3 2 3h-9z" fill={C.teal} />
    </>
  ),
  // Private sector: skyline + briefcase
  private: (
    <>
      <ellipse cx="32" cy="57" rx="26" ry="3" fill="#000" opacity=".08" />
      <rect x="6" y="14" width="16" height="40" rx="2" fill={C.tealSoft} />
      <rect x="42" y="8" width="16" height="46" rx="2" fill={C.teal} opacity=".55" />
      {[18, 26, 34].map((y) => (
        <g key={y}>
          <rect x="10" y={y} width="3" height="4" fill={C.white} />
          <rect x="15" y={y} width="3" height="4" fill={C.white} />
          <rect x="46" y={y - 4} width="3" height="4" fill={C.white} />
          <rect x="51" y={y - 4} width="3" height="4" fill={C.white} />
        </g>
      ))}
      <path d="M26 30v-4a4 4 0 014-4h4a4 4 0 014 4v4" fill="none" stroke={C.ink} strokeWidth="3" strokeLinecap="round" />
      <rect x="14" y="30" width="36" height="24" rx="5" fill={C.amber} />
      <rect x="14" y="40" width="36" height="3.5" fill={C.amberDark} />
      <rect x="28.5" y="38" width="7" height="8" rx="1.8" fill={C.white} />
    </>
  ),
  // Bank: roof, columns, coin
  bank: (
    <>
      <ellipse cx="32" cy="57" rx="26" ry="3" fill="#000" opacity=".08" />
      <path d="M32 7L8 20v4h48v-4L32 7z" fill={C.teal} />
      <circle cx="32" cy="16.500" r="3.200" fill={C.white} />
      <rect x="8" y="24" width="48" height="4" fill={C.tealSoft} />
      {[14, 25, 36, 47].map((x) => (
        <rect key={x} x={x - 2.500} y="29" width="5" height="19" rx="1.500" fill={C.white} stroke={C.tealSoft} strokeWidth="1" />
      ))}
      <rect x="6" y="48" width="52" height="5" rx="1.500" fill="#D9D9D9" />
      <circle cx="49" cy="46" r="10" fill={C.amber} />
      <circle cx="49" cy="46" r="7" fill="none" stroke={C.amberDark} strokeWidth="1.600" />
      <path d="M49 41v10M46.500 43.500c0-1.500 5-1.500 5 0s-5 1.800-5 3.500 5 2 5 .5" fill="none" stroke={C.amberDark} strokeWidth="1.600" strokeLinecap="round" />
    </>
  ),
  // Teaching: blackboard + apple
  teach: (
    <>
      <ellipse cx="32" cy="57" rx="26" ry="3" fill="#000" opacity=".08" />
      <rect x="6" y="8" width="52" height="34" rx="4" fill="#A8743E" />
      <rect x="10" y="12" width="44" height="26" rx="2" fill={C.teal} />
      <path d="M16 20h18M16 26h26M16 32h12" stroke={C.white} strokeWidth="2.500" strokeLinecap="round" opacity=".9" />
      <circle cx="46" cy="30" r="5" fill="none" stroke={C.white} strokeWidth="2" opacity=".9" />
      <rect x="14" y="42" width="3" height="12" fill="#8A5C2D" />
      <rect x="47" y="42" width="3" height="12" fill="#8A5C2D" />
      <rect x="24" y="44" width="16" height="3" rx="1.500" fill={C.white} stroke={C.line} />
      <circle cx="50" cy="50" r="6" className="fill-brand-500" />
      <path d="M50 44.500c0-2 1-3.500 3-4" stroke={C.teal} strokeWidth="2" strokeLinecap="round" fill="none" />
    </>
  ),
  // Police / security: shield with star
  police: (
    <>
      <ellipse cx="32" cy="58" rx="20" ry="3" fill="#000" opacity=".08" />
      <path d="M32 5l21 8v16c0 14-9 23-21 29C20 52 11 43 11 29V13l21-8z" fill={C.navy} />
      <path d="M32 10l16 6v13c0 10.500-6.500 17.500-16 22.500C22.500 46.500 16 39.500 16 29V16l16-6z" fill="#566893" />
      <path d="M32 19l3.200 6.500 7.100 1-5.200 5 1.300 7.100L32 35.200l-6.400 3.400 1.300-7.100-5.200-5 7.100-1L32 19z" fill={C.amber} />
    </>
  ),
  // Health: medical cross
  health: (
    <>
      <ellipse cx="32" cy="58" rx="22" ry="3" fill="#000" opacity=".08" />
      <rect x="7" y="7" width="50" height="50" rx="15" fill={C.white} stroke={C.line} strokeWidth="2" />
      <rect x="26" y="15" width="12" height="34" rx="4" className="fill-brand-500" />
      <rect x="15" y="26" width="34" height="12" rx="4" className="fill-brand-500" />
      <circle cx="32" cy="32" r="4" fill={C.white} />
    </>
  ),
  // IT / software: laptop with code
  tech: (
    <>
      <ellipse cx="32" cy="57" rx="27" ry="3" fill="#000" opacity=".08" />
      <rect x="11" y="10" width="42" height="30" rx="4" fill={C.ink} />
      <rect x="14.500" y="13.500" width="35" height="23" rx="2" fill={C.teal} />
      <path d="M26 20l-5 5.500 5 5.500M38 20l5 5.500-5 5.500M34 18l-4 15" fill="none" stroke={C.white} strokeWidth="2.600" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M5 45h54l-3 7a3 3 0 01-2.800 2H10.800A3 3 0 018 52l-3-7z" fill="#CFCFCF" />
      <rect x="26" y="45" width="12" height="2.500" rx="1.200" fill="#B5B5B5" />
    </>
  ),
  // Engineering: hard hat
  engineer: (
    <>
      <ellipse cx="32" cy="57" rx="26" ry="3" fill="#000" opacity=".08" />
      <path d="M10 42C10 26 20 16 32 16s22 10 22 26H10z" fill={C.amber} />
      <path d="M26 16.500h12V42H26z" fill={C.amberSoft} />
      <rect x="29" y="12" width="6" height="8" rx="2" fill={C.amberDark} />
      <rect x="5" y="42" width="54" height="8" rx="4" fill={C.amberDark} />
      <path d="M14 34c1-6 4-10 8-12" stroke={C.white} strokeWidth="2.500" strokeLinecap="round" fill="none" opacity=".7" />
    </>
  ),
  // Provinces
  punjab: (
    <>
      <ellipse cx="32" cy="57" rx="22" ry="3" fill="#000" opacity=".08" />
      <path d="M32 54V22" stroke={C.teal} strokeWidth="3" strokeLinecap="round" />
      {[[0, 14], [1, 24], [2, 34]].map(([i, y]) => (
        <g key={i}>
          <ellipse cx="24.500" cy={y + 6} rx="4" ry="7" transform={`rotate(-35 24.500 ${y + 6})`} fill={C.amber} />
          <ellipse cx="39.500" cy={y + 6} rx="4" ry="7" transform={`rotate(35 39.500 ${y + 6})`} fill={C.amberDark} />
        </g>
      ))}
      <ellipse cx="32" cy="10" rx="4" ry="8" fill={C.amber} />
    </>
  ),
  sindh: (
    <>
      <ellipse cx="32" cy="57" rx="24" ry="3" fill="#000" opacity=".08" />
      <rect x="10" y="36" width="44" height="18" rx="2" fill={C.tealSoft} />
      <path d="M14 36c0-14 8-22 18-22s18 8 18 22H14z" fill={C.teal} />
      <rect x="31" y="6" width="2" height="9" fill={C.ink} />
      <circle cx="32" cy="6" r="2.200" fill={C.amber} />
      <path d="M26 54V44a6 6 0 0112 0v10z" fill={C.white} />
      <rect x="16" y="40" width="5" height="8" rx="2.500" fill={C.white} />
      <rect x="43" y="40" width="5" height="8" rx="2.500" fill={C.white} />
    </>
  ),
  kpk: (
    <>
      <ellipse cx="32" cy="57" rx="26" ry="3" fill="#000" opacity=".08" />
      <circle cx="46" cy="14" r="6" fill={C.amber} />
      <path d="M2 54L24 14l14 24 6-9 18 25H2z" fill="#6B7C93" />
      <path d="M24 14l-7 12.500 4-2.500 3 3 3-3 4 2.500L24 14z" fill={C.white} />
      <path d="M44 29l-5.500 9.500 3-1.500 2.500 2 2.500-2 3 1.500L44 29z" fill={C.white} />
      <path d="M2 54l16-18 12 18H2z" fill="#4F5F78" opacity=".6" />
    </>
  ),
  balochistan: (
    <>
      <ellipse cx="32" cy="57" rx="26" ry="3" fill="#000" opacity=".08" />
      <circle cx="44" cy="18" r="9" className="fill-brand-500" />
      <path d="M2 50c8-14 16-14 24-4 8-14 18-14 36 4v6H2z" fill={C.amber} />
      <path d="M2 56c10-8 20-8 28-2 8-6 20-6 32 2v2H2z" fill={C.amberDark} />
      <path d="M12 40c-1-6 0-11 0-11M12 34l-4-4M12 36l4-4" stroke={C.teal} strokeWidth="2.600" strokeLinecap="round" fill="none" />
    </>
  ),
  islamabad: (
    <>
      <ellipse cx="32" cy="57" rx="26" ry="3" fill="#000" opacity=".08" />
      <path d="M6 54L32 18l26 36H6z" fill={C.white} stroke={C.line} strokeWidth="2" strokeLinejoin="round" />
      <path d="M32 18L22 54h20L32 18z" fill={C.tealSoft} />
      {[4, 60].map((x) => (
        <g key={x}>
          <rect x={x - 2} y="22" width="4" height="32" fill="#EDEDED" />
          <path d={`M${x - 2} 22l2-7 2 7z`} fill={C.teal} />
        </g>
      ))}
      <path d="M28 54V44a4 4 0 018 0v10z" fill={C.teal} />
    </>
  ),
  // Header tabs
  home: (
    <>
      <ellipse cx="32" cy="57" rx="24" ry="3" fill="#000" opacity=".08" />
      <rect x="12" y="28" width="40" height="26" rx="3" fill={C.amberSoft} />
      <path d="M5 31L32 9l27 22" fill="none" stroke="" />
      <path d="M32 7L4 30h8l20-17 20 17h8L32 7z" className="fill-brand-500" />
      <rect x="27" y="38" width="10" height="16" rx="2" className="fill-brand-500" />
      <rect x="16" y="34" width="8" height="8" rx="1.500" fill={C.white} />
      <rect x="40" y="34" width="8" height="8" rx="1.500" fill={C.white} />
    </>
  ),
  study: (
    <>
      <ellipse cx="32" cy="57" rx="26" ry="3" fill="#000" opacity=".08" />
      <path d="M32 10L4 24l28 14 28-14L32 10z" fill={C.ink} />
      <path d="M14 32v11c0 4 8 8 18 8s18-4 18-8V32L32 40 14 32z" fill="#6B6B6B" />
      <path d="M56 26v16" stroke={C.amber} strokeWidth="3" strokeLinecap="round" />
      <circle cx="56" cy="45" r="3.500" fill={C.amber} />
    </>
  ),
  medal: (
    <>
      <ellipse cx="32" cy="58" rx="20" ry="3" fill="#000" opacity=".08" />
      <path d="M18 4h12l6 18H24L18 4z" className="fill-brand-500" />
      <path d="M46 4H34l-6 18h12l6-18z" fill={C.teal} />
      <circle cx="32" cy="40" r="17" fill={C.amber} />
      <circle cx="32" cy="40" r="12" fill={C.amberSoft} />
      <path d="M32 31l2.800 5.600 6.200.9-4.500 4.400 1.100 6.200L32 45.200l-5.600 2.900 1.100-6.200-4.500-4.400 6.200-.9L32 31z" fill={C.amberDark} />
    </>
  ),
  mail: (
    <>
      <ellipse cx="32" cy="57" rx="26" ry="3" fill="#000" opacity=".08" />
      <rect x="6" y="14" width="52" height="38" rx="6" fill={C.white} stroke={C.line} strokeWidth="2" />
      <path d="M8 18l24 18 24-18" fill="none" className="stroke-brand-500" strokeWidth="3.500" strokeLinejoin="round" strokeLinecap="round" />
      <circle cx="52" cy="14" r="7" fill={C.amber} />
    </>
  ),
};

export const ILLUSTRATION_KINDS = Object.keys(ART);

export function Illustration({ kind = 'gov', className = 'h-10 w-10' }) {
  return (
    <svg viewBox="0 0 64 64" className={className} aria-hidden="true">
      {ART[kind] || ART.gov}
    </svg>
  );
}

// Soft pastel backgrounds per kind (the job-card "photo").
const BG = {
  gov: ['#FFE0E6', '#FFF3F5'],
  private: ['#FFF0CC', '#FFF9E8'],
  bank: ['#D4F1EE', '#EEF9F8'],
  teach: ['#DCEBFF', '#F2F7FF'],
  police: ['#E1E6F5', '#F4F6FB'],
  health: ['#FFE0E6', '#FFF3F5'],
  tech: ['#D9F0EE', '#F0FAF9'],
  engineer: ['#FFEBC2', '#FFF8E6'],
};

/** Big illustrated "photo" for a job card. Fills its (relatively positioned) parent. */
export function JobScene({ kind = 'gov', className = '' }) {
  const [from, to] = BG[kind] || BG.gov;
  return (
    <div
      className={`absolute inset-0 overflow-hidden ${className}`}
      style={{ background: `linear-gradient(145deg, ${from}, ${to})` }}
      aria-hidden="true"
    >
      <span className="absolute -right-8 -top-8 h-36 w-36 rounded-full bg-white/60" />
      <span className="absolute -bottom-10 -left-8 h-32 w-32 rounded-full bg-white/50" />
      <span className="absolute right-6 top-1/3 h-3 w-3 rounded-full bg-white/80" />
      <span className="absolute bottom-8 left-8 h-2 w-2 rounded-full bg-white/80" />
      <div className="absolute inset-0 flex items-center justify-center">
        <Illustration kind={kind} className="h-[58%] w-[58%] drop-shadow-md transition duration-500 group-hover:scale-110" />
      </div>
    </div>
  );
}

/** Pick the illustration that best matches a job (title, department, category). */
export function kindForJob(job = {}) {
  const t = `${job.title || ''} ${job.department || ''} ${job.category || ''}`.toLowerCase();
  const has = (...w) => w.some((x) => t.includes(x));
  if (has('bank', 'finance', 'accountant', 'accounts', 'audit', 'cashier', 'treasury')) return 'bank';
  if (has('teacher', 'teaching', 'lecturer', 'professor', 'school', 'college', 'university', 'education', 'educator', 'instructor', 'tutor')) return 'teach';
  if (has('police', 'constable', 'security', 'army', 'rangers', 'levies', 'guard', 'fia', 'navy', 'force', 'sipahi')) return 'police';
  if (has('nurse', 'doctor', 'medical', 'health', 'hospital', 'pharmac', 'dispenser', 'paramedic', 'dental', 'clinic', 'mbbs')) return 'health';
  if (has('software', 'developer', 'programmer', 'web ', ' it ', 'it officer', 'data entry', 'computer', 'network', 'digital', 'tech')) return 'tech';
  if (has('engineer', 'overseer', 'sub engineer', 'civil', 'electrician', 'mechanic', 'technician', 'driver', 'works', 'nha', 'wapda')) return 'engineer';
  return job.job_type === 'Private' ? 'private' : 'gov';
}
