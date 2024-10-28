/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/**/*.{js,jsx,ts,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        darkGray: '#3B3A3D',
        lightGray: '#E5E5E5',
        teal: '#319795',
        darkBlue: '#443c5b',
        pink: '#f8cacd',
        tealLight: '#7fbaa8',
        green: '#7ec682',
        blue: '#0097b2',
      },
    },
  },
  plugins: [],
};
