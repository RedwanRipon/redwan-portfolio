import { Hero } from '@/components/sections/Hero';
import { About } from '@/components/sections/About';
import { Services } from '@/components/sections/Services';
import { Portfolio } from '@/components/sections/Portfolio';
import { Resume } from '@/components/sections/Resume';
import { Blog } from '@/components/sections/Blog';
import { Contact } from '@/components/sections/Contact';

export default function HomePage() {
  return (
    <>
      <Hero />
      <About />
      <Services />
      <Portfolio />
      <Resume />
      <Blog />
      <Contact />
    </>
  );
}
