import React, { useEffect, useRef, useState, useCallback } from 'react';
import { m, AnimatePresence, useReducedMotion } from 'framer-motion';
import { FaPlay, FaStop } from 'react-icons/fa';

/* The friendly waving character follows the visitor down the page and
   shows a short line for whichever section is currently in view.

   Voice is STRICTLY on-demand. Nothing is ever spoken automatically —
   the site stays silent unless the visitor clicks the little play button
   on the character's speech bubble. Clicking speaks the current section's
   line via the browser's Web Speech API (speechSynthesis); clicking again
   (or scrolling to a new section) stops it. No audio assets required.

   The hand-wave animation speeds up while speaking, so you can tell at a
   glance that audio is playing. */

const SECTION_SPEECHES = [
  {
    id: 'hero',
    greeting: '👋',
    lines: [
      "Hey there! I'm Abdullah — welcome to my little corner of the web.",
      "Glad you made it. Let me give you the quick tour.",
    ],
  },
  {
    id: 'about',
    greeting: '🙋‍♂️',
    lines: [
      "That's me in a nutshell — a CS student who lives at the intersection of AI and clean UI.",
      "I build things that think, and I make sure they look great doing it.",
    ],
  },
  {
    id: 'skills',
    greeting: '🧠',
    lines: [
      "Python, React, a sprinkle of C++, and a serious love for the ML stack.",
      "Hover the constellation — every node is a real, shipped tool.",
    ],
  },
  {
    id: 'projects',
    greeting: '🛠️',
    lines: [
      "Real projects, real problems. Click any card for the full case study.",
      "Tap a skill above the grid to filter what's worth your time.",
    ],
  },
  {
    id: 'journey',
    greeting: '🛤️',
    lines: [
      "Scroll the timeline — every dot is a lesson learned the hard way.",
      "From first Hello World to shipping machine learning apps. It's been a ride.",
    ],
  },
  {
    id: 'writing',
    greeting: '✍️',
    lines: [
      "I write when I have something worth saying. Take a look.",
      "Notes, retros, and the occasional deep-dive on a problem I couldn't shake.",
    ],
  },
  {
    id: 'certifications',
    greeting: '🎓',
    lines: [
      "Proof that I actually did the coursework. PDFs are linked if you want to peek.",
      "Certificates are nice, but the projects above are the real test.",
    ],
  },
  {
    id: 'contact',
    greeting: '📬',
    lines: [
      "Like what you see? Drop a message — I read every single one.",
      "Or grab my email and let's skip the formalities.",
    ],
  },
];

const FALLBACK_SPEECH = {
  greeting: '👋',
  lines: ["Hey, I'm Abdullah! Glad you're here."],
};

const speechSupported = () =>
  typeof window !== 'undefined' && 'speechSynthesis' in window;

