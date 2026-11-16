'use client';

import { FormEvent, useEffect, useRef, useState } from 'react';

type Message = { role: 'user' | 'assistant'; content: string };

export default function PortfolioChat({ openSignal = 0 }: { openSignal?: number }) {
  const [open, setOpen] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (openSignal === 0) return;
    const frame = requestAnimationFrame(() => setOpen(true));
    return () => cancelAnimationFrame(frame);
  }, [openSignal]);

  useEffect(() => { if (open) inputRef.current?.focus(); }, [open]);

  async function submit(event: FormEvent) {
    event.preventDefault();
    const message = input.trim();
    if (!message || busy) return;
    const history = messages.slice(-6);
    setMessages([...messages, { role: 'user', content: message }, { role: 'assistant', content: '' }]);
    setInput(''); setBusy(true); setError('');
    try {
      const response = await fetch('/api/chat', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ message, history }) });
      if (!response.ok) throw new Error(await response.text());
      if (!response.body) throw new Error('No response stream');
      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let answer = '';
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        answer += decoder.decode(value, { stream: true });
        setMessages([...history, { role: 'user', content: message }, { role: 'assistant', content: answer }]);
      }
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'Chat is unavailable.');
      setMessages([...history, { role: 'user', content: message }]);
    } finally { setBusy(false); }
  }

  return <div className="chat-dock">
    {open && <section className="chat-window" aria-label="Portfolio assistant"><div className="chat-head"><div><strong>Ask about Abdullah</strong><small>Answers from approved portfolio content</small></div><button onClick={() => setOpen(false)} aria-label="Close assistant">×</button></div><div className="chat-messages" aria-live="polite">{messages.length === 0 && <p>Ask about projects, Python work, certificates or how to get in touch.</p>}{messages.map((item, index) => <div className={'chat-bubble ' + item.role} key={index}>{item.content || (busy ? 'Thinking…' : '')}</div>)}{error && <p role="alert">{error}</p>}</div><form onSubmit={submit}><label className="sr-only" htmlFor="chat-input">Your question</label><input ref={inputRef} id="chat-input" value={input} onChange={(event) => setInput(event.target.value)} maxLength={500} placeholder="Ask a question…" /><button disabled={busy || !input.trim()} aria-label="Send question">↑</button></form></section>}
    <button className="chat-trigger" onClick={() => setOpen(!open)} aria-expanded={open} aria-label={open ? 'Close assistant' : 'Open portfolio assistant'}>✳</button>
  </div>;
}
