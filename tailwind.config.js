/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        background: '#080808',
        'background-subtle': '#0E0E0E',
        'background-card': '#121212',
        'background-card-hover': '#171717',
        primary: {
          DEFAULT: '#F5F5F5',
          muted: '#D4D4D4',
        },
        accent: {
          DEFAULT: '#F0A5C8', // soft baby pink
          hover: '#F5B8D4',
          subtle: 'rgba(240, 165, 200, 0.1)',
          border: 'rgba(240, 165, 200, 0.25)',
          glow: 'rgba(240, 165, 200, 0.4)',
          deep: '#B35583',
        },
        muted: {
          DEFAULT: '#888888',
          light: '#A3A3A3',
          dark: '#525252',
        },
        border: {
          DEFAULT: '#1F1F1F',
          subtle: '#181818',
          hover: '#2E2E2E',
        },
      },
      fontFamily: {
        heading: ['"Space Grotesk"', 'sans-serif'],
        sans: ['"Inter"', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'monospace'],
      },
      letterSpacing: {
        tightest: '-0.04em',
        tighter: '-0.02em',
        widest: '0.15em',
      },
      animation: {
        'pulse-subtle': 'pulseSubtle 4s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'flame-glow': 'flameGlow 6s ease-in-out infinite alternate',
      },
      keyframes: {
        pulseSubtle: {
          '0%, 100%': { opacity: '0.9' },
          '50%': { opacity: '0.7' },
        },
        flameGlow: {
          '0%': { filter: 'drop-shadow(0 0 20px rgba(240, 165, 200, 0.15))' },
          '100%': { filter: 'drop-shadow(0 0 45px rgba(240, 165, 200, 0.35))' },
        },
      },
    },
  },
  plugins: [],
}
