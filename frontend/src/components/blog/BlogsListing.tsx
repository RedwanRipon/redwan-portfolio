'use client';

import Link from 'next/link';
import { useMemo, useRef, useState } from 'react';
import { Search, X } from 'lucide-react';
import { POSTS, type Post } from '@/lib/blog-data';
import { cn } from '@/lib/utils';

/**
 * Client-side blog grid with live search. Searches across title,
 * excerpt, and date so a query like 'rag' or 'may 2026' both work.
 */
export function BlogsListing() {
  const [query, setQuery] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return POSTS;
    return POSTS.filter(
      (p) =>
        p.title.toLowerCase().includes(q) ||
        p.excerpt.toLowerCase().includes(q) ||
        p.date.toLowerCase().includes(q),
    );
  }, [query]);

  return (
    <>
      {/* Search bar */}
      <div className="mx-auto mb-10 max-w-2xl">
        <form
          onSubmit={(e) => {
            // Filtering is live — keep the form, just suppress reload.
            e.preventDefault();
            inputRef.current?.focus();
          }}
          className="relative"
          role="search"
        >
          <Search
            size={18}
            className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-muted"
          />
          <input
            ref={inputRef}
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search blogs — title, topic, or date…"
            aria-label="Search blogs"
            className="w-full rounded-full border border-white/15 bg-ink-card/80 py-3 pl-11 pr-24 text-sm text-white placeholder:text-muted/70 backdrop-blur transition focus:border-gold focus:outline-none focus:ring-2 focus:ring-gold/30"
          />

          {/* Clear (X) — appears only when there's a query */}
          {query && (
            <button
              type="button"
              onClick={() => {
                setQuery('');
                inputRef.current?.focus();
              }}
              aria-label="Clear search"
              title="Clear"
              className="absolute right-14 top-1/2 -translate-y-1/2 rounded-full p-1 text-muted transition hover:bg-white/5 hover:text-gold"
            >
              <X size={15} />
            </button>
          )}

          {/* Gold search button on the right */}
          <button
            type="submit"
            aria-label="Search"
            title="Search"
            className="absolute right-1.5 top-1/2 inline-flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full bg-gold !text-white shadow-gold-sm transition-all duration-200 hover:scale-105 hover:bg-gold-dark hover:shadow-gold-lg active:scale-95 dark:!text-neutral-900"
          >
            <Search size={16} />
          </button>
        </form>

        <p className="mt-3 text-center text-xs text-muted">
          {query
            ? `Showing ${filtered.length} of ${POSTS.length}`
            : `${POSTS.length} post${POSTS.length === 1 ? '' : 's'}`}
        </p>
      </div>

      {/* Grid / empty state */}
      {filtered.length > 0 ? (
        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
          {filtered.map((post) => (
            <PostCard key={post.slug} post={post} />
          ))}
        </div>
      ) : (
        <div className="py-16 text-center">
          <p className="text-muted">
            No posts match &quot;<span className="text-white">{query}</span>&quot;.
          </p>
          <button
            type="button"
            onClick={() => setQuery('')}
            className="mt-4 text-sm font-medium text-gold underline-offset-4 hover:underline"
          >
            Clear search
          </button>
        </div>
      )}
    </>
  );
}

function PostCard({ post }: { post: Post }) {
  return (
    <article className="group overflow-hidden rounded-xl border border-white/10 bg-ink-card transition hover:border-gold/40">
      <Link href={`/blogs/${post.slug}`} className="block">
        <div className={cn('relative aspect-[16/10] bg-gradient-to-br', post.gradient)}>
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
  );
}
