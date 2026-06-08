'use client';

import { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Mic, Sparkles, Square, X } from 'lucide-react';
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

// Cap recordings to keep cost + latency sane. 30s is plenty for a
// portfolio question.
const MAX_RECORDING_MS = 30_000;

/**
 * Voice-only chat surface that floats above the orb.
 *
 * Flow:
 *   1. User clicks the orb -> this panel opens.
 *   2. User taps the mic -> MediaRecorder starts.
 *   3. User taps the stop button (or the 30s cap fires).
 *   4. Audio is uploaded to /api/voice -> FastAPI -> Whisper -> agent
 *      -> OpenAI TTS -> JSON with transcript + speech + audio_b64.
 *   5. Transcript shows as the user bubble, reply as the assistant
 *      bubble, and the TTS mp3 plays automatically. The page also
 *      auto-navigates to the route the agent picked.
 *
 * The text-input path was removed on purpose — this is the
 * voice-driven portfolio after all. /api/chat still exists on the
 * backend and can be reached programmatically; it just isn't wired
 * to any UI here.
 */
export function ChatPanel({ open, onClose }: Props) {
  const router = useRouter();
  const [messages, setMessages] = useState<Message[]>([]);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [recState, setRecState] = useState<'idle' | 'recording' | 'processing'>(
    'idle',
  );
  const [recElapsedMs, setRecElapsedMs] = useState(0);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Recording machinery — held in refs so they survive React re-renders.
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const mediaStreamRef = useRef<MediaStream | null>(null);
  const recordingStartRef = useRef<number>(0);
  const recordingTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const maxRecordingTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(
    null,
  );
  const audioPlayerRef = useRef<HTMLAudioElement | null>(null);

  // ------------------------------------------------------------------
  // Side effects
  // ------------------------------------------------------------------

  // Scroll to the bottom whenever the message list / state changes.
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth', block: 'end' });
  }, [messages, busy, recState]);

  // Close on Escape.
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [open, onClose]);

  // Tear everything down when the panel closes so the browser tab
  // mic indicator doesn't keep spinning.
  useEffect(() => {
    if (!open) {
      cleanupRecording();
      stopAudioPlayback();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  // ------------------------------------------------------------------
  // Navigation helper
  // ------------------------------------------------------------------
  function navigate(route: string | null | undefined) {
    if (!route) return;
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

  // ------------------------------------------------------------------
  // Voice recording
  // ------------------------------------------------------------------

  function isVoiceSupported(): boolean {
    if (typeof window === 'undefined') return false;
    if (!navigator.mediaDevices?.getUserMedia) return false;
    if (typeof window.MediaRecorder === 'undefined') return false;
    return true;
  }

  function cleanupRecording() {
    if (recordingTimerRef.current) {
      clearInterval(recordingTimerRef.current);
      recordingTimerRef.current = null;
    }
    if (maxRecordingTimeoutRef.current) {
      clearTimeout(maxRecordingTimeoutRef.current);
      maxRecordingTimeoutRef.current = null;
    }
    if (
      mediaRecorderRef.current &&
      mediaRecorderRef.current.state !== 'inactive'
    ) {
      try {
        mediaRecorderRef.current.stop();
      } catch {
        /* ignore */
      }
    }
    mediaStreamRef.current?.getTracks().forEach((t) => t.stop());
    mediaStreamRef.current = null;
    audioChunksRef.current = [];
  }

  function stopAudioPlayback() {
    if (audioPlayerRef.current) {
      audioPlayerRef.current.pause();
      audioPlayerRef.current.src = '';
      audioPlayerRef.current = null;
    }
  }

  async function startRecording() {
    if (!isVoiceSupported()) {
      setError('Voice isn’t supported in this browser. Try Chrome or Firefox.');
      return;
    }
    if (busy || recState !== 'idle') return;

    setError(null);
    stopAudioPlayback();

    let stream: MediaStream;
    try {
      stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    } catch (err) {
      if (err instanceof DOMException && err.name === 'NotAllowedError') {
        setError('Microphone permission denied. Allow mic access and try again.');
      } else {
        setError('Couldn’t access the microphone.');
      }
      return;
    }

    mediaStreamRef.current = stream;
    audioChunksRef.current = [];

    // Pick whichever container the browser supports. Safari prefers
    // mp4/aac; Chrome/Firefox use webm/opus. Whisper accepts them all.
    const candidates = [
      'audio/webm;codecs=opus',
      'audio/webm',
      'audio/mp4',
      'audio/ogg;codecs=opus',
    ];
    const mime = candidates.find((c) => MediaRecorder.isTypeSupported(c)) ?? '';

    const recorder = mime
      ? new MediaRecorder(stream, { mimeType: mime })
      : new MediaRecorder(stream);
    mediaRecorderRef.current = recorder;

    recorder.ondataavailable = (e) => {
      if (e.data.size > 0) audioChunksRef.current.push(e.data);
    };

    recorder.onstop = async () => {
      const blob = new Blob(audioChunksRef.current, {
        type: recorder.mimeType || 'audio/webm',
      });
      // Release the mic ASAP so the browser tab indicator goes away.
      mediaStreamRef.current?.getTracks().forEach((t) => t.stop());
      mediaStreamRef.current = null;
      audioChunksRef.current = [];

      await uploadVoice(blob);
    };

    recorder.start();
    recordingStartRef.current = Date.now();
    setRecState('recording');
    setRecElapsedMs(0);

    recordingTimerRef.current = setInterval(() => {
      setRecElapsedMs(Date.now() - recordingStartRef.current);
    }, 100);

    // Auto-stop at the cap so a stuck recorder can't burn audio + tokens.
    maxRecordingTimeoutRef.current = setTimeout(() => {
      if (mediaRecorderRef.current?.state === 'recording') {
        stopRecording();
      }
    }, MAX_RECORDING_MS);
  }

  function stopRecording() {
    if (recState !== 'recording') return;
    if (recordingTimerRef.current) {
      clearInterval(recordingTimerRef.current);
      recordingTimerRef.current = null;
    }
    if (maxRecordingTimeoutRef.current) {
      clearTimeout(maxRecordingTimeoutRef.current);
      maxRecordingTimeoutRef.current = null;
    }
    setRecState('processing');
    try {
      mediaRecorderRef.current?.stop();
    } catch {
      setRecState('idle');
      setError('Recording stopped unexpectedly.');
    }
  }

  async function uploadVoice(blob: Blob) {
    setBusy(true);
    setError(null);

    const form = new FormData();
    const ext = blob.type.includes('mp4') ? 'mp4' : 'webm';
    form.append('audio', blob, `recording.${ext}`);

    try {
      const res = await fetch('/api/voice', { method: 'POST', body: form });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error ?? `Server returned ${res.status}`);
      }

      // Show text bubbles + play audio simultaneously.
      setMessages((m) => [
        ...m,
        {
          id: crypto.randomUUID(),
          role: 'user',
          text: data.transcript ?? '(silence)',
        },
        {
          id: crypto.randomUUID(),
          role: 'assistant',
          text: data.speech ?? '(no reply)',
        },
      ]);

      if (data.audio_b64) {
        playAudioFromBase64(data.audio_b64, data.audio_mime ?? 'audio/mpeg');
      }

      if (data.route) {
        setTimeout(() => navigate(data.route), 600);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Voice request failed.');
    } finally {
      setBusy(false);
      setRecState('idle');
      setRecElapsedMs(0);
    }
  }

  function playAudioFromBase64(b64: string, mime: string) {
    stopAudioPlayback();
    const src = `data:${mime};base64,${b64}`;
    const audio = new Audio(src);
    audioPlayerRef.current = audio;
    void audio.play().catch(() => {
      /* autoplay blocked — user can still read the transcript / reply */
    });
  }

  if (!open) return null;

  const recording = recState === 'recording';
  const processing = recState === 'processing';
  const recSeconds = (recElapsedMs / 1000).toFixed(1);

  // Pick the right status / instruction line under the mic.
  const status = recording
    ? `Listening… ${recSeconds}s`
    : processing
      ? 'Processing…'
      : busy
        ? 'Thinking…'
        : messages.length === 0
          ? 'Tap the mic and ask anything'
          : 'Tap the mic to ask again';

  return (
    <div
      role="dialog"
      aria-label="Ask Redwan AI"
      className={cn(
        'fixed bottom-36 right-6 z-50 flex flex-col overflow-hidden',
        'h-[480px] max-h-[calc(100vh-10rem)] w-[calc(100vw-3rem)] sm:w-[360px]',
        'rounded-2xl border border-white/10 bg-ink-card/95 shadow-2xl backdrop-blur-md',
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
        {messages.length === 0 && !busy && !error && !recording && !processing && (
          <div className="flex h-full flex-col items-center justify-center gap-3 text-center">
            <div className="relative">
              <Sparkles size={32} className="text-violet-400/70" />
              <span className="absolute -inset-3 rounded-full bg-violet-500/20 blur-2xl" />
            </div>
            <p className="max-w-[240px] text-sm leading-relaxed text-muted">
              Ask anything about Redwan&apos;s work, education, or projects —
              <span className="text-white"> just talk</span>.
            </p>
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

        {busy && !processing && (
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
            <p className="font-semibold">Something went wrong</p>
            <p className="mt-1 opacity-80">{error}</p>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Mic dock — replaces the old text input + send buttons */}
      <div className="border-t border-white/10 bg-ink-card/80 px-4 py-4">
        <p
          className={cn(
            'mb-3 text-center text-xs',
            recording ? 'font-medium text-rose-300' : 'text-muted',
          )}
        >
          {recording && (
            <span className="relative mr-2 inline-flex h-2 w-2 align-middle">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-rose-400/70" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-rose-500" />
            </span>
          )}
          {status}
        </p>

        <div className="flex justify-center">
          <button
            type="button"
            onClick={recording ? stopRecording : startRecording}
            disabled={processing || (busy && !recording)}
            aria-label={recording ? 'Stop recording' : 'Start recording'}
            title={recording ? 'Tap to send' : 'Tap to record'}
            className={cn(
              'relative inline-flex h-16 w-16 items-center justify-center rounded-full shadow-2xl transition active:scale-95 focus:outline-none focus-visible:ring-2 focus-visible:ring-violet-400/60 focus-visible:ring-offset-2 focus-visible:ring-offset-ink',
              recording
                ? 'bg-rose-500 !text-white hover:bg-rose-400'
                : 'bg-gradient-to-br from-violet-500 to-fuchsia-700 !text-white hover:scale-105 hover:from-violet-400 hover:to-fuchsia-600',
              (processing || (busy && !recording)) &&
                'cursor-not-allowed opacity-60',
            )}
          >
            {/* Pulse ring when recording */}
            {recording && (
              <span className="absolute inset-0 animate-ping rounded-full bg-rose-500/40" />
            )}
            {recording ? (
              <Square size={22} fill="currentColor" />
            ) : (
              <Mic size={24} />
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
