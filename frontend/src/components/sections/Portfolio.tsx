'use client';

import { useState } from 'react';
import Link from 'next/link';
import { ExternalLink, Eye } from 'lucide-react';
import { cn } from '@/lib/utils';
import { SectionTitle } from '@/components/ui/SectionTitle';

type Tag = 'all' | 'ai' | 'web' | 'research' | 'voice';

interface Item {
  title: string;
  category: string;
  tags: Exclude<Tag, 'all'>[];
  link?: string;
  /** Optional Tailwind gradient for the placeholder thumbnail. */
  gradient?: string;
}

const FILTERS: { id: Tag; label: string }[] = [
  { id: 'all', label: 'All' },
  { id: 'ai', label: 'AI / ML' },
  { id: 'web', label: 'Web' },
  { id: 'research', label: 'Research' },
  { id: 'voice', label: 'Voice' },
];

// TODO: replace with real projects + screenshots in /public/images/portfolio/*.jpg
const ITEMS: Item[] = [
  {
    title: 'Voice-Driven Portfolio',
    category: 'Next.js, FastAPI, RAG',
    tags: ['ai', 'web', 'voice'],
    link: '#',
    gradient: 'from-amber-500/40 to-orange-700/40',
  },
  {
    title: 'Master’s Thesis Project',
    category: 'AI / ML Research',
    tags: ['ai', 'research'],
    link: '#',
    gradient: 'from-emerald-500/40 to-teal-700/40',
  },
  {
    title: 'RAG Knowledge Base',
    category: 'LangChain, ChromaDB',
    tags: ['ai', 'web'],
    link: '#',
    gradient: 'from-violet-500/40 to-fuchsia-700/40',
  },
  {
    title: 'Whisper Voice Agent',
    category: 'STT + Tool Calling',
    tags: ['ai', 'voice'],
    link: '#',
    gradient: 'from-sky-500/40 to-indigo-700/40',
  },
  {
    title: 'Realtime Chat UI',
    category: 'Next.js, WebSockets',
    tags: ['web'],
    link: '#',
    gradient: 'from-pink-500/40 to-rose-700/40',
  },
  {
    title: 'Paper Implementation',
    category: 'PyTorch, Transformers',
    tags: ['ai', 'research'],
    link: '#',
    gradient: 'from-lime-500/40 to-green-700/40',
  },
];

export function Portfolio() {
  const [active, setActive] = useState<Tag>('all');
  const visible = active === 'all' ? ITEMS : ITEMS.filter((i) => i.tags.includes(active));

  return (
    <section id="portfolio" className="section-padding bg-ink">
      <div className="container">
        <SectionTitle
          eyebrow="The projects"
          title="Selected Work"
          subtitle="A few things I've built and researched recently."
        />

        {/* Filters */}
        <ul className="mb-10 flex flex-wrap items-center justify-center gap-2 sm:gap-4">
          {FILTERS.map((f) => (
            <li key={f.id}>
              <button
                type="button"
                onClick={() => setActive(f.id)}
                className={cn(
                  'rounded-full px-5 py-2 font-display text-sm font-medium transition',
                  active === f.id
                    ? 'bg-gold text-ink'
                    : 'border border-white/10 text-white hover:border-gold hover:text-gold',
                )}
              >
                {f.label}
              </button>
            </li>
          ))}
        </ul>

        {/* Grid */}
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {visible.map((item) => (
            <div
              key={item.title}
              className="group relative overflow-hidden rounded-xl border border-white/10 bg-ink-card"
            >
              {/* Thumbnail (gradient placeholder until real images land) */}
              <div
                className={cn(
                  'relative aspect-[4/3] w-full bg-gradient-to-br',
                  item.gradient,
                )}
              >
                <div className="absolute inset-0 bg-ink/40 transition group-hover:bg-ink/70" />
                <div className="absolute inset-0 flex items-center justify-center gap-3 opacity-0 transition group-hover:opacity-100">
                  <Link
                    href={item.link ?? '#'}
                    className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-gold text-ink transition hover:scale-110"
                    aria-label="View project"
                  >
                    <Eye size={18} />
                  </Link>
                  <Link
                    href={item.link ?? '#'}
                    className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-gold text-ink transition hover:scale-110"
                    aria-label="Open external link"
                  >
                    <ExternalLink size={18} />
                  </Link>
                </div>
              </div>

              <div className="p-5">
                <h3 className="font-display text-lg font-semibold text-white">{item.title}</h3>
                <p className="mt-1 text-sm text-gold">{item.category}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
