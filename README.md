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

## Tech stack — what each piece does and where it lives

### Frontend — Next.js app (deployed on Vercel)

| Tech | Where in the repo | What it does |
| --- | --- | --- |
| **Next.js 14 (App Router)** | `frontend/src/app/` | React framework. File-based routing (`page.tsx`, `layout.tsx`), server + client components, dynamic routes (`[slug]/page.tsx`), API routes (`api/*/route.ts`). |
| **React 18** | every `.tsx` file | UI library. Hooks (`useState`, `useEffect`, `useRef`, `useMemo`) drive all interactivity. |
| **TypeScript (strict)** | `tsconfig.json`, every `.ts(x)` | Static types end-to-end. Catches shape mismatches between the frontend's `ChatResponse` and the backend's Pydantic models. |
| **TailwindCSS 3** | `tailwind.config.ts`, `globals.css`, every `className=` | Utility-first styling. Custom palette (`ink`, `gold`, `muted`), custom animations (`pop-in`, `orb-float`, `shimmer`), `dark:` modifier wired to the theme toggle. |
| **Zustand** | `frontend/src/lib/store.ts` | Tiny global state store. Used for the `isRecording` flag the voice UI consults. |
| **Framer Motion** | implicit via Tailwind `motion-safe:` classes + a few `useState`-driven CSS animations | Declarative animations. Currently doing most animation through Tailwind keyframes; Framer Motion is in deps for future expansion. |
| **lucide-react** | every `import { ... } from 'lucide-react'` | Icon set — `Mic`, `Sparkles`, `Search`, `X`, `MapPin`, `ThumbsUp`, etc. SVG, tree-shakable. |
| **next/font (Google Fonts)** | `app/layout.tsx` | Self-hosts Poppins (body) and Jost (display) so there's no FOUC and no third-party font CSS request. |
| **next/image** | `About.tsx`, `/blogs/page.tsx`, `/travels/page.tsx` | Auto-optimized images (AVIF/WebP, responsive `srcset`, `priority` flag for LCP images). |
| **next/navigation (`useRouter`)** | `ChatPanel.tsx`, `Navbar.tsx` | Programmatic navigation. After the agent picks a `route`, the chat panel calls `router.push(route)`. |
| **Canvas API** | `components/ui/NeuralNetworkBackground.tsx` | AI/ML neural-network animation behind the Hero — drifting gold nodes, distance-faded violet edges, occasional synaptic "firing" pulses. ~60 nodes, O(n²) distance per frame at 60fps. |
| **MediaDevices.getUserMedia** | `components/voice/ChatPanel.tsx` | Browser mic permission + audio stream. Triggers the OS-level "do you want to allow this site to use your mic" prompt. |
| **MediaRecorder API** | `components/voice/ChatPanel.tsx` | Records the mic stream as a `Blob` (webm/opus on Chrome, mp4/aac on Safari). 30s cap. |
| **HTMLAudioElement** | `components/voice/ChatPanel.tsx` | Plays the TTS reply. Source is a `data:audio/mpeg;base64,...` URL built from the backend's JSON response. |
| **IntersectionObserver** | `components/layout/Navbar.tsx` | Scroll-spy. Watches the home section anchors so the navbar's active link highlights as you scroll. |
| **localStorage** | `CommentSection.tsx`, `PostReactions.tsx`, `ThemeToggle.tsx` | Phase 1 persistence. Stores comments per blog/travel post, 👍/👎 votes per post, and the user's dark/light theme choice. |
| **crypto.randomUUID** | `ChatPanel.tsx`, `CommentSection.tsx` | Generates short unique IDs for messages + comments without an extra `uuid` dep. |

### Backend — FastAPI service (deployed on Render in Docker)

| Tech | Where in the repo | What it does |
| --- | --- | --- |
| **Python 3.12** | `backend/Dockerfile`, `backend/app/` | Runtime. 3.12 chosen for stable wheels across the ML stack. |
| **FastAPI** | `backend/app/main.py`, `backend/app/routes/*` | Async web framework. Auto-generates OpenAPI schema → Swagger UI at `/docs`. Dependency injection, typed handlers. |
| **Uvicorn (`[standard]`)** | `Dockerfile` `CMD` line + local `uvicorn` command | ASGI server that actually runs FastAPI. `--reload` watches `.py` files during dev. |
| **Pydantic 2.x** | `backend/app/schemas.py` | Runtime data validation. `ChatRequest`, `ChatResponse`, `VoiceResponse`, `HealthResponse` describe the JSON contract with the frontend. |
| **pydantic-settings** | `backend/app/config.py` | Type-safe env loader. Reads `OPENAI_API_KEY`, `OPENAI_LLM_MODEL`, `CORS_ORIGINS`, etc. from env or `.env`. |
| **python-dotenv** | implicit dep of pydantic-settings | Loads `backend/.env` into `os.environ` during local dev. |
| **python-multipart** | implicit dep used by FastAPI's `UploadFile` | Parses `multipart/form-data` requests so `POST /voice/chat` can accept the browser's audio upload. |
| **CORSMiddleware (built into FastAPI)** | `backend/app/main.py` | Adds `Access-Control-Allow-Origin` headers so the browser stops blocking cross-origin requests from Vercel to Render. |
| **logging (stdlib)** | `routes/chat.py`, `routes/voice.py`, `services/*` | Structured logs to stderr — Render's log view streams these in real time. |

