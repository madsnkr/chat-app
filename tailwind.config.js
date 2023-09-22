/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './dist/**/*.{html,js}',
  ],
  theme: {
    extend: {
      height: {
        "80v": "80vh"
      }
    },
  },
  plugins: [],
};
