
import React, { useState, useEffect, useRef } from 'react';
import {
  m,
  useReducedMotion,
  useMotionValue,
  useSpring,
  useScroll,
  useTransform,
  AnimatePresence
} from 'framer-motion';
import { FaGithub, FaLinkedin, FaEnvelope, FaDownload, FaPlay, FaStop } from 'react-icons/fa';
import { DEVELOPER_INFO, STATS } from '../utils/constants';
import Magnetic from './ui/Magnetic';

/* ─────────────────────────────────────────────────────────────────────────
   HERO — full-viewport "cyber interface" composition.

   The layout is a 12-column bento that mirrors the reference:
     ┌───────────────────────────┬───────────┐
     │  INTRO (cols 1–8, row 1)  │  AVATAR   │
     ├────────────┬──────────────┤ (cols 9–  │
     │ 01 DESIGN  │ 02 DEVELOP.  │  12, rows │
     ├────────────┴───┬──────┬───┴───┬───────┤ 1–2)
     │ 03 AI/ML SOL.  │ stat │ stat │ … stat │  (row 3)
     └────────────────┴──────┴──────┴────────┘

   Every tile is an always-dark glass "panel" (hardcoded palette) so the hero
   reads identically in light and dark themes. The animated circuit board
   lives behind everything via <HeroBackground/>.

   NOTE: colours here are intentionally fixed (text-white, accent-cyan, …)
   rather than theme tokens, because the panels are dark in BOTH themes.
────────────────────────────────────────────────────────────────────────── */

// Shared dark glass surface for every hero tile.
const PANEL =
  'relative rounded-[20px] border border-white/[0.15] bg-[#0a0e13]/95 ' +
  'shadow-[0_14px_44px_-16px_rgba(0,0,0,0.75)]';

const useTypewriter = (words, speed = 80, pause = 2000, disabled = false) => {
  const [index, setIndex] = useState(0);
  const [subIndex, setSubIndex] = useState(0);
  const [deleting, setDeleting] = useState(false);
  const [text, setText] = useState(disabled ? words[0] : '');

  useEffect(() => {
    if (disabled) return;
    if (subIndex === words[index].length + 1 && !deleting) {
      const timeout = setTimeout(() => setDeleting(true), pause);
      return () => clearTimeout(timeout);
    }
    if (subIndex === 0 && deleting) {
      setDeleting(false);
      setIndex((prev) => (prev + 1) % words.length);
      return;
    }
    const timeout = setTimeout(() => {
      setSubIndex((prev) => prev + (deleting ? -1 : 1));
      setText(words[index].substring(0, subIndex));
    }, deleting ? speed / 2 : speed);
    return () => clearTimeout(timeout);
  }, [subIndex, index, deleting, words, speed, pause, disabled]);

  const idle = disabled || (!deleting && subIndex === words[index].length + 1);
  return { text, idle };
};

const StatCounter = ({ stat, delay }) => {
  const [count, setCount] = useState(0);
  const shouldReduceMotion = useReducedMotion();

  useEffect(() => {
    if (shouldReduceMotion) {
      setCount(stat.value);
      return;
    }
    let rafId;
    const duration = 1800;
    let start;
    const timeout = setTimeout(() => {
      const tick = (now) => {
        if (start === undefined) start = now;
        const progress = Math.min((now - start) / duration, 1);
        const eased = 1 - Math.pow(1 - progress, 3);
        setCount(stat.value * eased);
        if (progress < 1) rafId = requestAnimationFrame(tick);
      };
      rafId = requestAnimationFrame(tick);
    }, delay);
    return () => {
      clearTimeout(timeout);
      cancelAnimationFrame(rafId);
    };
  }, [stat.value, delay, shouldReduceMotion]);

  return (
    <div className="flex flex-col items-center justify-center gap-1 h-full text-center">
      <span className="font-mono text-xl sm:text-2xl font-bold text-white leading-none">
        {stat.decimals > 0 ? count.toFixed(1) : Math.floor(count)}
        <span className="text-accent-cyan">{stat.suffix}</span>
      </span>
      <span className="font-sans text-[8px] sm:text-[9px] text-white/45 tracking-[0.15em] uppercase mt-1 leading-tight">
        {stat.label}
      </span>
    </div>
  );
};

