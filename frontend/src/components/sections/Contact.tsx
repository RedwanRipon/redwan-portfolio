'use client';

import { useState } from 'react';
import { Mail, MapPin, Phone, Clock, Send } from 'lucide-react';
import { SectionTitle } from '@/components/ui/SectionTitle';

const ADDRESS = [
  { icon: MapPin, title: 'Location', value: 'Germany' },
  { icon: Phone, title: 'Phone', value: 'Available on request' },
  { icon: Mail, title: 'Email', value: 'redwanhossain.seu@gmail.com' },
  { icon: Clock, title: 'Working hours', value: 'Mon–Fri · 9:00–18:00 CET' },
];

export function Contact() {
  const [status, setStatus] = useState<'idle' | 'sent'>('idle');

  function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    // TODO Phase 2: POST to /api/contact (or a Resend/Formspree endpoint).
    setStatus('sent');
    (e.currentTarget as HTMLFormElement).reset();
    setTimeout(() => setStatus('idle'), 4000);
  }

  return (
    <section id="contact" className="section-padding bg-ink-deep">
      <div className="container">
        <SectionTitle
          eyebrow="Get in touch"
          title="Write a Message"
          subtitle="I read every message — usually reply within a day."
        />

        <div className="grid gap-10 lg:grid-cols-3">
          {/* Form */}
          <form
            onSubmit={onSubmit}
            className="space-y-5 rounded-2xl border border-white/10 bg-ink-card p-6 lg:col-span-2 lg:p-8"
          >
            <div className="grid gap-5 sm:grid-cols-2">
              <input
                required
                type="text"
                name="name"
                placeholder="Name"
                className="rounded-md border border-white/10 bg-ink px-4 py-3 text-sm text-white placeholder:text-muted/70 focus:border-gold focus:outline-none"
              />
              <input
                required
                type="email"
                name="email"
                placeholder="Email"
                className="rounded-md border border-white/10 bg-ink px-4 py-3 text-sm text-white placeholder:text-muted/70 focus:border-gold focus:outline-none"
              />
            </div>
            <input
              required
              type="text"
              name="subject"
              placeholder="Subject"
              className="w-full rounded-md border border-white/10 bg-ink px-4 py-3 text-sm text-white placeholder:text-muted/70 focus:border-gold focus:outline-none"
            />
            <textarea
              required
              rows={6}
              name="message"
              placeholder="Your message"
              className="w-full resize-y rounded-md border border-white/10 bg-ink px-4 py-3 text-sm text-white placeholder:text-muted/70 focus:border-gold focus:outline-none"
            />
            <div className="flex items-center justify-between">
              <p className="text-xs text-muted">
                {status === 'sent' ? '✓ Sent — thanks! (stub)' : 'I respect your privacy.'}
              </p>
              <button
                type="submit"
                className="inline-flex items-center gap-2 rounded-md bg-gold px-7 py-3 font-display text-sm font-semibold uppercase tracking-widest text-ink transition hover:bg-gold-dark"
              >
                <Send size={15} />
                Send
              </button>
            </div>
          </form>

          {/* Address block */}
          <div className="space-y-4 rounded-2xl border border-white/10 bg-ink-card p-6 lg:p-8">
            {ADDRESS.map(({ icon: Icon, title, value }) => (
              <div key={title} className="flex items-start gap-4">
                <div className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-gold/30 text-gold">
                  <Icon size={18} />
                </div>
                <div>
                  <h4 className="font-display text-sm font-semibold uppercase tracking-widest text-gold">
                    {title}
                  </h4>
                  <p className="mt-1 text-sm text-white">{value}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
