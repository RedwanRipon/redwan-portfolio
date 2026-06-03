"""FastAPI application entry point.

Run locally:
    uvicorn app.main:app --reload --port 8000

Production (Docker/Render):
    uvicorn app.main:app --host 0.0.0.0 --port $PORT
"""
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.config import settings
from app.routes import chat, health, voice

app = FastAPI(
    title="Redwan Portfolio Agent",
    description=(
        "Backend brain for the voice-driven portfolio. Phase 2 exposes "
        "a /chat endpoint that the Next.js frontend calls. Phase 3 adds "
        "a WebSocket for streaming voice."
    ),
    version="0.1.0",
)

# CORS — allow only the configured origins (local dev + Vercel prod).
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins_list,
    allow_credentials=True,
    allow_methods=["GET", "POST", "OPTIONS"],
    allow_headers=["*"],
)

app.include_router(health.router)
app.include_router(chat.router)
app.include_router(voice.router)
