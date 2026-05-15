import Link from 'next/link';

export function Hero() {
  return (
    <section className="flex flex-col items-start gap-6 py-12">
      <p className="text-sm uppercase tracking-widest text-brand">Portfolio</p>
      <h1 className="text-5xl font-bold leading-tight md:text-6xl">
        Hi, I&apos;m Redwan.
        <br />
        <span className="text-neutral-400">Ask me anything — out loud.</span>
      </h1>
      <p className="max-w-2xl text-lg text-neutral-300">
        AI/ML researcher and builder. This site is voice-driven: tap the mic and
        talk to an agent that knows my CV, projects, and research.
      </p>
      <div className="flex gap-3">
        <Link
          href="/projects"
          className="rounded-md bg-brand px-5 py-2.5 font-medium text-brand-fg transition hover:opacity-90"
        >
          View projects
        </Link>
        <Link
          href="/contact"
          className="rounded-md border border-neutral-700 px-5 py-2.5 font-medium transition hover:border-neutral-400"
        >
          Get in touch
        </Link>
      </div>
    </section>
  );
}
