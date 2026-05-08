/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'bg-dark': '#050505',
        'neon-blue': '#00f3ff',
        'neon-purple': '#7000ff',
      },
      fontFamily: {
        'cyber': ['VT323', 'monospace'],
        'orbitron': ['Orbitron', 'sans-serif'],
      }
    },
  },
  plugins: [],
}
