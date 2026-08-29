// Text-color themes for the PUBLIC website.
//
// Scope: this ONLY changes the neutral "black" text used everywhere for
// headings/body copy (Tailwind's gray-400..900, which tailwind.config.js
// wires up to the CSS variables set here). It intentionally leaves the
// site's semantic colors untouched — brand green (buttons, "Government"
// badge, price/CTA), accent blue (links, "Private" badge) and red
// (expired/urgent notices) keep working exactly as before, no matter which
// text theme is active.
//
// Each theme provides six shades (400-900) so existing classes like
// `text-gray-900` (headings) and `text-gray-500` (muted/secondary text)
// both re-color consistently, from the same hue family, at a good contrast
// range on a white background.

export const DEFAULT_TEXT_THEME_ID = 'black';

export const TEXT_THEMES = [
  {
    id: 'black',
    name: 'Black (Classic)',
    swatch: '#111827',
    shades: { 400: '#9CA3AF', 500: '#6B7280', 600: '#4B5563', 700: '#374151', 800: '#1F2937', 900: '#111827' },
  },
  {
    id: 'charcoal-slate',
    name: 'Charcoal Slate',
    swatch: '#0F172A',
    shades: { 400: '#94A3B8', 500: '#64748B', 600: '#475569', 700: '#334155', 800: '#1E293B', 900: '#0F172A' },
  },
  {
    id: 'golden-bronze',
    name: 'Golden Bronze',
    swatch: '#4A2E05',
    shades: { 400: '#C9A25C', 500: '#A87D2E', 600: '#8A5A17', 700: '#6B4412', 800: '#54350E', 900: '#4A2E05' },
  },
  {
    id: 'silver-steel',
    name: 'Silver Steel',
    swatch: '#374045',
    shades: { 400: '#A9B4BA', 500: '#828E94', 600: '#5F6B71', 700: '#495257', 800: '#3B4348', 900: '#374045' },
  },
  {
    id: 'sky-blue-ink',
    name: 'Sky Blue Ink',
    swatch: '#0C2F4C',
    shades: { 400: '#7FB4DA', 500: '#4A90C4', 600: '#2E6FA3', 700: '#1F547E', 800: '#153E5D', 900: '#0C2F4C' },
  },
  {
    id: 'deep-maroon',
    name: 'Deep Maroon',
    swatch: '#3B0D14',
    shades: { 400: '#C98A93', 500: '#A65763', 600: '#823642', 700: '#642633', 800: '#4E1B25', 900: '#3B0D14' },
  },
  {
    id: 'royal-purple',
    name: 'Royal Purple',
    swatch: '#2E1140',
    shades: { 400: '#B79BD1', 500: '#9470B5', 600: '#734D96', 700: '#583876', 800: '#43285C', 900: '#2E1140' },
  },
  {
    id: 'forest-ink',
    name: 'Forest Ink',
    swatch: '#132318',
    shades: { 400: '#8FAE96', 500: '#688F72', 600: '#4B7154', 700: '#38573F', 800: '#26402C', 900: '#132318' },
  },

  // --- Added from user-supplied palette images (Coolors "sunset" palette,
  // pastel "colour palette inspiration" board, and the red/blue washi-tape
  // photos). Each is a monochromatic ramp built from that image's color so
  // it drops in exactly like the themes above.
  {
    id: 'deep-navy',
    name: 'Deep Navy',
    swatch: '#083349',
    shades: { 400: '#3EAFEA', 500: '#1896D8', 600: '#1379AE', 700: '#0F608A', 800: '#0C496A', 900: '#083349' },
  },
  {
    id: 'crimson-red',
    name: 'Crimson Red',
    swatch: '#450D0D',
    shades: { 400: '#DD4B4B', 500: '#CA2626', 600: '#A31F1F', 700: '#811818', 800: '#631212', 900: '#450D0D' },
  },
  {
    id: 'sunset-orange',
    name: 'Sunset Orange',
    swatch: '#492A08',
    shades: { 400: '#EA963E', 500: '#D87B18', 600: '#AE6313', 700: '#8A4E0F', 800: '#6A3C0C', 900: '#492A08' },
  },
  {
    id: 'golden-amber',
    name: 'Golden Amber',
    swatch: '#493308',
    shades: { 400: '#EAAF3E', 500: '#D89618', 600: '#AE7A13', 700: '#8A600F', 800: '#6A4A0C', 900: '#493308' },
  },
  {
    id: 'warm-sand',
    name: 'Warm Sand',
    swatch: '#3F3812',
    shades: { 400: '#CFBC59', 500: '#BAA536', 600: '#96852C', 700: '#766923', 800: '#5B511A', 900: '#3F3812' },
  },
  {
    id: 'blush-rose',
    name: 'Blush Rose',
    swatch: '#490818',
    shades: { 400: '#EA3E67', 500: '#D81845', 600: '#AE1338', 700: '#8A0F2C', 800: '#6A0C22', 900: '#490818' },
  },
  {
    id: 'butter-yellow',
    name: 'Butter Yellow',
    swatch: '#493A08',
    shades: { 400: '#EAC23E', 500: '#D8AB18', 600: '#AE8B13', 700: '#8A6D0F', 800: '#6A540C', 900: '#493A08' },
  },
  {
    id: 'olive-moss',
    name: 'Olive Moss',
    swatch: '#414111',
    shades: { 400: '#D3D355', 500: '#BFBF31', 600: '#9A9A28', 700: '#7A7A1F', 800: '#5D5D18', 900: '#414111' },
  },
  {
    id: 'dusty-teal',
    name: 'Dusty Teal',
    swatch: '#1C3235',
    shades: { 400: '#74ACB4', 500: '#54939C', 600: '#44777E', 700: '#355E64', 800: '#29484C', 900: '#1C3235' },
  },
  {
    id: 'ocean-blue',
    name: 'Ocean Blue',
    swatch: '#102342',
    shades: { 400: '#5384D5', 500: '#2F66C0', 600: '#26529C', 700: '#1E417B', 800: '#17325E', 900: '#102342' },
  },
  {
    id: 'royal-cobalt',
    name: 'Royal Cobalt',
    swatch: '#082049',
    shades: { 400: '#3E7DEA', 500: '#185ED8', 600: '#134CAE', 700: '#0F3C8A', 800: '#0C2E6A', 900: '#082049' },
  },
  {
    id: 'poppy-red',
    name: 'Poppy Red',
    swatch: '#490808',
    shades: { 400: '#EA3E3E', 500: '#D81818', 600: '#AE1313', 700: '#8A0F0F', 800: '#6A0C0C', 900: '#490808' },
  },
];

export function getTextThemeById(id) {
  return TEXT_THEMES.find((t) => t.id === id) || TEXT_THEMES[0];
}
