/** @type {import('tailwindcss').Config} */
export default {
  content: ['./src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        'neon-purple': '#9333ea',
        'neon-pink': '#ec4899',
        'neon-cyan': '#06b6d4',
        'crimson': '#7f1d1d',
        'void': '#0a0a0f',
        'glass': 'rgba(255,255,255,0.04)',
      },
      fontFamily: {
        display: ['Syne', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace'],
      },
    },
  },
  plugins: [],
}
