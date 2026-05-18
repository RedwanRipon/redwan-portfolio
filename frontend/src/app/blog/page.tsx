import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { POSTS } from '@/lib/blog-data';
import { cn } from '@/lib/utils';

export const metadata = { title: 'Blogs — Md Redwan Hossain' };

export default function BlogIndexPage() {
  return (
    <div className="bg-ink">
      {/* Page header — accounts for the fixed navbar (pt-32) */}
      <header className="border-b border-white/10 bg-ink-deep pb-16 pt-32">
        <div className="container">
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
        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
          {POSTS.map((post) => (
            <article
              key={post.slug}
              className="group overflow-hidden rounded-xl border border-white/10 bg-ink-card transition hover:border-gold/40"
            >
              <Link href={`/blog/${post.slug}`} className="block">
                <div
                  className={cn('relative aspect-[16/10] bg-gradient-to-br', post.gradient)}
                >
                  <span className="absolute bottom-4 left-4 rounded bg-ink/80 px-3 py-1 text-xs font-medium uppercase tracking-widest text-gold">
                    {post.date}
                  </span>
                </div>
                <div className="p-6">
                  <h3 className="font-display text-lg font-semibold leading-snug text-white transition group-hover:text-gold">
                    {post.title}
                  </h3>
                  <p className="mt-3 text-sm text-muted">{post.excerpt}</p>
                  <p className="mt-5 inline-flex items-center gap-2 font-display text-sm font-medium text-gold">
                    Continue reading &rarr;
                  </p>
                </div>
              </Link>
            </article>
          ))}
        </div>

        {/* Empty state hint if no posts */}
        {POSTS.length === 0 && (
          <p className="text-center text-muted">No posts yet — check back soon.</p>
        )}
      </main>
    </div>
  );
}
