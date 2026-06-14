'use client';

import { FormEvent, useState } from 'react';
import { Mail, MapPin, Phone, Clock, Send } from 'lucide-react';
import { SectionTitle } from '@/components/ui/SectionTitle';
import { postContactMessage } from '@/lib/api';

const ADDRESS = [
  { icon: MapPin, title: 'Location', value: 'Germany' },
  { icon: Phone, title: 'Phone', value: 'Available on request' },
  { icon: Mail, title: 'Email', value: 'redwanhossain.seu@gmail.com' },
  { icon: Clock, title: 'Working hours', value: 'Mon–Fri · 9:00–18:00 CET' },
];

type Status = 'idle' | 'sending' | 'sent' | 'error';

export function Contact() {
  const [status, setStatus] = useState<Status>('idle');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (status === 'sending') return;

    const form = e.currentTarget;
    const data = new FormData(form);
    const payload = {
      name: String(data.get('name') ?? '').trim(),
      email: String(data.get('email') ?? '').trim(),
      subject: String(data.get('subject') ?? '').trim(),
      body: String(data.get('message') ?? '').trim(),
    };
    if (!payload.name || !payload.email || !payload.subject || !payload.body) {
      return; // browser validation should already catch this
    }

    setStatus('sending');
    setErrorMsg(null);
    try {
      await postContactMessage(payload);
      form.reset();
      setStatus('sent');
      // Reset banner after a few seconds so the form is fully usable again.
      setTimeout(() => setStatus('idle'), 5000);
    } catch (err) {
      setStatus('error');
      setErrorMsg(err instanceof Error ? err.message : 'Something went wrong.');
    }
  }

  const disabled = status === 'sending';

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
                disabled={disabled}
                maxLength={80}
                className="rounded-md border border-white/10 bg-ink px-4 py-3 text-sm text-white placeholder:text-muted/70 focus:border-gold focus:outline-none disabled:opacity-60"
              />
              <input
                required
                type="email"
                name="email"
                placeholder="Email"
                disabled={disabled}
                maxLength={200}
                className="rounded-md border border-white/10 bg-ink px-4 py-3 text-sm text-white placeholder:text-muted/70 focus:border-gold focus:outline-none disabled:opacity-60"
              />
            </div>
            <input
              required
              type="text"
              name="subject"
              placeholder="Subject"
              disabled={disabled}
              maxLength={200}
              className="w-full rounded-md border border-white/10 bg-ink px-4 py-3 text-sm text-white placeholder:text-muted/70 focus:border-gold focus:outline-none disabled:opacity-60"
            />
            <textarea
              required
              rows={6}
              name="message"
              placeholder="Your message"
              disabled={disabled}
              maxLength={5000}
              className="w-full resize-y rounded-md border border-white/10 bg-ink px-4 py-3 text-sm text-white placeholder:text-muted/70 focus:border-gold focus:outline-none disabled:opacity-60"
            />
            <div className="flex items-center justify-between gap-4">
              <p className="text-xs text-muted" role={status === 'error' ? 'alert' : undefined}>
                {status === 'sent' && '✓ Sent — thanks! I’ll reply soon.'}
                {status === 'error' && `❌ ${errorMsg ?? 'Could not send. Try again.'}`}
                {status === 'sending' && 'Sending…'}
                {status === 'idle' && 'I respect your privacy.'}
              </p>
              <button
                type="submit"
                disabled={disabled}
                className="inline-flex items-center gap-2 rounded-md bg-gold px-7 py-3 font-display text-sm font-semibold uppercase tracking-widest text-ink transition hover:bg-gold-dark disabled:cursor-not-allowed disabled:opacity-60"
              >
                <Send size={15} />
                {status === 'sending' ? 'Sending' : 'Send'}
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
