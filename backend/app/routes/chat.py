"""POST /chat endpoint — runs the agent and returns its reply."""
import logging

from fastapi import APIRouter, HTTPException

from app.schemas import ChatRequest, ChatResponse
from app.services.agent import run_agent

router = APIRouter(prefix="/chat", tags=["chat"])

log = logging.getLogger(__name__)


@router.post("", response_model=ChatResponse)
def chat(req: ChatRequest) -> ChatResponse:
    if not req.message.strip():
        raise HTTPException(status_code=400, detail="message cannot be empty")

    try:
        return run_agent(req.message)
    except Exception as exc:  # noqa: BLE001
        # Log full traceback to the server console; return a friendly
        # error to the client so we don't leak internals.
        log.exception("Agent failed while handling: %s", req.message)
        raise HTTPException(
            status_code=500,
            detail="The agent hit an error. Check the backend logs.",
        ) from exc
