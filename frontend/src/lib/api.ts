/**
 * Typed client for the FastAPI backend.
 * Phase 1: stubs only. Phase 2 wires the real endpoints.
 */
import type { ChatRequest, ChatResponse } from '@/types';

const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL ?? 'http://localhost:8000';

export async function sendChatMessage(req: ChatRequest): Promise<ChatResponse> {
  const res = await fetch(`${API_BASE}/chat`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(req),
  });
  if (!res.ok) throw new Error(`Chat request failed: ${res.status}`);
  return res.json();
}
