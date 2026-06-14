'use client';

import { useCallback, useEffect, useState } from 'react';
import { ThumbsDown, ThumbsUp } from 'lucide-react';
import { cn } from '@/lib/utils';
import {
  deleteReaction,
  fetchReactionCounts,
  getVoterFingerprint,
  postReaction,
  type PostType,
  type ReactionCounts,
} from '@/lib/api';

interface Props {
  postType: PostType;
  postSlug: string;
}

const EMPTY: ReactionCounts = { likes: 0, dislikes: 0, user_vote: null };

/**
 * Like / dislike pair shown at the end of a blog or travel post.
 *
 * Phase 4: counts are global, fetched from the FastAPI /reactions
 * endpoint via the /api/reactions proxy. Each browser is identified
 * by a UUID stored once in localStorage ('voter_fingerprint') so
 * 'one vote per browser per post' is enforced server-side.
 */
export function PostReactions({ postType, postSlug }: Props) {
  const [state, setState] = useState<ReactionCounts>(EMPTY);
  const [loading, setLoading] = useState(true);
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fingerprint = getVoterFingerprint();

  const refresh = useCallback(async () => {
    if (!fingerprint) return;
    setError(null);
    try {
      const counts = await fetchReactionCounts(postType, postSlug, fingerprint);
      setState(counts);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not load reactions.');
    } finally {
      setLoading(false);
    }
  }, [postType, postSlug, fingerprint]);

  useEffect(() => {
    setLoading(true);
    refresh();
  }, [refresh]);

  async function cast(vote: 'like' | 'dislike') {
    if (pending || !fingerprint) return;
    setPending(true);
    setError(null);
    try {
      // Re-clicking the chosen reaction = undo.
      const isUndo = state.user_vote === vote;
      const counts = isUndo
        ? await deleteReaction({ postType, postSlug, fingerprint })
        : await postReaction({ postType, postSlug, fingerprint, vote });
      setState(counts);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not save vote.');
    } finally {
      setPending(false);
    }
  }

  const liked = state.user_vote === 'like';
  const disliked = state.user_vote === 'dislike';

  return (
    <div className="mt-10 flex flex-wrap items-center gap-3 border-t border-white/10 pt-6">
      <p className="mr-2 text-xs font-semibold uppercase tracking-widest text-muted">
        {loading ? 'Loading…' : 'Was this useful?'}
      </p>

      <button
        type="button"
        onClick={() => cast('like')}
        aria-pressed={liked}
        aria-label={liked ? 'Undo like' : 'Like this post'}
        disabled={pending || loading}
        className={cn(
          'group inline-flex items-center gap-2 rounded-full border px-4 py-2 font-display text-sm font-semibold transition-all duration-200 active:scale-95 disabled:cursor-wait disabled:opacity-60',
          liked
            ? 'border-gold bg-gold shadow-gold-sm !text-white dark:!text-neutral-900'
            : 'border-white/15 text-white hover:border-gold hover:text-gold',
        )}
      >
        <ThumbsUp
          size={16}
          fill={liked ? 'currentColor' : 'none'}
          className={cn(
            'transition-transform group-hover:scale-110',
            liked && 'scale-110',
          )}
        />
        <span>{state.likes}</span>
      </button>

      <button
        type="button"
        onClick={() => cast('dislike')}
        aria-pressed={disliked}
        aria-label={disliked ? 'Undo dislike' : 'Dislike this post'}
        disabled={pending || loading}
        className={cn(
          'group inline-flex items-center gap-2 rounded-full border px-4 py-2 font-display text-sm font-semibold transition-all duration-200 active:scale-95 disabled:cursor-wait disabled:opacity-60',
          disliked
            ? 'border-white/40 bg-white/10 text-white'
            : 'border-white/15 text-muted hover:border-white/30 hover:text-white',
        )}
      >
        <ThumbsDown
          size={16}
          fill={disliked ? 'currentColor' : 'none'}
          className={cn(
            'transition-transform group-hover:scale-110',
            disliked && 'scale-110',
          )}
        />
        <span>{state.dislikes}</span>
      </button>

      {error && (
        <p className="text-xs text-rose-300" role="alert">
          {error}
        </p>
      )}
    </div>
  );
}
