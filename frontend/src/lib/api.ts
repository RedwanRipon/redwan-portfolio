/**
 * Thin client for the public API.
 *
 * All calls go to the Next.js proxy routes under /api/*, which forward
 * to the FastAPI backend. Two reasons we don't hit the backend
 * directly from the browser:
 *   1. Hides the Render URL — only Vercel ever appears in DevTools.
 *   2. Avoids CORS preflights and cookie-domain issues.
 */
import type { ChatRequest, ChatResponse } from '@/types';

const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL ?? 'http://localhost:8000';

// =====================================================================
// Phase 2 — chat (kept for backwards compat with the voice button).
// =====================================================================

export async function sendChatMessage(req: ChatRequest): Promise<ChatResponse> {
  const res = await fetch(`${API_BASE}/chat`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(req),
  });
  if (!res.ok) throw new Error(`Chat request failed: ${res.status}`);
  return res.json();
}

// =====================================================================
// Phase 4 — typed shapes (must match Pydantic models on the backend).
// =====================================================================

export type PostType = 'blog' | 'travel';

export interface CommentRead {
  id: number;
  post_type: PostType;
  post_slug: string;
  author_name: string;
  text: string;
  created_at: string; // ISO
}

export interface ReactionCounts {
  likes: number;
  dislikes: number;
  user_vote: 'like' | 'dislike' | null;
}

export interface ContactBody {
  name: string;
  email: string;
  subject: string;
  body: string;
}

// =====================================================================
// fetch wrapper — turns non-2xx into a thrown Error with backend detail.
// =====================================================================

async function http<T>(url: string, init: RequestInit = {}): Promise<T> {
  const res = await fetch(url, {
    ...init,
    headers: {
      'Content-Type': 'application/json',
      ...(init.headers ?? {}),
    },
  });
  if (res.ok) {
    if (res.status === 204) return undefined as unknown as T;
    return (await res.json()) as T;
  }
  // Surface the backend's error message; fall back to status text.
  let detail = res.statusText;
  try {
    const j = await res.json();
    if (j?.error) detail = String(j.error);
    else if (j?.detail) detail = String(j.detail);
  } catch {
    /* ignore */
  }
  throw new Error(detail || `Request failed (${res.status})`);
}

// =====================================================================
// Comments
// =====================================================================

export async function fetchComments(
  postType: PostType,
  postSlug: string,
  limit = 100,
): Promise<CommentRead[]> {
  const qs = new URLSearchParams({
    type: postType,
    slug: postSlug,
    limit: String(limit),
  });
  return http<CommentRead[]>(`/api/comments?${qs}`);
}

export async function postComment(input: {
  postType: PostType;
  postSlug: string;
  authorName: string;
  text: string;
}): Promise<CommentRead> {
  return http<CommentRead>(`/api/comments`, {
    method: 'POST',
    body: JSON.stringify({
      post_type: input.postType,
      post_slug: input.postSlug,
      author_name: input.authorName,
      text: input.text,
    }),
  });
}

// =====================================================================
// Reactions
// =====================================================================

export async function fetchReactionCounts(
  postType: PostType,
  postSlug: string,
  fingerprint: string,
): Promise<ReactionCounts> {
  const qs = new URLSearchParams({
    type: postType,
    slug: postSlug,
    fingerprint,
  });
  return http<ReactionCounts>(`/api/reactions/counts?${qs}`);
}

export async function postReaction(input: {
  postType: PostType;
  postSlug: string;
  fingerprint: string;
  vote: 'like' | 'dislike';
}): Promise<ReactionCounts> {
  return http<ReactionCounts>(`/api/reactions`, {
    method: 'POST',
    body: JSON.stringify({
      post_type: input.postType,
      post_slug: input.postSlug,
      voter_fingerprint: input.fingerprint,
      vote: input.vote,
    }),
  });
}

export async function deleteReaction(input: {
  postType: PostType;
  postSlug: string;
  fingerprint: string;
}): Promise<ReactionCounts> {
  return http<ReactionCounts>(`/api/reactions`, {
    method: 'DELETE',
    body: JSON.stringify({
      post_type: input.postType,
      post_slug: input.postSlug,
      voter_fingerprint: input.fingerprint,
    }),
  });
}

// =====================================================================
// Contact form
// =====================================================================

export async function postContactMessage(
  body: ContactBody,
): Promise<{ id: number; created_at: string }> {
  return http(`/api/contact`, {
    method: 'POST',
    body: JSON.stringify(body),
  });
}

// =====================================================================
// voter_fingerprint helper — stable per browser
// =====================================================================

const FP_KEY = 'voter_fingerprint';

/** Read (or create) the anonymous per-browser identifier the backend
 *  uses to enforce 'one vote per browser per post'. */
export function getVoterFingerprint(): string {
  if (typeof window === 'undefined') return '';
  try {
    let fp = localStorage.getItem(FP_KEY);
    if (!fp) {
      fp =
        typeof crypto !== 'undefined' && 'randomUUID' in crypto
          ? crypto.randomUUID()
          : `${Date.now()}-${Math.random().toString(36).slice(2)}`;
      localStorage.setItem(FP_KEY, fp);
    }
    return fp;
  } catch {
    return '';
  }
}
