/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './app/**/*.{js,jsx}',
    './components/**/*.{js,jsx}',
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          50: '#eaf1fb',
          100: '#cfe0f5',
          200: '#a3c2ea',
          300: '#6f9ddc',
          400: '#3f79cf',
          500: '#1f5bc4',
          600: '#0047AB',
          700: '#003a8c',
          800: '#002e70',
          900: '#00234f',
        },
        accent: {
          50: '#eafaf0',
          100: '#c8f0d6',
          500: '#28A745',
          600: '#218838',
          700: '#1c7430',
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
