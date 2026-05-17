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
        ink: {
          DEFAULT: '#191A1C',
          card: '#1b1e22',
          deep: '#121315',
        },
        gold: {
          DEFAULT: '#f0bb62',
          dark: '#d9a44e',
        },
        muted: {
          DEFAULT: '#bdbec1',
        },
      },
      fontFamily: {
        sans: ['var(--font-poppins)', 'system-ui', 'sans-serif'],
        display: ['var(--font-jost)', 'system-ui', 'sans-serif'],
      },
      letterSpacing: {
        widest: '0.18em',
      },
      animation: {
        'fade-in-up': 'fadeInUp 700ms ease-out both',
        'pulse-slow': 'pulse 3s ease-in-out infinite',
        'orb-float': 'orbFloat 5s ease-in-out infinite',
        'orb-glow': 'orbGlow 3s ease-in-out infinite',
        shimmer: 'shimmer 3.5s linear infinite',
        'pop-in': 'popIn 700ms cubic-bezier(0.34, 1.56, 0.64, 1) both',
        'callout-in': 'calloutIn 500ms ease-out both',
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
      },
    },
  },
  plugins: [],
};

export default config;
