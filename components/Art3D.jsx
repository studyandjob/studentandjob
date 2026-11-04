import { Children, cloneElement, isValidElement, useId } from 'react';
/**
 * Art3D.jsx
 * -----------------------------------------------------------------------
 * Airbnb-style illustrated ("3D") icons, drawn as inline SVG so they are
 * crisp at any size and need no image files. Use:
 *   <Art3D name="briefcase" className="h-10 w-10" />
 * Names: globe, briefcase, study, trophy, medal, mail, building, office,
 *        bank, teacher, shield, pin (color prop), star, book, doc, gift, bell, phone
 * -----------------------------------------------------------------------
 */

const Shadow = () => <ellipse cx="32" cy="58" rx="16" ry="3" fill="#000" opacity="0.14" />;

function G({ id, from, to, x1 = 0, y1 = 0, x2 = 0, y2 = 1 }) {
  return (
    <linearGradient id={id} x1={x1} y1={y1} x2={x2} y2={y2}>
      <stop offset="0" stopColor={from} />
      <stop offset="1" stopColor={to} />
    </linearGradient>
  );
}

const ART = {
  globe: () => (
    <>
      <defs>
        <G id="ag-globe" from="#7CD1FF" to="#2B72C9" x1={0.2} y1={0} x2={0.8} y2={1} />
        <G id="ag-gland" from="#8BE05A" to="#3E9C3A" />
        <G id="ag-gbase" from="#B07A44" to="#7A4A1F" />
      </defs>
      <Shadow />
      <path d="M20 54h24l-3-6H23z" fill="url(#ag-gbase)" />
      <path d="M14 30a18 18 0 0 0 11 21" fill="none" stroke="#C99A5B" strokeWidth="2.5" strokeLinecap="round" />
      <circle cx="32" cy="29" r="19" fill="url(#ag-globe)" />
      <path d="M22 18c5-3 10-1 11 3s-5 5-6 9-7 3-9-1 0-8 4-11z" fill="url(#ag-gland)" />
      <path d="M38 33c4-2 9 0 9 5s-4 8-8 7-4-6-3-9 0-2 2-3z" fill="url(#ag-gland)" />
      <ellipse cx="24" cy="18" rx="7" ry="4" transform="rotate(-30 24 18)" fill="#fff" opacity="0.35" />
    </>
  ),
  briefcase: () => (
    <>
      <defs>
        <G id="ag-bc" from="#F2B35C" to="#C06E1C" />
        <G id="ag-bc2" from="#D98B33" to="#A4570F" />
        <G id="ag-gold" from="#FFE27A" to="#E5A100" />
      </defs>
      <Shadow />
      <path d="M24 20v-4a4 4 0 0 1 4-4h8a4 4 0 0 1 4 4v4" fill="none" stroke="#8A4E14" strokeWidth="3.5" strokeLinecap="round" />
      <rect x="8" y="19" width="48" height="33" rx="7" fill="url(#ag-bc)" />
      <path d="M8 33h48v-7a7 7 0 0 0-7-7H15a7 7 0 0 0-7 7z" fill="url(#ag-bc2)" />
      <rect x="27" y="30" width="10" height="8" rx="2.500" fill="url(#ag-gold)" />
      <rect x="11" y="22" width="42" height="4" rx="2" fill="#fff" opacity="0.28" />
    </>
  ),
  study: () => (
    <>
      <defs>
        <G id="ag-cap" from="#4A5F9E" to="#1B2650" />
        <G id="ag-capb" from="#34457E" to="#141C3E" />
        <G id="ag-bk" from="#FF6B6B" to="#C92A3E" />
        <G id="ag-gold" from="#FFE27A" to="#E5A100" />
      </defs>
      <Shadow />
      <rect x="10" y="42" width="44" height="10" rx="3" fill="url(#ag-bk)" />
      <rect x="12" y="44" width="40" height="2.500" rx="1.200" fill="#fff" opacity="0.35" />
      <path d="M18 28v9c0 3 6 6 14 6s14-3 14-6v-9z" fill="url(#ag-capb)" />
      <path d="M32 10 4 22l28 12 28-12z" fill="url(#ag-cap)" />
      <path d="M32 12 12 21l20 8" fill="none" stroke="#fff" strokeWidth="1.500" opacity="0.35" strokeLinecap="round" />
      <path d="M56 24v14" stroke="#E5A100" strokeWidth="2.500" strokeLinecap="round" />
      <circle cx="56" cy="40" r="3" fill="url(#ag-gold)" />
    </>
  ),
  trophy: () => (
    <>
      <defs>
        <G id="ag-gold" from="#FFE27A" to="#E5A100" x1={0} y1={0} x2={1} y2={1} />
        <G id="ag-tb" from="#8B5A2B" to="#5A3512" />
      </defs>
      <Shadow />
      <rect x="20" y="50" width="24" height="7" rx="2.500" fill="url(#ag-tb)" />
      <rect x="28" y="42" width="8" height="9" fill="url(#ag-gold)" />
      <path d="M17 12h30v14c0 9-7 16-15 16s-15-7-15-16z" fill="url(#ag-gold)" />
      <path d="M17 16H9c0 9 4 14 10 14M47 16h8c0 9-4 14-10 14" fill="none" stroke="#E5A100" strokeWidth="3" strokeLinecap="round" />
      <path d="m32 18 2.600 5.300 5.800.8-4.200 4.100 1 5.800-5.200-2.700-5.200 2.700 1-5.800-4.200-4.100 5.800-.8z" fill="#fff" opacity="0.85" />
      <path d="M21 14v12c0 6 3 10 7 12" fill="none" stroke="#fff" strokeWidth="2.500" opacity="0.4" strokeLinecap="round" />
    </>
  ),
  medal: () => (
    <>
      <defs>
        <G id="ag-gold" from="#FFE27A" to="#E5A100" x1={0} y1={0} x2={1} y2={1} />
        <G id="ag-rb1" from="#5AA9FF" to="#2563C9" />
        <G id="ag-rb2" from="#FF6B8A" to="#D62A52" />
      </defs>
      <Shadow />
      <path d="M17 4h14l7 22H24z" fill="url(#ag-rb1)" />
      <path d="M47 4H33l-7 22h14z" fill="url(#ag-rb2)" />
      <circle cx="32" cy="40" r="15" fill="url(#ag-gold)" />
      <circle cx="32" cy="40" r="10.500" fill="none" stroke="#fff" strokeWidth="2" opacity="0.55" />
      <path d="m32 33 2.200 4.500 5 .7-3.600 3.500.9 5L32 44.300 27.500 46.700l.9-5-3.600-3.500 5-.7z" fill="#fff" opacity="0.9" />
      <ellipse cx="26" cy="32" rx="5" ry="2.500" transform="rotate(-35 26 32)" fill="#fff" opacity="0.4" />
    </>
  ),
  mail: () => (
    <>
      <defs>
        <G id="ag-env" from="#FFFFFF" to="#DCE6F5" />
        <G id="ag-flap" from="#6DB4FF" to="#2E78E0" />
      </defs>
      <Shadow />
      <rect x="6" y="14" width="52" height="38" rx="7" fill="url(#ag-env)" />
      <path d="M8 18l24 18 24-18" fill="none" stroke="#B9C9E3" strokeWidth="1.500" />
      <path d="M7 16a6 6 0 0 1 6-4h38a6 6 0 0 1 6 4L32 36z" fill="url(#ag-flap)" />
      <path d="M12 15h40" stroke="#fff" strokeWidth="2" opacity="0.4" strokeLinecap="round" />
      <circle cx="49" cy="44" r="7" fill="#FF4D6A" />
      <path d="M49 47.500s-4-2.200-4-4.800a2.200 2.200 0 0 1 4-1.300 2.200 2.200 0 0 1 4 1.300c0 2.600-4 4.800-4 4.800z" fill="#fff" />
    </>
  ),
  building: () => (
    <>
      <defs>
        <G id="ag-wall" from="#FFF6E5" to="#E8D3AA" />
        <G id="ag-gold" from="#FFE27A" to="#E5A100" />
        <G id="ag-roof" from="#F5E6C4" to="#CDB27A" />
      </defs>
      <Shadow />
      <path d="M32 6 6 20h52z" fill="url(#ag-roof)" />
      <path d="M12 20h40" stroke="#fff" strokeWidth="2" opacity="0.5" />
      <circle cx="32" cy="15" r="2.500" fill="url(#ag-gold)" />
      <rect x="10" y="22" width="44" height="4" rx="1" fill="url(#ag-wall)" />
      {[14, 24, 34, 44].map((x) => (
        <rect key={x} x={x} y="26" width="6" height="22" rx="1.500" fill="url(#ag-wall)" stroke="#D2B97F" strokeWidth="0.8" />
      ))}
      <rect x="7" y="48" width="50" height="4" rx="1" fill="url(#ag-roof)" />
      <rect x="4" y="52" width="56" height="5" rx="1.500" fill="url(#ag-wall)" />
    </>
  ),
  office: () => (
    <>
      <defs>
        <G id="ag-t1" from="#7FB6FF" to="#2F6BD0" />
        <G id="ag-t2" from="#A8D0FF" to="#4C86DD" />
      </defs>
      <Shadow />
      <rect x="10" y="22" width="22" height="34" rx="3" fill="url(#ag-t2)" />
      <rect x="26" y="8" width="26" height="48" rx="3.500" fill="url(#ag-t1)" />
      {[14, 22, 30, 38, 46].map((y) => (
        <g key={y}>
          <rect x="31" y={y} width="5" height="4" rx="1" fill="#fff" opacity="0.8" />
          <rect x="42" y={y} width="5" height="4" rx="1" fill="#fff" opacity="0.8" />
        </g>
      ))}
      {[28, 36, 44].map((y) => (
        <g key={y}>
          <rect x="14" y={y} width="4" height="4" rx="1" fill="#fff" opacity="0.8" />
          <rect x="22" y={y} width="4" height="4" rx="1" fill="#fff" opacity="0.8" />
        </g>
      ))}
      <rect x="29" y="11" width="3" height="42" fill="#fff" opacity="0.12" />
    </>
  ),
  bank: () => (
    <>
      <defs>
        <G id="ag-wall" from="#FFFFFF" to="#DDE6F2" />
        <G id="ag-roof" from="#5C8FE0" to="#2A5CB4" />
        <G id="ag-gold" from="#FFE27A" to="#E5A100" x1={0} y1={0} x2={1} y2={1} />
      </defs>
      <Shadow />
      <path d="M32 7 6 20h52z" fill="url(#ag-roof)" />
      <rect x="9" y="21" width="46" height="4" rx="1" fill="url(#ag-wall)" />
      {[13, 23, 33, 43].map((x) => (
        <rect key={x} x={x} y="25" width="7" height="21" rx="1.500" fill="url(#ag-wall)" stroke="#BCCADF" strokeWidth="0.8" />
      ))}
      <rect x="6" y="46" width="52" height="5" rx="1.500" fill="url(#ag-wall)" stroke="#BCCADF" strokeWidth="0.8" />
      <circle cx="49" cy="49" r="9" fill="url(#ag-gold)" />
      <circle cx="49" cy="49" r="6" fill="none" stroke="#fff" strokeWidth="1.500" opacity="0.6" />
      <text x="49" y="52.500" textAnchor="middle" fontSize="9" fontWeight="800" fill="#B07A00">$</text>
    </>
  ),
  teacher: () => (
    <>
      <defs>
        <G id="ag-board" from="#3E9B6A" to="#1F6B45" />
        <G id="ag-wood" from="#C98A4B" to="#8A5424" />
      </defs>
      <Shadow />
      <path d="M18 56l6-10M46 56l-6-10" stroke="#8A5424" strokeWidth="3" strokeLinecap="round" />
      <rect x="6" y="9" width="52" height="38" rx="5" fill="url(#ag-wood)" />
      <rect x="10" y="13" width="44" height="30" rx="3" fill="url(#ag-board)" />
      <path d="M16 22h20M16 29h28M16 36h14" stroke="#fff" strokeWidth="2.500" strokeLinecap="round" opacity="0.9" />
      <circle cx="46" cy="36" r="3.500" fill="#FFD54A" />
      <rect x="40" y="43" width="12" height="3" rx="1.500" fill="#fff" />
    </>
  ),
  shield: () => (
    <>
      <defs>
        <G id="ag-sh" from="#6BA6FF" to="#2150B8" />
        <G id="ag-gold" from="#FFE27A" to="#E5A100" />
      </defs>
      <Shadow />
      <path d="M32 5 8 13v17c0 14 10 24 24 28 14-4 24-14 24-28V13z" fill="url(#ag-gold)" />
      <path d="M32 10 13 16.500V30c0 11 8 19 19 23 11-4 19-12 19-23V16.500z" fill="url(#ag-sh)" />
      <path d="m32 21 3.500 7.200 7.800 1.100-5.700 5.500 1.400 7.800L32 38.800l-7 3.800 1.400-7.800-5.700-5.500 7.800-1.100z" fill="#fff" />
      <path d="M17 20 32 14.500" stroke="#fff" strokeWidth="2" opacity="0.35" strokeLinecap="round" />
    </>
  ),
  star: () => (
    <>
      <defs>
        <G id="ag-gold" from="#FFE98A" to="#F0A500" x1={0} y1={0} x2={1} y2={1} />
      </defs>
      <Shadow />
      <path d="m32 5 8.500 17.500 19 2.700-13.800 13.400 3.300 19L32 48.600 15 57.600l3.300-19L4.500 25.200l19-2.700z" fill="url(#ag-gold)" stroke="#F0B400" strokeWidth="1" strokeLinejoin="round" />
      <path d="m32 11 6 12.500" stroke="#fff" strokeWidth="2.500" opacity="0.45" strokeLinecap="round" />
    </>
  ),
  book: () => (
    <>
      <defs>
        <G id="ag-b1" from="#FF8A65" to="#D6482B" />
        <G id="ag-b2" from="#6DB4FF" to="#2E6FD6" />
        <G id="ag-b3" from="#8BD66B" to="#3E9C3A" />
      </defs>
      <Shadow />
      <rect x="8" y="40" width="46" height="12" rx="3" fill="url(#ag-b3)" />
      <rect x="12" y="28" width="42" height="12" rx="3" fill="url(#ag-b2)" />
      <rect x="6" y="16" width="44" height="12" rx="3" fill="url(#ag-b1)" />
      {[[10, 16], [16, 28], [12, 40]].map(([x, y]) => (
        <rect key={y} x={x + 3} y={y + 3} width="26" height="2.500" rx="1.200" fill="#fff" opacity="0.5" />
      ))}
    </>
  ),
  doc: () => (
    <>
      <defs>
        <G id="ag-pg" from="#FFFFFF" to="#DDE6F2" />
        <G id="ag-fold" from="#9CC4FF" to="#4C86DD" />
      </defs>
      <Shadow />
      <path d="M14 6h26l12 12v34a5 5 0 0 1-5 5H14a5 5 0 0 1-5-5V11a5 5 0 0 1 5-5z" fill="url(#ag-pg)" stroke="#C5D3E8" strokeWidth="1" />
      <path d="M40 6v9a3 3 0 0 0 3 3h9z" fill="url(#ag-fold)" />
      <path d="M17 28h28M17 35h28M17 42h18" stroke="#8FA8CE" strokeWidth="3" strokeLinecap="round" />
    </>
  ),
  gift: () => (
    <>
      <defs>
        <G id="ag-gf" from="#FF6B8A" to="#D62A52" />
        <G id="ag-gf2" from="#FF8CA3" to="#E8385F" />
        <G id="ag-gold" from="#FFE27A" to="#E5A100" />
      </defs>
      <Shadow />
      <rect x="10" y="28" width="44" height="26" rx="4" fill="url(#ag-gf)" />
      <rect x="6" y="20" width="52" height="11" rx="4" fill="url(#ag-gf2)" />
      <rect x="28" y="20" width="8" height="34" fill="url(#ag-gold)" />
      <path d="M32 20c-6-1-12-4-10-9s9-2 10 9zM32 20c6-1 12-4 10-9s-9-2-10 9z" fill="url(#ag-gold)" />
    </>
  ),
  bell: () => (
    <>
      <defs>
        <G id="ag-bell" from="#D4DBE6" to="#6E7B90" />
        <G id="ag-bellb" from="#4A5568" to="#232A36" />
      </defs>
      <Shadow />
      <rect x="6" y="46" width="52" height="9" rx="4" fill="url(#ag-bellb)" />
      <path d="M12 46c0-14 8-24 20-24s20 10 20 24z" fill="url(#ag-bell)" />
      <rect x="29" y="14" width="6" height="8" rx="2" fill="#6E7B90" />
      <ellipse cx="25" cy="34" rx="4" ry="9" transform="rotate(12 25 34)" fill="#fff" opacity="0.45" />
    </>
  ),
  phone: () => (
    <>
      <defs>
        <G id="ag-ph" from="#56D58B" to="#1E9E55" />
      </defs>
      <Shadow />
      <circle cx="32" cy="30" r="24" fill="url(#ag-ph)" />
      <path d="M22 18h5l3 7-3.500 2.200a14 14 0 0 0 7 7L36 31l7 3v5a3 3 0 0 1-3 3C29 42 19 31 19 21a3 3 0 0 1 3-3z" fill="#fff" />
      <ellipse cx="22" cy="14" rx="9" ry="4" transform="rotate(-30 22 14)" fill="#fff" opacity="0.3" />
    </>
  ),
};

