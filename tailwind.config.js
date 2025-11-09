/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: '#cb0101',
        'primary-dark': '#a00000',
      },
    },
  },
  plugins: [],
}
