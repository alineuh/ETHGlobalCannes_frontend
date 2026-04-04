/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        arcBlue: '#3b82f6',
        critical: '#ef4444',
        high: '#f97316',
        medium: '#eab308',
        low: '#60a9fa',
        dark: '#0a0a0f',
      },
    },
  },
  plugins: [],
}
