/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./src/**/*.{js,ts,jsx,tsx,mdx}'],
  theme: {
    extend: {
      colors: {
        primaire: '#1A5C38',
        accent: '#F9A825',
        fond: '#F7F8FA',
        carte: '#FFFFFF',
        recette: '#2E7D32',
        depense: '#C62828',
      },
      borderRadius: {
        carte: '16px',
        bouton: '12px',
      },
      keyframes: {
        'fade-up': {
          from: { opacity: '0', transform: 'translateY(1rem)' },
          to: { opacity: '1', transform: 'translateY(0)' },
        },
        'fade-up-lg': {
          from: { opacity: '0', transform: 'translateY(2rem)' },
          to: { opacity: '1', transform: 'translateY(0)' },
        },
        'fade-down': {
          from: { opacity: '0', transform: 'translateY(-0.75rem)' },
          to: { opacity: '1', transform: 'translateY(0)' },
        },
        'fade-left': {
          from: { opacity: '0', transform: 'translateX(-1rem)' },
          to: { opacity: '1', transform: 'translateX(0)' },
        },
        'fade-right': {
          from: { opacity: '0', transform: 'translateX(1rem)' },
          to: { opacity: '1', transform: 'translateX(0)' },
        },
      },
      animation: {
        'fade-up': 'fade-up 0.7s ease-out both',
        'fade-up-lg': 'fade-up-lg 0.9s ease-out both',
        'fade-down': 'fade-down 0.4s ease-out both',
        'fade-left': 'fade-left 0.8s ease-out both',
        'fade-right': 'fade-right 0.8s ease-out both',
      },
    },
  },
  plugins: [require('tailwindcss-animate')],
};
