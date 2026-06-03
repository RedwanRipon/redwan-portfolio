"""Pydantic models shared across routes and services."""
from typing import Optional

from pydantic import BaseModel, Field


class ChatRequest(BaseModel):
    """Incoming chat message from the frontend."""

    message: str = Field(..., min_length=1, max_length=4000)
    session_id: Optional[str] = Field(
        default=None,
        description="Optional conversation id for session continuity.",
    )


class ChatResponse(BaseModel):
    """Agent reply. Matches the TypeScript ChatResponse on the frontend.

    The same shape will be reused over WebSocket in Phase 3 (voice).
    """

    speech: str = Field(
        ...,
        description="Natural-language reply (will also be fed to TTS in Phase 3).",
    )
    route: Optional[str] = Field(
        default=None,
        description="Optional Next.js route to navigate to (e.g. '/resume').",
    )
    highlight_id: Optional[str] = Field(
        default=None,
        description="Optional DOM id to spotlight after navigation.",
    )


class VoiceResponse(BaseModel):
    """Voice-chat reply. Same fields as ChatResponse plus the heard
    transcript and the synthesized audio.
    """

    transcript: str = Field(
        ...,
        description="What Whisper heard the user say.",
    )
    speech: str = Field(
        ...,
        description="Agent's text reply (also synthesized into audio_b64).",
    )
    route: Optional[str] = Field(
        default=None,
        description="Optional Next.js route to navigate to.",
    )
    highlight_id: Optional[str] = Field(
        default=None,
        description="Optional DOM id to spotlight after navigation.",
    )
    audio_b64: str = Field(
        ...,
        description="Base64-encoded TTS audio (mp3 by default).",
    )
    audio_mime: str = Field(
        default="audio/mpeg",
        description="MIME type matching audio_b64. The frontend uses this "
        "to construct a data: URL or Blob for playback.",
    )


class HealthResponse(BaseModel):
    """Liveness probe response."""

    status: str = "ok"
    version: str = "0.1.0"
