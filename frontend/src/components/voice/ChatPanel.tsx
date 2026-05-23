'use client';

import { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Send, Sparkles, X } from 'lucide-react';
import { cn } from '@/lib/utils';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  text: string;
}

interface Props {
  open: boolean;
  onClose: () => void;
}

// Starter prompts shown when the conversation is empty. Clicking one
// fills the input + sends in one go so the user can start fast.
const SUGGESTIONS = [
  "What's Redwan's master thesis about?",
  'Where did he study?',
  'Tell me about his projects',
];

export function ChatPanel({ open, onClose }: Props) {
  const router = useRouter();
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Scroll to bottom whenever messages or busy state change so the
  // latest message + the typing indicator stay in view.
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth', block: 'end' });
  }, [messages, busy]);

  // Focus the input when the panel opens.
  useEffect(() => {
    if (open) {
      const t = setTimeout(() => inputRef.current?.focus(), 80);
      return () => clearTimeout(t);
    }
  }, [open]);

  // Close on Escape key.
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [open, onClose]);

  /** Smoothly route to the page the agent recommends. */
  function navigate(route: string | null | undefined) {
    if (!route) return;
    // `/#anchor` — scroll within the home page.
    if (route.startsWith('/#')) {
      const id = route.slice(2);
      if (window.location.pathname === '/') {
        document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
      } else {
        router.push(route);
      }
      return;
    }
    router.push(route);
  }

  async function sendText(text: string) {
    const trimmed = text.trim();
    if (!trimmed || busy) return;

    const userMsg: Message = {
      id: crypto.randomUUID(),
      role: 'user',
      text: trimmed,
    };
    setMessages((m) => [...m, userMsg]);
    setInput('');
    setBusy(true);
    setError(null);

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: trimmed }),
      });
      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error ?? `Server returned ${res.status}`);
      }

      const assistantMsg: Message = {
        id: crypto.randomUUID(),
        role: 'assistant',
        text: data.speech ?? '(no reply)',
      };
      setMessages((m) => [...m, assistantMsg]);

      // Small delay so the user sees the reply before the page jumps.
      if (data.route) {
        setTimeout(() => navigate(data.route), 600);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong');
    } finally {
      setBusy(false);
    }
  }

  function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    sendText(input);
  }

  if (!open) return null;

  return (
    <div
      role="dialog"
      aria-label="Ask Redwan AI"
      className={cn(
        // Position: floats above the orb + toggle stack on the right.
        'fixed bottom-36 right-6 z-50 flex flex-col overflow-hidden',
        // Sizing: full width on mobile (with margins), fixed on desktop.
        'h-[480px] max-h-[calc(100vh-10rem)] w-[calc(100vw-3rem)] sm:w-[360px]',
        // Look
        'rounded-2xl border border-white/10 bg-ink-card/95 shadow-2xl backdrop-blur-md',
        // Entry animation
        'motion-safe:animate-fade-in-up',
      )}
    >
      {/* Header */}
      <header className="flex items-center justify-between border-b border-white/10 px-4 py-3">
        <div className="flex items-center gap-2">
          <Sparkles size={15} className="text-violet-400" />
          <h3 className="font-display text-sm font-semibold text-white">
            Ask Redwan AI
          </h3>
        </div>
        <button
          type="button"
          onClick={onClose}
          aria-label="Close chat"
          className="rounded-full p-1.5 text-muted transition hover:bg-white/5 hover:text-white"
        >
          <X size={15} />
        </button>
      </header>

      {/* Messages area */}
      <div className="flex-1 space-y-3 overflow-y-auto px-4 py-4">
        {messages.length === 0 && !busy && !error && (
          <div className="flex h-full flex-col items-center justify-center gap-4 text-center">
            <Sparkles size={28} className="text-violet-400/70" />
            <p className="max-w-[240px] text-sm text-muted">
              Ask me anything about Redwan&apos;s work, education, or projects.
            </p>
            <div className="flex flex-wrap justify-center gap-2 px-2">
              {SUGGESTIONS.map((s) => (
                <button
                  key={s}
                  type="button"
                  onClick={() => sendText(s)}
                  className="rounded-full border border-white/10 px-3 py-1 text-xs text-muted transition hover:border-violet-400/40 hover:text-white"
                >
                  {s}
                </button>
              ))}
            </div>
          </div>
        )}

        {messages.map((m) => (
          <div
            key={m.id}
            className={cn(
              'max-w-[85%] rounded-2xl px-3.5 py-2 text-sm leading-relaxed',
              m.role === 'user'
                ? 'ml-auto bg-violet-600 !text-white'
                : 'mr-auto border border-white/10 bg-ink/60 text-white',
            )}
          >
            {m.text}
          </div>
        ))}

        {busy && (
          <div className="mr-auto flex items-center gap-1.5 rounded-2xl border border-white/10 bg-ink/60 px-3 py-2.5">
            <span
              className="inline-block h-1.5 w-1.5 animate-pulse rounded-full bg-violet-400"
              style={{ animationDelay: '0ms' }}
            />
            <span
              className="inline-block h-1.5 w-1.5 animate-pulse rounded-full bg-violet-400"
              style={{ animationDelay: '150ms' }}
            />
            <span
              className="inline-block h-1.5 w-1.5 animate-pulse rounded-full bg-violet-400"
              style={{ animationDelay: '300ms' }}
            />
          </div>
        )}

        {error && (
          <div className="rounded-md border border-rose-500/30 bg-rose-500/10 px-3 py-2 text-xs text-rose-200">
            <p className="font-semibold">Couldn&apos;t reach the agent</p>
            <p className="mt-1 opacity-80">{error}</p>
            <p className="mt-1 opacity-60">
              Make sure the backend is running at localhost:8000.
            </p>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <form
        onSubmit={onSubmit}
        className="flex gap-2 border-t border-white/10 p-3"
      >
        <input
          ref={inputRef}
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Ask anything…"
          disabled={busy}
          className="flex-1 rounded-full border border-white/10 bg-ink px-4 py-2 text-sm text-white placeholder:text-muted/70 focus:border-violet-400 focus:outline-none focus:ring-1 focus:ring-violet-400/30 disabled:opacity-60"
        />
        <button
          type="submit"
          disabled={!input.trim() || busy}
          aria-label="Send"
          className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-violet-600 !text-white shadow-md transition hover:bg-violet-500 disabled:cursor-not-allowed disabled:bg-white/10 disabled:!text-muted"
        >
          <Send size={14} />
        </button>
      </form>
    </div>
  );
}
