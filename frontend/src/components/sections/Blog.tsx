import Link from 'next/link';
import { SectionTitle } from '@/components/ui/SectionTitle';
import { cn } from '@/lib/utils';

interface Post {
  slug: string;
  date: string;
  title: string;
  excerpt: string;
  gradient: string;
}

const POSTS: Post[] = [
  {
    slug: 'building-voice-agents',
    date: 'May 10, 2026',
    title: 'Building voice agents that actually understand context',
    excerpt:
      'How I combined Whisper, LangChain tool calling, and a tiny Zustand store to make a portfolio that listens.',
    gradient: 'from-amber-500/40 to-rose-700/40',
  },
  {
    slug: 'rag-over-cv',
    date: 'Apr 22, 2026',
    title: 'A practical RAG setup over your own CV',
    excerpt:
      'Chunking strategies, embeddings, and why ChromaDB is plenty for a personal site — no Pinecone needed.',
    gradient: 'from-sky-500/40 to-violet-700/40',
  },
  {
    slug: 'next-fastapi',
    date: 'Mar 30, 2026',
    title: 'Next.js + FastAPI: my default starter for AI apps',
    excerpt:
      'Typed end-to-end, deploys to Vercel and Render, fast to iterate. Here’s the layout I keep reaching for.',
    gradient: 'from-emerald-500/40 to-teal-700/40',
  },
];

export function Blog() {
  return (
    <section id="blog" className="section-padding bg-ink">
      <div className="container">
        <SectionTitle
          eyebrow="Latest writing"
          title="Blog"
          subtitle="Notes from things I'm building."
        />

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
      </div>
    </section>
  );
}
