import type { Config } from 'tailwindcss';

/**
 * Janemon-inspired palette.
 *   ink         — deep section background (#191A1C, near-black with warm tint)
 *   ink-card    — slightly raised card / nav background (#1b1e22)
 *   gold        — signature accent (#f0bb62)
 *   muted       — body text on dark (#bdbec1)
 */
const config: Config = {
  content: ['./src/**/*.{js,ts,jsx,tsx,mdx}'],
  darkMode: 'class',
  theme: {
    container: {
      center: true,
      padding: '1.5rem',
      screens: {
        sm: '640px',
        md: '768px',
        lg: '1024px',
        xl: '1140px',
      },
    },
    extend: {
      colors: {
        // `ink` and `muted` are driven by CSS variables defined in
        // globals.css so the entire palette can flip between dark and
        // light themes via the `.dark` class on <html>. Using the
        // <alpha-value> token preserves Tailwind opacity modifiers
        // (e.g. bg-ink-card/80).
        ink: {
          DEFAULT: 'rgb(var(--ink-default) / <alpha-value>)',
          card: 'rgb(var(--ink-card) / <alpha-value>)',
          deep: 'rgb(var(--ink-deep) / <alpha-value>)',
        },
        gold: {
          DEFAULT: 'rgb(var(--gold) / <alpha-value>)',
          dark: 'rgb(var(--gold-dark) / <alpha-value>)',
        },
        muted: {
          DEFAULT: 'rgb(var(--muted) / <alpha-value>)',
        },
      },
      fontFamily: {
        sans: ['var(--font-poppins)', 'system-ui', 'sans-serif'],
        display: ['var(--font-jost)', 'system-ui', 'sans-serif'],
      },
      letterSpacing: {
        widest: '0.18em',
      },
      boxShadow: {
        // Accent-colored shadows that follow the theme (gold in dark mode,
        // violet in light mode) via the --gold CSS variable.
        'gold-sm': '0 4px 18px rgb(var(--gold) / 0.25)',
        'gold-lg': '0 10px 28px rgb(var(--gold) / 0.45)',
        'gold-glow': '0 10px 28px rgb(var(--gold) / 0.4)',
      },
      animation: {
        'fade-in-up': 'fadeInUp 700ms ease-out both',
        'pulse-slow': 'pulse 3s ease-in-out infinite',
        'orb-float': 'orbFloat 5s ease-in-out infinite',
        'orb-glow': 'orbGlow 3s ease-in-out infinite',
        shimmer: 'shimmer 3.5s linear infinite',
        'pop-in': 'popIn 700ms cubic-bezier(0.34, 1.56, 0.64, 1) both',
        'callout-in': 'calloutIn 500ms ease-out both',
        'nudge-dr': 'nudgeDownRight 1.6s ease-in-out infinite',
        'violet-glow': 'violetGlow 2.4s ease-in-out infinite',
        'border-pulse': 'borderPulse 2.8s ease-in-out infinite',
        'border-sweep': 'borderSweep 4s linear infinite',
      },
      keyframes: {
        fadeInUp: {
          '0%': { opacity: '0', transform: 'translateY(24px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        orbFloat: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-6px)' },
        },
        orbGlow: {
          '0%, 100%': { opacity: '0.5', transform: 'scale(1)' },
          '50%': { opacity: '0.9', transform: 'scale(1.18)' },
        },
        shimmer: {
          '0%': { backgroundPosition: '200% 0' },
          '100%': { backgroundPosition: '-200% 0' },
        },
        popIn: {
          '0%': { opacity: '0', transform: 'scale(0.3) translateY(40px)' },
          '60%': { opacity: '1', transform: 'scale(1.08) translateY(-4px)' },
          '100%': { opacity: '1', transform: 'scale(1) translateY(0)' },
        },
        calloutIn: {
          '0%': { opacity: '0', transform: 'translateY(10px) scale(0.9)' },
          '100%': { opacity: '1', transform: 'translateY(0) scale(1)' },
        },
        nudgeDownRight: {
          '0%, 100%': { transform: 'translate(0, 0)', opacity: '0.6' },
          '50%': { transform: 'translate(5px, 5px)', opacity: '1' },
        },
        violetGlow: {
          '0%, 100%': {
            textShadow: '0 0 0 rgba(196,181,253,0)',
            color: '#c4b5fd',
          },
          '50%': {
            textShadow: '0 0 12px rgba(196,181,253,0.6), 0 0 20px rgba(139,92,246,0.4)',
            color: '#ddd6fe',
          },
        },
        borderPulse: {
          '0%, 100%': {
            borderColor: 'rgba(196,181,253,0.18)',
            boxShadow:
              '0 0 0 0 rgba(139,92,246,0), inset 0 0 0 0 rgba(196,181,253,0)',
          },
          '50%': {
            borderColor: 'rgba(196,181,253,0.6)',
            boxShadow:
              '0 0 18px 1px rgba(139,92,246,0.35), inset 0 0 10px rgba(196,181,253,0.15)',
          },
        },
        borderSweep: {
          '0%': { backgroundPosition: '0% 50%' },
          '100%': { backgroundPosition: '200% 50%' },
        },
      },
    },
  },
  plugins: [],
};

export default config;
