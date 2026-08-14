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
        script: ['"Playwrite US Modern"', 'cursive'],
        logo: ['"Pacifico"', 'cursive'],
        sans: ['"Quicksand"', 'ui-sans-serif', 'system-ui', 'sans-serif'],
        forum: ['"Forum"', 'serif'],
        footerNav: ['"Poppins"', 'sans-serif'],
        georgia: ['Georgia', '"Times New Roman"', 'serif'],
        footerAddress: ['"Quicksand"', 'sans-serif'],
        admin: ['"Poppins"', 'ui-sans-serif', 'system-ui', 'sans-serif'],
        poppins: ['"Poppins"', 'ui-sans-serif', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [require('tailwindcss-animate')],
}
