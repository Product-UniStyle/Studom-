/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        brand: {
          blue: '#2F6BFF',
          dark: '#0F1115',
        },
      },
      fontFamily: {
        script: ['"Caveat"', 'cursive'],
        sans: ['"Poppins"', 'ui-sans-serif', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [require('tailwindcss-animate')],
}
