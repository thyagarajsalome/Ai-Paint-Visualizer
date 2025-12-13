/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    // OLD PATHS (Remove these):
    // "./{components,pages,utils}/**/*.{js,ts,jsx,tsx}",
    // "./App.tsx",
    // "./index.tsx",

    // NEW PATH (Add this):
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: "class",
  theme: {
    extend: {},
  },
  plugins: [],
};
