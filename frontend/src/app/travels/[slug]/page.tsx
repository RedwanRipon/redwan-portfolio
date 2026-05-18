import Link from 'next/link';
import { ArrowLeft, MapPin } from 'lucide-react';
import { notFound } from 'next/navigation';
import { PLACES } from '@/lib/travel-data';
import { SuggestionTravels } from '@/components/travel/SuggestionTravels';
import { CommentSection } from '@/components/blog/CommentSection';
import { PostReactions } from '@/components/blog/PostReactions';

export function generateStaticParams() {
  return PLACES.map((p) => ({ slug: p.slug }));
}

export function generateMetadata({ params }: { params: { slug: string } }) {
  const place = PLACES.find((p) => p.slug === params.slug);
  return {
    title: place
      ? `${place.city}, ${place.country} — Md Redwan Hossain`
      : 'Travel not found',
    description: place?.excerpt,
  };
}

export default function TravelDetailPage({
  params,
}: {
  params: { slug: string };
}) {
  const place = PLACES.find((p) => p.slug === params.slug);
  if (!place) notFound();

  // Namespace comments + reactions so a city sharing a slug with a blog
  // post (or another travel post elsewhere) doesn't collide in
  // localStorage.
  const storageSlug = `travel-${place.slug}`;

  return (
    <div className="min-h-screen bg-ink">
      <div className="mx-auto w-full max-w-[1360px] px-4 pb-16 pt-32 sm:px-6 lg:px-8">
        {/* Back link */}
        <Link
          href="/travels"
          className="mb-8 inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-widest text-muted transition hover:text-gold"
        >
          <ArrowLeft size={14} />
          Back to all travels
        </Link>

        <div className="grid gap-6 lg:grid-cols-[200px_minmax(0,1fr)_260px] lg:gap-8 xl:grid-cols-[230px_minmax(0,1fr)_300px]">
          {/* Left — suggestions */}
          <aside className="lg:sticky lg:top-24 lg:max-h-[calc(100vh-7rem)] lg:self-start lg:overflow-y-auto">
            <SuggestionTravels currentSlug={place.slug} />
          </aside>

          {/* Middle — main post */}
          <article>
            <header className="mb-10 border-b border-white/10 pb-8">
              <p className="mb-3 inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-widest text-gold">
                <MapPin size={12} />
                {place.country}
              </p>
              <h1 className="font-display text-3xl font-bold leading-tight text-white md:text-4xl">
                {place.city}
              </h1>
              <p className="mt-3 text-sm text-muted">
                <span className="font-semibold text-white">
                  {place.author ?? 'Md Redwan Hossain'}
                </span>
                <span className="mx-2">·</span>
                <span>{place.date}</span>
              </p>
            </header>

            <div className="blog-body">{place.body}</div>

            {/* Like / dislike at the end of the post */}
            <PostReactions slug={storageSlug} />
          </article>

          {/* Right — comments */}
          <aside className="lg:sticky lg:top-24 lg:max-h-[calc(100vh-7rem)] lg:self-start lg:overflow-y-auto">
            <CommentSection slug={storageSlug} />
          </aside>
        </div>
      </div>
    </div>
  );
}
