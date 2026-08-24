/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        dark: {
          900: '#050505',
          800: '#080808',
          700: '#0E0E10',
          600: '#141417',
          500: '#1F1F24',
        },
        gold: {
          400: '#F0C75E',
          500: '#D4AF37',
          600: '#C9A227',
          700: '#A37F1A',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
};
