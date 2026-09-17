/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  darkMode: 'class', 
  theme: {
    extend: {
      fontFamily: {
        sans: ['Plus Jakarta Sans', 'Inter', 'Geist', 'system-ui', 'sans-serif'],
        mono: ['JetBrains Mono', 'Fira Code', 'monospace'],
      },
      colors: {
        // Deep Obsidian & Cyber Dark Backgrounds
        nexus: {
          950: '#050909',
          900: '#070D0D', // Deep Obsidian background
          850: '#0A1415', // Inner chat background
          800: '#0E1C1D', // Sidebar & panels
          700: '#15282A', // Elevated cards & popups
          600: '#1D3638', // Hover states
          500: '#27484B', // Subtle borders & dividers
          400: '#386568', // Active borders
        },
        // Cyber Mint & Emerald Glow (Eye-friendly, high-contrast, scientific)
        primary: {
          50: '#ECFDF5',
          100: '#D1FAE5',
          200: '#A7F3D0',
          300: '#6EE7B7',
          400: '#34D399', // Bright Mint
          500: '#10B981', // Emerald primary
          600: '#059669',
          700: '#047857',
          800: '#065F46',
          900: '#064E3B',
        },
        // Neon Cyan / Teal Accent
        accent: {
          300: '#5EEAD4',
          400: '#2DD4BF', // Neon Teal
          500: '#14B8A6',
          600: '#0D9488',
        },
        // Solar Gold / Amber (For key mathematical insights & theorems)
        amber: {
          300: '#FCD34D',
          400: '#FBBF24',
          500: '#F59E0B',
        },
        // Research Indigo / Violet (For Citations & references)
        indigo: {
          300: '#A5B4FC',
          400: '#818CF8',
          500: '#6366F1',
        },
      },
      boxShadow: {
        'glow-emerald': '0 0 20px -5px rgba(16, 185, 129, 0.25)',
        'glow-teal': '0 0 20px -5px rgba(45, 212, 191, 0.25)',
        'glow-card': '0 4px 20px -2px rgba(0, 0, 0, 0.5), 0 0 1px 1px rgba(39, 72, 75, 0.4)',
      },
    },
  },
  plugins: [],
}