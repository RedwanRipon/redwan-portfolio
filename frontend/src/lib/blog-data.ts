/**
 * Shared blog post data — used by both the home page Blog section
 * (shows the latest 3) and the /blog listing page (shows all).
 * Later this can be replaced by an MDX loader over src/content/blog.
 */

export interface Post {
  slug: string;
  date: string;
  title: string;
  excerpt: string;
  /** Tailwind gradient for the placeholder thumbnail. */
  gradient: string;
}

export const POSTS: Post[] = [
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
