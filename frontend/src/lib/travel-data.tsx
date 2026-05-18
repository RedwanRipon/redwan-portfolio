import type { ReactNode } from 'react';

/**
 * Shared travel post data — used by the home Travel section, the
 * /travels listing, and the /travels/[slug] detail page.
 *
 * Body content is authored as JSX directly here. Render it inside a
 * wrapper with the `blog-body` class to get the standard prose
 * styling (h2/h3, p, strong, em, ul, blockquote, etc.).
 */

export interface Place {
  slug: string;
  city: string;
  country: string;
  /** Human-readable trip date (e.g. "Jul 2025"). */
  date: string;
  /** Tailwind gradient for the placeholder thumbnail. */
  gradient: string;
  /** Short summary for cards. */
  excerpt: string;
  author?: string;
  body?: ReactNode;
}

const AUTHOR = 'Md Redwan Hossain';

export const PLACES: Place[] = [
  {
    slug: 'berlin',
    city: 'Berlin',
    country: 'Germany',
    date: 'Jul 2025',
    gradient: 'from-amber-500/40 to-orange-700/40',
    excerpt: 'Long walks, history pressed into walls, and the best falafel of the year.',
    author: AUTHOR,
    body: (
      <>
        <p>
          Berlin doesn&apos;t try to impress you. It just <em>is</em> — wide
          streets, mismatched buildings, layers of decades stacked on top of one
          another. After three days I caught myself thinking of it like a friend
          who never bothers with small talk.
        </p>

        <h2>Walks I took</h2>
        <ul>
          <li>Tiergarten at golden hour — start from the Brandenburg Gate</li>
          <li>East Side Gallery — slowly, with audio off</li>
          <li>Kreuzberg → Neukölln — falafel detours encouraged</li>
        </ul>

        <h2>What surprised me</h2>
        <p>
          The <strong>quiet</strong>. For a city this big, the U-Bahn and the
          streets are weirdly peaceful — even at rush hour, you can hear
          yourself think.
        </p>

        <blockquote>
          Berlin is the city of becoming. Whoever you are, it has room.
        </blockquote>
      </>
    ),
  },
  {
    slug: 'munich',
    city: 'Munich',
    country: 'Germany',
    date: 'Jun 2025',
    gradient: 'from-sky-500/40 to-indigo-700/40',
    excerpt: 'Beer gardens, baroque squares, and the Alps on the horizon.',
    author: AUTHOR,
    body: (
      <>
        <p>
          Munich feels like Germany&apos;s polished living room. Where Berlin
          shrugs, Munich smiles. The trams are clean, the squares are scrubbed,
          and you&apos;re never more than ten minutes from a beer garden.
        </p>

        <h2>Where I&apos;d go again</h2>
        <ul>
          <li>Englischer Garten — surfer wave + an afternoon of nothing</li>
          <li>Marienplatz at 11am for the glockenspiel</li>
          <li>Viktualienmarkt for lunch — pretzels, cheese, more pretzels</li>
        </ul>

        <h2>The Alps day-trip</h2>
        <p>
          From Munich, you&apos;re an hour&apos;s train from the foothills. Take
          the early one; the ride alone is worth it.
        </p>
      </>
    ),
  },
  {
    slug: 'paris',
    city: 'Paris',
    country: 'France',
    date: 'May 2025',
    gradient: 'from-rose-500/40 to-pink-700/40',
    excerpt: 'Beyond the obvious — the cafés, bookshops, and quiet bridges.',
    author: AUTHOR,
    body: (
      <>
        <p>
          You&apos;ve seen Paris a thousand times before you ever land there.
          The trick is to ignore the postcards and walk past them. The real
          city is in the side streets.
        </p>

        <h2>Cafés I returned to</h2>
        <ul>
          <li><strong>Café de Flore</strong> — for the people-watching</li>
          <li><strong>Du Pain et des Idées</strong> — for the croissants</li>
          <li>
            Any tiny place in <em>Le Marais</em> with three tables and an old
            chalkboard menu
          </li>
        </ul>

        <h2>The thing nobody tells you</h2>
        <p>
          The Seine bridges are best at <strong>11pm</strong>, after the
          tourists clear out. Pont des Arts, looking east — pick a spot and just
          stand for a while.
        </p>
      </>
    ),
  },
  {
    slug: 'amsterdam',
    city: 'Amsterdam',
    country: 'Netherlands',
    date: 'Apr 2025',
    gradient: 'from-lime-500/40 to-green-700/40',
    excerpt: 'Cycling everywhere, museums that punch above their weight, canals at dusk.',
    author: AUTHOR,
    body: (
      <>
        <p>
          Amsterdam is built around two things: water and bikes. Get on a bike
          on day one, even if you&apos;re bad at it, and the city opens up.
        </p>

        <h2>Cycling rules I learned</h2>
        <ul>
          <li>Locals have the right of way. Always.</li>
          <li>Don&apos;t stop on a bike lane. Pull over fully.</li>
          <li>Tram tracks will kill your wheels. Cross them at 90°.</li>
        </ul>

        <h2>Museums that surprised me</h2>
        <p>
          The <strong>Rijksmuseum</strong> is obvious and earned. But the{' '}
          <em>Stedelijk</em> next door, modern and weird, was the one I came
          back to twice.
        </p>
      </>
    ),
  },
  {
    slug: 'prague',
    city: 'Prague',
    country: 'Czechia',
    date: 'Mar 2025',
    gradient: 'from-violet-500/40 to-fuchsia-700/40',
    excerpt: 'A city that looks like a fairy-tale set, especially after dark.',
    author: AUTHOR,
    body: (
      <>
        <p>
          Prague is almost too photogenic. Every corner is a postcard. The
          challenge is to slow down enough to actually <em>be</em> there.
        </p>

        <h2>Old Town nights</h2>
        <p>
          Walk Charles Bridge at <strong>5am</strong>. I know — but it&apos;s
          the only time you get it to yourself, and the river is glassy and
          quiet.
        </p>

        <h2>One thing</h2>
        <blockquote>
          The best meal of the trip was a tiny place near Vyšehrad with no
          English menu and a grumpy waiter. Always go where the locals queue.
        </blockquote>
      </>
    ),
  },
  {
    slug: 'dhaka',
    city: 'Dhaka',
    country: 'Bangladesh',
    date: 'Dec 2024',
    gradient: 'from-emerald-500/40 to-teal-700/40',
    excerpt: 'Going home — chaos, family, and the food that no city has ever matched.',
    author: AUTHOR,
    body: (
      <>
        <p>
          Going home is a different kind of travel. You&apos;re not exploring
          — you&apos;re reading a place you already know, and noticing what
          changed while you were away.
        </p>

        <h2>What changed</h2>
        <p>
          Dhaka is louder, denser, faster than it was even two years ago. The
          construction has a different rhythm; the traffic an even tighter
          grip. But the food — the food is exactly where I left it.
        </p>

        <h2>What didn&apos;t</h2>
        <ul>
          <li>Mom&apos;s biryani still ruins all other biryani for me</li>
          <li>Old Dhaka at dusk is still magic</li>
          <li>A cup of tea at the right roadside stall is still 15 taka</li>
        </ul>

        <blockquote>
          You can leave home, but home doesn&apos;t leave you. It just waits.
        </blockquote>
      </>
    ),
  },
];
