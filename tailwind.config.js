module.exports = {
  // content: ['./views/**/*.{html,hbs}'],
  // content: ['./**/*.{html,hbs}'],
  content: ['./views/*.hbs', './views/**/*.hbs'],
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
