/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      keyframes: {
        'cow-bob': {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-5px)' },
        },
        'truck-drive': {
          '0%': { transform: 'translateX(110%)' },
          '25%': { transform: 'translateX(5%)' },
          '75%': { transform: 'translateX(5%)' },
          '100%': { transform: 'translateX(-110%)' },
        },
        'float-up': {
          '0%': { opacity: '1', transform: 'translateY(0) scale(1)' },
          '100%': { opacity: '0', transform: 'translateY(-50px) scale(1.3)' },
        },
        'pop-in': {
          '0%': { transform: 'scale(0.5)', opacity: '0' },
          '70%': { transform: 'scale(1.1)' },
          '100%': { transform: 'scale(1)', opacity: '1' },
        },
        'pulse-glow': {
          '0%, 100%': { boxShadow: '0 0 8px rgba(251,191,36,0.3)' },
          '50%': { boxShadow: '0 0 30px rgba(251,191,36,0.9)' },
        },
        'shimmer': {
          '0%': { backgroundPosition: '-200% center' },
          '100%': { backgroundPosition: '200% center' },
        },
      },
      animation: {
        'cow-bob': 'cow-bob 2s ease-in-out infinite',
        'truck-drive': 'truck-drive 3s ease-in-out forwards',
        'float-up': 'float-up 1.4s ease-out forwards',
        'pop-in': 'pop-in 0.3s ease-out forwards',
        'pulse-glow': 'pulse-glow 2s ease-in-out infinite',
        'shimmer': 'shimmer 2s linear infinite',
      },
    },
  },
  plugins: [],
}
