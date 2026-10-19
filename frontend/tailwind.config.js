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
        bg: {
          DEFAULT: 'var(--bg)',
          cream: 'var(--bg-cream)',
          warm: 'var(--bg-warm)',
        },
        peach: 'var(--peach)',
        'grey-card': 'var(--grey-card)',
        border: {
          DEFAULT: 'var(--border)',
        },
        ink: {
          DEFAULT: 'var(--ink)',
          soft: 'var(--ink-soft)',
          faint: 'var(--ink-faint)',
        },
        primary: {
          DEFAULT: 'var(--primary)',
          hover: 'var(--primary-hover)',
          tint: 'var(--primary-tint)',
          deep: 'var(--primary-deep)',
          text: 'var(--primary-text)',
        },
        'on-primary': 'var(--on-primary)',
        accent: {
          DEFAULT: 'var(--accent)',
          tint: 'var(--accent-tint)',
          soft: 'var(--accent-soft)',
        },
        status: {
          success: 'var(--status-success)',
          warning: 'var(--status-warning)',
          danger: 'var(--status-danger)',
          'success-bg': 'var(--status-success-bg)',
          'warning-bg': 'var(--status-warning-bg)',
          'danger-bg': 'var(--status-danger-bg)',
        },
        topic: {
          orange: 'var(--topic-orange)',
          purple: 'var(--topic-purple)',
          teal: 'var(--topic-teal)',
          rose: 'var(--topic-rose)',
          olive: 'var(--topic-olive)',
          sky: 'var(--topic-sky)',
        },
        // Compatibility aliases for components during migration
        canvas: {
          DEFAULT: 'var(--bg)',
          darker: 'var(--bg-warm)',
          subtle: 'var(--bg-cream)',
        },
        panel: {
          DEFAULT: 'var(--bg)',
          elevated: 'var(--bg-cream)',
          border: 'var(--border)',
          hairline: 'var(--border)',
        },
        brand: {
          red: 'var(--primary)',
          redGlow: 'var(--peach)',
          redDark: 'var(--primary-deep)',
        },
      },
      borderRadius: {
        'card': '24px',
        'card-lg': '32px',
        'input': '16px',
        'pill': '9999px',
      },
      boxShadow: {
        'warm': 'var(--shadow-warm)',
        'warm-lg': 'var(--shadow-warm-lg)',
      },
      fontFamily: {
        sans: ['"Pangea Afrikan"', 'Figtree', 'system-ui', '-apple-system', '"Segoe UI"', 'sans-serif'],
        display: ['"Pangea Afrikan"', 'Figtree', 'system-ui', '-apple-system', '"Segoe UI"', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'SFMono-Regular', 'Menlo', 'monospace'],
      },
    },
  },
  plugins: [],
}
