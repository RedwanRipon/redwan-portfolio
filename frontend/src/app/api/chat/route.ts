import { NextResponse } from 'next/server';

/**
 * Proxy/passthrough for chat messages.
 * Phase 1: returns a stub.
 * Phase 2: forwards POST body to the FastAPI backend (`/chat`) and streams back.
 */
export async function POST(request: Request) {
  const body = await request.json().catch(() => ({}));
  // TODO Phase 2: forward to `${process.env.NEXT_PUBLIC_API_BASE_URL}/chat`.
  return NextResponse.json({
    speech: 'Chat backend not wired up yet — Phase 2.',
    route: null,
    highlight_id: null,
    echo: body,
  });
}
