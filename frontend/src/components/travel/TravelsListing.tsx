'use client';

import Link from 'next/link';
import { useMemo, useRef, useState } from 'react';
import { MapPin, Search, X } from 'lucide-react';
import { PLACES, type Place } from '@/lib/travel-data';
import { cn } from '@/lib/utils';

/**
 * Client-side travel grid with live search. Searches across city,
 * country, excerpt, and date.
 */
export function TravelsListing() {
  const [query, setQuery] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return PLACES;
    return PLACES.filter(
      (p) =>
        p.city.toLowerCase().includes(q) ||
        p.country.toLowerCase().includes(q) ||
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
            placeholder="Search travels — city, country, or date…"
            aria-label="Search travels"
            className="w-full rounded-full border border-white/15 bg-ink-card/80 py-3 pl-11 pr-24 text-sm text-white placeholder:text-muted/70 backdrop-blur transition focus:border-gold focus:outline-none focus:ring-2 focus:ring-gold/30"
          />

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
            ? `Showing ${filtered.length} of ${PLACES.length}`
            : `${PLACES.length} place${PLACES.length === 1 ? '' : 's'}`}
        </p>
      </div>

      {/* Grid / empty state */}
      {filtered.length > 0 ? (
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((p) => (
            <PlaceCard key={p.slug} place={p} />
          ))}
        </div>
      ) : (
        <div className="py-16 text-center">
          <p className="text-muted">
            No places match &quot;<span className="text-white">{query}</span>&quot;.
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

function PlaceCard({ place: p }: { place: Place }) {
  return (
    <article className="group overflow-hidden rounded-xl border border-white/10 bg-ink-card transition hover:border-gold/40">
      <Link href={`/travels/${p.slug}`} className="block">
        <div
          className={cn('relative aspect-[4/3] w-full bg-gradient-to-br', p.gradient)}
        >
          <div className="absolute inset-0 bg-ink/30 transition group-hover:bg-ink/55" />
          <div className="absolute left-4 top-4 inline-flex items-center gap-2 rounded-full bg-ink/70 px-3 py-1 text-xs font-medium uppercase tracking-widest text-gold">
            <MapPin size={12} />
            {p.country}
          </div>
          <span className="absolute right-4 top-4 rounded-full bg-ink/70 px-3 py-1 text-xs font-medium text-white">
            {p.date}
          </span>
        </div>
        <div className="p-5">
          <h3 className="font-display text-lg font-semibold text-white transition group-hover:text-gold">
            {p.city}
          </h3>
          <p className="mt-1 text-sm text-muted">{p.country}</p>
          <p className="mt-3 line-clamp-2 text-sm text-muted">{p.excerpt}</p>
          <p className="mt-4 inline-flex items-center gap-2 font-display text-sm font-medium text-gold opacity-0 transition group-hover:opacity-100">
            Read story &rarr;
          </p>
        </div>
      </Link>
    </article>
  );
}
