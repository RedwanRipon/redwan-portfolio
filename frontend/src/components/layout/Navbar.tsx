import Link from 'next/link';

const NAV_LINKS = [
  { href: '/', label: 'Home' },
  { href: '/about', label: 'About' },
  { href: '/projects', label: 'Projects' },
  { href: '/research', label: 'Research' },
  { href: '/skills', label: 'Skills' },
  { href: '/education', label: 'Education' },
  { href: '/blog', label: 'Blog' },
  { href: '/contact', label: 'Contact' },
];

export function Navbar() {
  return (
    <header className="sticky top-0 z-40 border-b border-neutral-800 bg-neutral-950/80 backdrop-blur">
      <nav className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
        <Link href="/" className="text-lg font-semibold tracking-tight">
          Redwan Hossain
        </Link>
        <ul className="hidden gap-6 text-sm text-neutral-300 md:flex">
          {NAV_LINKS.slice(1).map((link) => (
            <li key={link.href}>
              <Link href={link.href} className="transition hover:text-white">
                {link.label}
              </Link>
            </li>
          ))}
        </ul>
      </nav>
    </header>
  );
}
