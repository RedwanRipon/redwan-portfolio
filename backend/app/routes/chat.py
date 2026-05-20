"""POST /chat endpoint.

Phase 2 Step 1: returns a stub so the frontend can wire up end-to-end
before the LangChain agent is built. Step 3 replaces the stub with a
real call into services.agent.run_agent().
"""
from fastapi import APIRouter, HTTPException

from app.schemas import ChatRequest, ChatResponse

router = APIRouter(prefix="/chat", tags=["chat"])


@router.post("", response_model=ChatResponse)
def chat(req: ChatRequest) -> ChatResponse:
    if not req.message.strip():
        raise HTTPException(status_code=400, detail="message cannot be empty")

    # TODO Step 3 — delegate to services.agent.run_agent(req.message)
    return ChatResponse(
        speech=(
            "The agent isn't wired up yet — this is a Phase 2 Step 1 stub. "
            f"You said: \"{req.message}\". Real answers come once the "
            "ChromaDB ingest + LangChain agent ship."
        ),
        route=None,
        highlight_id=None,
    )
