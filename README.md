# AI-Powered Portfolio

![Next.js](https://img.shields.io/badge/Next.js-14-black?logo=nextdotjs)
![FastAPI](https://img.shields.io/badge/FastAPI-live-009688?logo=fastapi)
![TypeScript](https://img.shields.io/badge/TypeScript-strict-3178c6?logo=typescript)
![Python](https://img.shields.io/badge/Python-3.12-3776ab?logo=python)
![LangChain](https://img.shields.io/badge/LangChain-1.x-1c3c3c)
![ChromaDB](https://img.shields.io/badge/ChromaDB-vector_RAG-ff4f00)
![OpenAI](https://img.shields.io/badge/OpenAI-Whisper_·_GPT--4o--mini_·_TTS-412991?logo=openai)
![Deployed on Vercel](https://img.shields.io/badge/Vercel-frontend_live-000000?logo=vercel)
![Deployed on Render](https://img.shields.io/badge/Render-backend_live-46e3b7?logo=render)
![License](https://img.shields.io/badge/license-personal-lightgrey)

Voice-driven personal portfolio for **Md Redwan Hossain**.

A visitor can **speak** to the site — an LLM agent answers in voice and
navigates the page in real time. RAG-grounded over a CV PDF, so every
reply is factual, not hallucinated.

> 🌐 **Live demo:** <https://redwan-portfolio-2lrx.vercel.app/>
> 🎙 **Try it:** click the violet orb (bottom-right) → tap the mic → speak
> 👤 **Author:** [@RedwanRipon](https://github.com/RedwanRipon)

## Architecture

```
   Visitor opens redwan-portfolio-2lrx.vercel.app  (Vercel)
        │
        ├──► clicks violet orb → chat panel opens
        │           └──► clicks mic, speaks question
        │                   └──► /api/voice  (Next.js proxy)
        │                          ↓
        │                   redwan-portfolio-yvrg.onrender.com/voice/chat  (Render)
        │                          │
        │                          ├── 1. Whisper translate  → English transcript
        │                          ├── 2. LangChain agent (GPT-4o-mini)
        │                          │      ├─ search_cv_tool   → ChromaDB
        │                          │      └─ navigation_tool  → /#section
        │                          └── 3. OpenAI TTS (Nova)   → mp3 (base64)
        │
        └──► Browser plays the reply audio + page auto-navigates
```

**Cost per voice question:** ~$0.005 (Whisper $0.0001 + agent $0.001 + TTS $0.003).

## Build phases

| Phase | Scope | Status |
| :---: | --- | :---: |
| **1** | Next.js portfolio frontend (Hero, About, Expertise, Portfolio, Resume, Blog, Travel, Contact + theme toggle + dark/light + CV download) | ✅ Live |
| **2** | FastAPI backend + ChromaDB RAG + LangChain agent + text chat panel | ✅ Live |
| **3** | Voice layer (Whisper STT + agent + OpenAI TTS + mic capture + audio playback) | ✅ Live |
| **4** | Admin panel + auth | ⏳ Future |

## What the live site does

### Frontend
- 🌗 **Dark + light themes** with persisted preference and no flash on load
- ✨ **AI/ML neural-network canvas** animated behind the Hero
- 🎙 **Voice-driven "Ask Redwan AI"** — click the violet orb → tap the mic → speak → hear a spoken reply + watch the page navigate to the relevant section
- 📰 Full **blog system**: home preview → `/blogs` listing with live search → `/blogs/[slug]` 3-column detail page (sticky suggestions, sticky comments, 👍/👎 reactions, all persisted in localStorage)
- ✈️ Full **travel system** mirroring the blog, with a looping background video banner on `/travels`
- 📄 **Resume** section with a one-click CV download (also linked from the navbar)
- ♿ Motion-safe animations, accessible focus rings, keyboard-friendly, theme-aware text contrast

### Backend
- **`POST /chat`** — text in, JSON out (`{speech, route, highlight_id}`). Used by the chat panel's text mode (still wired, hidden in UI).
- **`POST /voice/chat`** — audio in, JSON out with transcript + reply text + base64 mp3 + nav hint.
- **`GET /` / `GET /health`** — uptime probes.
- **`/docs`** — auto-generated Swagger UI for trying the API.

### LangChain agent
Two tools the LLM can call:
- `search_cv_tool(query)` — RAG over ChromaDB (CV PDF chunked + embedded with `text-embedding-3-small`)
- `navigation_tool(route, highlight_id)` — declares which page the frontend should jump to

System prompt enforces 1–2 sentence spoken-friendly replies, past tense for completed degrees, "most recent first" ordering, polite off-topic refusal.

## Repo layout

```
.
├── README.md
├── frontend/                          # Next.js 14 — live on Vercel
│   ├── public/
│   │   ├── documents/cv.pdf
│   │   ├── images/                    # portrait, blog banner, etc.
│   │   └── videos/travel-banner.{mp4,webm}
│   ├── src/
│   │   ├── app/
│   │   │   ├── api/
│   │   │   │   ├── chat/route.ts      # proxy → FastAPI /chat
│   │   │   │   └── voice/route.ts     # proxy → FastAPI /voice/chat
│   │   │   ├── blogs/                 # listing + [slug] detail
│   │   │   ├── travels/               # listing + [slug] detail
│   │   │   ├── layout.tsx
│   │   │   ├── page.tsx               # single-page home (all sections)
│   │   │   └── globals.css
│   │   ├── components/
│   │   │   ├── blog/                  # CommentSection, PostReactions, SuggestionPosts, BlogsListing
│   │   │   ├── travel/                # mirrors blog
│   │   │   ├── voice/
│   │   │   │   ├── VoiceButton.tsx    # the floating orb
│   │   │   │   └── ChatPanel.tsx      # voice-only chat panel
│   │   │   ├── sections/              # Hero, About, Expertise, Portfolio, Resume, Blog, Travel, Contact
│   │   │   ├── layout/                # Navbar, Footer
│   │   │   └── ui/                    # SectionTitle, ThemeToggle, NeuralNetworkBackground
│   │   ├── lib/
│   │   │   ├── blog-data.tsx          # all blog posts (slug, title, JSX body, etc.)
│   │   │   ├── travel-data.tsx
│   │   │   ├── store.ts               # Zustand
│   │   │   └── utils.ts
│   │   └── hooks/
│   ├── package.json
│   ├── tailwind.config.ts
│   ├── tsconfig.json
│   └── next.config.mjs
│
└── backend/                           # FastAPI — live on Render
    ├── app/
    │   ├── main.py                    # FastAPI app + CORS
    │   ├── config.py                  # pydantic-settings (env-driven)
    │   ├── schemas.py                 # Pydantic request / response models
    │   ├── routes/
    │   │   ├── chat.py                # POST /chat
    │   │   ├── voice.py               # POST /voice/chat (Whisper + agent + TTS)
    │   │   └── health.py              # GET /, GET /health
    │   └── services/
    │       ├── agent.py               # LangChain agent + tools + system prompt
    │       ├── vector_store.py        # Chroma wrapper
    │       └── ingest.py              # PDF → chunks → embeddings → Chroma
    ├── data/
    │   ├── sources/cv.pdf             # source for the ingest
    │   └── chroma_db/                 # persisted vector store (committed)
    ├── scripts/
    │   ├── reindex.py                 # rebuild vector store from CV
    │   └── refresh_cv.py              # sync CV from frontend + reindex
    ├── Dockerfile                     # what Render builds
    ├── requirements.txt
    └── .env.example
```

## Getting started locally

You'll need **Python 3.12+**, **Node 18+**, and an **OpenAI API key**.

### Backend

```bash
cd backend
python -m venv .venv
.venv\Scripts\Activate.ps1            # PowerShell — use 'source .venv/bin/activate' on macOS/Linux
pip install -r requirements.txt

cp .env.example .env                   # then edit .env with your real OPENAI_API_KEY
python -m scripts.reindex              # one-time: embed the CV into ChromaDB

uvicorn app.main:app --reload --port 8000
```

Verify: <http://localhost:8000> → `{"status":"ok"}`. Try <http://localhost:8000/docs> for Swagger.

### Frontend

In a second terminal:

```bash
cd frontend
npm install
npm run dev
```

Open <http://localhost:3000>. The chat panel will hit your local backend by default.

## Updating the CV

Whenever the CV PDF changes:

```bash
# 1. Replace the file
#    frontend/public/documents/redwan-hossain-cv.pdf

# 2. From /backend (venv active):
python -m scripts.refresh_cv          # copies the new CV in + reindexes ChromaDB

# 3. Restart uvicorn so the agent picks up the new embeddings

# 4. Commit + push so the deploy gets it
git add -A && git commit -m "Update CV" && git push
```

## Production deploy

| Layer | Where | Trigger |
| --- | --- | --- |
| Frontend | Vercel | `git push origin main` → auto-deploys |
| Backend | Render (Docker) | `git push origin main` → auto-rebuilds |
| Vector store | committed to git (under `backend/data/chroma_db/`) | ships with the Docker image |

Env vars on **Render** (production backend):
- `OPENAI_API_KEY`
- `OPENAI_LLM_MODEL=gpt-4o-mini`
- `OPENAI_EMBEDDING_MODEL=text-embedding-3-small`
- `CORS_ORIGINS=https://redwan-portfolio-2lrx.vercel.app,http://localhost:3000`

Env vars on **Vercel** (production frontend):
- `NEXT_PUBLIC_API_BASE_URL=https://redwan-portfolio-yvrg.onrender.com`

## License

Personal project — all rights reserved unless otherwise specified.
