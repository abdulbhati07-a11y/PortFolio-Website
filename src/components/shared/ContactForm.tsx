'use client';

import { FormEvent, useState } from 'react';
import { profile } from '@/content/portfolio';

export default function ContactForm() {
  const [status, setStatus] = useState('');
  const [busy, setBusy] = useState(false);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    if (!form.reportValidity()) return;
    const data = new FormData(form);
    setBusy(true); setStatus('');
    try {
      const response = await fetch('/api/contact', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: data.get('name'), email: data.get('email'), message: data.get('message'), website: data.get('website') }),
      });
      if (!response.ok) throw new Error(await response.text());
      setStatus('Message sent. Thank you for reaching out.');
      form.reset();
    } catch (cause) { setStatus((cause instanceof Error ? cause.message : 'Could not send your message.') + ' You can email ' + profile.email + '.'); }
    finally { setBusy(false); }
  }

  return <form className="contact-form" onSubmit={submit}><label>Your name<input name="name" minLength={2} maxLength={80} required autoComplete="name" /></label><label>Email address<input name="email" type="email" maxLength={160} required autoComplete="email" /></label><label>Your message<textarea name="message" minLength={10} maxLength={3000} rows={5} required /></label><label className="honeypot" aria-hidden="true">Website<input name="website" tabIndex={-1} autoComplete="off" /></label><button disabled={busy}>{busy ? 'Sending…' : 'Send message ↗'}</button>{status && <p role="status">{status}</p>}</form>;
}
