# Backend — Redwan Portfolio Agent

FastAPI + LangChain + ChromaDB. Serves the AI brain for the voice-driven portfolio.

## Quick start (local)

```bash
cd backend

# 1. Create + activate a virtual env
python -m venv .venv
# Windows
.venv\Scripts\activate
# macOS / Linux
# source .venv/bin/activate

# 2. Install dependencies
pip install --upgrade pip
pip install -r requirements.txt

# 3. Configure env
cp .env.example .env
# Then open .env in any editor and paste your OPENAI_API_KEY=sk-...

# 4. Run the dev server (auto-reload on save)
uvicorn app.main:app --reload --port 8000
```

Then open <http://localhost:8000> — you should see `{"status": "ok"}`.

Interactive API docs: <http://localhost:8000/docs>.

## Endpoints (Phase 2 Step 1 — stubbed)

| Method | Path     | Purpose |
| --- | --- | --- |
| `GET`  | `/`        | Liveness probe |
| `GET`  | `/health`  | Liveness probe |
| `POST` | `/chat`    | Chat with the agent. Returns `{ speech, route, highlight_id }` |

Stub `POST /chat` just echoes your message until Step 3 wires the agent.

## Project layout

```
backend/
├── app/
│   ├── main.py              # FastAPI app, CORS, router includes
│   ├── config.py            # Settings (env-driven, pydantic-settings)
│   ├── schemas.py           # Pydantic models (ChatRequest, ChatResponse, ...)
│   ├── routes/
│   │   ├── health.py        # GET / and GET /health
│   │   └── chat.py          # POST /chat
│   └── services/
│       ├── vector_store.py  # ChromaDB wrapper (Step 2)
│       ├── ingest.py        # PDF/text ingestion (Step 2)
│       └── agent.py         # LangChain agent + tools (Step 3)
├── scripts/
│   └── reindex.py           # CLI: rebuild ChromaDB from data/sources
├── data/
│   ├── sources/             # CV PDF + content snapshots (gitignored except .gitkeep)
│   └── chroma_db/           # vector index (gitignored)
├── .env.example             # template — copy to .env
├── requirements.txt
├── Dockerfile               # for Render / Fly / Railway deploys
└── README.md
```

## Build phases (this backend)

| Step | Scope | Status |
| --- | --- | --- |
| 1 | FastAPI scaffold + stub `/chat` | ✅ done |
| 2 | ChromaDB ingest pipeline (CV + blog + travel) | next |
| 3 | LangChain agent with `search_cv_tool` + `navigation_tool` | after Step 2 |
| 4 | Wire frontend chat panel | after Step 3 |
| 5 | Deploy to Render | last |

## Production / Docker

```bash
docker build -t redwan-agent .
docker run -p 8000:8000 --env-file .env redwan-agent
```

Render reads the same `Dockerfile`. On Render you set the env vars
(`OPENAI_API_KEY`, `CORS_ORIGINS`) in the dashboard.
