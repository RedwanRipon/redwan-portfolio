# AI-Powered Portfolio

Voice-driven personal portfolio for **Md Redwan Hossain**.

A visitor can speak to the site; an LLM agent answers in voice and navigates
the page in real-time. Built as a sliced, phased project.

## Architecture (high-level)

- **Frontend** — Next.js 14 (App Router), TailwindCSS, Zustand, Framer Motion. Deployed on Vercel.
- **Backend** — FastAPI + LangChain + ChromaDB (vector RAG over CV/projects). LLM: GPT-4o-mini.
- **Voice** — Web Audio (mic) → WebSocket → Whisper STT → LLM → OpenAI TTS → playback.
- **Admin** — `/admin` (NextAuth) for content + re-indexing the vector DB.

See `docs/architecture.png` (TODO) for the full diagram.

## Build phases

| Phase | Scope | Status |
| --- | --- | --- |
| 1 | Next.js portfolio frontend (static, no AI) | In progress |
| 2 | FastAPI backend + RAG + text chat | Planned |
| 3 | Voice layer (STT + TTS + WebSocket) | Planned |
| 4 | Admin panel + auth | Planned |
| 5 | CI/CD + production deploy | Planned |

## Repo layout

```
.
├── frontend/   # Next.js 14 app  (Phase 1)
├── backend/    # FastAPI service (Phase 2+)
└── docs/       # Diagrams, notes
```

## Getting started

See `frontend/README.md` for local dev instructions (once scaffolded).

## License

Personal project — all rights reserved unless otherwise specified.
