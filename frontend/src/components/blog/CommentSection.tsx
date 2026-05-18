'use client';

import { FormEvent, useEffect, useState } from 'react';
import { Send } from 'lucide-react';

interface CommentItem {
  id: string;
  name: string;
  text: string;
  createdAt: number;
}

/**
 * Sticky right rail on the post detail page — name + comment + send,
 * with the existing comments listed below. Comments are persisted to
 * localStorage under `comments:<slug>` (Phase 1 stub; Phase 2 will
 * move this to FastAPI + a real database).
 */
export function CommentSection({ slug }: { slug: string }) {
  const storageKey = `comments:${slug}`;

  const [comments, setComments] = useState<CommentItem[]>([]);
  const [name, setName] = useState('');
  const [text, setText] = useState('');
  const [sent, setSent] = useState(false);

  // Hydrate from localStorage on mount.
  useEffect(() => {
    try {
      const raw = localStorage.getItem(storageKey);
      if (raw) setComments(JSON.parse(raw));
    } catch {
      /* ignore */
    }
  }, [storageKey]);

  const submit = (e: FormEvent) => {
    e.preventDefault();
    const trimmedName = name.trim();
    const trimmedText = text.trim();
    if (!trimmedName || !trimmedText) return;
    const next: CommentItem = {
      id:
        typeof crypto !== 'undefined' && 'randomUUID' in crypto
          ? crypto.randomUUID()
          : `${Date.now()}-${Math.random().toString(36).slice(2)}`,
      name: trimmedName,
      text: trimmedText,
      createdAt: Date.now(),
    };
    const updated = [next, ...comments];
    setComments(updated);
    try {
      localStorage.setItem(storageKey, JSON.stringify(updated));
    } catch {
      /* ignore */
    }
    setName('');
    setText('');
    setSent(true);
    setTimeout(() => setSent(false), 2500);
  };

  function relative(ts: number) {
    const sec = Math.floor((Date.now() - ts) / 1000);
    if (sec < 60) return 'just now';
    if (sec < 3600) return `${Math.floor(sec / 60)}m ago`;
    if (sec < 86400) return `${Math.floor(sec / 3600)}h ago`;
    return `${Math.floor(sec / 86400)}d ago`;
  }

  return (
    <div className="rounded-2xl border border-white/10 bg-ink-card p-5">
      <h3 className="mb-1 font-display text-base font-semibold text-white">Comments</h3>
      <p className="mb-5 text-xs text-muted">Leave a thought below.</p>

      <form onSubmit={submit} className="space-y-3">
        <input
          required
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Your name"
          className="w-full rounded-md border border-white/10 bg-ink px-3 py-2 text-sm text-white placeholder:text-muted/70 focus:border-gold focus:outline-none focus:ring-1 focus:ring-gold/30"
        />
        <textarea
          required
          rows={3}
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Write a comment…"
          className="w-full resize-y rounded-md border border-white/10 bg-ink px-3 py-2 text-sm text-white placeholder:text-muted/70 focus:border-gold focus:outline-none focus:ring-1 focus:ring-gold/30"
        />
        <button
          type="submit"
          className="inline-flex w-full items-center justify-center gap-2 rounded-md bg-gold px-4 py-2 font-display text-xs font-semibold uppercase tracking-widest !text-white shadow-gold-sm transition hover:bg-gold-dark hover:shadow-gold-lg active:scale-[0.98] dark:!text-neutral-900"
        >
          <Send size={13} />
          {sent ? 'Sent!' : 'Send'}
        </button>
      </form>

      <hr className="my-5 border-white/10" />

      <h4 className="mb-3 font-display text-xs font-semibold uppercase tracking-widest text-gold">
        {comments.length} comment{comments.length === 1 ? '' : 's'}
      </h4>

      {comments.length === 0 ? (
        <p className="text-sm text-muted">Be the first to comment.</p>
      ) : (
        <ul className="space-y-4">
          {comments.map((c) => (
            <li key={c.id} className="rounded-lg border border-white/5 bg-ink/40 p-3">
              <div className="flex items-baseline justify-between gap-3">
                <p className="font-display text-sm font-semibold text-white">
                  {c.name}
                </p>
                <p className="text-[10px] uppercase tracking-widest text-muted">
                  {relative(c.createdAt)}
                </p>
              </div>
              <p className="mt-1 whitespace-pre-line text-sm text-muted">{c.text}</p>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
