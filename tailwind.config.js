/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['IranSans', 'system-ui', 'sans-serif'], // فونت پیش‌فرض برای کل برنامه
      }
    },
  },
  plugins: [],
}