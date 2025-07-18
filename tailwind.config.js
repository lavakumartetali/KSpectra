/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        border: 'rgba(51, 65, 85, 0.5)',
      },
    },
  },
  plugins: [],
};
