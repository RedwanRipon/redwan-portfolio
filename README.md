# AI-Powered Portfolio

![Next.js](https://img.shields.io/badge/Next.js-14-black?logo=nextdotjs)
![FastAPI](https://img.shields.io/badge/FastAPI-planned-009688?logo=fastapi)
![TypeScript](https://img.shields.io/badge/TypeScript-strict-3178c6?logo=typescript)
![Deployed on Vercel](https://img.shields.io/badge/Vercel-live-000000?logo=vercel)
![License](https://img.shields.io/badge/license-personal-lightgrey)

Voice-driven personal portfolio for **Md Redwan Hossain**.

A visitor can speak to the site; an LLM agent answers in voice and navigates
the page in real-time. Built as a sliced, phased project.

> 🌐 **Live demo:** <https://redwan-portfolio-2lrx.vercel.app/>
> 👤 **Author:** [@RedwanRipon](https://github.com/RedwanRipon)

## Architecture (high-level)

- **Frontend** — Next.js 14 (App Router), TailwindCSS, Zustand, Framer Motion. Deployed on Vercel.
- **Backend** — FastAPI + LangChain + ChromaDB (vector RAG over CV/projects). LLM: GPT-4o-mini.
- **Voice** — Web Audio (mic) → WebSocket → Whisper STT → LLM → OpenAI TTS → playback.
- **Admin** — `/admin` (NextAuth) for content + re-indexing the vector DB.

See `docs/architecture.png` (TODO) for the full diagram.

## Build phases

| Phase | Scope | Status |
| --- | --- | --- |
| 1 | Next.js portfolio frontend (static, no AI) | ✅ Live |
| 2 | FastAPI backend + RAG + text chat | Planned |
| 3 | Voice layer (STT + TTS + WebSocket) | Planned |
| 4 | Admin panel + auth | Planned |
| 5 | Production deploy with backend | Frontend done |

## Highlights of the live frontend

- 🌗 **Dark + light themes** with persisted preference and no flash on load
- ✨ **AI/ML neural-network canvas** animated behind the Hero
- 🎙 **"Ask Redwan AI"** voice launcher (UI shell — wired in Phase 3)
- 📰 Full **blog system**: home section → `/blogs` listing with search → `/blogs/[slug]` 3-column detail page with sticky suggestions + comments + 👍/👎 reactions
- ✈️ Full **travel system** mirroring the blog, with a looping background video banner on `/travels`
- 📄 **Resume** section with one-click CV download
- ♿ Motion-safe animations, accessible focus rings, keyboard-friendly

## Repo layout

```
.
├── frontend/   # Next.js 14 app — Phase 1 ✅
├── backend/    # FastAPI service — Phase 2+ (planned)
└── docs/       # Diagrams, notes
```

## Getting started locally

```bash
cd frontend
npm install
npm run dev
```

Open <http://localhost:3000>.

See `frontend/README.md` for more.

## License

Personal project — all rights reserved unless otherwise specified.
