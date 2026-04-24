/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        brand: {
          50:  '#fff7ed',
          100: '#ffedd5',
          200: '#fed7aa',
          300: '#fdba74',
          400: '#fb923c',
          500: '#f97316',
          600: '#ea580c',
          700: '#c2410c',
          800: '#9a3412',
          900: '#7c2d12',
        },
        surface: {
          0:   '#ffffff',
          50:  '#fafafa',
          100: '#f5f5f5',
          200: '#eeeeee',
        },
      },
      fontFamily: {
        sans: ['Plus Jakarta Sans', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace'],
      },
      keyframes: {
        'fade-up': {
          '0%':   { opacity: '0', transform: 'translateY(12px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        'fade-in': {
          '0%':   { opacity: '0' },
          '100%': { opacity: '1' },
        },
        'scale-in': {
          '0%':   { opacity: '0', transform: 'scale(0.92)' },
          '100%': { opacity: '1', transform: 'scale(1)' },
        },
        'bounce-dot': {
          '0%, 80%, 100%': { transform: 'translateY(0)',    opacity: '0.4' },
          '40%':           { transform: 'translateY(-5px)', opacity: '1'   },
        },
        'pulse-soft': {
          '0%, 100%': { opacity: '1' },
          '50%':      { opacity: '0.4' },
        },
        shimmer: {
          '0%':   { backgroundPosition: '-400% 0' },
          '100%': { backgroundPosition:  '400% 0' },
        },
        'slide-up': {
          '0%':   { opacity: '0', transform: 'translateY(20px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
      },
      animation: {
        'fade-up':    'fade-up 0.32s cubic-bezier(0.16,1,0.3,1) forwards',
        'fade-in':    'fade-in 0.2s ease-out forwards',
        'scale-in':   'scale-in 0.4s cubic-bezier(0.16,1,0.3,1) forwards',
        'bounce-dot': 'bounce-dot 1.3s infinite ease-in-out',
        'pulse-soft': 'pulse-soft 2s ease-in-out infinite',
        shimmer:      'shimmer 2.5s linear infinite',
        'slide-up':   'slide-up 0.5s cubic-bezier(0.16,1,0.3,1) forwards',
      },
      boxShadow: {
        'chat':    '0 8px 40px rgba(0,0,0,0.08), 0 1px 3px rgba(0,0,0,0.04)',
        'bubble':  '0 1px 4px rgba(0,0,0,0.06)',
        'input':   '0 0 0 3px rgba(249,115,22,0.18)',
        'card':    '0 2px 12px rgba(0,0,0,0.06)',
        'btn':     '0 2px 8px rgba(249,115,22,0.35)',
        'btn-hover': '0 4px 16px rgba(249,115,22,0.45)',
      },
      backgroundImage: {
        'brand-gradient': 'linear-gradient(135deg, #ff6b2b 0%, #f97316 50%, #fb923c 100%)',
        'page-gradient':  'radial-gradient(ellipse 90% 70% at 50% -5%, rgba(251,146,60,0.10) 0%, transparent 65%)',
      },
    },
  },
  plugins: [],
}