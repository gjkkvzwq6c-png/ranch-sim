/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      keyframes: {
        'cow-walk': {
          '0%, 100%': { transform: 'translateX(0) scaleX(1)' },
          '25%': { transform: 'translateX(12px) scaleX(1)' },
          '50%': { transform: 'translateX(20px) scaleX(-1)' },
          '75%': { transform: 'translateX(8px) scaleX(-1)' },
        },
        'cow-bob': {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-4px)' },
        },
        'truck-drive': {
          '0%': { transform: 'translateX(110%)' },
          '30%': { transform: 'translateX(0%)' },
          '70%': { transform: 'translateX(0%)' },
          '100%': { transform: 'translateX(-110%)' },
        },
        'float-up': {
          '0%': { opacity: '1', transform: 'translateY(0)' },
          '100%': { opacity: '0', transform: 'translateY(-40px)' },
        },
        'pop-in': {
          '0%': { transform: 'scale(0.5)', opacity: '0' },
          '70%': { transform: 'scale(1.15)' },
          '100%': { transform: 'scale(1)', opacity: '1' },
        },
        'bounce-btn': {
          '0%, 100%': { transform: 'scale(1)' },
          '50%': { transform: 'scale(0.93)' },
        },
        'shine': {
          '0%': { backgroundPosition: '-200% center' },
          '100%': { backgroundPosition: '200% center' },
        },
        'pulse-glow': {
          '0%, 100%': { boxShadow: '0 0 5px rgba(251,191,36,0.3)' },
          '50%': { boxShadow: '0 0 20px rgba(251,191,36,0.8)' },
        },
      },
      animation: {
        'cow-walk': 'cow-walk 4s ease-in-out infinite',
        'cow-bob': 'cow-bob 2s ease-in-out infinite',
        'truck-drive': 'truck-drive 3s ease-in-out forwards',
        'float-up': 'float-up 1.5s ease-out forwards',
        'pop-in': 'pop-in 0.3s ease-out forwards',
        'bounce-btn': 'bounce-btn 0.15s ease-in-out',
        'shine': 'shine 2s linear infinite',
        'pulse-glow': 'pulse-glow 2s ease-in-out infinite',
      },
    },
  },
  plugins: [],
}
