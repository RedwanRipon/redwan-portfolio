import type { Metadata } from 'next';
import { Poppins, Jost } from 'next/font/google';
import './globals.css';
import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import { VoiceButton } from '@/components/voice/VoiceButton';
import { ThemeToggle } from '@/components/ui/ThemeToggle';

// Runs synchronously in <head> before paint to set the theme without
// flashing the wrong colors.
const THEME_INIT_SCRIPT = `
(function () {
  try {
    var stored = localStorage.getItem('theme');
    var theme = stored || (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');
    if (theme === 'dark') document.documentElement.classList.add('dark');
    else document.documentElement.classList.remove('dark');
  } catch (e) {}
})();
`;

const poppins = Poppins({
  subsets: ['latin'],
  weight: ['300', '400', '500', '600', '700', '800'],
  variable: '--font-poppins',
  display: 'swap',
});

const jost = Jost({
  subsets: ['latin'],
  weight: ['300', '400', '500', '600', '700', '800'],
  variable: '--font-jost',
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'Md Redwan Hossain — AI-Powered Portfolio',
  description:
    'Voice-driven personal portfolio of Md Redwan Hossain. Ask anything about my work — out loud.',
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html
      lang="en"
      className={`${poppins.variable} ${jost.variable} dark`}
      suppressHydrationWarning
    >
      <head>
        {/* Sets the theme class on <html> before paint to avoid flash. */}
        <script dangerouslySetInnerHTML={{ __html: THEME_INIT_SCRIPT }} />
      </head>
      <body className="flex min-h-screen flex-col">
        <Navbar />
        <main className="flex-1">{children}</main>
        <Footer />
        <ThemeToggle />
        <VoiceButton />
      </body>
    </html>
  );
}