const SectionCharacter = () => {
  const shouldReduceMotion = useReducedMotion();
  const wrapperRef = useRef(null);
  const [activeId, setActiveId] = useState('hero');
  const [bubbleVisible, setBubbleVisible] = useState(true);
  const [lineIndex, setLineIndex] = useState(0);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [canSpeak] = useState(speechSupported);
  const hideTimer = useRef(null);
  const lineTimer = useRef(null);
  const activeIdRef = useRef('hero');
  const isSpeakingRef = useRef(false);

  // Auto-hide the bubble after 6s of idleness, but always re-show it
  // when the active section changes. Hover pauses the timer. Declared
  // up here because the section-detection effect calls it.
  const scheduleAutoHide = useCallback(() => {
    clearTimeout(hideTimer.current);
    clearTimeout(lineTimer.current);
    hideTimer.current = setTimeout(() => {
      // Never hide the bubble (and its Stop button) while audio is playing.
      if (isSpeakingRef.current) {
        scheduleAutoHide();
        return;
      }
      setBubbleVisible(false);
    }, 6000);
    lineTimer.current = setTimeout(() => {
      setLineIndex((i) => (i + 1) % 2);
    }, 3500);
  }, []);

  // Track which section is dominating the viewport. IntersectionObserver
  // gives us visibility ratios; we also recompute on scroll so fast
  // scrolling doesn't leave us with a stale winner.
  useEffect(() => {
    if (typeof window === 'undefined') return;

    const sections = SECTION_SPEECHES
      .map((s) => document.getElementById(s.id))
      .filter(Boolean);

    if (sections.length === 0) return;

    const visibility = new Map();

    const recompute = () => {
      const vh = window.innerHeight || 1;
      const mid = vh / 2;
      let bestId = activeIdRef.current;
      let bestScore = -Infinity;
      sections.forEach((el) => {
        const rect = el.getBoundingClientRect();
        const ratio = visibility.get(el.id) ?? 0;
        const distance = Math.abs(rect.top + rect.height / 2 - mid);
        const score = ratio * 1000 - distance;
        if (score > bestScore) {
          bestScore = score;
          bestId = el.id;
        }
      });
      if (bestId !== activeIdRef.current) {
        activeIdRef.current = bestId;
        setActiveId(bestId);
        setLineIndex(0);
        setBubbleVisible(true);
        scheduleAutoHide();
      }
    };

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          visibility.set(entry.target.id, entry.intersectionRatio);
        });
        recompute();
      },
      { threshold: [0, 0.15, 0.35, 0.55, 0.75, 1] }
    );
    sections.forEach((el) => observer.observe(el));

    const onScroll = () => recompute();
    window.addEventListener('scroll', onScroll, { passive: true });
    recompute();

    return () => {
      observer.disconnect();
      window.removeEventListener('scroll', onScroll);
    };
  }, [scheduleAutoHide]);

  // Voice selection: speechSynthesis.getVoices() returns an empty array on
  // the first call in most browsers — the OS voice list populates
  // asynchronously and fires `voiceschanged`. We pick a male-leaning
  // English voice once voices are available, cache it in a ref, and reuse
  // it for every utterance so the voice never changes mid-session.
  const chosenVoiceRef = useRef(null);

  useEffect(() => {
    if (!speechSupported()) return;
    const synth = window.speechSynthesis;

    const MALE_VOICE_HINTS = [
      'Google UK English Male',
      'Google US English',
      'Microsoft David',
      'Microsoft Mark',
      'Microsoft Guy',
      'Microsoft Ryan',
      'Alex',
      'Daniel',
      'David',
      'Mark',
      'Fred',
      'James',
      'Richard',
      'Bruce',
      'Thomas',
      'en-US-Standard-B',
      'en-US-Standard-D',
      'en-GB-Standard-B',
      'en-GB-Standard-D',
      'en-US-Journey-D',
      'english-us+m1',
      'english-us+m2',
      'english-us+m3',
      'english+m1',
      'english+m2',
      'english+m3',
    ];

    const pickVoice = () => {
      const voices = synth.getVoices();
      if (!voices || voices.length === 0) return null;

      const matchesHint = (v) =>
        MALE_VOICE_HINTS.some((h) => (v.name || '').toLowerCase().includes(h.toLowerCase()));
      const isEnglish = (v) => /^en[-_]?/i.test(v.lang || '');

      return (
        voices.find((v) => matchesHint(v) && isEnglish(v)) ||
        voices.find((v) => matchesHint(v)) ||
        voices.find(
          (v) =>
            isEnglish(v) &&
            !/(samantha|victoria|karen|allison|ava|zira|susan|jenny|aria|fiona|veena|tessa|moira|tina|paulina|monica|laura|sara|marie|amelie|anna|catherine|alice|emma|nicky|kyoko|yuna|mei|ting|sin|hiu|satu|sofia|helena|katja|marlene|andrea|paola)/i.test(
              v.name || ''
            )
        ) ||
        voices.find((v) => isEnglish(v)) ||
        null
      );
    };

    const immediate = pickVoice();
    if (immediate) {
      chosenVoiceRef.current = immediate;
      return;
    }

    const onVoicesChanged = () => {
      const v = pickVoice();
      if (v) {
        chosenVoiceRef.current = v;
        synth.removeEventListener('voiceschanged', onVoicesChanged);
      }
    };
    synth.addEventListener('voiceschanged', onVoicesChanged);
    // Some browsers (older Safari) never fire voiceschanged; poll a few
    // times as a safety net.
    let attempts = 0;
    const poll = setInterval(() => {
      const v = pickVoice();
      if (v) {
        chosenVoiceRef.current = v;
        clearInterval(poll);
        synth.removeEventListener('voiceschanged', onVoicesChanged);
      } else if (++attempts > 10) {
        clearInterval(poll);
      }
    }, 250);
    return () => {
      synth.removeEventListener('voiceschanged', onVoicesChanged);
      clearInterval(poll);
    };
  }, []);

  const stopSpeaking = useCallback(() => {
    if (!speechSupported()) return;
    try {
      window.speechSynthesis.cancel();
    } catch {
      /* ignore */
    }
    isSpeakingRef.current = false;
    setIsSpeaking(false);
  }, []);

  // Speak the CURRENT section's lines — only ever called from a click,
  // which doubles as the user gesture browsers require to allow audio.
  // Clicking while already speaking stops playback (toggle).
  const speakCurrent = useCallback(() => {
    if (!speechSupported()) return;
    const synth = window.speechSynthesis;

    if (isSpeakingRef.current || synth.speaking) {
      stopSpeaking();
      return;
    }

    const section =
      SECTION_SPEECHES.find((s) => s.id === activeIdRef.current) || FALLBACK_SPEECH;
    const text = section.lines.join('  ');

    try {
      synth.cancel();
    } catch {
      /* ignore */
    }

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = 1.02;
    utterance.pitch = 0.9;
    utterance.volume = 1;
    if (chosenVoiceRef.current) utterance.voice = chosenVoiceRef.current;

    utterance.onstart = () => {
      isSpeakingRef.current = true;
      setIsSpeaking(true);
    };
    utterance.onend = () => {
      isSpeakingRef.current = false;
      setIsSpeaking(false);
    };
    utterance.onerror = () => {
      isSpeakingRef.current = false;
      setIsSpeaking(false);
    };

    // Keep the bubble open while a line is being read.
    clearTimeout(hideTimer.current);
    setBubbleVisible(true);
    synth.speak(utterance);
  }, [stopSpeaking]);

  // Stop any in-flight speech when the active section changes, so an intro
  // never keeps playing after the visitor has scrolled somewhere else.
  useEffect(() => {
    stopSpeaking();
  }, [activeId, stopSpeaking]);

  // Auto-hide the bubble after 6s of idleness, but always re-show it
  // when the active section changes. Hover pauses the timer.
  useEffect(() => {
    scheduleAutoHide();
    return () => {
      clearTimeout(hideTimer.current);
      clearTimeout(lineTimer.current);
    };
  }, [activeId, scheduleAutoHide]);

  // Cancel speech if the component unmounts.
  useEffect(() => stopSpeaking, [stopSpeaking]);

  const handleMouseEnter = () => {
    clearTimeout(hideTimer.current);
    clearTimeout(lineTimer.current);
  };
  const handleMouseLeave = () => scheduleAutoHide();

  const current =
    SECTION_SPEECHES.find((s) => s.id === activeId) || FALLBACK_SPEECH;
  const line = current.lines[lineIndex % current.lines.length];

  // Broadcast state so the hero can mirror the bubble + play control.
  useEffect(() => {
    window.dispatchEvent(
      new CustomEvent('character-state', {
        detail: { activeId, line, greeting: current.greeting, isSpeaking, bubbleVisible, canSpeak },
      })
    );
  }, [activeId, line, current.greeting, isSpeaking, bubbleVisible, canSpeak]);

  // The hero's mirrored play button dispatches this to drive the same speech.
  useEffect(() => {
    const handleSpeak = () => speakCurrent();
    window.addEventListener('character-speak', handleSpeak);
    return () => window.removeEventListener('character-speak', handleSpeak);
  }, [speakCurrent]);

  return (
    <div
      ref={wrapperRef}
      className={`hidden md:flex fixed bottom-5 left-5 z-[150] items-end gap-3 pointer-events-none transition-all duration-700 ease-[cubic-bezier(0.16,1,0.3,1)] ${activeId === "hero" ? "opacity-0 translate-y-12 scale-90" : "opacity-100 translate-y-0 scale-100"}`}
    >
      {/* Speech bubble — appears above the character with an on-demand
          play button. Nothing is spoken until the visitor clicks it. */}
      <AnimatePresence mode="wait">
        {bubbleVisible && (
          <m.div
            key={`${activeId}-${lineIndex}`}
            role="status"
            className="relative mb-6 max-w-[260px] pointer-events-auto cursor-default"
            onMouseEnter={handleMouseEnter}
            onMouseLeave={handleMouseLeave}
            initial={shouldReduceMotion ? { opacity: 0 } : { opacity: 0, y: 8, scale: 0.92 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={shouldReduceMotion ? { opacity: 0 } : { opacity: 0, y: 4, scale: 0.96 }}
            transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
          >
            <div className="relative px-4 py-3 rounded-2xl rounded-bl-sm backdrop-blur-xl bg-[#0d1f3c]/92 border border-accent-cyan/35 shadow-[0_8px_32px_rgba(0,0,0,0.35),0_0_20px_rgba(0,212,255,0.15)]">
              <div className="flex items-start gap-2">
                <span className="text-base leading-none mt-0.5" aria-hidden="true">
                  {current.greeting}
                </span>
                <p className="font-sans text-[13px] leading-snug text-white pr-1">
                  {line}
                </p>
              </div>

              {/* On-demand voice control + speaking indicator */}
              {canSpeak && (
                <div className="mt-2.5 flex items-center gap-2">
                  <button
                    type="button"
                    onClick={speakCurrent}
                    aria-label={isSpeaking ? 'Stop voice' : 'Hear this'}
                    aria-pressed={isSpeaking}
                    className="inline-flex items-center gap-1.5 rounded-full bg-accent-cyan/15 text-accent-cyan hover:bg-accent-cyan hover:text-slate-900 transition-colors px-2.5 py-1 font-mono text-[10px] uppercase tracking-wider active:scale-95"
                  >
                    {isSpeaking ? <FaStop size={9} /> : <FaPlay size={9} />}
                    {isSpeaking ? 'Stop' : 'Hear this'}
                  </button>

                  {isSpeaking && (
                    <span className="inline-flex items-end gap-[2px] h-3" aria-hidden="true">
                      {[0, 1, 2, 3].map((i) => (
                        <m.span
                          key={i}
                          className="w-[2px] rounded-full bg-accent-cyan"
                          animate={{ height: ['30%', '100%', '40%', '80%', '30%'] }}
                          transition={{ duration: 0.7, repeat: Infinity, delay: i * 0.1, ease: 'easeInOut' }}
                          style={{ display: 'inline-block' }}
                        />
                      ))}
                    </span>
                  )}
                </div>
              )}

              <span
                className="absolute -bottom-1.5 left-3 w-3 h-3 rotate-45 bg-[#0d1f3c]/92 border-r border-b border-accent-cyan/35"
                aria-hidden="true"
              />
            </div>
          </m.div>
        )}
      </AnimatePresence>

      {/* The character itself — body + independently waving hand.
          The hand wave speeds up while the character is talking. */}
      <m.div
        className="relative w-[120px] h-[140px] sm:w-[140px] sm:h-[160px] pointer-events-auto"
        style={{ filter: 'drop-shadow(0 14px 30px rgba(0,0,0,0.45))' }}
        initial={shouldReduceMotion ? { opacity: 0 } : { opacity: 0, y: 24, scale: 0.9 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ delay: 0.4, duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
        aria-hidden="true"
      >
        {/* Soft cyan glow under the feet so the float reads. */}
        <m.div
          className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-3/4 h-3 rounded-[50%] blur-lg bg-accent-cyan/30"
          animate={
            shouldReduceMotion
              ? {}
              : { scaleX: [1, 0.85, 1], opacity: [0.6, 0.4, 0.6] }
          }
          transition={{ duration: 4.5, repeat: Infinity, ease: 'easeInOut' }}
          aria-hidden="true"
        />

        {/* Idle float loop. */}
        <m.div
          className="relative w-full h-full"
          animate={
            shouldReduceMotion
              ? {}
              : { y: [0, -4, 0], rotate: [0, 1.4, 0, -1.4, 0] }
          }
          transition={{
            y: { duration: 4.5, repeat: Infinity, ease: 'easeInOut' },
            rotate: { duration: 9, repeat: Infinity, ease: 'easeInOut' },
          }}
          style={{ transformOrigin: '50% 85%' }}
        >
          <img
            src="/assets/greeting-body.png"
            alt=""
            aria-hidden="true"
            className="absolute inset-0 w-full h-full object-contain"
          />
          <m.img
            src="/assets/greeting-hand.png"
            alt=""
            aria-hidden="true"
            className="absolute inset-0 w-full h-full object-contain [transform-origin:33.2%_33.2%]"
            animate={
              shouldReduceMotion
                ? {}
                : { rotate: [0, 14, -10, 14, -10, 8, 0] }
            }
            transition={{
              duration: isSpeaking ? 0.55 : 1.6,
              ease: 'easeInOut',
              repeat: Infinity,
              repeatDelay: isSpeaking ? 0.4 : 4.5,
            }}
          />
        </m.div>
      </m.div>
    </div>
  );
};

export default SectionCharacter;
