import {
  Brain,
  Code2,
  Database,
  MessagesSquare,
  Mic,
  Sparkles,
} from 'lucide-react';
import { SectionTitle } from '@/components/ui/SectionTitle';

const SERVICES = [
  {
    icon: Brain,
    title: 'AI / ML Research',
    desc: 'Designing and training models, from classical ML to modern transformer architectures.',
  },
  {
    icon: MessagesSquare,
    title: 'LLM Agents',
    desc: 'Building tool-using agents with LangChain, function calling, and structured outputs.',
  },
  {
    icon: Database,
    title: 'RAG Pipelines',
    desc: 'Vector search over CVs, papers, and codebases using ChromaDB or Pinecone.',
  },
  {
    icon: Code2,
    title: 'Full-Stack Web',
    desc: 'Production-grade Next.js + FastAPI apps. Typed end-to-end, deployed on Vercel + Render.',
  },
  {
    icon: Mic,
    title: 'Voice Interfaces',
    desc: 'Whisper STT, streaming TTS, and Web Audio — turning voice into UI actions.',
  },
  {
    icon: Sparkles,
    title: 'Prototyping',
    desc: 'Rapid 0→1 builds for AI features. From idea to demo in days, not weeks.',
  },
];

export function Services() {
  return (
    <section id="service" className="section-padding bg-ink-deep">
      <div className="container">
        <SectionTitle
          eyebrow="What I'm doing"
          title="Services"
          subtitle="A snapshot of the work I take on."
        />

        <div className="grid grid-cols-1 gap-px overflow-hidden rounded-2xl border border-white/10 bg-white/10 sm:grid-cols-2 lg:grid-cols-3">
          {SERVICES.map(({ icon: Icon, title, desc }) => (
            <div
              key={title}
              className="group flex flex-col gap-3 bg-ink p-8 text-center transition hover:bg-ink-card"
            >
              <div className="mx-auto inline-flex h-14 w-14 items-center justify-center rounded-full border border-gold/30 text-gold transition group-hover:bg-gold group-hover:text-ink">
                <Icon size={26} />
              </div>
              <h3 className="font-display text-lg font-semibold text-white">{title}</h3>
              <p className="text-sm text-muted">{desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
