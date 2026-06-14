import { NextResponse } from 'next/server';

/**
 * Proxy: browser → /api/comments → FastAPI /comments.
 *   GET    forwards the query string (?type=&slug=&limit=).
 *   POST   forwards the JSON body.
 */
const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL ?? 'http://localhost:8000';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  const { search } = new URL(request.url);
  try {
    const upstream = await fetch(`${API_BASE}/comments${search}`, {
      method: 'GET',
      signal: AbortSignal.timeout(30_000),
    });
    const body = await upstream.text();
    return new NextResponse(body, {
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

export async function POST(request: Request) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 });
  }
  try {
    const upstream = await fetch(`${API_BASE}/comments`, {
      method: 'POST',
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
