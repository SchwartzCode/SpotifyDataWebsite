
/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
    "./components/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        /**TODO - i dont think these are doing anything */
        'spotify-dark-gray': 'oklch(0.12 0.05 70)',
        'spotify-off-white': 'oklch(0.90 0.03 100)',
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
      },
      typography: {
        DEFAULT: {
          css: {
            color: 'var(--spotify-off-white)',
            h1: {
              color: 'var(--spotify-green)',
            },
            h2: {
              color: 'var(--spotify-green)',
            },
            h3: {
              color: 'var(--spotify-green)',
            },
            strong: {
              color: 'var(--spotify-off-white)',
            },
            a: {
              color: 'var(--spotify-green)',
              '&:hover': {
                color: 'var(--spotify-green-dark)',
              },
            },
            li: {
              color: 'var(--spotify-off-white)',
              p: {
                color: 'var(--spotify-off-white)',
              }
            },
          },
        },
      },
    },
  },
  plugins: [
    require('@tailwindcss/typography'),
  ],
};