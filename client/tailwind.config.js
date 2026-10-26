/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Forest Green: navbar, sidebar, footer, prominent headings, brand elements
        forest: {
          DEFAULT: '#174C3C',
          50: '#f1f8f5',
          100: '#def0e7',
          200: '#bedfd0',
          300: '#94c7b2',
          400: '#67a88f',
          500: '#458b73',
          600: '#326f5b',
          700: '#26594a',
          800: '#1e483c',
          900: '#174C3C',
          950: '#0b261e',
        },
        // Primary Green: primary buttons, links, active states, key actions
        primary: {
          DEFAULT: '#2F855A',
          hover: '#276f4a',
          light: '#e6f4ea',
        },
        // Soft Lime: small highlights, selected nav indicators, icon backgrounds, accent elements
        'soft-lime': {
          DEFAULT: '#D9F99D',
          hover: '#bef264',
          dark: '#a3e635',
        },
        // Warm Cream: main page background
        'warm-cream': {
          DEFAULT: '#FFF9ED',
          darker: '#fdf3de',
        },
        // Neutral Typography & Borders
        mainText: '#1F2937',
        secText: '#647067',
        appBorder: '#E5E7EB',

        // Standardized Status Colors
        status: {
          success: '#15803D',
          'success-bg': '#f0fdf4',
          'success-border': '#bbf7d0',
          pending: '#B45309',
          'pending-bg': '#fffbeb',
          'pending-border': '#fde68a',
          rejected: '#B91C1C',
          'rejected-bg': '#fef2f2',
          'rejected-border': '#fecaca',
          info: '#1D4ED8',
          'info-bg': '#eff6ff',
          'info-border': '#bfdbfe',
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
      },
      boxShadow: {
        'subtle': '0 1px 3px 0 rgba(0, 0, 0, 0.05), 0 1px 2px -1px rgba(0, 0, 0, 0.05)',
        'card': '0 4px 6px -1px rgba(0, 0, 0, 0.04), 0 2px 4px -2px rgba(0, 0, 0, 0.03)',
        'modal': '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.05)',
      }
    },
  },
  plugins: [],
}
