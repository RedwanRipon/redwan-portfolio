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
    title: 'M.Sc. in Data Science (Major: Machine Learning & AI)',
    year: '2026',
    org: 'University of Erlangen-Nuremberg, Germany',
    desc: 'Coursework: Pattern Recognition, Deep Learning, ML for Time Series, High-dimensional Statistics, Anomaly Detection, Business Intelligence.',
  },
  {
    title: 'B.Sc. in Computer Science & Engineering',
    year: '2020',
    org: 'Southeast University, Dhaka, Bangladesh',
    desc: 'Coursework: Algorithms, OOP, Data Mining, Linear Algebra, Artificial Intelligence, Computer Graphics, Advanced Networking.',
  },
];

const EXPERIENCE: TimelineItem[] = [
  {
    title: 'Master Thesis Student',
    year: '2025/11 — 2026/05',
    org: 'Department Mathematik, Erlangen',
    desc: 'Integrated charging-aware mixed-fleet MIP for joint scheduling of electric and diesel buses — combining timetable, vehicle scheduling, fleet assignment, and charging in one model. Stack: Python, Pyomo, Gurobi, py5.',
  },
  {
    title: 'Web Developer',
    year: '2020/03 — 2021/12',
    org: 'Aarashi Online Store, Dhaka',
    desc: 'Built scalable REST APIs, designed the database schema, and shipped UI integrations. Stack: JS frameworks, SQL Server, Postman, cloud services.',
  },
  {
    title: 'Web Developer Trainee',
    year: '2019/12 — 2020/02',
    org: 'Unlock It Limited, Dhaka',
    desc: 'Assisted in REST API development, database design, and RESTful UI integration. Stack: JS, CSS, Laravel, PHP, MySQL.',
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
