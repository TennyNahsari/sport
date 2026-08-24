/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#2563EB', // Electric Blue
          hover: '#1D4ED8',
          light: '#EFF6FF'
        },
        navy: {
          DEFAULT: '#0F172A', // Sport Navy
          light: '#1E293B',
          dark: '#020617'
        },
        sportgreen: {
          DEFAULT: '#16A34A', // Sport Green
          hover: '#15803D',
          light: '#F0FDF4'
        },
        orange: {
          DEFAULT: '#F97316', // Energy Orange
          hover: '#EA580C',
          light: '#FFF7ED'
        },
        surface: '#F8FAFC',
        card: '#FFFFFF',
        muted: '#64748B',
        border: '#E2E8F0',
        status: {
          available: '#16A34A',
          selected: '#2563EB',
          booked: '#CBD5E1',
          pending: '#F59E0B',
          cancelled: '#EF4444',
          completed: '#64748B'
        }
      },
      fontFamily: {
        sans: ['"Plus Jakarta Sans"', 'sans-serif'],
      },
      borderRadius: {
        'button': '10px',
        'card': '16px',
        'large': '20px'
      }
    },
  },
  plugins: [],
}
