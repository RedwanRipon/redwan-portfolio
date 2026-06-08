"""The agent — turns a user question into a spoken reply + nav hint.

Design: single-LLM-call with JSON structured output
----------------------------------------------------
No tool-calling loop. The LLM returns a JSON object with speech + route
in a single call. RAG context is pre-fetched and injected into the
system prompt. This is the fastest possible architecture:

  1. Vector search (~0.1-0.5s warm)
  2. One LLM call (~1-2s)
  3. JSON parse (instant)

Total agent time: ~1.5-2.5s (warm).
"""
import functools
import json
import logging
import re
import time
from typing import Optional

from openai import OpenAI

from app.config import settings
from app.schemas import ChatResponse
from app.services.vector_store import search

log = logging.getLogger(__name__)


# ----------------------------------------------------------------------
# Cached client
# ----------------------------------------------------------------------

@functools.lru_cache(maxsize=1)
def _get_openai_client() -> OpenAI:
    """Raw OpenAI client — reuses HTTP connection pool across requests."""
    return OpenAI(api_key=settings.openai_api_key)


# ----------------------------------------------------------------------
# System prompt
# ----------------------------------------------------------------------

SYSTEM_PROMPT_TEMPLATE = """You are the AI voice assistant on Md Redwan Hossain's
personal portfolio website. Answer questions about Redwan using the
context below.

=== CV CONTEXT (from vector search) ===
{cv_context}
=== END CV CONTEXT ===

Hard facts (override anything in the context that contradicts):
- He COMPLETED his M.Sc. in Data Science (Major: ML & AI) at the
  University of Erlangen-Nuremberg in May 2026. FINISHED, not ongoing.
- He COMPLETED his B.Sc. in Computer Science & Engineering at
  Southeast University, Bangladesh, in January 2020.
- His master's thesis was on integrated charging-aware mixed-fleet
  scheduling for electric and conventional buses, using Python,
  Pyomo, and Gurobi.

Tense rules:
- ALWAYS use PAST TENSE for degrees: "Redwan earned…" / "he holds…"
- Same for thesis: "his thesis was on…" / "he worked on…"

Ordering: lead with the most recent item first.

Tone:
- Replies will be SPOKEN ALOUD by TTS. Keep to 1-2 short sentences.
- No bullet points, no markdown, no headings, no emojis.
- Conversational, friendly, natural.
- Refer to Redwan as "Redwan" or "he", never "I".

You MUST respond with a JSON object in this exact format:
{{
  "speech": "Your spoken reply here",
  "route": "/#section"
}}

Route must be one of these values based on the topic:
  education / thesis / experience / skills -> "/#resume"
  projects / portfolio                     -> "/#portfolio"
  focus areas / what he does               -> "/#expertise"
  bio / who is he                          -> "/#about"
  blog / writing                           -> "/#blog"
  travel / cities                          -> "/#travel"
  contact / hire                           -> "/#contact"
  off-topic / greeting                     -> null

If the context doesn't help, say so honestly in speech.
Off-topic questions: speech should politely say you only know about Redwan."""


def run_agent(user_message: str) -> ChatResponse:
    """Single LLM call. Returns ChatResponse with speech + route."""
    t0 = time.perf_counter()
    client = _get_openai_client()

    # 1. Pre-fetch RAG context.
    t_rag = time.perf_counter()
    hits = search(user_message, k=4)
    cv_context = (
        "\n\n---\n\n".join(content for content, _ in hits)
        if hits
        else "No relevant information found."
    )
    log.info(
        "[agent] RAG search took %.2fs (%d hits)",
        time.perf_counter() - t_rag,
        len(hits),
    )

    # 2. Single LLM call with JSON output.
    system_prompt = SYSTEM_PROMPT_TEMPLATE.format(cv_context=cv_context)

    t_llm = time.perf_counter()
    response = client.chat.completions.create(
        model=settings.openai_llm_model,
        temperature=0.2,
        messages=[
            {"role": "system", "content": system_prompt},
            {"role": "user", "content": user_message},
        ],
        response_format={"type": "json_object"},
    )
    log.info("[agent] LLM call took %.2fs", time.perf_counter() - t_llm)

    # 3. Parse the JSON response.
    raw = (response.choices[0].message.content or "").strip()
    speech = "I'm not sure how to answer that — try asking about Redwan's work or background."
    nav_route: Optional[str] = None

    try:
        data = json.loads(raw)
        speech = data.get("speech", speech)
        nav_route = data.get("route")
    except (json.JSONDecodeError, AttributeError):
        # If JSON parsing fails, use the raw text as speech.
        log.warning("[agent] Failed to parse JSON, using raw: %r", raw[:100])
        if raw:
            # Try to salvage — strip any JSON artifacts.
            cleaned = re.sub(r'[{}"\[\]]', '', raw).strip()
            if cleaned:
                speech = cleaned

    log.info("[agent] total run_agent took %.2fs", time.perf_counter() - t0)

    return ChatResponse(
        speech=speech,
        route=nav_route,
        highlight_id=None,
    )
