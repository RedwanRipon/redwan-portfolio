'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { Menu, X } from 'lucide-react';
import { cn } from '@/lib/utils';

const NAV_LINKS = [
  { href: '/#home', label: 'Home' },
  { href: '/#about', label: 'About' },
  { href: '/#service', label: 'Services' },
  { href: '/#portfolio', label: 'Portfolio' },
  { href: '/#resume', label: 'Resume' },
  { href: '/#blog', label: 'Blog' },
  { href: '/#contact', label: 'Contact' },
];

export function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState<string>('home');

  // Solidify nav after scroll, and observe section anchors for active state.
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    const ids = NAV_LINKS.map((l) => l.href.split('#')[1]).filter(Boolean);
    const sections = ids
      .map((id) => document.getElementById(id))
      .filter((el): el is HTMLElement => el !== null);
    if (!sections.length) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) setActive(entry.target.id);
        });
      },
      { rootMargin: '-40% 0px -55% 0px', threshold: 0 },
    );
    sections.forEach((s) => observer.observe(s));
    return () => observer.disconnect();
  }, []);

  return (
    <header
      className={cn(
        'fixed inset-x-0 top-0 z-50 transition-all duration-300',
        scrolled
          ? 'bg-ink-card/90 shadow-lg shadow-black/30 backdrop-blur'
          : 'bg-transparent',
      )}
    >
      <nav className="container flex items-center justify-between py-4">
        <Link href="/#home" className="font-display text-xl font-bold tracking-tight text-white">
          Redwan<span className="text-gold">.</span>
        </Link>

        {/* Desktop */}
        <ul className="hidden items-center gap-8 lg:flex">
          {NAV_LINKS.map((link) => {
            const id = link.href.split('#')[1];
            const isActive = active === id;
            return (
              <li key={link.href}>
                <Link
                  href={link.href}
                  className={cn(
                    'font-display text-sm font-medium tracking-wide transition-colors',
                    isActive ? 'text-gold' : 'text-white hover:text-gold',
                  )}
                >
                  {link.label}
                </Link>
              </li>
            );
          })}
        </ul>

        {/* Mobile toggle */}
        <button
          type="button"
          aria-label="Toggle menu"
          onClick={() => setOpen((v) => !v)}
          className="rounded-md p-2 text-white lg:hidden"
        >
          {open ? <X size={22} /> : <Menu size={22} />}
        </button>
      </nav>

      {/* Mobile sheet */}
      {open && (
        <div className="border-t border-white/10 bg-ink-card lg:hidden">
          <ul className="container flex flex-col gap-1 py-4">
            {NAV_LINKS.map((link) => (
              <li key={link.href}>
                <Link
                  href={link.href}
                  onClick={() => setOpen(false)}
                  className="block rounded px-3 py-2 font-display text-sm text-white hover:bg-white/5 hover:text-gold"
                >
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      )}
    </header>
  );
}
