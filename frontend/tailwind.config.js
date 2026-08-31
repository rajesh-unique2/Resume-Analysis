/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        ink: {
          DEFAULT: '#111827',
          soft: '#4B5563',
        },
        paper: '#F8FAFC',
        accent: {
          DEFAULT: '#4F46E5',
          soft: '#EEF2FF',
          dark: '#4338CA',
        },
        strong: { DEFAULT: '#059669', soft: '#ECFDF5' },
        moderate: { DEFAULT: '#D97706', soft: '#FFFBEB' },
        weak: { DEFAULT: '#E11D48', soft: '#FFF1F2' },
      },
      fontFamily: {
        display: ['"Space Grotesk"', 'sans-serif'],
        body: ['Inter', 'sans-serif'],
      },
      keyframes: {
        fadeSlideUp: {
          '0%': { opacity: '0', transform: 'translateY(20px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        popIn: {
          '0%': { opacity: '0', transform: 'scale(0.9)' },
          '100%': { opacity: '1', transform: 'scale(1)' },
        },
        pulse: {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0.5' },
        },
      },
      animation: {
        'fade-slide-up': 'fadeSlideUp 0.6s cubic-bezier(0.4, 0, 0.2, 1) forwards',
        'pop-in': 'popIn 0.35s cubic-bezier(0.4, 0, 0.2, 1) forwards',
        'pulse-slow': 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
      },
    },
  },
  plugins: [],
};