'use client';

import { useEffect, useState } from 'react';
import { Moon, Sun } from 'lucide-react';

type Theme = 'dark' | 'light';

/**
 * Floating theme toggle. Sits directly above the voice assistant orb
 * (bottom-right). Click swaps between dark and light, persists the
 * choice in localStorage, and toggles the `.dark` class on <html>.
 *
 * The initial paint is handled by the inline script in layout.tsx
 * (which sets the class before React hydrates), so there is no flash
 * of the wrong theme.
 */
export function ThemeToggle() {
  const [theme, setTheme] = useState<Theme | null>(null);

  // Sync our state with whatever the boot script decided.
  useEffect(() => {
    const current: Theme = document.documentElement.classList.contains('dark')
      ? 'dark'
      : 'light';
    setTheme(current);
  }, []);

  const toggle = () => {
    const next: Theme = theme === 'dark' ? 'light' : 'dark';
    setTheme(next);
    try {
      localStorage.setItem('theme', next);
    } catch {
      /* localStorage may be blocked (privacy mode) — ignore */
    }
    document.documentElement.classList.toggle('dark', next === 'dark');
  };

  // Reserve the layout slot but render nothing visible until we know
  // the theme — prevents a brief icon-flip on hydration.
  if (!theme) {
    return (
      <div
        aria-hidden
        className="pointer-events-none fixed bottom-[5.25rem] right-6 z-50 h-11 w-11"
      />
    );
  }

  const isDark = theme === 'dark';

  return (
    <button
      type="button"
      onClick={toggle}
      aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
      title={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
      className="fixed bottom-[5.25rem] right-6 z-50 flex h-11 w-11 items-center justify-center rounded-full border border-white/15 bg-ink-card/80 text-white shadow-lg backdrop-blur transition hover:scale-110 hover:border-gold hover:text-gold focus:outline-none focus:ring-2 focus:ring-gold/40 motion-safe:animate-pop-in"
    >
      {/* Subtle icon swap with rotation */}
      <span className="relative inline-flex h-[18px] w-[18px] items-center justify-center">
        <Sun
          size={18}
          className={`absolute transition-all duration-300 ${
            isDark ? 'rotate-0 scale-100 opacity-100' : '-rotate-90 scale-50 opacity-0'
          }`}
        />
        <Moon
          size={18}
          className={`absolute transition-all duration-300 ${
            isDark ? 'rotate-90 scale-50 opacity-0' : 'rotate-0 scale-100 opacity-100'
          }`}
        />
      </span>
    </button>
  );
}
