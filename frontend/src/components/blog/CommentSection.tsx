'use client';

import { FormEvent, useCallback, useEffect, useState } from 'react';
import { Send, X } from 'lucide-react';
import {
  fetchComments,
  postComment,
  type CommentRead,
  type PostType,
} from '@/lib/api';

interface Props {
  postType: PostType;
  postSlug: string;
}

const PREVIEW_COUNT = 3;

/**
 * Sticky right rail on the post detail page — name + comment + send.
 *
 * Phase 4: backed by the FastAPI /comments endpoint via the Next.js
 * /api/comments proxy. Comments are global — every visitor sees the
 * same list.
 */
export function CommentSection({ postType, postSlug }: Props) {
  const [comments, setComments] = useState<CommentRead[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [name, setName] = useState('');
  const [text, setText] = useState('');
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);

  const [modalOpen, setModalOpen] = useState(false);

  const refresh = useCallback(async () => {
    setError(null);
    try {
      const list = await fetchComments(postType, postSlug);
      setComments(list);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not load comments.');
    } finally {
      setLoading(false);
    }
  }, [postType, postSlug]);

  // Initial load + on slug change.
  useEffect(() => {
    setLoading(true);
    refresh();
  }, [refresh]);

  // Lock body scroll + Esc to close while the modal is open.
  useEffect(() => {
    if (!modalOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setModalOpen(false);
    };
    document.addEventListener('keydown', onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = prev;
    };
  }, [modalOpen]);

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    const trimmedName = name.trim();
    const trimmedText = text.trim();
    if (!trimmedName || !trimmedText || sending) return;

    setSending(true);
    setError(null);
    try {
      const created = await postComment({
        postType,
        postSlug,
        authorName: trimmedName,
        text: trimmedText,
      });
      // Newest-first; optimistic prepend so the user sees it instantly.
      setComments((prev) => [created, ...prev]);
      setName('');
      setText('');
      setSent(true);
      setTimeout(() => setSent(false), 2500);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not post comment.');
    } finally {
      setSending(false);
    }
  };

  function relative(iso: string) {
    const sec = Math.floor((Date.now() - new Date(iso).getTime()) / 1000);
    if (sec < 60) return 'just now';
    if (sec < 3600) return `${Math.floor(sec / 60)}m ago`;
    if (sec < 86400) return `${Math.floor(sec / 3600)}h ago`;
    return `${Math.floor(sec / 86400)}d ago`;
  }

  const hasComments = comments.length > 0;
  const preview = comments.slice(0, PREVIEW_COUNT);
  const remaining = Math.max(0, comments.length - PREVIEW_COUNT);

  return (
    <>
      <div className="rounded-2xl border border-white/10 bg-ink-card p-5">
        <h3 className="mb-1 font-display text-base font-semibold text-white">
          Comments
        </h3>
        <p className="mb-5 text-xs text-muted">
          {loading
            ? 'Loading comments…'
            : hasComments
              ? `${comments.length} comment${comments.length === 1 ? '' : 's'} so far. Add yours below.`
              : 'No comments yet — be the first to leave a thought.'}
        </p>

        {/* Latest few comments (preview) + 'see all' link */}
        {hasComments && (
          <>
            <ul className="space-y-3">
              {preview.map((c) => (
                <li
                  key={c.id}
                  className="rounded-lg border border-white/5 bg-ink/40 p-3"
                >
                  <div className="flex items-baseline justify-between gap-3">
                    <p className="font-display text-sm font-semibold text-white">
                      {c.author_name}
                    </p>
                    <p className="text-[10px] uppercase tracking-widest text-muted">
                      {relative(c.created_at)}
                    </p>
                  </div>
                  <p className="mt-1 whitespace-pre-line text-sm text-muted">
                    {c.text}
                  </p>
                </li>
              ))}
            </ul>

            {remaining > 0 && (
              <button
                type="button"
                onClick={() => setModalOpen(true)}
                className="mt-3 inline-flex items-center gap-1.5 text-xs font-semibold uppercase tracking-widest text-gold underline-offset-4 transition hover:underline"
              >
                See all comments ({comments.length})
                <span aria-hidden>&rarr;</span>
              </button>
            )}

            <hr className="my-5 border-white/10" />
          </>
        )}

        {/* Comment form (always at the bottom) */}
        <form onSubmit={submit} className="space-y-3">
          <input
            required
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Your name"
            disabled={sending}
            maxLength={80}
            className="w-full rounded-md border border-white/10 bg-ink px-3 py-2 text-sm text-white placeholder:text-muted/70 focus:border-gold focus:outline-none focus:ring-1 focus:ring-gold/30 disabled:opacity-60"
          />
          <textarea
            required
            rows={3}
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="Write a comment…"
            disabled={sending}
            maxLength={2000}
            className="w-full resize-y rounded-md border border-white/10 bg-ink px-3 py-2 text-sm text-white placeholder:text-muted/70 focus:border-gold focus:outline-none focus:ring-1 focus:ring-gold/30 disabled:opacity-60"
          />
          <button
            type="submit"
            disabled={sending || !name.trim() || !text.trim()}
            className="inline-flex w-full items-center justify-center gap-2 rounded-md bg-gold px-4 py-2 font-display text-xs font-semibold uppercase tracking-widest !text-white shadow-gold-sm transition hover:bg-gold-dark hover:shadow-gold-lg active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-60 dark:!text-neutral-900"
          >
            <Send size={13} />
            {sending ? 'Sending…' : sent ? 'Sent!' : 'Send'}
          </button>

          {error && (
            <p className="text-xs text-rose-300" role="alert">
              {error}
            </p>
          )}
        </form>
      </div>

      {/* "See all comments" modal */}
      {modalOpen && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label="All comments"
          className="fixed inset-0 z-[100] flex items-center justify-center p-4"
        >
          <button
            type="button"
            aria-label="Close"
            onClick={() => setModalOpen(false)}
            className="absolute inset-0 bg-black/65 backdrop-blur-sm"
          />

          <div className="relative flex max-h-[85vh] w-full max-w-lg flex-col overflow-hidden rounded-2xl border border-white/10 bg-ink-card shadow-2xl motion-safe:animate-pop-in">
            <header className="flex items-center justify-between border-b border-white/10 px-5 py-4">
              <h3 className="font-display text-base font-semibold text-white">
                All comments ({comments.length})
              </h3>
              <button
                type="button"
                onClick={() => setModalOpen(false)}
                aria-label="Close"
                className="rounded-full p-1.5 text-muted transition hover:bg-white/5 hover:text-white"
              >
                <X size={18} />
              </button>
            </header>

            <ul className="flex-1 space-y-3 overflow-y-auto p-5">
              {comments.map((c) => (
                <li
                  key={c.id}
                  className="rounded-lg border border-white/5 bg-ink/40 p-3"
                >
                  <div className="flex items-baseline justify-between gap-3">
                    <p className="font-display text-sm font-semibold text-white">
                      {c.author_name}
                    </p>
                    <p className="text-[10px] uppercase tracking-widest text-muted">
                      {relative(c.created_at)}
                    </p>
                  </div>
                  <p className="mt-1 whitespace-pre-line text-sm text-muted">
                    {c.text}
                  </p>
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}
    </>
  );
}
