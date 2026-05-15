/** Shared type definitions across the frontend. */

export interface ChatRequest {
  message: string;
  /** Optional conversation id for session continuity. */
  sessionId?: string;
}

/** Standard agent reply shape — matches what the LangChain orchestrator returns. */
export interface ChatResponse {
  /** Natural-language reply (also fed to TTS in Phase 3). */
  speech: string;
  /** Optional Next.js route to navigate to (e.g. "/projects"). */
  route: string | null;
  /** Optional DOM element id to spotlight after navigation. */
  highlight_id: string | null;
}

export interface Project {
  slug: string;
  title: string;
  summary: string;
  tags: string[];
  year: number;
  link?: string;
}
