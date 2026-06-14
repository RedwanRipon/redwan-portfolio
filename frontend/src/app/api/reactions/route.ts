import { NextResponse } from 'next/server';

/**
 * Proxy: browser → /api/reactions → FastAPI /reactions.
 *   POST   cast or change a vote (upsert).
 *   DELETE undo a vote.
 *
 * (GET counts lives at /api/reactions/counts — separate file.)
 */
const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL ?? 'http://localhost:8000';

export const dynamic = 'force-dynamic';

async function forward(
  method: 'POST' | 'DELETE',
  request: Request,
): Promise<NextResponse> {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 });
  }
  try {
    const upstream = await fetch(`${API_BASE}/reactions`, {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
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

export const POST = (request: Request) => forward('POST', request);
export const DELETE = (request: Request) => forward('DELETE', request);
