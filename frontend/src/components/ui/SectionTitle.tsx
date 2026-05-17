/**
 * Centered section heading used by every home section (matches Janemon).
 * Example:
 *   <SectionTitle eyebrow="What I do" title="Services" subtitle="Lorem ipsum..." />
 */
export function SectionTitle({
  eyebrow,
  title,
  subtitle,
}: {
  eyebrow?: string;
  title: string;
  subtitle?: string;
}) {
  return (
    <div className="mx-auto mb-14 max-w-2xl text-center">
      {eyebrow && (
        <p className="mb-3 text-xs font-semibold uppercase tracking-widest text-gold">
          {eyebrow}
        </p>
      )}
      <h2 className="font-display text-4xl font-bold text-white md:text-5xl">{title}</h2>
      {subtitle && <p className="mt-4 text-base text-muted">{subtitle}</p>}
      <div className="mx-auto mt-5 h-[3px] w-14 rounded bg-gold" />
    </div>
  );
}
