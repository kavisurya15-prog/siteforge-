/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          dark: '#0F0F0F',
          darker: '#1A1A1A',
          gray: '#2A2A2A',
          gold: '#D4AF37',
        }
      }
    },
  },
  plugins: [],
}

