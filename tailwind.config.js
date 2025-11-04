/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./{components,pages,utils}/**/*.{js,ts,jsx,tsx}",
    "./App.tsx",
    "./index.tsx",
  ],
  darkMode: "class", // This enables class-based dark mode, fixing your theme toggle
  theme: {
    extend: {},
  },
  plugins: [],
};
