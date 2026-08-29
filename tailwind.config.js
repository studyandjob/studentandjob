/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './app/**/*.{js,jsx}',
    './components/**/*.{js,jsx}',
  ],
  theme: {
    extend: {
      colors: {
        // NOTE: these resolve to CSS custom properties set at runtime by
        // <ThemeProvider> (contexts/ThemeContext.js) from the admin's
        // selected theme (see /admin -> Theme Settings). The literal hex
        // values here are only the fallback used before JS hydrates, or if
        // no theme has been applied yet — they match "Classic Royal Blue",
        // the default theme.
        // The `rgb(var(--x) / <alpha-value>)` pattern (not plain var(--x))
        // is what lets Tailwind opacity modifiers keep working, e.g. the
        // existing `shadow-brand-900/10` in Header.jsx — Tailwind swaps
        // <alpha-value> for the /NN fraction at build time, so the CSS
        // variable only ever needs to hold "R G B" (space separated).
        // Fallback ramps below match the "BCI Platform (Green & Blue)"
        // theme in lib/themes.js — used only before <ThemeProvider>
        // hydrates and overwrites these via CSS variables at runtime.
        brand: {
          50: 'rgb(var(--brand-50, 232 244 237) / <alpha-value>)',
          100: 'rgb(var(--brand-100, 205 232 216) / <alpha-value>)',
          200: 'rgb(var(--brand-200, 160 209 180) / <alpha-value>)',
          300: 'rgb(var(--brand-300, 110 183 141) / <alpha-value>)',
          400: 'rgb(var(--brand-400, 60 154 100) / <alpha-value>)',
          500: 'rgb(var(--brand-500, 27 135 71) / <alpha-value>)',
          600: 'rgb(var(--brand-600, 30 132 73) / <alpha-value>)',
          700: 'rgb(var(--brand-700, 26 112 62) / <alpha-value>)',
          800: 'rgb(var(--brand-800, 21 92 51) / <alpha-value>)',
          900: 'rgb(var(--brand-900, 17 73 41) / <alpha-value>)',
        },
        accent: {
          50: 'rgb(var(--accent-50, 233 238 249) / <alpha-value>)',
          100: 'rgb(var(--accent-100, 202 215 240) / <alpha-value>)',
          500: 'rgb(var(--accent-500, 46 90 172) / <alpha-value>)',
          600: 'rgb(var(--accent-600, 40 79 151) / <alpha-value>)',
          700: 'rgb(var(--accent-700, 33 68 131) / <alpha-value>)',
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
