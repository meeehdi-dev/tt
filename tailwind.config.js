/** @type {import('tailwindcss').Config} */
const WEEK_START = Number(process.env.VITE_WEEK_START || 0);
const WEEK_END = Number(process.env.VITE_WEEK_END || 6);
const DAY_START = Number(process.env.VITE_DAY_START || 9);
const DAY_END = Number(process.env.VITE_DAY_END || 18);

const weekCols = `grid-cols-${WEEK_END - WEEK_START + 1}`;
const dayRows = `grid-rows-${(DAY_END - DAY_START) * 2}`;

export default {
  content: [
    "./index.html",
    "./src/**/*.{vue,js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {},
  },
  plugins: [],
  safelist: [
    weekCols,
    dayRows,
  ],
}