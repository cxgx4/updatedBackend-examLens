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
        canvas: {
          DEFAULT: '#07090D',
          darker: '#040508',
          subtle: '#0B0F15',
        },
        panel: {
          DEFAULT: '#0D1117',
          elevated: '#121720',
          border: '#1F2937',
          hairline: '#18202C',
        },
        brand: {
          red: '#FF3B30',
          redGlow: 'rgba(255, 59, 48, 0.25)',
          redDark: '#C7241A',
        },
        topic: {
          amber: '#F59E0B',
          cyan: '#06B6D4',
          violet: '#8B5CF6',
          lime: '#A3E635',
          rose: '#F43F5E',
          blue: '#3B82F6',
        }
      },
      fontFamily: {
        display: ['"Bebas Neue"', 'Impact', 'sans-serif'],
        sans: ['Inter', '-apple-system', 'BlinkMacSystemFont', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'SFMono-Regular', 'Menlo', 'monospace'],
      },
      letterSpacing: {
        ultra: '0.18em',
        mega: '0.25em',
      },
      boxShadow: {
        'glow-red': '0 0 35px -5px rgba(255, 59, 48, 0.35)',
        'glow-red-lg': '0 0 60px -10px rgba(255, 59, 48, 0.45)',
        'panel': '0 4px 20px -2px rgba(0, 0, 0, 0.7)',
        'laser': '0 0 10px rgba(255, 59, 48, 0.8), 0 0 20px rgba(255, 59, 48, 0.4)',
      },
      keyframes: {
        marquee: {
          '0%': { transform: 'translateX(0%)' },
          '100%': { transform: 'translateX(-50%)' },
        },
        scanline: {
          '0%': { transform: 'translateY(-100%)' },
          '100%': { transform: 'translateY(1000%)' },
        },
        pulseSubtle: {
          '0%, 100%': { opacity: 1 },
          '50%': { opacity: 0.5 },
        },
        radar: {
          '0%': { transform: 'rotate(0deg)' },
          '100%': { transform: 'rotate(360deg)' },
        }
      },
      animation: {
        marquee: 'marquee 28s linear infinite',
        scanline: 'scanline 8s linear infinite',
        'pulse-subtle': 'pulseSubtle 2.5s ease-in-out infinite',
        radar: 'radar 10s linear infinite',
      }
    },
  },
  plugins: [],
}
