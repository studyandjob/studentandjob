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
        brand: {
          50: 'rgb(var(--brand-50, 234 241 251) / <alpha-value>)',
          100: 'rgb(var(--brand-100, 207 224 245) / <alpha-value>)',
          200: 'rgb(var(--brand-200, 163 194 234) / <alpha-value>)',
          300: 'rgb(var(--brand-300, 111 157 220) / <alpha-value>)',
          400: 'rgb(var(--brand-400, 63 121 207) / <alpha-value>)',
          500: 'rgb(var(--brand-500, 31 91 196) / <alpha-value>)',
          600: 'rgb(var(--brand-600, 0 71 171) / <alpha-value>)',
          700: 'rgb(var(--brand-700, 0 58 140) / <alpha-value>)',
          800: 'rgb(var(--brand-800, 0 46 112) / <alpha-value>)',
          900: 'rgb(var(--brand-900, 0 35 79) / <alpha-value>)',
        },
        accent: {
          50: 'rgb(var(--accent-50, 234 250 240) / <alpha-value>)',
          100: 'rgb(var(--accent-100, 200 240 214) / <alpha-value>)',
          500: 'rgb(var(--accent-500, 40 167 69) / <alpha-value>)',
          600: 'rgb(var(--accent-600, 33 136 56) / <alpha-value>)',
          700: 'rgb(var(--accent-700, 28 116 48) / <alpha-value>)',
        },
        // Admin dashboard palette — kept separate from the public-site
        // "brand" colors so the admin panel has its own visual identity.
        atl: '#14534F',
        atl2: '#1E7A73',
        agold: '#E8A33D',
        acoral: '#F2785C',
        aink: '#1F2E2B',
        acream: '#FBF6EF',
        aline: '#E7DFD2',
        amuted: '#8A9A96',
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
