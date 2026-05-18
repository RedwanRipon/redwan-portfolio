import Image from 'next/image';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { BlogsListing } from '@/components/blog/BlogsListing';

export const metadata = { title: 'Blogs — Md Redwan Hossain' };

export default function BlogsIndexPage() {
  return (
    <div className="bg-ink">
      {/* Page header with image banner */}
      <header className="relative overflow-hidden border-b border-white/10 bg-ink-deep pb-20 pt-32">
        {/* Banner image — fills the header behind everything */}
        <Image
          src="/images/blog-banner.png"
          alt=""
          fill
          priority
          sizes="100vw"
          className="object-cover object-center"
        />

        {/* Dark gradient overlay so the title stays readable in both
            themes regardless of how bright the underlying image is. */}
        <div
          aria-hidden
          className="absolute inset-0 bg-gradient-to-b from-black/40 via-black/55 to-black/80"
        />

        {/* Bottom hairline glow for polish */}
        <div
          aria-hidden
          className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-gold/50 to-transparent"
        />

        <div className="container relative">
          <Link
            href="/#blog"
            className="mb-6 inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-widest !text-white/75 transition hover:!text-gold"
          >
            <ArrowLeft size={14} />
            Back to home
          </Link>
          <p className="mb-3 text-xs font-semibold uppercase tracking-widest text-gold drop-shadow">
            Notes
          </p>
          <h1 className="font-display text-4xl font-bold !text-white drop-shadow-lg md:text-5xl">
            All Blog Posts
          </h1>
          <p className="mt-4 max-w-2xl text-base !text-white/85 drop-shadow">
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
