const config = {
  content: ['./src/**/*.{html,js,svelte,ts}'],

  theme: {
    extend: {
      transitionProperty: {
        sidebar: 'width',
      },
      letterSpacing: {
        narrow: '-.5em',
      },
    },
    screens: {
      sm: '576px',
      md: '768px',
      lg: '992px',
      xl: '1200px',
      xxl: '1400px',
    },
    colors: {
      transparent: 'transparent',
      current: 'currentColor',

      default: '#575757',
      primary: '#173d7a',
      secondary: '#029df7',
      highlight: '#ff890e',

      blue: {
        800: '#0B2D64',
        DEFAULT: '#173d7a',
        600: '#1C5298',
        500: '#396EB2',
        400: '#518AD4',
      },
      cyan: {
        600: '#008Ad8',
        DEFAULT: '#029df7',
        400: '#41b9ff',
        200: '#e3f5ff',
      },
      grey: {
        text: '#575757',
        900: '#36404A',
        800: '#4D5A67',
        700: '#80909F',
        600: '#9CABBB',
        DEFAULT: '#B4C1CE',
        500: '#B4C1CE',
        400: '#CAD6E1',
        300: '#E7EEF5',
        200: '#EEF3F6',
        100: '#F4F7F9',
      },

      black: '#000000',
      white: '#FFFFFF',
      orange: '#FF890E',
      red: '#D40000',
      yellow: '#FFCC47',
      green: '#129806',
      mariner: '#2C6FC8',
      azure: '#029DF7',
      violet: '#782994',
      magenta: '#EC4176',
    },
    boxShadow: {
      none: '0 0 #0000',
      sidebar: '0px 0px 10px 10px rgba(34, 34, 34, .1)',
    },
  },

  plugins: [
    require('@tailwindcss/forms'),
  ],
};

module.exports = config;
