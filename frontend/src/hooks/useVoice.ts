'use client';

/**
 * Phase 3 hook — orchestrates: mic capture → WebSocket send → agent response →
 * TTS playback + router.push() for navigation.
 * Stubbed for now.
 */
export function useVoice() {
  return {
    start: () => console.warn('useVoice.start: not implemented until Phase 3'),
    stop: () => console.warn('useVoice.stop: not implemented until Phase 3'),
  };
}
