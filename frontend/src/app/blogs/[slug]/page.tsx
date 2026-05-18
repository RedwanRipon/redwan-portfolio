import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { notFound } from 'next/navigation';
import { POSTS } from '@/lib/blog-data';
import { SuggestionPosts } from '@/components/blog/SuggestionPosts';
import { CommentSection } from '@/components/blog/CommentSection';

export function generateStaticParams() {
  return POSTS.map((p) => ({ slug: p.slug }));
}

export function generateMetadata({ params }: { params: { slug: string } }) {
  const post = POSTS.find((p) => p.slug === params.slug);
  return {
    title: post ? `${post.title} — Md Redwan Hossain` : 'Post not found',
    description: post?.excerpt,
  };
}

export default function BlogPostPage({ params }: { params: { slug: string } }) {
  const post = POSTS.find((p) => p.slug === params.slug);
  if (!post) notFound();

  return (
    <div className="min-h-screen bg-ink">
      <div className="container pb-16 pt-32">
        {/* Back link */}
        <Link
          href="/blogs"
          className="mb-8 inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-widest text-muted transition hover:text-gold"
        >
          <ArrowLeft size={14} />
          Back to all blogs
        </Link>

        {/* 3-column grid: suggestions (sticky) · article (scrolls) · comments (sticky) */}
        <div className="grid gap-8 lg:grid-cols-[260px_minmax(0,1fr)_320px]">
          {/* Left — suggestions */}
          <aside className="lg:sticky lg:top-24 lg:max-h-[calc(100vh-7rem)] lg:self-start lg:overflow-y-auto">
            <SuggestionPosts currentSlug={post.slug} />
          </aside>

          {/* Middle — main post */}
          <article>
            <header className="mb-10 border-b border-white/10 pb-8">
              <h1 className="font-display text-3xl font-bold leading-tight text-white md:text-4xl">
                {post.title}
              </h1>
              <p className="mt-3 text-sm text-muted">
                <span className="font-semibold text-white">
                  {post.author ?? 'Md Redwan Hossain'}
                </span>
                <span className="mx-2">·</span>
                <span>{post.date}</span>
              </p>
            </header>

            <div className="blog-body">{post.body}</div>
          </article>

          {/* Right — comments */}
          <aside className="lg:sticky lg:top-24 lg:max-h-[calc(100vh-7rem)] lg:self-start lg:overflow-y-auto">
            <CommentSection slug={post.slug} />
          </aside>
        </div>
      </div>
    </div>
  );
}
