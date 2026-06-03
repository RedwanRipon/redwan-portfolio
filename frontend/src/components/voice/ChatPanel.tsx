'use client';

import { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Mic, Send, Sparkles, Square, X } from 'lucide-react';
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

// Cap recordings to keep cost + latency sane. 30s is plenty for a
// portfolio question.
const MAX_RECORDING_MS = 30_000;

export function ChatPanel({ open, onClose }: Props) {
  const router = useRouter();
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Recording state: 'idle' | 'recording' | 'processing'
  const [recState, setRecState] = useState<'idle' | 'recording' | 'processing'>(
    'idle',
  );
  const [recElapsedMs, setRecElapsedMs] = useState(0);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Refs for recording machinery so they survive across renders.
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const mediaStreamRef = useRef<MediaStream | null>(null);
  const recordingStartRef = useRef<number>(0);
  const recordingTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const maxRecordingTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(
    null,
  );
  // Audio element used to play TTS replies. Kept as a single instance
  // so we can stop the previous reply before playing a new one.
  const audioPlayerRef = useRef<HTMLAudioElement | null>(null);

  // Scroll to bottom whenever messages or busy state change so the
  // latest message + the typing indicator stay in view.
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth', block: 'end' });
  }, [messages, busy, recState]);

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

  // If the panel closes mid-recording, tear everything down so the
  // mic indicator in the browser tab doesn't keep showing.
  useEffect(() => {
    if (!open) {
      cleanupRecording();
      stopAudioPlayback();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

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

  // ------------------------------------------------------------------
  // Text path (unchanged from before).
  // ------------------------------------------------------------------
  async function sendText(text: string) {
    const trimmed = text.trim();
    if (!trimmed || busy || recState !== 'idle') return;

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

  // ------------------------------------------------------------------
  // Voice path: record, upload, play back.
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
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
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
    // mp4/aac; Chrome/Firefox use webm/opus. Whisper accepts all of
    // these, so we let the browser choose.
    const candidates = [
      'audio/webm;codecs=opus',
      'audio/webm',
      'audio/mp4',
      'audio/ogg;codecs=opus',
    ];
    const mime = candidates.find((c) => MediaRecorder.isTypeSupported(c)) ?? '';

    const recorder = mime ? new MediaRecorder(stream, { mimeType: mime }) : new MediaRecorder(stream);
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
      // recorder.onstop will not fire — fall back to manual cleanup.
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

      // Display transcript as user message + reply as assistant.
      setMessages((m) => [
        ...m,
        { id: crypto.randomUUID(), role: 'user', text: data.transcript ?? '(silence)' },
        { id: crypto.randomUUID(), role: 'assistant', text: data.speech ?? '(no reply)' },
      ]);

      // Play the TTS audio.
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
      /* autoplay blocked — user can click the assistant message later */
    });
  }

  if (!open) return null;

  const recording = recState === 'recording';
  const processing = recState === 'processing';
  const recSeconds = (recElapsedMs / 1000).toFixed(1);

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
          <h3 className="font-display text-sm font-semibold text-white">Ask Redwan AI</h3>
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
        {messages.length === 0 && !busy && !error && !recording && (
          <div className="flex h-full flex-col items-center justify-center gap-4 text-center">
            <Sparkles size={28} className="text-violet-400/70" />
            <p className="max-w-[240px] text-sm text-muted">
              Type or hit the mic — ask anything about Redwan&apos;s work,
              education, or projects.
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
            <p className="font-semibold">Something went wrong</p>
            <p className="mt-1 opacity-80">{error}</p>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Recording status bar (only while recording) */}
      {recording && (
        <div className="flex items-center gap-2 border-t border-white/10 bg-rose-500/10 px-4 py-2 text-xs text-rose-200">
          <span className="relative inline-flex h-2.5 w-2.5">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-rose-400/70" />
            <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-rose-500" />
          </span>
          <span className="font-medium">Listening…</span>
          <span className="ml-auto tabular-nums opacity-70">{recSeconds}s</span>
        </div>
      )}

      {/* Input + mic + send */}
      <form
        onSubmit={onSubmit}
        className="flex items-center gap-2 border-t border-white/10 p-3"
      >
        <input
          ref={inputRef}
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder={recording ? 'Listening to your voice…' : 'Ask anything…'}
          disabled={busy || recording || processing}
          className="flex-1 rounded-full border border-white/10 bg-ink px-4 py-2 text-sm text-white placeholder:text-muted/70 focus:border-violet-400 focus:outline-none focus:ring-1 focus:ring-violet-400/30 disabled:opacity-60"
        />

        {/* Mic / Stop button */}
        <button
          type="button"
          onClick={recording ? stopRecording : startRecording}
          disabled={busy && !recording}
          aria-label={recording ? 'Stop recording' : 'Record voice question'}
          title={recording ? 'Stop recording' : 'Hold to record'}
          className={cn(
            'inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-full shadow-md transition active:scale-95',
            recording
              ? 'bg-rose-500 !text-white hover:bg-rose-400'
              : 'border border-white/15 text-white hover:border-violet-400/60 hover:text-violet-300',
            !recording && busy && 'cursor-not-allowed opacity-50',
          )}
        >
          {recording ? <Square size={14} fill="currentColor" /> : <Mic size={15} />}
        </button>

        {/* Send button */}
        <button
          type="submit"
          disabled={!input.trim() || busy || recording || processing}
          aria-label="Send"
          className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-violet-600 !text-white shadow-md transition hover:bg-violet-500 disabled:cursor-not-allowed disabled:bg-white/10 disabled:!text-muted"
        >
          <Send size={14} />
        </button>
      </form>
    </div>
  );
}
