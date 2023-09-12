const { join } = require('path');
const { createGlobPatternsForDependencies } = require('@nrwl/react/tailwind');

/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    join(__dirname, '{src,app,components}/**/*!(*.stories|*.spec).{ts,tsx,html}'),
    ...createGlobPatternsForDependencies(__dirname),
  ],
  theme: {
    extend: {
      colors: {
        primary: 'rgb(49, 51, 56)',
        menu: 'rgb(43, 45, 49)',
      },
    },
  },
  plugins: [require('@tailwindcss/forms')],
};
