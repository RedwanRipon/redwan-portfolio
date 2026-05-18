import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { BlogsListing } from '@/components/blog/BlogsListing';

export const metadata = { title: 'Blogs — Md Redwan Hossain' };

export default function BlogsIndexPage() {
  return (
    <div className="bg-ink">
      {/* Page header with decorative banner */}
      <header className="relative overflow-hidden border-b border-white/10 bg-ink-deep pb-20 pt-32">
        {/* Banner layers — purely decorative, no pointer events */}
        <div aria-hidden className="pointer-events-none absolute inset-0">
          {/* Large blurred accent orbs */}
          <div className="absolute -top-24 left-12 h-72 w-72 rounded-full bg-gold/15 blur-3xl" />
          <div className="absolute -bottom-10 right-12 h-80 w-80 rounded-full bg-violet-500/15 blur-3xl" />
          {/* Radial highlight */}
          <div
            className="absolute inset-0"
            style={{
              background:
                'radial-gradient(circle at 28% 35%, rgb(var(--gold) / 0.10), transparent 60%)',
            }}
          />
          {/* Subtle dot grid — flips with theme via --fg variable */}
          <div
            className="absolute inset-0 opacity-30"
            style={{
              backgroundImage:
                'radial-gradient(rgb(var(--fg) / 0.08) 1px, transparent 1.2px)',
              backgroundSize: '24px 24px',
            }}
          />
          {/* Bottom glow line */}
          <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-gold/40 to-transparent" />
        </div>

        <div className="container relative">
          <Link
            href="/#blog"
            className="mb-6 inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-widest text-muted transition hover:text-gold"
          >
            <ArrowLeft size={14} />
            Back to home
          </Link>
          <p className="mb-3 text-xs font-semibold uppercase tracking-widest text-gold">
            Notes
          </p>
          <h1 className="font-display text-4xl font-bold text-white md:text-5xl">
            All Blog Posts
          </h1>
          <p className="mt-4 max-w-2xl text-base text-muted">
            Everything I&apos;ve written — about AI, ML, web development, and the things
            I&apos;m currently building.
          </p>
        </div>
      </header>

      <main className="container py-16">
        <BlogsListing />
      </main>
    </div>
  );
}
