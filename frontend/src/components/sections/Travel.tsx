import Link from 'next/link';
import { ArrowRight, MapPin } from 'lucide-react';
import { cn } from '@/lib/utils';
import { SectionTitle } from '@/components/ui/SectionTitle';
import { PLACES } from '@/lib/travel-data';

export function Travel() {
  // Show the 3 most recent on the home section.
  const recent = PLACES.slice(0, 3);

  return (
    <section id="travel" className="section-padding bg-ink-deep">
      <div className="container">
        <SectionTitle
          eyebrow="Beyond the screen"
          title="Travel"
          subtitle="Places I've been — for ideas, for distance, for the long walks."
        />

        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {recent.map((p) => (
            <article
              key={p.slug}
              className="group overflow-hidden rounded-xl border border-white/10 bg-ink-card transition hover:border-gold/40"
            >
              <Link href={`/travels/${p.slug}`} className="block">
                <div
                  className={cn(
                    'relative aspect-[4/3] w-full bg-gradient-to-br',
                    p.gradient,
                  )}
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
          ))}
        </div>

        {/* More travel posts CTA */}
        <div className="mt-12 flex justify-center">
          <Link
            href="/travels"
            className="group relative inline-flex items-center gap-2 overflow-hidden rounded-md border border-white/15 px-6 py-2.5 font-display text-xs font-semibold uppercase tracking-widest text-white transition-all duration-300 hover:-translate-y-0.5 hover:border-gold hover:!text-white hover:shadow-gold-glow focus-visible:-translate-y-0.5 focus-visible:border-gold focus-visible:!text-white focus-visible:shadow-gold-glow focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold/40 focus-visible:ring-offset-2 focus-visible:ring-offset-ink active:scale-[0.97] dark:hover:!text-neutral-900 dark:focus-visible:!text-neutral-900"
          >
            <span className="relative z-10">More travel posts</span>
            <ArrowRight
              size={14}
              className="relative z-10 transition-transform group-hover:translate-x-1"
            />
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
