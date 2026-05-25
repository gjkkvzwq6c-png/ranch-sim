/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      keyframes: {
        'pop-in': {
          '0%':   { transform: 'scale(0.5)', opacity: '0' },
          '70%':  { transform: 'scale(1.1)' },
          '100%': { transform: 'scale(1)', opacity: '1' },
        },
        'float-up': {
          '0%':   { opacity: '1', transform: 'translateY(0) scale(1)' },
          '100%': { opacity: '0', transform: 'translateY(-52px) scale(1.4)' },
        },
        'pulse-glow': {
          '0%, 100%': { boxShadow: '0 0 8px rgba(251,191,36,0.3)' },
          '50%':       { boxShadow: '0 0 30px rgba(251,191,36,0.9)' },
        },
      },
      animation: {
        'pop-in':     'pop-in 0.3s ease-out forwards',
        'float-up':   'float-up 1.4s ease-out forwards',
        'pulse-glow': 'pulse-glow 2s ease-in-out infinite',
      },
    },
  },
  plugins: [],
}
