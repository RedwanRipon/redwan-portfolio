import { NextResponse } from 'next/server';

/**
 * Proxy: browser GET /api/reactions/counts → FastAPI /reactions/counts.
 *
 * Forwards the query string (?type=&slug=&fingerprint=) untouched and
 * returns the JSON { likes, dislikes, user_vote } the backend produces.
 */
const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL ?? 'http://localhost:8000';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  const { search } = new URL(request.url);
  try {
    const upstream = await fetch(`${API_BASE}/reactions/counts${search}`, {
      method: 'GET',
      signal: AbortSignal.timeout(30_000),
    });
    const text = await upstream.text();
    return new NextResponse(text, {
      status: upstream.status,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (err) {
    return NextResponse.json(
      { error: 'Backend unreachable', detail: err instanceof Error ? err.message : String(err) },
      { status: 502 },
    );
  }
}
