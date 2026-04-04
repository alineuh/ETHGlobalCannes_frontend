/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        arcBlue: '#4f6ef7',
        arcPurple: '#7c3aed',
        critical: '#ef4444',
        high: '#f97316',
        medium: '#f59e0b',
        low: '#3b82f6',
        darkBg: '#0a0a0f',
        cardBg: '#ffffff',
      },
    },
  },
  plugins: [],
}