function Pin({ color = '#FF385C' }) {
  return (
    <>
      <defs>
        <linearGradient id={`ag-pin-${color.slice(1)}`} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor={color} stopOpacity="0.75" />
          <stop offset="0.5" stopColor={color} />
          <stop offset="1" stopColor={color} stopOpacity="0.8" />
        </linearGradient>
      </defs>
      <Shadow />
      <path d="M32 59S12 38 12 25a20 20 0 0 1 40 0c0 13-20 34-20 34z" fill={`url(#ag-pin-${color.slice(1)})`} />
      <circle cx="32" cy="25" r="8.500" fill="#fff" />
      <ellipse cx="23" cy="14" rx="6" ry="3" transform="rotate(-35 23 14)" fill="#fff" opacity="0.4" />
    </>
  );
}

// Gradient ids must be unique per rendered icon: a gradient defined inside a
// display:none <svg> (e.g. the desktop-only header tabs on mobile) would
// otherwise break every other icon that shares the same id.
function uniq(node, sfx) {
  if (Array.isArray(node)) return node.map((n) => uniq(n, sfx));
  if (!isValidElement(node)) return node;
  const p = { ...node.props };
  let changed = false;
  for (const k of Object.keys(p)) {
    const v = p[k];
    if (k === 'id' && typeof v === 'string' && v.startsWith('ag-')) {
      p[k] = `${v}-${sfx}`;
      changed = true;
    } else if (typeof v === 'string' && v.includes('url(#ag-')) {
      p[k] = v.replace(/url\(#(ag-[^)]+)\)/g, `url(#$1-${sfx})`);
      changed = true;
    }
  }
  if (p.children !== undefined) {
    p.children = Children.map(p.children, (c) => uniq(c, sfx));
    changed = true;
  }
  return changed ? cloneElement(node, p) : node;
}

export default function Art3D({ name, className = 'h-10 w-10', color }) {
  const uid = useId().replace(/[^a-zA-Z0-9]/g, '');
  const Draw = name === 'pin' ? () => Pin({ color }) : ART[name];
  if (!Draw) return null;
  return (
    <svg className={className} viewBox="0 0 64 64" fill="none" aria-hidden="true" focusable="false">
      {uniq(Draw(), uid)}
    </svg>
  );
}
