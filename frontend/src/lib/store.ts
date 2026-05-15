'use client';

import { create } from 'zustand';

/**
 * Global UI state. The voice agent (Phase 3) writes into this store to
 * highlight elements on the page in response to LLM tool calls.
 */
interface UIState {
  /** ID of an element the voice agent wants to spotlight (e.g. project card). */
  highlightId: string | null;
  setHighlight: (id: string | null) => void;

  /** Whether the mic is currently recording. */
  isRecording: boolean;
  setRecording: (v: boolean) => void;

  /** Whether the TTS audio is currently playing. */
  isSpeaking: boolean;
  setSpeaking: (v: boolean) => void;
}

export const useUIStore = create<UIState>((set) => ({
  highlightId: null,
  setHighlight: (id) => set({ highlightId: id }),

  isRecording: false,
  setRecording: (v) => set({ isRecording: v }),

  isSpeaking: false,
  setSpeaking: (v) => set({ isSpeaking: v }),
}));
