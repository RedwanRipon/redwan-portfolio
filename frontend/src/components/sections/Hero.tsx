'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { CornerDownRight } from 'lucide-react';

const ROLES = ['AI/ML Researcher', 'Full-Stack Developer', 'M.Sc. Data Science'];

/** Simple typewriter that cycles through the ROLES array. */
function useTypewriter(words: string[], typeMs = 90, holdMs = 1400) {
  const [text, setText] = useState('');
  const [i, setI] = useState(0);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    const word = words[i % words.length];
    if (!deleting && text === word) {
      const t = setTimeout(() => setDeleting(true), holdMs);
      return () => clearTimeout(t);
    }
    if (deleting && text === '') {
      setDeleting(false);
      setI((n) => (n + 1) % words.length);
      return;
    }
    const t = setTimeout(
      () => {
        const next = deleting ? word.slice(0, text.length - 1) : word.slice(0, text.length + 1);
        setText(next);
      },
      deleting ? typeMs / 2 : typeMs,
    );
    return () => clearTimeout(t);
  }, [text, deleting, i, words, typeMs, holdMs]);

  return text;
}

export function Hero() {
  const typed = useTypewriter(ROLES);

  return (
    <section
      id="home"
      className="relative isolate flex min-h-screen items-center overflow-hidden bg-ink-deep"
    >
      {/* Decorative blurred orbs (replaces particles.js) */}
      <div className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute -top-32 left-1/3 h-96 w-96 rounded-full bg-gold/10 blur-3xl" />
        <div className="absolute bottom-0 right-0 h-80 w-80 rounded-full bg-gold/5 blur-3xl" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_50%,rgba(240,187,98,0.08),transparent_60%)]" />
      </div>

      <div className="container">
        <div className="max-w-3xl pt-24">
          <p className="mb-4 font-display text-base text-gold">— I am Md Redwan Hossain</p>
          <h1 className="font-display text-5xl font-bold leading-tight text-white md:text-7xl">
            <span className="inline-block min-h-[1.2em]">{typed}</span>
            <span className="animate-pulse text-gold">|</span>
          </h1>
          <p className="mt-6 max-w-2xl text-lg text-muted">
            Building voice-driven AI experiences. This portfolio listens — tap the mic
            and talk to an agent that knows my CV, projects, and research.
          </p>

          {/* CTAs */}
          <div className="mt-8 flex flex-wrap gap-4">
            <Link
              href="#portfolio"
              className="rounded-md bg-gold px-7 py-3 font-display text-sm font-semibold uppercase tracking-widest text-ink transition hover:bg-gold-dark"
            >
              View Work
            </Link>
            <Link
              href="#contact"
              className="rounded-md border border-white/15 px-7 py-3 font-display text-sm font-semibold uppercase tracking-widest text-white transition hover:border-gold hover:text-gold"
            >
              Get in touch
            </Link>
          </div>
          <div className="relative mt-5 inline-block">
            {/* Traveling-light highlight that sweeps around the pill */}
            <span
              aria-hidden
              className="pointer-events-none absolute inset-0 rounded-full opacity-70 blur-[2px] motion-safe:animate-border-sweep"
              style={{
                background:
                  'linear-gradient(90deg, transparent 0%, transparent 35%, rgba(196,181,253,0.55) 50%, transparent 65%, transparent 100%)',
                backgroundSize: '200% 100%',
                WebkitMask:
                  'linear-gradient(#000 0 0) content-box, linear-gradient(#000 0 0)',
                WebkitMaskComposite: 'xor',
                maskComposite: 'exclude',
                padding: '1px',
              }}
            />
            <p className="relative inline-flex items-center gap-2 rounded-full border border-violet-400/20 bg-violet-500/5 px-4 py-2 text-xs text-muted/90 backdrop-blur motion-safe:animate-border-pulse">
              Or hit the{' '}
              <span className="font-semibold motion-safe:animate-violet-glow">
                violet orb
              </span>{' '}
              at the bottom-right to talk instead of read
              <CornerDownRight
                size={14}
                className="text-violet-300 motion-safe:animate-nudge-dr"
                aria-hidden
              />
            </p>
          </div>

          {/* Basic info grid (Janemon-style) */}
          <dl className="mt-14 grid grid-cols-1 gap-x-8 gap-y-6 sm:grid-cols-2 lg:grid-cols-4">
            {[
              { k: 'Email', v: 'redwanhossain.seu@gmail.com' },
              { k: 'Location', v: 'Germany' },
              { k: 'Field', v: 'AI / ML' },
              { k: 'Status', v: 'Open to work' },
            ].map(({ k, v }) => (
              <div key={k} className="min-w-0">
                <dt className="text-xs uppercase tracking-widest text-gold">{k}</dt>
                <dd className="mt-1 break-words text-sm text-white">{v}</dd>
              </div>
            ))}
          </dl>
        </div>
      </div>
    </section>
  );
}
