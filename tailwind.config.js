/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        background: '#020617',
        card: '#1e293b',
      },
      fontFamily: {
        heading: ['Playfair Display', 'serif'],
        body: ['Heebo', 'sans-serif'],
      },
    },
  },
  plugins: [],
};
