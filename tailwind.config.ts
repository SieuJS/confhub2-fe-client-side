import type { Config } from 'tailwindcss'

const config = {
  darkMode: ['class'],
  content: [
    './pages/**/*.{ts,tsx}',
    './components/**/*.{ts,tsx}',
    './app/**/*.{ts,tsx}',
    './src/**/*.{ts,tsx}'
  ],
  prefix: '',
  theme: {
    container: {
      center: true,
      padding: '2rem',
      screens: {
        '2xl': '1440px'
      }
    },
    extend: {
      backgroundImage: {
        'span-bg': 'var(--span-bg)'
      },
      colors: {
        background: 'var(--background)',
        primary: {
          DEFAULT: 'var(--primary)'
        },
        'button-secondary': 'var(--button-secondary)',
        'button-text': 'var(--button-text)',
        'text-secondary': 'var(--text-secondary)',
        'background-secondary': 'var(--background-secondary)',
        secondary: 'var(--secondary)',
        button: 'var(--button)',
        selected: 'var(--selected)',
        dropdown: 'var(--dropdown)',
        dropdownHover: 'var(--dropdown-hover)',
        buttonSecondary: 'var(--button-secondary)'
      },

      fontFamily: {
        sans: ['var(--font-space-grotesk)', 'var(--rubik)']
      },
      keyframes: {
        ripple: { // Keep the original ripple for button hover if uncommented
          '0%': { transform: 'scale(0)', opacity: '0.5' },
          '100%': { transform: 'scale(1.5)', opacity: '0' },
        },
        'pulse-ripple': { // New continuous pulse ripple animation
          '0%': { transform: 'scale(0)', opacity: '0.5' },
          '50%': { transform: 'scale(1.2)', opacity: '0.2' }, // Scale up and slightly fade
          '100%': { transform: 'scale(1.5)', opacity: '0' },   // Scale further and fully fade
        }
      },
      animation: {
        'accordion-down': 'accordion-down 0.2s ease-out',
        'accordion-up': 'accordion-up 0.2s ease-out',
        ripple: 'ripple 0.5s ease-out', // Animation for button hover (if used)
        'pulse-ripple': 'pulse-ripple 1s linear infinite', // Continuous pulse ripple for div
      }
    }
  },
  plugins: [require('tailwindcss-animate')]
} satisfies Config

export default config
