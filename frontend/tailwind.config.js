/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
    "./components/**/*.{js,ts,jsx,tsx}",
    // TODO: specifying colors like this and passing to className didn't work
    "./src/app/components/ui/**/*.{js,ts,jsx,tsx}", // Explicitly adding this path
  ],
  theme: {
    extend: {
      colors: {
        spotifyGreen: '#1DB954',
        spotifyGreenLight: '#1ED760', // Example for a lighter green
        spotifyDarkGreen: '#1A8343',
      },
    },
  },
  plugins: [],
};
