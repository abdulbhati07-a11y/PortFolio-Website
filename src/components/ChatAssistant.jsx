import React, { useState, useRef, useEffect, useCallback } from 'react';
import { m, AnimatePresence, useReducedMotion } from 'framer-motion';
import { FaTimes, FaPaperPlane, FaRobot } from 'react-icons/fa';
import { getAnswer, STARTER_PROMPTS, ASSISTANT_INTRO } from '../utils/assistantKnowledge';
import { DEVELOPER_INFO } from '../utils/constants';

/* An assistant message can carry action chips (scroll/link) and follow-up
   suggestion chips. User messages are plain text. */
const makeBotMessage = (payload) => ({
  id: `b-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
  from: 'bot',
  ...payload,
});

const EASE = [0.16, 1, 0.3, 1];

/* ─── Typing dots ─────────────────────────────────────────────────────── */
const TypingDots = () => (
  <div className="flex items-center gap-1.5 px-1 py-1" aria-label="Assistant is typing">
    {[0, 1, 2].map((i) => (
      <m.span
        key={i}
        className="w-1.5 h-1.5 rounded-full bg-accent-cyan/70"
        animate={{ y: [0, -4, 0], opacity: [0.4, 1, 0.4] }}
        transition={{ duration: 0.9, repeat: Infinity, delay: i * 0.15, ease: 'easeInOut' }}
      />
    ))}
  </div>
);

/* ─── Action / suggestion chip ────────────────────────────────────────── */
const Chip = ({ children, onClick, href, primary }) => {
  const base =
    'inline-flex items-center gap-1.5 text-left font-mono text-[11px] px-3 py-1.5 rounded-full transition-all duration-300 active:scale-95';
  const style = primary
    ? 'bg-accent-cyan/15 text-accent-cyan hover:bg-accent-cyan hover:text-slate-900'
    : 'bg-glass/[0.06] text-text-secondary hover:text-text-primary hover:bg-glass/[0.12]';
  if (href) {
    return (
      <a href={href} target={href.startsWith('mailto:') ? undefined : '_blank'} rel="noopener noreferrer" className={`${base} ${style}`}>
        {children}
      </a>
    );
  }
  return (
    <button type="button" onClick={onClick} className={`${base} ${style}`}>
      {children}
    </button>
  );
};

/* ─── Chat Assistant ──────────────────────────────────────────────────── */
const ChatAssistant = ({ scrollTo }) => {
  const shouldReduceMotion = useReducedMotion();
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [typing, setTyping] = useState(false);
  const [unread, setUnread] = useState(true); // pulse on the FAB until first open

  const scrollRef = useRef(null);
  const inputRef = useRef(null);
  const panelRef = useRef(null);
  const typingTimer = useRef(null);

  /* Seed the intro message the first time the panel opens. */
  useEffect(() => {
    if (open && messages.length === 0) {
      setMessages([makeBotMessage({ text: ASSISTANT_INTRO, suggestions: STARTER_PROMPTS })]);
    }
    if (open) setUnread(false);
  }, [open, messages.length]);

  /* Autoscroll to the newest message. */
  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: shouldReduceMotion ? 'auto' : 'smooth' });
  }, [messages, typing, shouldReduceMotion]);

  /* Focus the input when opened; Esc closes. */
  useEffect(() => {
    if (!open) return;
    const t = setTimeout(() => inputRef.current?.focus(), 350);
    const onKey = (e) => e.key === 'Escape' && setOpen(false);
    document.addEventListener('keydown', onKey);
    return () => {
      clearTimeout(t);
      document.removeEventListener('keydown', onKey);
    };
  }, [open]);

  useEffect(() => () => clearTimeout(typingTimer.current), []);

  const handleAction = useCallback(
    (action) => {
      if (action.type === 'scroll') {
        setOpen(false);
        // let the panel start closing before we scroll the page
        setTimeout(() => scrollTo?.(action.target), 150);
      }
      // 'link' actions are plain anchors handled by the Chip itself
    },
    [scrollTo]
  );

  const send = useCallback(
    (rawText) => {
      const text = (rawText ?? input).trim();
      if (!text) return;

      setMessages((prev) => [...prev, { id: `u-${Date.now()}`, from: 'user', text }]);
      setInput('');
      setTyping(true);

      // Small, natural delay so the answer doesn't snap in instantly.
      const delay = shouldReduceMotion ? 200 : 500 + Math.min(text.length * 12, 700);
      clearTimeout(typingTimer.current);
      typingTimer.current = setTimeout(() => {
        const answer = getAnswer(text);
        setTyping(false);
        setMessages((prev) => [...prev, makeBotMessage(answer)]);
      }, delay);
    },
    [input, shouldReduceMotion]
  );

  const handleSubmit = (e) => {
    e.preventDefault();
    send();
  };

  return (
    <>
      {/* ─── Floating launcher (bottom-right) ─── */}
      <div className="fixed bottom-5 right-5 sm:bottom-6 sm:right-6 z-[200]">
        <AnimatePresence>
          {!open && (
            <m.button
              type="button"
              onClick={() => setOpen(true)}
              aria-label="Open AI assistant — ask about Abdullah"
              className="group relative w-14 h-14 sm:w-16 sm:h-16 rounded-full bg-accent-cyan text-slate-900 flex items-center justify-center shadow-[0_8px_30px_rgba(0,212,255,0.35)] hover:shadow-[0_10px_40px_rgba(0,212,255,0.55)] transition-shadow"
              initial={shouldReduceMotion ? { opacity: 0 } : { scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={shouldReduceMotion ? { opacity: 0 } : { scale: 0, opacity: 0 }}
              transition={{ type: 'spring', bounce: 0.5, duration: 0.6 }}
              whileHover={shouldReduceMotion ? {} : { scale: 1.06 }}
              whileTap={{ scale: 0.94 }}
            >
              {/* Pulsing ring to draw the eye until first interaction */}
              {unread && !shouldReduceMotion && (
                <span className="absolute inset-0 rounded-full animate-ping bg-accent-cyan/40" aria-hidden="true" />
              )}
              <FaRobot size={24} className="relative z-10" aria-hidden="true" />
              {/* Little greeting bubble on hover (desktop) */}
              <span className="absolute right-full mr-3 hidden md:flex items-center whitespace-nowrap px-3 py-1.5 rounded-full rounded-br-sm bg-secondary/90 backdrop-blur-md text-text-primary text-xs font-sans font-medium opacity-0 translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-300 shadow-lg pointer-events-none">
                Ask me about {DEVELOPER_INFO.nickname} 👋
              </span>
            </m.button>
          )}
        </AnimatePresence>
      </div>

      {/* ─── Chat panel ─── */}
      <AnimatePresence>
        {open && (
          <m.div
            ref={panelRef}
            role="dialog"
            aria-modal="false"
            aria-label={`Chat assistant for ${DEVELOPER_INFO.nickname}`}
            className="fixed z-[200] bottom-0 right-0 sm:bottom-6 sm:right-6 w-full sm:w-[400px] h-[100dvh] sm:h-[600px] sm:max-h-[85vh] flex flex-col glass-card sm:rounded-3xl rounded-none overflow-hidden shadow-[0_24px_70px_-12px_rgba(0,0,0,0.6)]"
            initial={shouldReduceMotion ? { opacity: 0 } : { opacity: 0, y: 30, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={shouldReduceMotion ? { opacity: 0 } : { opacity: 0, y: 20, scale: 0.98 }}
            transition={{ duration: 0.4, ease: EASE }}
          >
            {/* Header */}
            <div className="flex items-center justify-between gap-3 px-5 py-4 bg-glass/[0.04] backdrop-blur-xl shrink-0">
              <div className="flex items-center gap-3">
                <span className="relative w-10 h-10 rounded-full bg-accent-cyan/15 flex items-center justify-center text-accent-cyan">
                  <FaRobot size={18} aria-hidden="true" />
                  <span className="absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full bg-accent-green ring-2 ring-secondary" aria-hidden="true" />
                </span>
                <div className="leading-tight">
                  <p className="font-display text-sm font-bold text-text-primary">{DEVELOPER_INFO.nickname}&rsquo;s Assistant</p>
                  <p className="font-mono text-[10px] text-accent-green uppercase tracking-wider">● Online</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setOpen(false)}
                aria-label="Close assistant"
                className="w-9 h-9 rounded-full flex items-center justify-center text-text-secondary hover:text-text-primary hover:bg-glass/[0.08] transition-colors"
              >
                <FaTimes size={16} />
              </button>
            </div>

            {/* Messages */}
            <div
              ref={scrollRef}
              className="flex-1 overflow-y-auto px-4 py-4 flex flex-col gap-4 scroll-smooth"
            >
              {messages.map((msg) => (
                <div key={msg.id} className={`flex flex-col gap-2 ${msg.from === 'user' ? 'items-end' : 'items-start'}`}>
                  <div
                    className={`max-w-[85%] px-4 py-2.5 text-sm leading-relaxed whitespace-pre-line ${
                      msg.from === 'user'
                        ? 'bg-accent-cyan text-slate-900 font-medium rounded-2xl rounded-br-sm'
                        : 'bg-glass/[0.06] text-text-primary font-sans rounded-2xl rounded-bl-sm'
                    }`}
                  >
                    {msg.text}
                  </div>

                  {/* Action chips (scroll to section / open link) */}
                  {msg.actions?.length > 0 && (
                    <div className="flex flex-wrap gap-2 max-w-[90%]">
                      {msg.actions.map((a, i) => (
                        <Chip key={i} primary href={a.type === 'link' ? a.href : undefined} onClick={a.type === 'scroll' ? () => handleAction(a) : undefined}>
                          {a.label}
                        </Chip>
                      ))}
                    </div>
                  )}

                  {/* Suggested follow-up questions */}
                  {msg.suggestions?.length > 0 && (
                    <div className="flex flex-wrap gap-2 max-w-[90%]">
                      {msg.suggestions.map((s, i) => (
                        <Chip key={i} onClick={() => send(s)}>
                          {s}
                        </Chip>
                      ))}
                    </div>
                  )}
                </div>
              ))}

              {typing && (
                <div className="flex items-start">
                  <div className="bg-glass/[0.06] rounded-2xl rounded-bl-sm">
                    <TypingDots />
                  </div>
                </div>
              )}
            </div>

            {/* Composer */}
            <form onSubmit={handleSubmit} className="shrink-0 p-3 bg-glass/[0.04] backdrop-blur-xl">
              <div className="flex items-center gap-2 bg-glass/[0.06] rounded-full pl-4 pr-2 py-1.5 focus-within:ring-1 focus-within:ring-accent-cyan/50 transition-all">
                <input
                  ref={inputRef}
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder={`Ask about ${DEVELOPER_INFO.nickname}…`}
                  aria-label="Type your question"
                  className="flex-1 bg-transparent text-sm text-text-primary placeholder:text-text-tertiary outline-none font-sans"
                  maxLength={200}
                />
                <button
                  type="submit"
                  disabled={!input.trim()}
                  aria-label="Send message"
                  className="w-9 h-9 rounded-full bg-accent-cyan text-slate-900 flex items-center justify-center shrink-0 disabled:opacity-40 disabled:cursor-not-allowed hover:shadow-[0_0_16px_rgba(0,212,255,0.5)] transition-all active:scale-90"
                >
                  <FaPaperPlane size={13} aria-hidden="true" />
                </button>
              </div>
              <p className="text-center font-mono text-[9px] text-text-tertiary mt-2 tracking-wider">
                Answers are generated from {DEVELOPER_INFO.nickname}&rsquo;s portfolio data
              </p>
            </form>
          </m.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default ChatAssistant;
