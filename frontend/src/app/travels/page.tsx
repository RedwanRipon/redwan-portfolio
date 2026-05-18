import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { TravelsListing } from '@/components/travel/TravelsListing';

export const metadata = { title: 'Travels — Md Redwan Hossain' };

export default function TravelsIndexPage() {
  return (
    <div className="bg-ink">
      {/* Page header with looping background video */}
      <header className="relative min-h-[360px] overflow-hidden border-b border-white/10 bg-ink-deep pb-20 pt-32">
        {/* Decorative gradient under the video — shows through if the
            video file is missing, and adds depth around the edges. */}
        <div aria-hidden className="pointer-events-none absolute inset-0">
          <div className="absolute -top-24 left-12 h-72 w-72 rounded-full bg-gold/15 blur-3xl" />
          <div className="absolute -bottom-10 right-12 h-80 w-80 rounded-full bg-violet-500/15 blur-3xl" />
        </div>

        {/* Background video — drop your file at
            /public/videos/travel-banner.mp4 (and optional .webm for
            smaller size on Chrome/Firefox). Muted + playsInline so
            browsers autoplay it without a user gesture. */}
        <video
          className="pointer-events-none absolute inset-0 h-full w-full object-cover object-top"
          autoPlay
          muted
          loop
          playsInline
          preload="auto"
          aria-hidden
        >
          {/* mp4 is smaller in this case, list it first */}
          <source src="/videos/travel-banner.mp4" type="video/mp4" />
          <source src="/videos/travel-banner.webm" type="video/webm" />
        </video>

        {/* Dark gradient overlay so the title stays readable on top of
            any video frame. */}
        <div
          aria-hidden
          className="absolute inset-0 bg-gradient-to-b from-black/45 via-black/60 to-black/85"
        />

        {/* Bottom hairline gold glow */}
        <div
          aria-hidden
          className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-gold/50 to-transparent"
        />

        <div className="container relative">
          <Link
            href="/#travel"
            className="mb-6 inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-widest !text-white/75 transition hover:!text-gold"
          >
            <ArrowLeft size={14} />
            Back to home
          </Link>
          <p className="mb-3 text-xs font-semibold uppercase tracking-widest !text-white drop-shadow dark:!text-gold">
            Wanderlust
          </p>
          <h1 className="font-display text-4xl font-bold !text-white drop-shadow-lg md:text-5xl">
            All Travel Posts
          </h1>
          <p className="mt-4 max-w-2xl text-base !text-white/85 drop-shadow">
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
