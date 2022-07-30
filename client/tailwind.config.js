/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./src/**/*.{js,jsx,ts,tsx}'],
  theme: {
    extend: {
      colors: {
        nex: 'hsl(269, 34%, 30%)'
      },
      fontFamily: {
        Lato: ['Lato', 'Helvetica Neue', 'Helvetica', 'Arial', 'sans-serif']
      }
    }
  },
  plugins: []
};
