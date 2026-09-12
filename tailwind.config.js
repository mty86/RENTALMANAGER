/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        dark: {
          bg: '#0a0d18',
          surface: '#0f1424',
          card: '#13182b',
          'card-hover': '#182038',
          border: '#1e2642',
          muted: '#8b9bb4',
        },
        neon: {
          pink: '#ff2e93',
          fuchsia: '#ec4899',
          rose: '#f43f5e',
          cyan: '#06b6d4',
          sky: '#38bdf8',
          purple: '#8b5cf6',
          indigo: '#6366f1',
          emerald: '#10b981',
          amber: '#f59e0b',
        },
        brand: {
          50: '#f0fdfa',
          100: '#ccfbf1',
          500: '#14b8a6',
          600: '#0d9488',
          700: '#0f766e',
          800: '#115e59',
          900: '#134e4a',
        },
      },
      boxShadow: {
        'glow-pink': '0 0 20px -3px rgba(255, 46, 147, 0.45)',
        'glow-pink-lg': '0 0 35px -2px rgba(255, 46, 147, 0.65)',
        'glow-cyan': '0 0 20px -3px rgba(6, 182, 212, 0.45)',
        'glow-cyan-lg': '0 0 35px -2px rgba(6, 182, 212, 0.65)',
        'glow-purple': '0 0 20px -3px rgba(139, 92, 246, 0.45)',
      },
      backgroundImage: {
        'neon-gradient': 'linear-gradient(135deg, #ff2e93 0%, #a855f7 100%)',
        'cyan-gradient': 'linear-gradient(135deg, #06b6d4 0%, #3b82f6 100%)',
        'dark-gradient': 'linear-gradient(180deg, #13182b 0%, #0c101e 100%)',
      }
    },
  },
  plugins: [],
}

