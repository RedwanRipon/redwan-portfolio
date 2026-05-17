import Link from 'next/link';
import { Github, Linkedin, Mail, Twitter } from 'lucide-react';

const SOCIALS = [
  { href: 'https://github.com/RedwanRipon', label: 'GitHub', icon: Github },
  { href: '#', label: 'LinkedIn', icon: Linkedin },
  { href: '#', label: 'Twitter', icon: Twitter },
  { href: 'mailto:ripon201318@gmail.com', label: 'Email', icon: Mail },
];

export function Footer() {
  return (
    <footer className="border-t border-white/5 bg-ink-deep py-12">
      <div className="container flex flex-col items-center gap-6 text-center">
        <ul className="flex items-center gap-3">
          {SOCIALS.map(({ href, label, icon: Icon }) => (
            <li key={label}>
              <Link
                href={href}
                aria-label={label}
                className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-white/10 text-white transition hover:border-gold hover:text-gold"
              >
                <Icon size={16} />
              </Link>
            </li>
          ))}
        </ul>
        <p className="text-xs uppercase tracking-widest text-muted">
          © {new Date().getFullYear()} Md Redwan Hossain · Built with Next.js + voice AI
        </p>
      </div>
    </footer>
  );
}
