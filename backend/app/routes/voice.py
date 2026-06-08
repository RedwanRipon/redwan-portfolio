"""POST /voice/chat — speech in, speech + audio out.

Pipeline:
  1. Receive audio (multipart upload) from the browser.
  2. OpenAI Whisper transcribes it (in a thread — non-blocking).
  3. Re-use run_agent() — the same brain text chat uses (in a thread).
  4. OpenAI TTS synthesizes the reply into mp3 (in a thread).
  5. Return everything as JSON — text + audio arrive together.

With gpt-4o-mini + cached clients + parallel tool calls, the full
round trip is ~4-6s (down from 10-15s with gpt-5).

Costs per request (approximate):
  Whisper (STT)             ~$0.0001 for a 5s clip
  Agent (gpt-4o-mini)       ~$0.0003
  TTS (tts-1, ~150c)        ~$0.003
  ---------------------------------
  Total                     ~$0.004
"""
import asyncio
import base64
import functools
import logging
import time
from io import BytesIO

from fastapi import APIRouter, File, HTTPException, UploadFile
from openai import OpenAI

from app.config import settings
from app.schemas import VoiceResponse
from app.services.agent import run_agent

router = APIRouter(prefix="/voice", tags=["voice"])

log = logging.getLogger(__name__)


# --- OpenAI audio config ---------------------------------------------------
STT_MODEL = "whisper-1"
TTS_MODEL = "tts-1"
TTS_VOICE = "nova"  # warm, clear; good default for a portfolio agent
MAX_AUDIO_BYTES = 5 * 1024 * 1024  # 5 MB


@functools.lru_cache(maxsize=1)
def _openai_client() -> OpenAI:
    """Cached OpenAI client — reuses the HTTP connection pool across
    requests instead of creating a fresh TCP + TLS handshake every time.
    """
    return OpenAI(api_key=settings.openai_api_key)


def _run_stt(audio_bytes: bytes, filename: str) -> str:
    """Synchronous Whisper STT — designed to be called via to_thread()."""
    client = _openai_client()
    buf = BytesIO(audio_bytes)
    buf.name = filename

    stt = client.audio.translations.create(
        model=STT_MODEL,
        file=buf,
        prompt=(
            "A spoken question about Md Redwan Hossain, an AI and "
            "machine learning researcher who completed his M.Sc. in "
            "Data Science at the University of Erlangen-Nuremberg. "
            "Topics: master thesis, publications, projects, voice "
            "agents, RAG, Python, FastAPI, ChromaDB, LangChain."
        ),
    )
    return (stt.text or "").strip()


def _run_tts(text: str) -> bytes:
    """Synchronous TTS — designed to be called via to_thread()."""
    client = _openai_client()
    tts = client.audio.speech.create(
        model=TTS_MODEL,
        voice=TTS_VOICE,
        input=text,
        response_format="mp3",
    )
    return tts.content


@router.post("/chat", response_model=VoiceResponse)
async def voice_chat(audio: UploadFile = File(...)) -> VoiceResponse:
    """End-to-end voice round trip — text + audio arrive together."""
    t_start = time.perf_counter()

    # ------------------------------------------------------------------
    # 1. Read + size-check the upload.
    # ------------------------------------------------------------------
    audio_bytes = await audio.read()
    if not audio_bytes:
        raise HTTPException(status_code=400, detail="audio file is empty")
    if len(audio_bytes) > MAX_AUDIO_BYTES:
        raise HTTPException(
            status_code=413,
            detail=f"audio exceeds {MAX_AUDIO_BYTES // 1024 // 1024} MB cap",
        )

    # ------------------------------------------------------------------
    # 2. Whisper STT
    # ------------------------------------------------------------------
    try:
        t_stt = time.perf_counter()
        transcript = await asyncio.to_thread(
            _run_stt, audio_bytes, audio.filename or "audio.webm"
        )
        log.info("[voice] STT took %.2fs", time.perf_counter() - t_stt)
    except Exception as exc:  # noqa: BLE001
        log.exception("Whisper transcription failed")
        raise HTTPException(
            status_code=502,
            detail="Speech-to-text failed. Check the backend logs.",
        ) from exc

    if not transcript:
        raise HTTPException(
            status_code=422,
            detail="No speech detected in the audio.",
        )

    log.info("[voice] transcript: %r", transcript)

    # ------------------------------------------------------------------
    # 3. Run the agent
    # ------------------------------------------------------------------
    try:
        t_agent = time.perf_counter()
        agent_reply = await asyncio.to_thread(run_agent, transcript)
        log.info("[voice] Agent took %.2fs", time.perf_counter() - t_agent)
    except Exception as exc:  # noqa: BLE001
        log.exception("Agent failed while handling voice transcript")
        raise HTTPException(
            status_code=500,
            detail="Agent error. Check the backend logs.",
        ) from exc

    # ------------------------------------------------------------------
    # 4. TTS — synthesize speech (in a thread, non-blocking).
    # ------------------------------------------------------------------
    audio_b64: str | None = None
    try:
        t_tts = time.perf_counter()
        tts_bytes = await asyncio.to_thread(_run_tts, agent_reply.speech)
        audio_b64 = base64.b64encode(tts_bytes).decode("ascii")
        log.info("[voice] TTS took %.2fs", time.perf_counter() - t_tts)
    except Exception:  # noqa: BLE001
        log.exception("TTS failed — returning text-only response")
        # Non-fatal: the user still gets the text reply.

    log.info(
        "[voice] total /voice/chat took %.2fs",
        time.perf_counter() - t_start,
    )

    # ------------------------------------------------------------------
    # 5. Return everything in one JSON — text + audio together.
    # ------------------------------------------------------------------
    return VoiceResponse(
        transcript=transcript,
        speech=agent_reply.speech,
        route=agent_reply.route,
        highlight_id=agent_reply.highlight_id,
        audio_b64=audio_b64,
        audio_mime="audio/mpeg" if audio_b64 else None,
    )
