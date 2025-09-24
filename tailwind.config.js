/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/renderer/index.html",
    "./src/renderer/src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        gray: {
          900: '#0f0f0f',
          800: '#1a1a1a',
          700: '#2a2a2a',
          600: '#3a3a3a',
          500: '#4a4a4a',
          400: '#5a5a5a',
          300: '#6a6a6a',
          200: '#7a7a7a',
          100: '#8a8a8a',
        }
      },
      animation: {
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
      }
    },
  },
  plugins: [],
}