const FeatureCard = ({ icon, title, description, delay, onClick, cta, index, className }) => {
  const shouldReduceMotion = useReducedMotion();
  return (
    <m.button
      type="button"
      onClick={onClick}
      className={`${PANEL} p-3.5 sm:p-4 flex flex-col gap-1 text-left group overflow-hidden transition-all duration-500 hover:-translate-y-1 hover:border-accent-cyan/35 hover:shadow-[0_18px_50px_-14px_rgba(0,212,255,0.2)] ${className || ''}`}
      initial={shouldReduceMotion ? { opacity: 1 } : { opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
    >
      {/* Corner sheen */}
      <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 bg-[radial-gradient(circle_at_top_left,rgba(0,212,255,0.10),transparent_55%)] pointer-events-none" />

      <div className="flex items-center justify-between w-full relative z-10">
        <span className="font-mono text-[11px] font-bold text-white/30 tracking-[0.3em]">
          0{index}
        </span>
        <span className="w-8 h-8 rounded-full flex items-center justify-center text-lg bg-accent-cyan/10 border border-accent-cyan/25 group-hover:border-accent-cyan/50 group-hover:bg-accent-cyan/15 group-hover:shadow-[0_0_15px_rgba(0,212,255,0.3)] transition-all duration-300">
          {icon}
        </span>
      </div>
      <h3 className="font-display text-xs sm:text-sm font-bold text-white uppercase tracking-wider mt-2 relative z-10">
        {title}
      </h3>
      <p className="font-sans text-[10px] sm:text-[11px] text-white/55 leading-relaxed relative z-10">
        {description}
      </p>
      <span className="font-mono text-[9px] text-accent-cyan mt-auto pt-1.5 inline-flex items-center gap-1 relative z-10">
        <span className="link-underline">{cta}</span>
        <span className="transition-transform duration-300 group-hover:translate-x-1" aria-hidden="true">→</span>
      </span>
    </m.button>
  );
};

const CornerTick = ({ className }) => (
  <span
    className={`absolute w-4 h-4 border-accent-cyan/50 pointer-events-none ${className}`}
    aria-hidden="true"
  />
);

const Hero = ({ scrollTo }) => {
  const shouldReduceMotion = useReducedMotion();
  const { text: typedRole, idle: typewriterIdle } = useTypewriter(DEVELOPER_INFO.roles, 75, 2200, shouldReduceMotion);
  const sectionRef = useRef(null);
  const characterCardRef = useRef(null);

  const nameParts = DEVELOPER_INFO.name.split(' ');
  const namePlain = nameParts.slice(0, -1).join(' ');
  const nameAccent = nameParts[nameParts.length - 1];

  const [charState, setCharState] = useState({
    activeId: 'hero',
    line: "Hey there! I'm Abdullah — welcome to my little corner of the web.",
    greeting: '👋',
    isSpeaking: false,
    bubbleVisible: false,
    canSpeak: false
  });

  useEffect(() => {
    const handleCharState = (e) => setCharState(e.detail);
    window.addEventListener('character-state', handleCharState);
    return () => window.removeEventListener('character-state', handleCharState);
  }, []);

  const toggleSpeak = (e) => {
    e.stopPropagation();
    window.dispatchEvent(new CustomEvent('character-speak'));
  };

  // Global parallax (drives the character's subtle drift).
  const parallaxX = useMotionValue(0);
  const parallaxY = useMotionValue(0);
  const springX = useSpring(parallaxX, { stiffness: 55, damping: 16 });
  const springY = useSpring(parallaxY, { stiffness: 55, damping: 16 });

  // 3D tilt for the avatar panel.
  const tiltX = useMotionValue(0);
  const tiltY = useMotionValue(0);
  const tiltSpringX = useSpring(tiltX, { stiffness: 100, damping: 30 });
  const tiltSpringY = useSpring(tiltY, { stiffness: 100, damping: 30 });
  const rotateX = useTransform(tiltSpringY, [-0.5, 0.5], [10, -10]);
  const rotateY = useTransform(tiltSpringX, [-0.5, 0.5], [-10, 10]);

  const handleMouseMove = (e) => {
    if (shouldReduceMotion) return;
    parallaxX.set((e.clientX / window.innerWidth - 0.5) * -18);
    parallaxY.set((e.clientY / window.innerHeight - 0.5) * -12);
  };

  const handleCharacterMouseMove = (e) => {
    if (shouldReduceMotion || !characterCardRef.current) return;
    const rect = characterCardRef.current.getBoundingClientRect();
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;
    tiltX.set(mouseX / rect.width - 0.5);
    tiltY.set(mouseY / rect.height - 0.5);
  };

  const handleCharacterMouseLeave = () => {
    if (shouldReduceMotion) return;
    tiltX.set(0);
    tiltY.set(0);
  };

  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ['start start', 'end start'],
  });
  const exitOpacity = useTransform(scrollYProgress, [0, 0.75], [1, 0.15]);
  const exitScale = useTransform(scrollYProgress, [0, 0.75], [1, 0.96]);
  const exitY = useTransform(scrollYProgress, [0, 0.75], [0, -40]);
  const exitStyle = shouldReduceMotion ? {} : { opacity: exitOpacity, scale: exitScale, y: exitY };

  const containerVariants = {
    hidden: {},
    visible: { transition: { staggerChildren: 0.12, delayChildren: 0.3 } },
  };
  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.8, ease: [0.16, 1, 0.3, 1] } },
  };

  return (
    <section
      id="hero"
      ref={sectionRef}
      aria-label="Introduction"
      onMouseMove={handleMouseMove}
      /* Full-bleed: break out of the max-w-screen-2xl main container to span
         the whole viewport width, and fill the viewport height below the
         fixed 5rem nav. `overflow-hidden` contains the background + the tiny
         100vw scrollbar sliver (body already has overflow-x: clip). */
      className="relative left-1/2 -translate-x-1/2 w-screen overflow-hidden flex items-center py-10 sm:py-12 lg:py-3 lg:items-stretch lg:h-[calc(100dvh-5rem)]"
    >
      {/* Dark wash so the hero reads as a distinct zone against the global
          circuit background — light-mode keeps a very soft tint,
          dark-mode deepens to near-black. No base color here: bg-primary
          from the body + SiteBackground shows through. */}
      {/* Light theme: soft sky-blue wash that matches the circuit board accent.
          Dark theme: near-black wash so panels read clearly. */}
      <div className="absolute inset-0 bg-sky-100/60 dark:bg-black/65 pointer-events-none" aria-hidden="true" />

      <m.div
        className="relative z-10 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 lg:h-full"
        style={exitStyle}
      >
        {/* 2-column grid: left col = INTRO + feature cards, right col = AVATAR + stats.
             Row 1 takes remaining height (1fr); row 2 is auto-sized to content. */}
        <div className="grid grid-cols-1 lg:grid-cols-[3fr_2fr] gap-2.5 sm:gap-3 lg:h-full">

          {/* ── LEFT: INTRO + three feature cards stacked below ── */}
          <div className="flex flex-col gap-2.5 sm:gap-3 lg:h-full">

          {/* ─── INTRO ─── */}
          <m.div
            className={`${PANEL} p-5 sm:p-6 lg:p-7 flex-1 flex flex-col justify-center gap-3 overflow-hidden group`}
            variants={containerVariants}
            initial={shouldReduceMotion ? 'visible' : 'hidden'}
            animate="visible"
          >
            {/* Inner sheen */}
            <div className="absolute inset-0 opacity-60 bg-[radial-gradient(ellipse_at_top_left,rgba(0,212,255,0.10),transparent_55%)] pointer-events-none" />

            {/* Top row: section index + availability */}
            <m.div
              className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 relative z-10"
              variants={itemVariants}
            >
              <span className="font-mono text-[11px] tracking-[0.35em] uppercase text-white/35">
                01 — Introduction
              </span>
              {DEVELOPER_INFO.available && (
                <span className="inline-flex items-center gap-2.5 px-4 py-1.5 rounded-full bg-accent-green/10 border border-accent-green/30 font-mono text-[10px] sm:text-[11px] tracking-wider uppercase text-accent-green shadow-[0_0_12px_rgba(74,222,128,0.12)]">
                  <span className="relative flex h-2 w-2" aria-hidden="true">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-accent-green opacity-60" />
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-accent-green" />
                  </span>
                  Available for work
                </span>
              )}
            </m.div>

            {/* Eyebrow + name */}
            <div className="flex flex-col gap-2 relative z-10">
              <m.p
                className="font-mono text-xs sm:text-sm tracking-[0.28em] uppercase text-white/40"
                variants={itemVariants}
              >
                Designer &amp; Developer
              </m.p>

              <m.h1
                className="font-display font-bold text-white uppercase leading-[1.03] tracking-tight text-4xl sm:text-5xl lg:text-[3.1rem] xl:text-6xl"
                variants={itemVariants}
                aria-label={DEVELOPER_INFO.name}
              >
                <span className="block">{namePlain}</span>
                <span className="block text-accent-cyan [text-shadow:0_0_34px_rgba(0,212,255,0.45)]">
                  {nameAccent}
                </span>
              </m.h1>

              <m.p
                className="font-sans text-sm sm:text-base text-white/55 max-w-xl leading-relaxed mt-1"
                variants={itemVariants}
              >
                {DEVELOPER_INFO.tagline}
              </m.p>

              {/* Typewriter role */}
              <m.div
                className="font-mono text-sm sm:text-base text-accent-cyan tracking-wide h-6 flex items-center gap-2 mt-1"
                variants={itemVariants}
              >
                <span aria-hidden="true" className="text-white/40">&gt;</span>
                <span className="sr-only">{DEVELOPER_INFO.roles.join(', ')}</span>
                <span aria-hidden="true">{typedRole}</span>
                {!shouldReduceMotion && (
                  <span
                    className={`w-[2px] h-4 bg-accent-cyan ml-0.5 rounded-full ${typewriterIdle ? 'animate-pulse' : ''}`}
                    aria-hidden="true"
                  />
                )}
              </m.div>
            </div>

            {/* CTAs + socials */}
            <m.div
              className="flex flex-wrap items-center gap-3 mt-1 relative z-10"
              variants={itemVariants}
            >
              <Magnetic>
                <button
                  onClick={() => scrollTo('#contact')}
                  className="btn-primary !py-2.5 !px-6 text-xs sm:text-sm"
                >
                  Contact Me
                </button>
              </Magnetic>
              <Magnetic strength={0.4}>
                <a
                  href={DEVELOPER_INFO.resume}
                  download
                  className="px-5 py-2.5 rounded-full font-sans font-bold text-xs sm:text-sm uppercase tracking-wider inline-flex items-center gap-2 text-white/70 border border-white/15 hover:border-accent-cyan hover:text-accent-cyan hover:shadow-[0_0_20px_rgba(0,212,255,0.22)] hover:bg-accent-cyan/10 transition-all duration-300 active:scale-95 bg-white/[0.03]"
                >
                  <FaDownload size={12} aria-hidden="true" />
                  Resume
                </a>
              </Magnetic>

              <div className="h-8 w-px bg-white/15 mx-1.5 hidden sm:block" />

              <div className="flex items-center gap-3">
                {[
                  { icon: FaGithub, link: DEVELOPER_INFO.github, label: 'GitHub' },
                  { icon: FaLinkedin, link: DEVELOPER_INFO.linkedin, label: 'LinkedIn' },
                  { icon: FaEnvelope, link: `mailto:${DEVELOPER_INFO.email}`, label: 'Email' },
                ].map(({ icon: Icon, link, label }) => (
                  <Magnetic key={label} strength={0.5}>
                    <a
                      href={link}
                      target="_blank"
                      rel="noopener noreferrer"
                      aria-label={label}
                      className="w-9 h-9 rounded-full border border-white/10 flex items-center justify-center text-white/65 bg-white/[0.03] hover:text-accent-cyan hover:border-accent-cyan hover:shadow-[0_0_15px_rgba(0,212,255,0.3)] hover:bg-accent-cyan/10 transition-all duration-300"
                    >
                      <Icon size={15} />
                    </a>
                  </Magnetic>
                ))}
              </div>
            </m.div>
          </m.div>

          {/* Feature cards — 3-up row below the intro */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 sm:gap-3">
            <FeatureCard
              icon="🎨"
              index={1}
              title="Design Principles"
              description="Crafting clean, user-centric interfaces with focus on aesthetics."
              delay={1.0}
              cta="Read more"
              onClick={() => scrollTo('#about')}
            />
            <FeatureCard
              icon="⚙️"
              index={2}
              title="Development"
              description="Robust full-stack apps with Python, React and modern tools."
              delay={1.15}
              cta="See projects"
              onClick={() => scrollTo('#projects')}
            />
            <FeatureCard
              icon="🤖"
              index={3}
              title="AI/ML Solutions"
              description="Intelligent systems powered by ML and data science."
              delay={1.3}
              cta="Explore"
              onClick={() => scrollTo('#skills')}
            />
          </div>

          </div>{/* end left column */}

          {/* ── RIGHT: AVATAR fills top, 2×2 stats sit below ── */}
          <div className="flex flex-col gap-2.5 sm:gap-3 lg:h-full">

          {/* ─── AVATAR ─── */}
          <m.div
            ref={characterCardRef}
            onMouseMove={handleCharacterMouseMove}
            onMouseLeave={handleCharacterMouseLeave}
            className="flex-1 min-h-[320px] sm:min-h-[360px] lg:min-h-0 relative flex items-center justify-center [perspective:1000px] group"
            initial={shouldReduceMotion ? { opacity: 1 } : { opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 1, delay: 0.5, ease: [0.16, 1, 0.3, 1] }}
          >
            <m.div
              className={`${PANEL} w-full h-full overflow-hidden transition-colors duration-500 group-hover:border-accent-cyan/40`}
              style={shouldReduceMotion ? {} : { rotateX, rotateY, transformStyle: 'preserve-3d' }}
            >
              {/* Corner brackets */}
              <CornerTick className="top-4 left-4 border-t-2 border-l-2 rounded-tl-lg" />
              <CornerTick className="top-4 right-4 border-t-2 border-r-2 rounded-tr-lg" />
              <CornerTick className="bottom-4 left-4 border-b-2 border-l-2 rounded-bl-lg" />
              <CornerTick className="bottom-4 right-4 border-b-2 border-r-2 rounded-br-lg" />

              {/* Deep background glow */}
              <m.div
                className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(0,212,255,0.22),transparent_60%)] blur-2xl"
                style={shouldReduceMotion ? {} : { translateZ: -50 }}
                animate={shouldReduceMotion ? {} : { scale: [1, 1.1, 1], opacity: [0.6, 0.9, 0.6] }}
                transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut' }}
              />

              {/* Faint tech grid */}
              <div
                className="absolute inset-0 opacity-[0.04] pointer-events-none"
                style={{
                  backgroundImage:
                    'linear-gradient(rgba(255,255,255,1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,1) 1px, transparent 1px)',
                  backgroundSize: '22px 22px',
                  transform: 'translateZ(-20px)',
                }}
              />

              {/* Character (pops toward viewer in Z) */}
              <m.div
                className="absolute inset-0 flex items-center justify-center"
                style={shouldReduceMotion ? {} : { translateZ: 60, x: springX, y: springY }}
              >
                <m.div
                  initial={shouldReduceMotion ? { opacity: 1 } : { opacity: 0, y: 60, scale: 0.85 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  transition={{ delay: 0.7, duration: 0.9, type: 'spring', bounce: 0.45 }}
                  className="flex flex-col items-center"
                >
                  {/* Speech bubble — in-flow above the character, no absolute overlap */}
                  <AnimatePresence mode="wait">
                    {charState.activeId === 'hero' && charState.bubbleVisible && (
                      <m.div
                        key={charState.line}
                        className="w-max max-w-[240px] z-[60] pointer-events-auto mb-2"
                        initial={shouldReduceMotion ? { opacity: 0 } : { opacity: 0, y: 8, scale: 0.92 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={shouldReduceMotion ? { opacity: 0 } : { opacity: 0, y: 4, scale: 0.96 }}
                      >
                        <div className="relative px-4 py-3 rounded-2xl bg-[#0d1f3c] border border-accent-cyan/35 shadow-[0_8px_32px_rgba(0,0,0,0.35),0_0_20px_rgba(0,212,255,0.15)] flex flex-col items-center">
                          {charState.canSpeak && (
                            <button
                              onClick={toggleSpeak}
                              className="absolute -top-3 -right-3 w-7 h-7 rounded-full bg-[#0d1f3c] border border-accent-cyan/40 text-white flex items-center justify-center shadow-lg hover:text-accent-cyan transition-colors"
                              aria-label={charState.isSpeaking ? 'Stop voice' : 'Hear this'}
                              aria-pressed={charState.isSpeaking}
                            >
                              {charState.isSpeaking ? <FaStop size={9} /> : <FaPlay size={9} />}
                            </button>
                          )}

                          <div className="flex items-start gap-2 text-left">
                            <span className="text-base leading-none mt-0.5">{charState.greeting}</span>
                            <p className="font-sans text-[12px] leading-snug text-white max-w-[180px] whitespace-normal">
                              {charState.line}
                            </p>
                          </div>

                          {charState.isSpeaking && (
                            <span className="absolute bottom-3 right-4 flex items-end gap-[2px] h-2">
                              {[0, 1, 2].map((i) => (
                                <m.span
                                  key={i}
                                  className="w-[2px] rounded-full bg-accent-cyan"
                                  animate={{ height: ['30%', '100%', '30%'] }}
                                  transition={{ duration: 0.6, repeat: Infinity, delay: i * 0.1 }}
                                  style={{ display: 'inline-block' }}
                                />
                              ))}
                            </span>
                          )}

                          {/* Tail points down toward the character below */}
                          <span className="absolute -bottom-1.5 left-1/2 -translate-x-1/2 w-3 h-3 rotate-45 bg-[#0d1f3c] border-r border-b border-accent-cyan/35" />
                        </div>
                      </m.div>
                    )}
                  </AnimatePresence>

                  <m.div
                    animate={shouldReduceMotion ? {} : { y: [0, -8, 0], rotate: [0, 1.5, 0, -1.5, 0] }}
                    transition={{
                      y: { delay: 3.2, duration: 4.5, repeat: Infinity, ease: 'easeInOut' },
                      rotate: { delay: 3.2, duration: 9, repeat: Infinity, ease: 'easeInOut' },
                    }}
                    style={{ transformOrigin: '50% 85%' }}
                    className="relative z-10"
                  >
                    <div className="relative" style={{ filter: 'drop-shadow(0 30px 40px rgba(0,0,0,0.5))' }}>
                      <img
                        src="/assets/greeting-body.png"
                        alt="Developer character"
                        className="w-auto max-h-[150px] sm:max-h-[190px] lg:max-h-[230px] object-contain"
                      />
                      <m.img
                        src="/assets/greeting-hand.png"
                        alt=""
                        aria-hidden="true"
                        className="absolute inset-0 w-full h-full object-contain [transform-origin:33.2%_33.2%]"
                        animate={shouldReduceMotion ? {} : { rotate: [0, 14, -10, 14, -10, 8, 0] }}
                        transition={{ duration: charState.isSpeaking ? 0.55 : 1.6, ease: 'easeInOut', repeat: Infinity, repeatDelay: charState.isSpeaking ? 0.4 : 4.5 }}
                      />
                      {!shouldReduceMotion && (
                        <div className="absolute inset-0 pointer-events-none" aria-hidden="true">
                          {[
                            { left: '47.0%', top: '16.8%' },
                            { left: '52.1%', top: '16.6%' },
                          ].map((pos, i) => (
                            <m.span
                              key={i}
                              className="absolute w-[3.4%] h-[3.1%] rounded-[50%]"
                              style={{
                                ...pos,
                                background: 'linear-gradient(to bottom, #eeb083, #e29a70)',
                                transformOrigin: 'center top',
                                filter: 'blur(0.4px)',
                              }}
                              initial={{ scaleY: 0 }}
                              animate={{ scaleY: [0, 1, 1, 0] }}
                              transition={{ delay: 2.6, duration: 0.26, times: [0, 0.4, 0.6, 1], repeat: Infinity, repeatDelay: 5.8, ease: 'easeInOut' }}
                            />
                          ))}
                        </div>
                      )}
                    </div>
                  </m.div>

                  {/* Holographic platform */}
                  <div className="mt-[-20px] relative z-0 flex justify-center w-[200px]">
                    <m.div
                      className="absolute w-full h-[30px] rounded-[50%] bg-accent-cyan/20 blur-md"
                      animate={shouldReduceMotion ? {} : { scaleX: [1, 0.85, 1], opacity: [0.7, 0.4, 0.7] }}
                      transition={{ delay: 3.2, duration: 4.5, repeat: Infinity, ease: 'easeInOut' }}
                    />
                    <div className="absolute w-[80%] h-[15px] top-2 rounded-[50%] border-t border-accent-cyan/50 shadow-[0_0_15px_rgba(0,212,255,0.6)]" />
                  </div>
                </m.div>
              </m.div>
            </m.div>
          </m.div>

          {/* ─── STATS 2×2 grid ─── */}
          <div className="grid grid-cols-2 gap-2.5 sm:gap-3">
            {STATS.map((stat, i) => (
              <m.div
                key={stat.label}
                className={`${PANEL} p-2.5 sm:p-3 flex items-center justify-center overflow-hidden group transition-all duration-500 hover:-translate-y-1 hover:border-accent-cyan/30 hover:shadow-[0_14px_44px_-16px_rgba(0,212,255,0.16)]`}
                variants={itemVariants}
                initial={shouldReduceMotion ? 'visible' : 'hidden'}
                animate="visible"
              >
                <StatCounter stat={stat} delay={800 + i * 150} />
              </m.div>
            ))}
          </div>

          </div>{/* end right column */}

        </div>
      </m.div>
    </section>
  );
};

export default Hero;
