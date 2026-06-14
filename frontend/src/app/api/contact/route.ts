import { NextResponse } from 'next/server';

/**
 * Proxy: browser POST /api/contact → FastAPI POST /contact.
 *
 * Visitor submits the contact form, the backend writes a row to
 * contact_messages, the response { id, created_at } is forwarded back.
 */
const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL ?? 'http://localhost:8000';

export const dynamic = 'force-dynamic';

export async function POST(request: Request) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 });
  }
  try {
    const upstream = await fetch(`${API_BASE}/contact`, {
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
