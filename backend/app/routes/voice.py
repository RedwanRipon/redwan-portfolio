"""POST /voice/chat — speech in, speech out.

Pipeline:
  1. Receive audio (multipart upload) from the browser.
  2. OpenAI Whisper transcribes it.
  3. Re-use run_agent() — the same brain text chat uses.
  4. OpenAI TTS synthesizes the reply into an mp3.
  5. Return everything as JSON, with the audio base64-encoded so the
     frontend can play it without a second round trip.

Costs per request (approximate):
  Whisper (STT)        ~$0.0001 for a 5s clip
  Agent (gpt-4o-mini)  ~$0.001
  TTS (tts-1, ~150c)   ~$0.003
  ---------------------------------
  Total                ~$0.005
"""
import base64
import logging
from io import BytesIO

from fastapi import APIRouter, File, HTTPException, UploadFile
from openai import OpenAI

from app.config import settings
from app.schemas import VoiceResponse
from app.services.agent import run_agent

router = APIRouter(prefix="/voice", tags=["voice"])

log = logging.getLogger(__name__)


# --- OpenAI audio config ---------------------------------------------------
# Whisper: the only STT model OpenAI currently exposes.
STT_MODEL = "whisper-1"

# TTS model + voice. tts-1 is cheaper/faster; tts-1-hd is higher quality.
# Voice options: alloy, ash, ballad, coral, echo, fable, onyx, nova, sage, shimmer.
TTS_MODEL = "tts-1"
TTS_VOICE = "nova"  # warm, clear; good default for a portfolio agent

# Reject ridiculously large uploads early. Whisper accepts up to 25MB but
# our use case is short voice prompts — anything over 1MB is suspicious.
MAX_AUDIO_BYTES = 5 * 1024 * 1024  # 5 MB


def _openai_client() -> OpenAI:
    """Create a fresh OpenAI client each call so a key rotation takes
    effect on the next request without restarting uvicorn."""
    return OpenAI(api_key=settings.openai_api_key)


@router.post("/chat", response_model=VoiceResponse)
async def voice_chat(audio: UploadFile = File(...)) -> VoiceResponse:
    """End-to-end voice round trip."""
    client = _openai_client()

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
    # 2. Whisper STT — transcribe the audio.
    # ------------------------------------------------------------------
    # Whisper needs a file-like object with a .name attribute so it can
    # infer the format (webm / mp3 / wav / etc.) from the extension.
    buf = BytesIO(audio_bytes)
    buf.name = audio.filename or "audio.webm"

    try:
        # Use Whisper's TRANSLATE task instead of transcribe. translate
        # always outputs ENGLISH regardless of detected source language,
        # so even when Whisper mis-IDs an accented English speaker as
        # Bengali/Hindi/etc., we still get an English transcript.
        # transcribe + language='en' isn't enough — Whisper honors its
        # phonetic interpretation and produces non-Latin script.
        stt = client.audio.translations.create(
            model=STT_MODEL,
            file=buf,
            # Hint prompt biases Whisper toward portfolio names and
            # jargon. Improves recognition of 'Redwan', 'Erlangen',
            # 'ChromaDB', 'LangChain', etc.
            prompt=(
                "A spoken question about Md Redwan Hossain, an AI and "
                "machine learning researcher who completed his M.Sc. in "
                "Data Science at the University of Erlangen-Nuremberg. "
                "Topics: master thesis, publications, projects, voice "
                "agents, RAG, Python, FastAPI, ChromaDB, LangChain."
            ),
        )
        transcript = (stt.text or "").strip()
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
    # 3. Run the same agent text chat uses.
    # ------------------------------------------------------------------
    try:
        agent_reply = run_agent(transcript)
    except Exception as exc:  # noqa: BLE001
        log.exception("Agent failed while handling voice transcript")
        raise HTTPException(
            status_code=500,
            detail="Agent error. Check the backend logs.",
        ) from exc

    # ------------------------------------------------------------------
    # 4. OpenAI TTS — synthesize speech for the reply text.
    # ------------------------------------------------------------------
    try:
        tts = client.audio.speech.create(
            model=TTS_MODEL,
            voice=TTS_VOICE,
            input=agent_reply.speech,
            response_format="mp3",
        )
        audio_b64 = base64.b64encode(tts.content).decode("ascii")
    except Exception as exc:  # noqa: BLE001
        log.exception("TTS failed")
        raise HTTPException(
            status_code=502,
            detail="Text-to-speech failed. Check the backend logs.",
        ) from exc

    # ------------------------------------------------------------------
    # 5. Return everything in one JSON.
    # ------------------------------------------------------------------
    return VoiceResponse(
        transcript=transcript,
        speech=agent_reply.speech,
        route=agent_reply.route,
        highlight_id=agent_reply.highlight_id,
        audio_b64=audio_b64,
        audio_mime="audio/mpeg",
    )
