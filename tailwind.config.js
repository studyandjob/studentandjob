/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './app/**/*.{js,jsx}',
    './components/**/*.{js,jsx}',
  ],
  theme: {
    extend: {
      colors: {
        // Single, fixed design system shared by the ENTIRE site (public
        // pages + admin dashboard) — the old per-visitor "Theme Settings"
        // switcher has been removed, so these are no longer CSS variables,
        // just plain hex values. `brand` is a green shade ramp built from
        // the admin panel's `atl2` (#1E8449) and `accent` is a blue ramp
        // built from the admin panel's `atl` (#2E5AAC) — the exact same
        // math the old theme engine used for the default "BCI Platform"
        // theme, just computed once instead of at runtime.
        brand: {
          50: '#f4f9f6',
          100: '#ddede4',
          200: '#bcdac8',
          300: '#8ec2a4',
          400: '#56a376',
          500: '#34905b',
          600: '#1E8449',
          700: '#1a703e',
          800: '#155c33',
          900: '#104928',
        },
        accent: {
          50: '#eef2f8',
          100: '#d1dbed',
          500: '#2E5AAC',
          600: '#284f97',
          700: '#234483',
        },
        // Neutral "black" text scale used across the PUBLIC site
        // (text-gray-400..900 — headings, body copy, muted labels).
        // Shades 400-900 resolve through CSS variables so the admin's
        // Text Theme panel (components/admin/TextThemeManager.jsx +
        // lib/textThemes.js) can re-tint all of it at once — e.g. to
        // Golden, Silver, Sky Blue, etc. — without touching the semantic
        // brand/accent/red colors above. The fallback hex after each var()
        // is Tailwind's own default gray, so nothing changes visually
        // until an admin actually picks and saves a different theme.
        // gray-50..300 are intentionally left as plain Tailwind defaults
        // (borders/subtle backgrounds, not really "text").
        gray: {
          400: 'var(--text-400, #9CA3AF)',
          500: 'var(--text-500, #6B7280)',
          600: 'var(--text-600, #4B5563)',
          700: 'var(--text-700, #374151)',
          800: 'var(--text-800, #1F2937)',
          900: 'var(--text-900, #111827)',
        },
        // Admin dashboard palette — kept separate from the public-site
        // "brand" colors so the admin panel has its own visual identity.
        // Reworked to match the BCI Platform look: white surfaces, a blue
        // "atl" for headings/links (like their "Mass Balance BCP..." page
        // titles) and a green "atl2" for primary actions/logo accents
        // (like their green "View Report" button).
        atl: '#2E5AAC',
        atl2: '#1E8449',
        agold: '#8A5A17',
        acoral: '#C0392B',
        aink: '#1F2937',
        acream: '#F1F4F8',
        aline: '#E2E8F0',
        amuted: '#5B6B82',
      },
      fontFamily: {
        serif: ['var(--font-fraunces)', 'Georgia', 'serif'],
        // Public Sans handles Latin text; Noto Nastaliq Urdu is listed as a
        // fallback so any Urdu/Arabic-script characters anywhere on the
        // site render with that font too — the browser automatically picks
        // whichever font in this list actually has the glyph it needs, so
        // mixed English+Urdu text (e.g. "Federal (وفاقی)") renders both
        // scripts correctly without any extra markup.
        sans: [
          'var(--font-public-sans)',
          'var(--font-urdu)',
          'ui-sans-serif',
          'system-ui',
          '-apple-system',
          'sans-serif',
        ],
        // Use font-urdu directly for headings/paragraphs that are entirely
        // in Urdu (e.g. dir="rtl" blocks) if you want the Nastaliq look to
        // stand out more prominently than as a plain fallback.
        urdu: ['var(--font-urdu)', 'ui-sans-serif', 'system-ui', 'sans-serif'],
      },
      keyframes: {
        marquee: {
          '0%': { transform: 'translateX(100%)' },
          '100%': { transform: 'translateX(-100%)' },
        },
        'spin-reverse': {
          from: { transform: 'rotate(360deg)' },
          to: { transform: 'rotate(0deg)' },
        },
        'pulse-soft': {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0.4' },
        },
        'fade-in-up': {
          '0%': { opacity: '0', transform: 'translateY(8px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        'loading-bar': {
          '0%': { transform: 'translateX(-100%)' },
          '100%': { transform: 'translateX(350%)' },
        },
      },
      animation: {
        marquee: 'marquee 25s linear infinite',
        // Slow outer ring for the page-loading overlay — spins the
        // opposite direction of Tailwind's built-in animate-spin so the
        // two rings around the logo visibly counter-rotate.
        'spin-reverse-slow': 'spin-reverse 3s linear infinite',
        'pulse-soft': 'pulse-soft 1.6s ease-in-out infinite',
        // Site name under the loading logo: animates in, then keeps a
        // gentle breathing pulse for as long as the overlay is visible.
        'fade-in-up': 'fade-in-up 0.5s ease-out forwards',
        // The moving colored segment inside the loading bar track.
        'loading-bar': 'loading-bar 1.3s ease-in-out infinite',
      },
    },
  },
  plugins: [],
};
