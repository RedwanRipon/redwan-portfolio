import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { TravelsListing } from '@/components/travel/TravelsListing';

export const metadata = { title: 'Travels — Md Redwan Hossain' };

export default function TravelsIndexPage() {
  return (
    <div className="bg-ink">
      {/* Page header with decorative banner */}
      <header className="relative overflow-hidden border-b border-white/10 bg-ink-deep pb-20 pt-32">
        {/* Decorative banner layers — pure CSS, no image required.
            Drop a /public/images/travel-banner.png and swap in
            next/image later for a richer header. */}
        <div aria-hidden className="pointer-events-none absolute inset-0">
          <div className="absolute -top-24 left-12 h-72 w-72 rounded-full bg-gold/15 blur-3xl" />
          <div className="absolute -bottom-10 right-12 h-80 w-80 rounded-full bg-violet-500/15 blur-3xl" />
          <div
            className="absolute inset-0"
            style={{
              background:
                'radial-gradient(circle at 28% 35%, rgb(var(--gold) / 0.10), transparent 60%)',
            }}
          />
          <div
            className="absolute inset-0 opacity-30"
            style={{
              backgroundImage:
                'radial-gradient(rgb(var(--fg) / 0.08) 1px, transparent 1.2px)',
              backgroundSize: '24px 24px',
            }}
          />
          <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-gold/40 to-transparent" />
        </div>

        <div className="container relative">
          <Link
            href="/#travel"
            className="mb-6 inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-widest text-muted transition hover:text-gold"
          >
            <ArrowLeft size={14} />
            Back to home
          </Link>
          <p className="mb-3 text-xs font-semibold uppercase tracking-widest text-gold">
            Wanderlust
          </p>
          <h1 className="font-display text-4xl font-bold text-white md:text-5xl">
            All Travel Posts
          </h1>
          <p className="mt-4 max-w-2xl text-base text-muted">
            Every city, walk, and detour I&apos;ve written about — from long
            German afternoons to going home to Dhaka.
          </p>
        </div>
      </header>

      <main className="container py-16">
        <TravelsListing />
      </main>
    </div>
  );
}
