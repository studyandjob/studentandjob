// Central definition of every color theme the admin can pick for the public
// site, plus small helpers to turn a single "primary" / "accent" hex value
// into the full 50-900 shade ramp that tailwind.config.js's `brand` and
// `accent` color scales expect. This is what makes runtime theme-switching
// possible without editing every component that uses `bg-brand-600`,
// `text-brand-700`, `border-accent-500`, etc: those class names never
// change, only the CSS variables they resolve to.

export const DEFAULT_THEME_ID = 'bci-platform-green-blue';

// Each theme has 4 color roles. `secondaryLabel` is only cosmetic — it lets
// the settings screen show "Success" for the default theme (matching the
// existing site copy) and "Accent" everywhere else, even though under the
// hood both map to the same `accent` scale used for buttons/highlights.
// All themes below follow the same "BCI Platform" design language: a
// clean near-white page background, dark neutral body text for
// readability, a saturated `primary` for logo/buttons/nav (like BCI's
// green), and a distinct `accent` for headings/links (like BCI's blue).
// Each theme keeps its original name/color identity — only the exact
// hex values and background/text pairing were refreshed for the light,
// professional dashboard look.
export const THEMES = [
  // BCI Platform-inspired refresh: green primary (buttons, header, nav —
  // matches the "bci platform" logo mark + the green pill CTA buttons),
  // blue accent (headings, links, breadcrumbs — matches "Mass Balance BCP
  // Transaction Summary" style text), light blue-gray page background, on
  // clean white surfaces. Set as the new default theme.
  {
    id: 'bci-platform-green-blue',
    name: 'BCI Platform (Green & Blue)',
    isDefault: true,
    primary: '#1E8449',
    accent: '#2E5AAC',
    background: '#F1F4F8',
    text: '#1F2937',
    secondaryLabel: 'Accent',
  },
  {
    id: 'classic-royal-blue',
    name: 'Classic Royal Blue',
    primary: '#0047AB',
    accent: '#0D7A70',
    background: '#F8F9FA',
    text: '#1F2937',
    secondaryLabel: 'Accent',
  },
  {
    id: 'pakistani-government-green',
    name: 'Pakistani Government Green',
    primary: '#046A38',
    accent: '#B7871F',
    background: '#F3FAF6',
    text: '#1C2A22',
    secondaryLabel: 'Accent',
  },
  {
    id: 'corporate-navy-cyan',
    name: 'Corporate Navy & Cyan',
    primary: '#14304F',
    accent: '#0E88B5',
    background: '#F5F8FB',
    text: '#1E293B',
    secondaryLabel: 'Accent',
  },
  {
    id: 'midnight-dark-mode',
    name: 'Midnight Dark Mode',
    primary: '#334155',
    accent: '#16A34A',
    background: '#0F172A',
    text: '#F1F5F9',
    secondaryLabel: 'Accent',
  },
  {
    id: 'vibrant-orange-charcoal',
    name: 'Vibrant Orange & Charcoal',
    primary: '#D9631E',
    accent: '#374151',
    background: '#FFFBF7',
    text: '#374151',
    secondaryLabel: 'Accent',
  },
  {
    id: 'earthy-olive-beige',
    name: 'Earthy Olive & Beige',
    primary: '#57751A',
    accent: '#B5651D',
    background: '#FAF8F0',
    text: '#3A2E1A',
    secondaryLabel: 'Accent',
  },
  {
    id: 'deep-purple-gold',
    name: 'Deep Purple & Gold',
    primary: '#6B21A8',
    accent: '#C9A227',
    background: '#F7F5FB',
    text: '#312E4B',
    secondaryLabel: 'Accent',
  },
  {
    id: 'serene-teal-white',
    name: 'Serene Teal & White',
    primary: '#0D7A70',
    accent: '#475569',
    background: '#F5FBFA',
    text: '#0F2A28',
    secondaryLabel: 'Accent',
  },

  // ---------------------------------------------------------------------
  // Newer, more modern palettes — softer neutrals, contemporary
  // indigo/violet/emerald pairings instead of the flatter primary-color
  // combos above. All of the themes above are kept as-is; these are
  // additions, not replacements.
  // ---------------------------------------------------------------------
  {
    id: 'modern-indigo-sky',
    name: 'Modern Indigo & Sky',
    primary: '#4338CA',
    accent: '#0284C7',
    background: '#F5F6FC',
    text: '#28264D',
    secondaryLabel: 'Accent',
  },
  {
    id: 'sunset-coral-ivory',
    name: 'Sunset Coral & Ivory',
    primary: '#D9445D',
    accent: '#C2660F',
    background: '#FFF9F6',
    text: '#3F2222',
    secondaryLabel: 'Accent',
  },
  {
    id: 'fresh-mint-slate',
    name: 'Fresh Mint & Slate',
    primary: '#0F9D71',
    accent: '#64748B',
    background: '#F3FAF8',
    text: '#1B2E2A',
    secondaryLabel: 'Accent',
  },
  {
    id: 'cyber-violet-lime',
    name: 'Cyber Violet & Lime',
    primary: '#7C3AED',
    accent: '#65A30D',
    background: '#F8F6FC',
    text: '#2C2244',
    secondaryLabel: 'Accent',
  },
  {
    id: 'graphite-amber-pro',
    name: 'Graphite & Amber Pro',
    primary: '#3F3F46',
    accent: '#B45309',
    background: '#FAFAF9',
    text: '#27272A',
    secondaryLabel: 'Accent',
  },
  {
    id: 'digital-lavender-charcoal',
    name: 'Digital Lavender & Charcoal',
    primary: '#6D5BD0',
    accent: '#1E293B',
    background: '#F6F5FC',
    text: '#2A2650',
    secondaryLabel: 'Accent',
  },

  // 16th theme: mirrors the admin dashboard's own fixed palette (green
  // buttons/primary like "atl2", coral badge accents like "acoral", the
  // same soft blue-gray page background as the admin sidebar hover
  // ("acream") and the same dark body text ("aink") — so the public site
  // can look and feel like the admin panel if the admin wants that match.
  {
    id: 'admin-panel-match',
    name: 'Admin Panel Match (Green & Coral)',
    primary: '#1E8449',
    accent: '#DC5B4B',
    background: '#F1F4F8',
    text: '#1F2937',
    secondaryLabel: 'Accent',
  },
];

