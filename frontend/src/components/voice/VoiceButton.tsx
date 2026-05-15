'use client';

import { Mic, MicOff } from 'lucide-react';
import { useUIStore } from '@/lib/store';

/**
 * Placeholder mic button — wired up properly in Phase 3 with Web Audio + WebSocket.
 * For now it just toggles the recording flag in the store.
 */
export function VoiceButton() {
  const { isRecording, setRecording } = useUIStore();

  return (
    <button
      type="button"
      onClick={() => setRecording(!isRecording)}
      aria-label={isRecording ? 'Stop recording' : 'Start recording'}
      className="fixed bottom-6 right-6 z-50 flex h-14 w-14 items-center justify-center rounded-full bg-brand text-brand-fg shadow-lg transition hover:scale-105"
    >
      {isRecording ? <MicOff size={22} /> : <Mic size={22} />}
    </button>
  );
}
