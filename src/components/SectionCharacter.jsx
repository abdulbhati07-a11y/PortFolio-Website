import React, { useEffect, useRef, useState, useCallback } from 'react';
import { m, AnimatePresence, useReducedMotion } from 'framer-motion';
import { FaVolumeUp, FaVolumeMute } from 'react-icons/fa';

/* The friendly waving character follows the visitor down the page and
   "narrates" whichever section is currently in view. Each section gets
   its own short speech line, shown as a chat bubble AND spoken aloud
   via the browser's Web Speech API (speechSynthesis) so the character
   actually talks — no audio assets required.

   Audio behavior:
   - Browsers block speechSynthesis until the user interacts with the
     page. We unlock it on the very first click/scroll/keypress and
     from then on the character speaks on every section change.
   - A floating mute button lets the visitor turn audio off at any time.
     The choice is remembered for the session.
   - The hand-wave animation speeds up while the character is talking,
     so you can tell at a glance whether audio is playing. */

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

const SectionCharacter = () => {
  const shouldReduceMotion = useReducedMotion();
  const wrapperRef = useRef(null);
  const [activeId, setActiveId] = useState('hero');
  const [bubbleVisible, setBubbleVisible] = useState(true);
  const [lineIndex, setLineIndex] = useState(0);
  const [audioUnlocked, setAudioUnlocked] = useState(false);
  const [muted, setMuted] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const hideTimer = useRef(null);
  const lineTimer = useRef(null);
  const activeIdRef = useRef('hero');

  // Auto-hide the bubble after 6s of idleness, but always re-show it
  // when the active section changes. Hover pauses the timer. Declared
  // up here because the section-detection effect calls it.
  const scheduleAutoHide = useCallback(() => {
    clearTimeout(hideTimer.current);
    clearTimeout(lineTimer.current);
    hideTimer.current = setTimeout(() => {
      setBubbleVisible(false);
    }, 6000);
    lineTimer.current = setTimeout(() => {
      setLineIndex((i) => (i + 1) % 2);
    }, 3500);
  }, []);

  // Unlock speechSynthesis on first user interaction. Browsers refuse
  // to speak until that happens, so we listen for the earliest one
  // we can find and flip the flag once.
  useEffect(() => {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) return;
    const unlock = () => {
      setAudioUnlocked(true);
      // Warm the synth with a silent utterance so the first real
      // speak() doesn't suffer a 1–2s cold-start.
      try {
        const u = new SpeechSynthesisUtterance('');
        u.volume = 0;
        window.speechSynthesis.speak(u);
      } catch {
        /* ignore */
      }
      window.removeEventListener('pointerdown', unlock);
      window.removeEventListener('keydown', unlock);
      window.removeEventListener('scroll', unlock);
      window.removeEventListener('touchstart', unlock);
    };
    window.addEventListener('pointerdown', unlock, { once: true });
    window.addEventListener('keydown', unlock, { once: true });
    window.addEventListener('scroll', unlock, { once: true, passive: true });
    window.addEventListener('touchstart', unlock, { once: true });
    return () => {
      window.removeEventListener('pointerdown', unlock);
      window.removeEventListener('keydown', unlock);
      window.removeEventListener('scroll', unlock);
      window.removeEventListener('touchstart', unlock);
    };
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

  // Speak the current line whenever the active section changes —
  // but only once audio is unlocked and not muted. This is split out
  // so the speak effect can depend on the user-controlled flags.
  //
  // Voice selection: speechSynthesis.getVoices() returns an empty
  // array on the first call in most browsers — the OS voice list
  // populates asynchronously and fires `voiceschanged`. We pick the
  // male English voice the first time voices become available, cache
  // it in a ref, and reuse it for every utterance after that so the
  // voice never changes mid-session.
  const chosenVoiceRef = useRef(null);
  const [voiceDebug, setVoiceDebug] = useState('');

  useEffect(() => {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) return;
    const synth = window.speechSynthesis;

    // Hard-coded preferred male English voice names, in priority
    // order. If your OS has one of these installed, we use it.
    const MALE_VOICE_HINTS = [
      'Google UK English Male',
      'Google US English', // sometimes male
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
      // Web Speech API / Cloud voices
      'en-US-Standard-B',
      'en-US-Standard-D',
      'en-GB-Standard-B',
      'en-GB-Standard-D',
      'en-US-Journey-D',
      // espeak / Linux voices
      'english-us+m1',
      'english-us+m2',
      'english-us+m3',
      'english-us+m4',
      'english-us+m5',
      'english-us+m6',
      'english-us+m7',
      'english+m1',
      'english+m2',
      'english+m3',
      'english+m4',
      'english+m5',
      'english+m6',
      'english+m7',
    ];

    const pickMaleEnglishVoice = () => {
      const voices = synth.getVoices();
      if (!voices || voices.length === 0) return null;

      const matchesHint = (v) =>
        MALE_VOICE_HINTS.some((h) => (v.name || '').toLowerCase().includes(h.toLowerCase()));
      const isEnglish = (v) => /^en[-_]?/i.test(v.lang || '');

      // 1) A name-listed male, any English locale.
      let picked =
        voices.find((v) => matchesHint(v) && isEnglish(v)) ||
        // 2) A name-listed male, any locale.
        voices.find((v) => matchesHint(v)) ||
        // 3) Any English voice whose name does NOT contain a known
        //    female keyword (Samantha, Victoria, Karen, Ava, Zira,
        //    Susan, Jenny, Aria, etc.). This is the load-bearing
        //    fallback — on macOS Catalina+ "Daniel" often shows up
        //    here even when its name doesn't match a hint exactly,
        //    and "Samantha" is filtered out.
        voices.find(
          (v) =>
            isEnglish(v) &&
            !/(samantha|victoria|karen|allison|ava|zira|susan|jenny|aria|fiona|veena|tessa|moira|tina|paulina|monica|laura|sara|marie|amelie|anna|catherine|alice|emma|nicky|kyoko|yuna|mei|ting|sin|hiu|satu|sofia|helena|katja|marlene|andrea|paola)/i.test(
              v.name || ''
            )
        ) ||
        // 4) Last resort: any English voice.
        voices.find((v) => isEnglish(v)) ||
        null;

      if (picked) {
        // eslint-disable-next-line no-console
        console.log('[SectionCharacter] picked voice:', picked.name, picked.lang, 'from', voices.length, 'available');
        setVoiceDebug(`${picked.name} (${picked.lang})`);
      }
      return picked;
    };

    // Try immediately in case the browser already populated voices.
    const immediate = pickMaleEnglishVoice();
    if (immediate) {
      chosenVoiceRef.current = immediate;
      return;
    }

    // Otherwise wait for the async population.
    const onVoicesChanged = () => {
      const v = pickMaleEnglishVoice();
      if (v) {
        chosenVoiceRef.current = v;
        synth.removeEventListener('voiceschanged', onVoicesChanged);
      }
    };
    synth.addEventListener('voiceschanged', onVoicesChanged);
    // Some browsers (older Safari) never fire voiceschanged; poll
    // a few times as a safety net.
    let attempts = 0;
    const poll = setInterval(() => {
      const v = pickMaleEnglishVoice();
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

  useEffect(() => {
    if (!audioUnlocked || muted) return;
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) return;

    const section = SECTION_SPEECHES.find((s) => s.id === activeId) || FALLBACK_SPEECH;
    const line = section.lines[0];

    // Cancel anything currently being said so we don't queue up old
    // lines on top of new ones during fast scrolling.
    try {
      window.speechSynthesis.cancel();
    } catch {
      /* ignore */
    }

    const utterance = new SpeechSynthesisUtterance(line);
    utterance.rate = 1.02;
    utterance.pitch = 0.6; // definitely lower pitch to force male sounding // lower pitch → reads as male
    utterance.volume = 0.95;
    if (chosenVoiceRef.current) {
      utterance.voice = chosenVoiceRef.current;
    } else {
      // eslint-disable-next-line no-console
      console.warn('[SectionCharacter] no voice selected — using browser default');
    }

    utterance.onstart = () => setIsSpeaking(true);
    utterance.onend = () => setIsSpeaking(false);
    utterance.onerror = (e) => {
      // eslint-disable-next-line no-console
      console.warn('[SectionCharacter] speech error', e);
      setIsSpeaking(false);
    };

    window.speechSynthesis.speak(utterance);

    return () => {
      try {
        window.speechSynthesis.cancel();
      } catch {
        /* ignore */
      }
      setIsSpeaking(false);
    };
  }, [activeId, audioUnlocked, muted]);

  // Stop any in-flight speech as soon as the user mutes.
  useEffect(() => {
    if (muted && typeof window !== 'undefined' && 'speechSynthesis' in window) {
      try {
        window.speechSynthesis.cancel();
      } catch {
        /* ignore */
      }
    }
  }, [muted]);

  // Auto-hide the bubble after 6s of idleness, but always re-show it
  // when the active section changes. Hover pauses the timer.
  useEffect(() => {
    scheduleAutoHide();
    return () => {
      clearTimeout(hideTimer.current);
      clearTimeout(lineTimer.current);
    };
  }, [activeId, scheduleAutoHide]);

  const handleMouseEnter = () => {
    clearTimeout(hideTimer.current);
    clearTimeout(lineTimer.current);
  };
  const handleMouseLeave = () => scheduleAutoHide();

  const toggleMute = () => {
    setMuted((m) => !m);
  };

  
  const current =
    SECTION_SPEECHES.find((s) => s.id === activeId) || FALLBACK_SPEECH;
  const line = current.lines[lineIndex % current.lines.length];

  useEffect(() => {
    window.dispatchEvent(new CustomEvent('character-state', {
      detail: { activeId, line, greeting: current.greeting, isSpeaking, bubbleVisible, muted }
    }));
  }, [activeId, line, current.greeting, isSpeaking, bubbleVisible, muted]);

  useEffect(() => {
    const handleToggleMute = () => setMuted(m => !m);
    window.addEventListener('toggle-mute', handleToggleMute);
    return () => window.removeEventListener('toggle-mute', handleToggleMute);
  }, []);


  return (
    <div
      ref={wrapperRef}
      className={`hidden md:flex fixed bottom-5 left-5 z-[150] items-end gap-3 pointer-events-none transition-all duration-700 ease-[cubic-bezier(0.16,1,0.3,1)] ${activeId === "hero" ? "opacity-0 translate-y-12 scale-90" : "opacity-100 translate-y-0 scale-100"}`}
      aria-hidden="true"
    >
      {/* Mute / unmute control — small, sits above the speech bubble
          so it doesn't fight the character for attention. */}
      <div className="absolute -top-2 right-0 flex flex-col items-end gap-1 pointer-events-auto" style={{ transform: 'translate(0, -100%)' }}>
        {voiceDebug && (
          <span className="font-mono text-[9px] tracking-wider uppercase text-text-tertiary bg-[#0d1f3c]/80 border border-glass/10 rounded-full px-2 py-0.5 backdrop-blur-md">
            {voiceDebug}
          </span>
        )}
        <m.button
          type="button"
          onClick={toggleMute}
          className="w-8 h-8 rounded-full bg-[#0d1f3c]/92 border border-accent-cyan/35 backdrop-blur-xl text-white flex items-center justify-center shadow-[0_4px_16px_rgba(0,0,0,0.35)] hover:border-accent-cyan hover:text-accent-cyan transition-colors"
          whileTap={{ scale: 0.9 }}
          aria-label={muted ? 'Unmute character voice' : 'Mute character voice'}
          aria-pressed={muted}
        >
          {muted ? <FaVolumeMute size={12} /> : <FaVolumeUp size={12} />}
        </m.button>
      </div>

      {/* Speech bubble — appears above the character. */}
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
                <p className="font-sans text-[13px] leading-snug text-white">
                  {line}
                </p>
              </div>
              {/* Tiny "speaking" EQ bars next to the line so you can
                  see audio is playing even with the sound off. */}
              {isSpeaking && (
                <span
                  className="ml-2 inline-flex items-end gap-[2px] h-3 align-middle"
                  aria-hidden="true"
                >
                  {[0, 1, 2, 3].map((i) => (
                    <m.span
                      key={i}
                      className="w-[2px] rounded-full bg-accent-cyan"
                      animate={{ height: ['30%', '100%', '40%', '80%', '30%'] }}
                      transition={{
                        duration: 0.7,
                        repeat: Infinity,
                        delay: i * 0.1,
                        ease: 'easeInOut',
                      }}
                      style={{ display: 'inline-block' }}
                    />
                  ))}
                </span>
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
