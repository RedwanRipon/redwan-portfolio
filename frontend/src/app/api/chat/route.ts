import { NextResponse } from 'next/server';

/**
 * Proxy: browser POSTs to /api/chat → this route forwards to the
 * FastAPI backend at NEXT_PUBLIC_API_BASE_URL/chat and returns the
 * upstream JSON.
 *
 * Why proxy instead of hitting the backend directly from the browser?
 *  - Hides the backend URL (cleaner network tab, no CORS surprises).
 *  - Single place to add auth / rate-limiting later.
 *  - Same fetch pattern works in dev (localhost:8000) and prod (Render URL).
 */

const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL ?? 'http://localhost:8000';

// Don't cache responses — the agent's reply depends on the message.
export const dynamic = 'force-dynamic';

export async function POST(request: Request) {
  // Parse the JSON body sent from the chat panel.
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 });
  }

  try {
    const upstream = await fetch(`${API_BASE}/chat`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
      // The agent can take ~1-3s, so give it a generous timeout.
      signal: AbortSignal.timeout(30_000),
    });

    if (!upstream.ok) {
      const detail = await upstream.text().catch(() => '');
      return NextResponse.json(
        { error: `Backend returned ${upstream.status}`, detail },
        { status: upstream.status },
      );
    }

    return NextResponse.json(await upstream.json());
  } catch (err) {
    const detail = err instanceof Error ? err.message : String(err);
    return NextResponse.json(
      { error: 'Backend unreachable', detail },
      { status: 502 },
    );
  }
}
