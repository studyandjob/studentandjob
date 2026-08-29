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
];

export function getTextThemeById(id) {
  return TEXT_THEMES.find((t) => t.id === id) || TEXT_THEMES[0];
}
