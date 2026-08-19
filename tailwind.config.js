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
          50: '#eef6ff',
          100: '#d9ecff',
          500: '#1565d8',
          600: '#0f52b0',
          700: '#0c4189',
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
      },
      keyframes: {
        marquee: {
          '0%': { transform: 'translateX(100%)' },
          '100%': { transform: 'translateX(-100%)' },
        },
      },
      animation: {
        marquee: 'marquee 25s linear infinite',
      },
    },
  },
  plugins: [],
};
