import { NextResponse } from 'next/server';

/**
 * Proxy: browser POSTs { text: string } to /api/voice/tts, this route
 * forwards it to the FastAPI backend at /voice/tts and returns the
 * JSON ({ audio_b64, audio_mime }).
 *
 * Called by ChatPanel after the text reply arrives from /api/voice,
 * so the user sees the reply text while audio loads in the background.
 */

const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL ?? 'http://localhost:8000';

// TTS alone is fast (~1-3s), but Render cold starts can add time.
const TTS_TIMEOUT_MS = 30_000;

export const dynamic = 'force-dynamic';

export async function POST(request: Request) {
  let body: { text: string };
  try {
    body = await request.json();
    if (!body.text || typeof body.text !== 'string') {
      return NextResponse.json(
        { error: 'Missing "text" field in request body.' },
        { status: 400 },
      );
    }
  } catch {
    return NextResponse.json(
      { error: 'Invalid JSON body.' },
      { status: 400 },
    );
  }

  try {
    const upstream = await fetch(`${API_BASE}/voice/tts`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text: body.text }),
      signal: AbortSignal.timeout(TTS_TIMEOUT_MS),
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
