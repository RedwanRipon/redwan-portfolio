import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { SectionTitle } from '@/components/ui/SectionTitle';
import { POSTS } from '@/lib/blog-data';
import { cn } from '@/lib/utils';

export function Blog() {
  // Latest 3 posts only on the home section.
  const recent = POSTS.slice(0, 3);

  return (
    <section id="blog" className="section-padding bg-ink">
      <div className="container">
        <SectionTitle
          eyebrow="Latest writing"
          title="Blog"
          subtitle="Notes from things I'm building."
        />

        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
          {recent.map((post) => (
            <article
              key={post.slug}
              className="group overflow-hidden rounded-xl border border-white/10 bg-ink-card transition hover:border-gold/40"
            >
              <Link href={`/blogs/${post.slug}`} className="block">
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

        {/* See all blogs CTA */}
        <div className="mt-12 flex justify-center">
          <Link
            href="/blogs"
            className="group relative inline-flex items-center gap-2 overflow-hidden rounded-md border border-white/15 px-6 py-2.5 font-display text-xs font-semibold uppercase tracking-widest text-white transition-all duration-300 hover:-translate-y-0.5 hover:border-gold hover:!text-white hover:shadow-gold-glow focus-visible:-translate-y-0.5 focus-visible:border-gold focus-visible:!text-white focus-visible:shadow-gold-glow focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold/40 focus-visible:ring-offset-2 focus-visible:ring-offset-ink active:scale-[0.97] dark:hover:!text-neutral-900 dark:focus-visible:!text-neutral-900"
          >
            <span className="relative z-10">See all blogs</span>
            <ArrowRight
              size={14}
              className="relative z-10 transition-transform group-hover:translate-x-1"
            />
            {/* Gold fill slides in from the left on hover / focus */}
            <span
              aria-hidden
              className="absolute inset-0 origin-left scale-x-0 bg-gold transition-transform duration-300 ease-out group-hover:scale-x-100 group-focus-visible:scale-x-100"
            />
          </Link>
        </div>
      </div>
    </section>
  );
}
