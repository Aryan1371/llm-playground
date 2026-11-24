/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        display: ['Space Grotesk', 'sans-serif'],
        mono: ['JetBrains Mono', 'ui-monospace', 'monospace'],
      },
      colors: {
        groq: {
          orange: '#f55036',
          yellow: '#f89c36',
          dark: '#0b0f19',
          surface: '#111827',
          panel: '#151d2f',
          border: '#1f293d',
        }
      }
    },
  },
  plugins: [],
}
