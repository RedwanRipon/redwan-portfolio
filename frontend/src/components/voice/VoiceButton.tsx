'use client';

import { useEffect, useRef, useState } from 'react';
import { Sparkles, X } from 'lucide-react';
import { useUIStore } from '@/lib/store';
import { cn } from '@/lib/utils';

/**
 * Floating voice-assistant launcher.
 *   • Pill "Ask Redwan AI"  +  glowing violet orb on the right.
 *   • Click toggles the recording flag in the Zustand store.
 *   • Phase 1: visual shell only — auto-stops after a few seconds since
 *     no STT backend is wired yet. Phase 3 replaces the stub with the
 *     Web Audio capture + WebSocket stream to FastAPI.
 *
 * Attention-grabbers (motion-safe):
 *   - Pop-in entry on mount
 *   - Gentle orb float + idle glow pulse
 *   - Shimmer sweep across the pill
 *   - First-visit callout bubble that auto-dismisses
 */
export function VoiceButton() {
  const { isRecording, setRecording } = useUIStore();
  const active = isRecording;

  const [showCallout, setShowCallout] = useState(false);
  const interactedRef = useRef(false);

  // Show the "try me" bubble shortly after mount, hide after a while.
  useEffect(() => {
    const showT = setTimeout(() => {
      if (!interactedRef.current) setShowCallout(true);
    }, 1500);
    const hideT = setTimeout(() => setShowCallout(false), 9500);
    return () => {
      clearTimeout(showT);
      clearTimeout(hideT);
    };
  }, []);

  // Phase-1 stub: auto-stop the "listening" state after 3.5s.
  useEffect(() => {
    if (!active) return;
    const t = setTimeout(() => setRecording(false), 3500);
    return () => clearTimeout(t);
  }, [active, setRecording]);

  const toggle = () => {
    interactedRef.current = true;
    setShowCallout(false);
    setRecording(!active);
  };

  return (
    <div
      role="region"
      aria-label="Voice assistant"
      className="fixed bottom-6 right-6 z-50 flex items-center gap-2.5 motion-safe:animate-pop-in"
    >
      {/* First-visit callout bubble */}
      {showCallout && !active && (
        <div className="absolute -top-20 right-0 motion-safe:animate-callout-in">
          <div className="relative max-w-[260px] rounded-2xl border border-violet-400/30 bg-ink-card/95 px-4 py-3 text-left shadow-2xl backdrop-blur">
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                setShowCallout(false);
              }}
              aria-label="Dismiss"
              className="absolute right-2 top-2 rounded-full p-1 text-muted hover:text-white"
            >
              <X size={12} />
            </button>
            <p className="pr-4 font-display text-sm text-white">
              <span className="mr-1.5">👋</span>
              Try voice — ask me anything!
            </p>
            <p className="mt-1 text-xs text-muted">
              Tap the orb to start a conversation.
            </p>
            {/* Pointer */}
            <span
              aria-hidden
              className="absolute -bottom-1.5 right-7 h-3 w-3 rotate-45 border-b border-r border-violet-400/30 bg-ink-card/95"
            />
          </div>
        </div>
      )}

      {/* Label pill (hidden on tiny phones) — wrapped so the border-sweep
          ring can sit on top of the button outline without being clipped. */}
      <div className="relative hidden sm:block">
        {/* Traveling light streak around the border */}
        <span
          aria-hidden
          className="pointer-events-none absolute inset-0 rounded-full opacity-70 blur-[2px] motion-safe:animate-border-sweep"
          style={{
            background:
              'linear-gradient(90deg, transparent 0%, transparent 35%, rgba(196,181,253,0.55) 50%, transparent 65%, transparent 100%)',
            backgroundSize: '200% 100%',
            WebkitMask:
              'linear-gradient(#000 0 0) content-box, linear-gradient(#000 0 0)',
            WebkitMaskComposite: 'xor',
            maskComposite: 'exclude',
            padding: '1px',
          }}
        />
        <button
          type="button"
          onClick={toggle}
          className={cn(
            'group relative overflow-hidden rounded-full border bg-ink-card/80 px-4 py-2 font-display text-[13px] font-medium backdrop-blur transition motion-safe:animate-border-pulse',
            active
              ? 'border-violet-400/60 text-violet-700 dark:text-violet-200'
              : 'border-white/15 text-white hover:border-violet-400/60 hover:text-violet-700 dark:hover:text-violet-200',
          )}
        >
          <span className="relative z-10">
            {active ? 'Listening…' : 'Ask Redwan AI'}
          </span>
          {/* Shimmer sweep across the text (only when idle) */}
          {!active && (
            <span
              aria-hidden
              className="pointer-events-none absolute inset-0 motion-safe:animate-shimmer"
              style={{
                backgroundImage:
                  'linear-gradient(120deg, transparent 30%, rgba(255,255,255,0.18) 50%, transparent 70%)',
                backgroundSize: '200% 100%',
                backgroundRepeat: 'no-repeat',
              }}
            />
          )}
        </button>
      </div>

      {/* Orb button with gentle float wrapper */}
      <div className="motion-safe:animate-orb-float">
        <button
          type="button"
          onClick={toggle}
          aria-label={active ? 'Stop voice agent' : 'Start voice agent'}
          className="group relative flex h-12 w-12 items-center justify-center rounded-full transition hover:scale-105 focus:outline-none focus:ring-2 focus:ring-violet-400/60 focus:ring-offset-2 focus:ring-offset-ink"
        >
          {/* Idle breathing glow (slow pulse when not recording) */}
          {!active && (
            <span className="pointer-events-none absolute -inset-3 rounded-full bg-violet-500/30 blur-xl motion-safe:animate-orb-glow" />
          )}
          {/* Active state: ping ring + extra bloom */}
          {active && (
            <>
              <span className="absolute -inset-3 rounded-full bg-violet-500/35 blur-xl" />
              <span className="absolute inset-0 animate-ping rounded-full bg-violet-500/55" />
              <span className="absolute -inset-1 animate-pulse rounded-full bg-fuchsia-500/35 blur-md" />
            </>
          )}

          {/* Orb body — radial gradient + inner highlight */}
          <span
            className="absolute inset-0 rounded-full"
            style={{
              background:
                'radial-gradient(circle at 32% 30%, #c4b5fd 0%, #8b5cf6 28%, #6d28d9 55%, #3b0764 90%)',
              boxShadow:
                'inset 0 0 22px rgba(216,180,254,0.45), inset 0 0 6px rgba(255,255,255,0.55), 0 8px 24px rgba(139,92,246,0.45)',
            }}
          />
          {/* Dot-grid texture overlay → "particle sphere" feel */}
          <span
            className="pointer-events-none absolute inset-0 rounded-full opacity-30 mix-blend-overlay"
            style={{
              backgroundImage:
                'radial-gradient(rgba(255,255,255,0.6) 1px, transparent 1.4px)',
              backgroundSize: '5px 5px',
              WebkitMaskImage:
                'radial-gradient(circle, #000 55%, transparent 75%)',
              maskImage: 'radial-gradient(circle, #000 55%, transparent 75%)',
            }}
          />

          {/* Icon — white on the light/violet bg, gold on the dark bg.
              Use an arbitrary value for white so the html:not(.dark)
              .text-white override doesn't hijack it in light mode. */}
          <Sparkles
            size={20}
            strokeWidth={1.7}
            className="relative z-10 text-[#fff] drop-shadow-[0_1px_4px_rgba(0,0,0,0.5)] dark:text-gold"
          />
        </button>
      </div>
    </div>
  );
}
