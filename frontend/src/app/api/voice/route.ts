import { NextResponse } from 'next/server';

/**
 * Proxy: browser POSTs a multipart audio upload to /api/voice, this
 * route forwards it to the FastAPI backend at /voice/chat and returns
 * the JSON (transcript, speech, route, audio_b64, audio_mime).
 *
 * Mirrors /api/chat — same logic, different upstream + content type.
 */

const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL ?? 'http://localhost:8000';

// STT + agent + TTS typically takes 4-6s. Render free-tier cold starts
// can add ~30s, so 90s covers the worst case.
const VOICE_TIMEOUT_MS = 90_000;

export const dynamic = 'force-dynamic';

export async function POST(request: Request) {
  // FormData re-construction: Next.js doesn't transparently forward
  // multipart bodies between fetches, so we read the incoming
  // FormData and build a fresh one for the upstream request.
  let upstreamForm: FormData;
  try {
    const incoming = await request.formData();
    const audio = incoming.get('audio');
    if (!(audio instanceof File)) {
      return NextResponse.json(
        { error: 'Missing "audio" file part in form data.' },
        { status: 400 },
      );
    }
    upstreamForm = new FormData();
    upstreamForm.append('audio', audio, audio.name || 'audio.webm');
  } catch {
    return NextResponse.json(
      { error: 'Invalid multipart form data.' },
      { status: 400 },
    );
  }

  try {
    const upstream = await fetch(`${API_BASE}/voice/chat`, {
      method: 'POST',
      body: upstreamForm,
      // No explicit Content-Type — fetch sets the multipart boundary itself.
      signal: AbortSignal.timeout(VOICE_TIMEOUT_MS),
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
