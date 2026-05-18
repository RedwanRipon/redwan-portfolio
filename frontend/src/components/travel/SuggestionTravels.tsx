import Link from 'next/link';
import { MapPin } from 'lucide-react';
import { PLACES } from '@/lib/travel-data';
import { cn } from '@/lib/utils';

/**
 * Sticky left rail on the travel detail page — surfaces 3 other
 * places (excluding the current one).
 */
export function SuggestionTravels({ currentSlug }: { currentSlug: string }) {
  const suggestions = PLACES.filter((p) => p.slug !== currentSlug).slice(0, 3);
  if (suggestions.length === 0) return null;

  return (
    <div className="rounded-2xl border border-white/10 bg-ink-card p-5">
      <h3 className="mb-1 font-display text-base font-semibold text-white">
        More places
      </h3>
      <p className="mb-5 text-xs text-muted">Suggested travels</p>

      <ul className="space-y-4">
        {suggestions.map((p) => (
          <li key={p.slug}>
            <Link href={`/travels/${p.slug}`} className="group block">
              <div
                className={cn(
                  'relative aspect-[16/10] overflow-hidden rounded-lg bg-gradient-to-br',
                  p.gradient,
                )}
              >
                <div className="absolute inset-0 bg-ink/30 transition group-hover:bg-ink/55" />
                <div className="absolute left-2 top-2 inline-flex items-center gap-1 rounded bg-ink/80 px-2 py-0.5 text-[10px] font-medium uppercase tracking-widest text-gold">
                  <MapPin size={10} />
                  {p.country}
                </div>
                <span className="absolute bottom-2 left-2 rounded bg-ink/80 px-2 py-0.5 text-[10px] font-medium uppercase tracking-widest text-white">
                  {p.date}
                </span>
              </div>
              <h4 className="mt-3 font-display text-sm font-semibold leading-snug text-white transition group-hover:text-gold">
                {p.city}
              </h4>
              <p className="mt-1 line-clamp-2 text-xs text-muted">{p.excerpt}</p>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
