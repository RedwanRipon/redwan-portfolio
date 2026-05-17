import Image from 'next/image';
import { SectionTitle } from '@/components/ui/SectionTitle';

const SKILLS = [
  { name: 'Machine Learning / AI', pct: 90 },
  { name: 'Python / FastAPI', pct: 88 },
  { name: 'Next.js / React', pct: 82 },
  { name: 'LLM Engineering (RAG, Agents)', pct: 80 },
];

export function About() {
  return (
    <section id="about" className="section-padding bg-ink">
      <div className="container">
        <SectionTitle eyebrow="Profile" title="About Me" subtitle="A short introduction." />

        <div className="grid items-start gap-12 lg:grid-cols-2">
          {/* Portrait — file lives at /public/images/profile.jpg */}
          <div className="relative mx-auto w-full max-w-md">
            <div className="relative aspect-[4/5] overflow-hidden rounded-2xl border border-white/10 bg-ink-card">
              <Image
                src="/images/profile.jpg"
                alt="Md Redwan Hossain portrait"
                fill
                priority
                sizes="(max-width: 1024px) 80vw, 420px"
                className="object-cover"
              />
              {/* Subtle gold wash on top */}
              <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-gold/15 via-transparent to-transparent" />
            </div>
            {/* Glow behind the card */}
            <div className="absolute -inset-2 -z-10 rounded-2xl bg-gold/20 blur-2xl" />
          </div>

          <div>
            <h4 className="mb-2 text-sm font-semibold uppercase tracking-widest text-gold">
              Intro
            </h4>
            <h3 className="mb-4 font-display text-3xl font-bold text-white">
              Hi, I&apos;m Md Redwan Hossain.
            </h3>
            <p className="mb-4 text-base font-medium text-white/90">
              Master&apos;s student and AI/ML researcher focused on building agentic systems —
              the kind that listen, reason, and act.
            </p>
            <p className="mb-8 text-muted">
              I work across the stack: training and deploying models on the backend, and
              crafting fast, accessible interfaces on the frontend. This portfolio itself
              is a voice agent — ask it anything about my work.
            </p>

            <h4 className="mb-4 text-sm font-semibold uppercase tracking-widest text-gold">
              Skills
            </h4>
            <div className="space-y-5">
              {SKILLS.map((s) => (
                <div key={s.name}>
                  <div className="mb-2 flex items-center justify-between font-display text-sm text-white">
                    <span>{s.name}</span>
                    <span className="text-gold">{s.pct}%</span>
                  </div>
                  <div className="h-1.5 w-full overflow-hidden rounded bg-white/10">
                    <div
                      className="h-full rounded bg-gold transition-all"
                      style={{ width: `${s.pct}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
