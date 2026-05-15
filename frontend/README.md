# Frontend — Redwan Portfolio

Next.js 14 (App Router) + TypeScript + TailwindCSS + Zustand.

## Local development

```bash
cd frontend
npm install
cp .env.local.example .env.local   # adjust if needed
npm run dev
```

Open <http://localhost:3000>.

## Structure

```
frontend/
├── public/
│   ├── images/         # static images
│   └── documents/      # CV.pdf etc.
└── src/
    ├── app/            # App Router pages
    │   ├── (routes)/   # home, about, projects, ...
    │   └── api/chat/   # proxy → FastAPI (Phase 2)
    ├── components/
    │   ├── layout/     # Navbar, Footer
    │   ├── sections/   # Hero, ProjectCard, ...
    │   ├── voice/      # mic button, WS client, TTS player (Phase 3)
    │   └── ui/         # shadcn-style primitives
    ├── content/        # MDX source for projects/blog/research
    ├── lib/            # store (Zustand), api client, utils
    ├── hooks/          # useVoice (Phase 3)
    ├── types/          # shared TS types
    └── styles/         # extra CSS if needed
```

## Phases

This frontend is built in slices. Phase-3 voice files exist as stubs.

| Phase | What gets added here |
| --- | --- |
| 1 (now) | All routes + content, no AI |
| 2 | Wire `/api/chat` to FastAPI; add a text chat widget |
| 3 | Activate `voice/*` (Web Audio + WebSocket + TTS playback) |
| 4 | Admin routes under `/admin` |

## Scripts

| Command | Purpose |
| --- | --- |
| `npm run dev` | Start dev server (http://localhost:3000) |
| `npm run build` | Production build |
| `npm run start` | Run the production build |
| `npm run lint` | ESLint |
| `npm run format` | Prettier (with Tailwind plugin) |
