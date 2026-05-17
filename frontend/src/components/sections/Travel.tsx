import { MapPin } from 'lucide-react';
import { cn } from '@/lib/utils';
import { SectionTitle } from '@/components/ui/SectionTitle';

interface Place {
  city: string;
  country: string;
  year?: string;
  /** Tailwind gradient for the placeholder thumbnail. */
  gradient: string;
}

// TODO: replace with real photos in /public/images/travel/*.jpg
const PLACES: Place[] = [
  { city: 'Berlin', country: 'Germany', year: '2025', gradient: 'from-amber-500/40 to-orange-700/40' },
  { city: 'Munich', country: 'Germany', year: '2025', gradient: 'from-sky-500/40 to-indigo-700/40' },
  { city: 'Dhaka', country: 'Bangladesh', year: '2024', gradient: 'from-emerald-500/40 to-teal-700/40' },
  { city: 'Paris', country: 'France', year: '2025', gradient: 'from-rose-500/40 to-pink-700/40' },
  { city: 'Prague', country: 'Czechia', year: '2025', gradient: 'from-violet-500/40 to-fuchsia-700/40' },
  { city: 'Amsterdam', country: 'Netherlands', year: '2025', gradient: 'from-lime-500/40 to-green-700/40' },
];

export function Travel() {
  return (
    <section id="travel" className="section-padding bg-ink-deep">
      <div className="container">
        <SectionTitle
          eyebrow="Beyond the screen"
          title="Travel"
          subtitle="Places I've been — for ideas, for distance, for the long walks."
        />

        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {PLACES.map((p) => (
            <div
              key={`${p.city}-${p.country}`}
              className="group relative overflow-hidden rounded-xl border border-white/10 bg-ink-card"
            >
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
                {p.year && (
                  <span className="absolute right-4 top-4 rounded-full bg-ink/70 px-3 py-1 text-xs font-medium text-white">
                    {p.year}
                  </span>
                )}
              </div>
              <div className="p-5">
                <h3 className="font-display text-lg font-semibold text-white">{p.city}</h3>
                <p className="mt-1 text-sm text-muted">{p.country}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
