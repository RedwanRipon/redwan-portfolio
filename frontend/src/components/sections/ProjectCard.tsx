import Link from 'next/link';
import type { Project } from '@/types';

export function ProjectCard({ project }: { project: Project }) {
  return (
    <Link
      href={project.link ?? `/projects/${project.slug}`}
      id={`project-${project.slug}`}
      className="block rounded-lg border border-neutral-800 p-5 transition hover:border-neutral-600"
    >
      <h3 className="text-xl font-semibold">{project.title}</h3>
      <p className="mt-2 text-sm text-neutral-400">{project.summary}</p>
      <div className="mt-4 flex flex-wrap gap-2">
        {project.tags.map((t) => (
          <span
            key={t}
            className="rounded bg-neutral-800 px-2 py-0.5 text-xs text-neutral-300"
          >
            {t}
          </span>
        ))}
      </div>
    </Link>
  );
}
