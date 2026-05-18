'use client';

import { useEffect, useState } from 'react';
import { ThumbsDown, ThumbsUp } from 'lucide-react';
import { cn } from '@/lib/utils';

type Vote = 'like' | 'dislike' | null;

interface State {
  likes: number;
  dislikes: number;
  user: Vote;
}

const EMPTY: State = { likes: 0, dislikes: 0, user: null };

/**
 * Like / dislike pair shown at the end of a blog post.
 *
 * Counts and the current user's vote are persisted in localStorage
 * under `reactions:<slug>`. Re-clicking the chosen reaction undoes
 * it; clicking the opposite reaction switches sides.
 *
 * Phase 1 stub — Phase 2 will move counts to a real backend so they
 * are global instead of per-browser.
 */
export function PostReactions({ slug }: { slug: string }) {
  const storageKey = `reactions:${slug}`;
  const [state, setState] = useState<State>(EMPTY);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(storageKey);
      if (raw) {
        const parsed = JSON.parse(raw) as Partial<State>;
        setState({
          likes: Number(parsed.likes ?? 0),
          dislikes: Number(parsed.dislikes ?? 0),
          user: (parsed.user as Vote) ?? null,
        });
      }
    } catch {
      /* ignore */
    }
  }, [storageKey]);

  const persist = (next: State) => {
    setState(next);
    try {
      localStorage.setItem(storageKey, JSON.stringify(next));
    } catch {
      /* ignore */
    }
  };

  const onLike = () => {
    if (state.user === 'like') {
      persist({ ...state, likes: Math.max(0, state.likes - 1), user: null });
    } else if (state.user === 'dislike') {
      persist({
        likes: state.likes + 1,
        dislikes: Math.max(0, state.dislikes - 1),
        user: 'like',
      });
    } else {
      persist({ ...state, likes: state.likes + 1, user: 'like' });
    }
  };

  const onDislike = () => {
    if (state.user === 'dislike') {
      persist({ ...state, dislikes: Math.max(0, state.dislikes - 1), user: null });
    } else if (state.user === 'like') {
      persist({
        likes: Math.max(0, state.likes - 1),
        dislikes: state.dislikes + 1,
        user: 'dislike',
      });
    } else {
      persist({ ...state, dislikes: state.dislikes + 1, user: 'dislike' });
    }
  };

  const liked = state.user === 'like';
  const disliked = state.user === 'dislike';

  return (
    <div className="mt-10 flex flex-wrap items-center gap-3 border-t border-white/10 pt-6">
      <p className="mr-2 text-xs font-semibold uppercase tracking-widest text-muted">
        Was this useful?
      </p>

      <button
        type="button"
        onClick={onLike}
        aria-pressed={liked}
        aria-label={liked ? 'Undo like' : 'Like this post'}
        className={cn(
          'group inline-flex items-center gap-2 rounded-full border px-4 py-2 font-display text-sm font-semibold transition-all duration-200 active:scale-95',
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
        onClick={onDislike}
        aria-pressed={disliked}
        aria-label={disliked ? 'Undo dislike' : 'Dislike this post'}
        className={cn(
          'group inline-flex items-center gap-2 rounded-full border px-4 py-2 font-display text-sm font-semibold transition-all duration-200 active:scale-95',
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
    </div>
  );
}
