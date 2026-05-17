import { Download } from 'lucide-react';
import { SectionTitle } from '@/components/ui/SectionTitle';

interface TimelineItem {
  title: string;
  year: string;
  org: string;
  desc?: string;
}

const EDUCATION: TimelineItem[] = [
  {
    title: 'M.Sc. Data Science',
    year: '2024 — Present',
    org: 'Germany',
    desc: 'Focus on AI / Machine Learning. Thesis on voice-driven agents in progress.',
  },
  {
    title: 'B.Sc. in Computer Science',
    year: '2020',
    org: 'Undergraduate',
    desc: 'Foundations in algorithms, systems, and software engineering.',
  },
];

const EXPERIENCE: TimelineItem[] = [
  {
    title: 'AI Research / Thesis Work',
    year: '2025 — Present',
    org: 'University',
    desc: 'Building agentic systems with LangChain, RAG, and streaming speech interfaces.',
  },
  {
    title: 'Full-Stack Developer (Freelance)',
    year: '2022 — 2024',
    org: 'Selected clients',
    desc: 'Shipped Next.js + Python apps; led prototyping for AI features.',
  },
];

function Timeline({ title, items }: { title: string; items: TimelineItem[] }) {
  return (
    <div>
      <h4 className="mb-8 font-display text-2xl font-semibold text-white">{title}</h4>
      <ol className="relative space-y-10 border-l border-white/10 pl-8">
        {items.map((item) => (
          <li key={item.title} className="relative">
            {/* Dot */}
            <span className="absolute -left-[37px] top-1 inline-flex h-4 w-4 items-center justify-center rounded-full border-2 border-gold bg-ink">
              <span className="h-1.5 w-1.5 rounded-full bg-gold" />
            </span>
            <h5 className="font-display text-lg font-semibold text-white">{item.title}</h5>
            <p className="mt-1 text-sm">
              <span className="text-gold">{item.year}</span>
              <span className="mx-2 text-muted/60">·</span>
              <span className="text-muted">{item.org}</span>
            </p>
            {item.desc && <p className="mt-2 text-sm text-muted">{item.desc}</p>}
          </li>
        ))}
      </ol>
    </div>
  );
}

export function Resume() {
  return (
    <section id="resume" className="section-padding bg-ink-deep">
      <div className="container">
        <SectionTitle eyebrow="Journey" title="Resume" subtitle="Education and experience." />

        {/* Download CV — drop a PDF at /public/documents/redwan-hossain-cv.pdf */}
        <div className="mb-14 flex justify-center">
          <a
            href="/documents/redwan-hossain-cv.pdf"
            download
            className="group relative inline-flex items-center gap-2 overflow-hidden rounded-md bg-gold px-6 py-2.5 font-display text-xs font-semibold uppercase tracking-widest !text-white shadow-gold-sm transition-all duration-300 hover:-translate-y-0.5 hover:bg-gold-dark hover:shadow-gold-lg focus-visible:-translate-y-0.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold/60 focus-visible:ring-offset-2 focus-visible:ring-offset-ink active:scale-[0.97] dark:!text-neutral-900"
          >
            <Download size={14} className="transition-transform group-hover:translate-y-0.5" />
            Download CV
          </a>
        </div>

        <div className="grid gap-12 lg:grid-cols-2">
          <Timeline title="Education" items={EDUCATION} />
          <Timeline title="Experience" items={EXPERIENCE} />
        </div>
      </div>
    </section>
  );
}
