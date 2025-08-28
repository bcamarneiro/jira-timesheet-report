/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./frontend/**/*.{js,ts,jsx,tsx}",
    "./frontend/react/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#eff6ff',
          100: '#dbeafe',
          500: '#007bff',
          600: '#0056b3',
          700: '#004085',
        },
        danger: {
          500: '#dc3545',
          600: '#c82333',
        },
        success: {
          50: '#e6f6ea',
          500: '#28a745',
        },
        warning: {
          50: '#fff6cc',
          500: '#ffc107',
        },
        error: {
          50: '#ffe9e3',
          500: '#fd7e14',
        }
      },
      fontFamily: {
        sans: ['system-ui', 'sans-serif'],
      },
      spacing: {
        '18': '4.5rem',
        '88': '22rem',
      },
      borderRadius: {
        'xl': '0.75rem',
      },
      boxShadow: {
        'soft': '0 2px 4px rgba(0, 0, 0, 0.1)',
        'medium': '0 4px 6px rgba(0, 0, 0, 0.1)',
        'large': '0 10px 15px rgba(0, 0, 0, 0.1)',
      }
    },
  },
  plugins: [],
}
