/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        civic: {
          50: '#effbf9',
          100: '#d7f4ef',
          500: '#0d9488',
          600: '#0f766e',
          700: '#115e59',
          900: '#123b3a',
          950: '#081d2c'
        },
        signal: '#f5b942'
      },
      fontFamily: {
        sans: ['Inter', 'ui-sans-serif', 'system-ui', 'sans-serif'],
        display: ['Georgia', 'Cambria', 'Times New Roman', 'serif']
      },
      boxShadow: {
        lift: '0 24px 70px -30px rgba(8, 29, 44, .35)',
        card: '0 12px 36px -24px rgba(15, 23, 42, .38)'
      },
      backgroundImage: {
        'civic-grid': 'linear-gradient(rgba(255,255,255,.045) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,.045) 1px, transparent 1px)'
      }
    }
  },
  plugins: []
};