export function getThemeById(id) {
  return THEMES.find((t) => t.id === id) || THEMES.find((t) => t.isDefault) || THEMES[0];
}

// ---- color math -----------------------------------------------------

function hexToRgb(hex) {
  const clean = hex.replace('#', '');
  const full = clean.length === 3 ? clean.split('').map((c) => c + c).join('') : clean;
  const num = parseInt(full, 16);
  return { r: (num >> 16) & 255, g: (num >> 8) & 255, b: num & 255 };
}

function rgbToHex({ r, g, b }) {
  const toHex = (n) => Math.round(Math.min(255, Math.max(0, n))).toString(16).padStart(2, '0');
  return `#${toHex(r)}${toHex(g)}${toHex(b)}`;
}

// "R G B" (space-separated, 0-255) — the format tailwind.config.js's
// `rgb(var(--brand-600) / <alpha-value>)` pattern expects, so Tailwind's
// `/NN` opacity modifiers (e.g. `shadow-brand-900/10`, already used in
// Header.jsx) keep working after a theme swap.
export function hexToRgbTriplet(hex) {
  const { r, g, b } = hexToRgb(hex);
  return `${Math.round(r)} ${Math.round(g)} ${Math.round(b)}`;
}

// Mixes `hex` toward white (positive weight) or black (negative weight).
// weight is 0-1, e.g. 0.9 = 90% of the way to white.
function mix(hex, weight, towards = '#ffffff') {
  const a = hexToRgb(hex);
  const b = hexToRgb(towards);
  return rgbToHex({
    r: a.r + (b.r - a.r) * weight,
    g: a.g + (b.g - a.g) * weight,
    b: a.b + (b.b - a.b) * weight,
  });
}

// Produces a Tailwind-style 50-900 ramp with `base` sitting at the 600 step
// (matching the site's original brand.600 = "#0047AB" primary color).
export function buildShadeScale(base) {
  return {
    50: mix(base, 0.95),
    100: mix(base, 0.85),
    200: mix(base, 0.7),
    300: mix(base, 0.5),
    400: mix(base, 0.25),
    500: mix(base, 0.1),
    600: base,
    700: mix(base, 0.15, '#000000'),
    800: mix(base, 0.3, '#000000'),
    900: mix(base, 0.45, '#000000'),
  };
}

// Smaller ramp for the `accent` scale, which only ever uses 50/100/500/600/700.
export function buildAccentScale(base) {
  return {
    50: mix(base, 0.92),
    100: mix(base, 0.78),
    500: base,
    600: mix(base, 0.12, '#000000'),
    700: mix(base, 0.24, '#000000'),
  };
}
