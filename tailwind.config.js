module.exports = {
  // content: ['./views/**/*.{html,hbs}'],
  // content: ['./**/*.{html,hbs}'],
  content: ['./views/*.ejs', './views/**/*.ejs'],
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