### AI / RAG stack — the brain

| Tech | Where in the repo | What it does |
| --- | --- | --- |
| **LangChain 1.x** | `backend/app/services/agent.py` | LLM orchestration framework. We use it for the tool-calling primitives (`@tool`, `ChatOpenAI.bind_tools`), but implement the tool-calling loop ourselves for clarity + version stability. |
| **`langchain-openai`** | `services/agent.py`, `services/vector_store.py` | Wrappers around OpenAI's chat-completions and embeddings APIs — `ChatOpenAI`, `OpenAIEmbeddings`. |
| **`langchain-chroma`** | `services/vector_store.py` | Adapter from LangChain `Document`s to ChromaDB. `Chroma(persist_directory=...)` connects to the on-disk vector store. |
| **`langchain-core`** | imported everywhere | Stable interfaces — `Document`, `SystemMessage`, `HumanMessage`, `ToolMessage`, `AIMessage`, `@tool` decorator. |
| **`langchain-text-splitters`** | `services/ingest.py` | `RecursiveCharacterTextSplitter` slices the CV into ~600-char chunks with 120-char overlap, preferring paragraph → sentence → word boundaries. |
| **ChromaDB** | `backend/data/chroma_db/` + `services/vector_store.py` | Local persistent vector database (SQLite + HNSW binary index files). Stores chunk text + 1536-dim embeddings + metadata. ~1.2 MB on disk, committed to git so the Docker image ships with the index. |
| **OpenAI Python SDK** | `services/agent.py`, `routes/voice.py` | Used both directly (Whisper, TTS) and indirectly via LangChain (chat + embeddings). |
| **OpenAI Whisper (`whisper-1`)** | `routes/voice.py` — `client.audio.translations.create` | Speech-to-text. We use the **translate** task (not transcribe), which always outputs English regardless of detected source language — important for accented English speakers. |
| **OpenAI Embeddings (`text-embedding-3-small`)** | `services/vector_store.py` | Converts CV chunks + each user query into 1536-dim vectors. Cosine distance over these vectors is how we find "relevant CV passages." |
| **OpenAI Chat Completions (`gpt-4o-mini`)** | `services/agent.py` — `ChatOpenAI(model=...)` | The agent's reasoning LLM. Tool-calling, system-prompt steering, navigation decisions. Cheap (~$0.001 / query) and fast (~1-3 s). |
| **OpenAI TTS (`tts-1`, voice `nova`)** | `routes/voice.py` — `client.audio.speech.create` | Text-to-speech. Returns mp3 bytes; we base64-encode them into the JSON response. |
| **pypdf** | `services/ingest.py` | Pure-Python PDF text extraction. Reads the CV PDF page by page into plain text before chunking. |
| **tiktoken** | implicit (used by OpenAI SDK for budget calculations) | OpenAI's tokenizer. Powers token-aware safety checks inside the SDK. |

### Hosting + infrastructure

| Tech | Where | What it does |
| --- | --- | --- |
| **Vercel** | `frontend/` | Frontend hosting + CDN + auto-deploy on `git push`. Free tier. |
| **Render (Docker)** | `backend/Dockerfile` → `redwan-portfolio-yvrg.onrender.com` | Backend hosting. Builds the Dockerfile, exposes `$PORT`, restarts on every push. Free tier (sleeps after 15 min idle). |
| **Docker** | `backend/Dockerfile`, `backend/.dockerignore` | Containerizes the backend. `python:3.12-slim` base, layered `COPY` for cache-friendly rebuilds, ChromaDB index baked into the image. |
| **GitHub** | the repo | Source of truth + webhook target. Pushes to `main` trigger both Vercel and Render rebuilds. |
| **Git** | local | Version control. Single `main` branch, no LFS (chroma_db is small enough to commit raw). |

### Browser features we rely on (no library, just standards)

| Feature | Where | What it does |
| --- | --- | --- |
| **`scroll-behavior: smooth`** + scroll-padding | `globals.css` | Smooth scroll between anchor sections without JS, accounting for the sticky navbar. |
| **`prefers-color-scheme`** | `ThemeToggle.tsx` | Initial theme falls back to the OS preference when localStorage is empty. |
| **`prefers-reduced-motion`** | `motion-safe:*` Tailwind variants | Animations are skipped for users who have OS-level reduced motion on. |
| **`AbortSignal.timeout`** | `api/chat/route.ts`, `api/voice/route.ts` | 90s / 120s timeouts on upstream fetches so a hung backend doesn't hang the UI forever. |
| **Backdrop blur** (`backdrop-filter`) | navbar, chat panel, voice pill | Frosted-glass look on top of the page content. |

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
