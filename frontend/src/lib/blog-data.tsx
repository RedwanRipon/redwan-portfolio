import type { ReactNode } from 'react';

/**
 * Shared blog post data — used by the home section, the /blogs
 * listing, and the /blogs/[slug] detail page.
 *
 * Body content is authored as JSX directly here. The wrapper at
 * the render site adds the `blog-body` class which styles all the
 * standard prose elements (h2/h3, p, strong, a, ul, ol, blockquote,
 * img, code, pre).
 */

export interface Post {
  slug: string;
  date: string;
  title: string;
  excerpt: string;
  /** Tailwind gradient for the placeholder thumbnail. */
  gradient: string;
  /** Author name shown on the detail page. */
  author?: string;
  /** Rich body content for /blogs/[slug]. */
  body?: ReactNode;
}

const AUTHOR = 'Md Redwan Hossain';

export const POSTS: Post[] = [
  {
    slug: 'building-voice-agents',
    date: 'May 10, 2026',
    title: 'Building voice agents that actually understand context',
    excerpt:
      'How I combined Whisper, LangChain tool calling, and a tiny Zustand store to make a portfolio that listens.',
    gradient: 'from-amber-500/40 to-rose-700/40',
    author: AUTHOR,
    body: (
      <>
        <p>
          Most voice demos are toys — they transcribe what you said, paste it into a
          chat box, and read the reply out loud. That works for a hello-world. It
          falls apart the moment the user expects the agent to <em>do</em> something
          on the page.
        </p>
        <p>
          This portfolio was an excuse to build a real one. Speak to it; an agent
          answers in voice <strong>and</strong> moves the page where the answer
          lives.
        </p>

        <h2>Why voice is harder than text</h2>
        <p>Three things make voice agents fundamentally different from chat:</p>
        <ul>
          <li>
            <strong>Latency budget is tight.</strong> Anything over ~1.2s feels
            broken. Every hop — mic capture, STT, LLM, TTS — adds milliseconds.
          </li>
          <li>
            <strong>Turn-taking is hard.</strong> You need to know when the user
            stopped speaking, when to barge in, and when to stay quiet.
          </li>
          <li>
            <strong>Errors compound.</strong> Whisper hears <em>“RAG”</em> as
            <em> “rack”</em>, the LLM searches for the wrong thing, the TTS
            confidently misreads it back. One slip cascades.
          </li>
        </ul>

        <h2>The architecture</h2>
        <p>
          Inside this site the flow is: mic → WebSocket → faster-whisper → LangChain
          agent with two tools (<code>search_cv_tool</code>, <code>navigation_tool</code>)
          → OpenAI TTS → Web Audio playback. A tiny Zustand store fans the
          navigation intent out to the App Router, so the page navigates the
          instant the agent decides on a route.
        </p>
        <p>
          <strong>Key insight:</strong> the LLM&apos;s response is structured —
          <code>{`{ speech, route, highlight_id }`}</code> — not just text. Speech
          goes to TTS, route goes to <code>router.push()</code>, highlight ID
          spotlights an element on the destination page. Three channels of output
          for the price of one prompt.
        </p>

        <h2>Lessons learned</h2>
        <p>
          The biggest surprise was how much the <em>system prompt</em> matters once
          tools are involved. A vague prompt makes the agent ramble in voice; a
          tight one keeps replies under two sentences and reserves longer answers
          for the rendered page. That single change was the biggest win.
        </p>
        <blockquote>
          Voice UX is a constraint, not a feature. Lean into the constraint and
          design replies that are <em>spoken first, written second</em>.
        </blockquote>
      </>
    ),
  },
  {
    slug: 'rag-over-cv',
    date: 'Apr 22, 2026',
    title: 'A practical RAG setup over your own CV',
    excerpt:
      'Chunking strategies, embeddings, and why ChromaDB is plenty for a personal site — no Pinecone needed.',
    gradient: 'from-sky-500/40 to-violet-700/40',
    author: AUTHOR,
    body: (
      <>
        <p>
          A portfolio with a chatbot stapled on is useful for about thirty seconds.
          A portfolio whose chatbot actually knows your CV, projects, and papers
          is something a recruiter will spend three minutes with.
        </p>

        <h2>Chunking strategies</h2>
        <p>
          For a CV (one page, dense, structured) you don&apos;t want naive 512-token
          chunks — they cut sections in half and lose context. I split by{' '}
          <em>semantic block</em>:
        </p>
        <ul>
          <li>Each role under <em>Experience</em> is one chunk</li>
          <li>Each degree under <em>Education</em> is one chunk</li>
          <li>Each project paragraph is one chunk</li>
          <li>The profile/summary is its own chunk</li>
        </ul>
        <p>
          Each chunk also gets metadata — section name, dates, tags — which the
          retriever can filter on. <strong>“What did you do in Germany?”</strong>{' '}
          becomes a filter on <code>country=DE</code> before embedding similarity
          ever runs.
        </p>

        <h2>Why ChromaDB</h2>
        <p>
          For a personal site, ChromaDB running in the same Python process as
          FastAPI is more than enough. No managed service, no per-request cost,
          no network hop. Spin it up, persist to a local volume, ingest on deploy.
          Pinecone, Weaviate, and friends only earn their keep at scale neither of
          us has.
        </p>

        <h2>Embeddings: pick the cheap one</h2>
        <p>
          OpenAI&apos;s <code>text-embedding-3-small</code> is plenty for a CV-sized
          corpus and costs fractions of a cent per ingest. Don&apos;t reach for{' '}
          <code>-large</code> unless you have a measurable retrieval problem.
        </p>
      </>
    ),
  },
  {
    slug: 'next-fastapi',
    date: 'Mar 30, 2026',
    title: 'Next.js + FastAPI: my default starter for AI apps',
    excerpt:
      'Typed end-to-end, deploys to Vercel and Render, fast to iterate. Here’s the layout I keep reaching for.',
    gradient: 'from-emerald-500/40 to-teal-700/40',
    author: AUTHOR,
    body: (
      <>
        <p>
          I&apos;ve started three AI side projects this year, and every time I&apos;ve
          reached for the same skeleton: Next.js on the front, FastAPI on the back,
          a single repo with two folders. Here&apos;s why it keeps winning.
        </p>

        <h2>The layout</h2>
        <pre>
          <code>{`my-app/
├── frontend/   # Next.js 14, TypeScript, Tailwind
└── backend/    # FastAPI, Pydantic, LangChain`}</code>
        </pre>
        <p>
          Two independent deploys (Vercel for the frontend, Render or Fly for the
          backend), one git repo, no monorepo tooling. CORS handled in FastAPI,
          API base URL in a single env var on the frontend.
        </p>

        <h2>Why this combo</h2>
        <ul>
          <li>
            <strong>Python is unavoidable for AI.</strong> The ecosystem (LangChain,
            transformers, sklearn, Pyomo) lives here.
          </li>
          <li>
            <strong>Next.js shines on the frontend.</strong> App Router, server
            components, image optimization, and Vercel&apos;s zero-config deploy.
          </li>
          <li>
            <strong>Both are statically typed end-to-end.</strong> Pydantic on the
            backend, TypeScript on the frontend, with a shared JSON schema for
            cross-checking when it matters.
          </li>
        </ul>

        <h2>Tradeoffs</h2>
        <p>
          You pay one network hop between Vercel (US, edge) and your backend
          (wherever you host it). For interactive chat that&apos;s usually fine. For
          ultra-low-latency voice it can hurt — co-locate them in the same region
          and add a WebSocket so connections stay warm.
        </p>
        <p>
          Otherwise: ship it. The boring stack keeps winning.
        </p>
      </>
    ),
  },
];
