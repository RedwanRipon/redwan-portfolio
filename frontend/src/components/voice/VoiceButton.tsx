'use client';

import { useEffect } from 'react';
import { Sparkles } from 'lucide-react';
import { useUIStore } from '@/lib/store';
import { cn } from '@/lib/utils';

/**
 * Floating voice-assistant launcher.
 *   • Pill "Ask Redwan AI"  +  glowing violet orb on the right.
 *   • Click toggles the recording flag in the Zustand store.
 *   • Phase 1: visual shell only — auto-stops after a few seconds since
 *     no STT backend is wired yet. Phase 3 replaces the stub with the
 *     Web Audio capture + WebSocket stream to FastAPI.
 */
export function VoiceButton() {
  const { isRecording, setRecording } = useUIStore();
  const active = isRecording;

  // Phase-1 stub: auto-stop the "listening" state after 3.5s.
  useEffect(() => {
    if (!active) return;
    const t = setTimeout(() => setRecording(false), 3500);
    return () => clearTimeout(t);
  }, [active, setRecording]);

  const toggle = () => setRecording(!active);

  return (
    <div
      role="region"
      aria-label="Voice assistant"
      className="fixed bottom-6 right-6 z-50 flex items-center gap-3"
    >
      {/* Label pill (hidden on the smallest phones to keep the orb the only thing visible) */}
      <button
        type="button"
        onClick={toggle}
        className={cn(
          'hidden rounded-full border bg-ink-card/80 px-5 py-3 font-display text-sm font-medium backdrop-blur transition sm:block',
          active
            ? 'border-violet-400/60 text-violet-200'
            : 'border-white/15 text-white hover:border-violet-400/60 hover:text-violet-200',
        )}
      >
        {active ? 'Listening…' : 'Ask Redwan AI'}
      </button>

      {/* Orb button */}
      <button
        type="button"
        onClick={toggle}
        aria-label={active ? 'Stop voice agent' : 'Start voice agent'}
        className="group relative flex h-14 w-14 items-center justify-center rounded-full transition hover:scale-105 focus:outline-none focus:ring-2 focus:ring-violet-400/60 focus:ring-offset-2 focus:ring-offset-ink"
      >
        {/* Outer soft glow */}
        <span
          className={cn(
            'absolute -inset-3 rounded-full bg-violet-500/25 blur-xl transition-opacity',
            active ? 'opacity-100' : 'opacity-70 group-hover:opacity-100',
          )}
        />
        {/* Ping ring when listening */}
        {active && (
          <>
            <span className="absolute inset-0 animate-ping rounded-full bg-violet-500/50" />
            <span className="absolute -inset-1 animate-pulse rounded-full bg-fuchsia-500/30 blur-md" />
          </>
        )}

        {/* Orb body — radial gradient + inner highlight, mimicking the particle sphere */}
        <span
          className="absolute inset-0 rounded-full"
          style={{
            background:
              'radial-gradient(circle at 32% 30%, #c4b5fd 0%, #8b5cf6 28%, #6d28d9 55%, #3b0764 90%)',
            boxShadow:
              'inset 0 0 22px rgba(216,180,254,0.45), inset 0 0 6px rgba(255,255,255,0.55), 0 8px 24px rgba(139,92,246,0.45)',
          }}
        />
        {/* Subtle dot-grid texture overlay to read as "particle sphere" */}
        <span
          className="pointer-events-none absolute inset-0 rounded-full opacity-30 mix-blend-overlay"
          style={{
            backgroundImage:
              'radial-gradient(rgba(255,255,255,0.6) 1px, transparent 1.4px)',
            backgroundSize: '5px 5px',
            WebkitMaskImage: 'radial-gradient(circle, #000 55%, transparent 75%)',
            maskImage: 'radial-gradient(circle, #000 55%, transparent 75%)',
          }}
        />

        {/* Icon */}
        <Sparkles
          size={22}
          strokeWidth={1.7}
          className="relative z-10 text-white drop-shadow-[0_1px_4px_rgba(0,0,0,0.5)]"
        />
      </button>
    </div>
  );
}
