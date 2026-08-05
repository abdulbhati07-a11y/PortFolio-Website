import React, { useState, useEffect, useRef } from 'react';
import {
  m,
  useReducedMotion,
  useMotionValue,
  useSpring,
  useScroll,
  useTransform,
} from 'framer-motion';
import { FaGithub, FaLinkedin, FaEnvelope, FaArrowDown, FaDownload } from 'react-icons/fa';
import { DEVELOPER_INFO, STATS } from '../utils/constants';
import Magnetic from './ui/Magnetic';

/* ─── Typewriter Hook ─────────────────────────────────────────────────── */
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

/* ─── Stat Counter ────────────────────────────────────────────────────── */
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
    <m.div
      className="flex flex-col items-center gap-1"
      variants={{
        hidden: { opacity: 0, y: 20 },
        visible: { opacity: 1, y: 0, transition: { duration: 0.6 } },
      }}
    >
      <span className="font-mono text-xl sm:text-2xl md:text-3xl font-bold text-text-primary">
        {stat.decimals > 0 ? count.toFixed(1) : Math.floor(count)}
        <span className="text-accent-cyan">{stat.suffix}</span>
      </span>
      <span className="font-sans text-xs text-text-secondary tracking-widest uppercase">{stat.label}</span>
    </m.div>
  );
};

/* ─── Feature Card ────────────────────────────────────────────────────── */
const FeatureCard = ({ icon, title, description, delay, onClick, cta }) => {
  const shouldReduceMotion = useReducedMotion();
  return (
    <m.button
      type="button"
      onClick={onClick}
      className="glass-card glass-card-hover rounded-3xl p-4 flex flex-col gap-2 text-left group"
      initial={shouldReduceMotion ? { opacity: 1 } : { opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
    >
      <div className="flex items-center justify-between w-full">
        <h3 className="font-display text-sm font-bold text-text-primary uppercase tracking-wider">{title}</h3>
        <span className="w-9 h-9 rounded-full flex items-center justify-center text-lg bg-accent-amber/20">
          {icon}
        </span>
      </div>
      <p className="font-sans text-xs text-text-secondary leading-relaxed">{description}</p>
      <span className="font-mono text-[11px] text-accent-cyan mt-1 inline-flex items-center gap-1">
        <span className="link-underline">{cta}</span>
        <span className="transition-transform duration-300 group-hover:translate-x-1" aria-hidden="true">→</span>
      </span>
    </m.button>
  );
};

/* ─── Hero Component ──────────────────────────────────────────────────── */
const Hero = ({ scrollTo }) => {
  const shouldReduceMotion = useReducedMotion();
  const { text: typedRole, idle: typewriterIdle } = useTypewriter(DEVELOPER_INFO.roles, 75, 2200, shouldReduceMotion);
  const sectionRef = useRef(null);

  const nameParts = DEVELOPER_INFO.name.split(' ');
  const namePlain = nameParts.slice(0, -1).join(' ');
  const nameAccent = nameParts[nameParts.length - 1];

  /* Cursor parallax — the character drifts a few px opposite the mouse */
  const parallaxX = useMotionValue(0);
  const parallaxY = useMotionValue(0);
  const springX = useSpring(parallaxX, { stiffness: 55, damping: 16 });
  const springY = useSpring(parallaxY, { stiffness: 55, damping: 16 });
  const handleMouseMove = (e) => {
    if (shouldReduceMotion) return;
    parallaxX.set((e.clientX / window.innerWidth - 0.5) * -18);
    parallaxY.set((e.clientY / window.innerHeight - 0.5) * -12);
  };

  /* Scroll-linked exit — hero recedes softly as you scroll toward About */
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
      className="relative w-full flex flex-col justify-start overflow-hidden"
    >
      {/* ─── Main two-column layout ─── */}
      <m.div
        className="relative z-10 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 pt-1 pb-6 md:pt-2 md:pb-8"
        style={exitStyle}
      >
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-4 items-center">

          {/* ─── LEFT COLUMN: Text content ─── */}
          <m.div
            className="flex flex-col gap-3 text-center lg:text-left order-2 lg:order-1"
            variants={containerVariants}
            initial={shouldReduceMotion ? 'visible' : 'hidden'}
            animate="visible"
          >
            {/* Availability pill */}
            {DEVELOPER_INFO.available && (
              <m.div className="flex justify-center lg:justify-start" variants={itemVariants}>
                <span className="inline-flex items-center gap-2.5 px-4 py-1.5 rounded-full bg-accent-green/10 border border-accent-green/30 font-mono text-[11px] tracking-wider uppercase text-accent-green">
                  <span className="relative flex h-2 w-2" aria-hidden="true">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-accent-green opacity-60" />
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-accent-green" />
                  </span>
                  Available for work · building {DEVELOPER_INFO.currentlyBuilding}
                </span>
              </m.div>
            )}

            {/* Subtitle */}
            <m.p
              className="font-mono text-xs sm:text-sm tracking-[0.25em] uppercase text-text-tertiary"
              variants={itemVariants}
            >
              Designer &amp; Developer
            </m.p>

            {/* Name */}
            <m.h1
              className="font-display text-4xl sm:text-5xl md:text-6xl lg:text-6xl font-bold text-text-primary leading-[1.02] tracking-tight"
              variants={itemVariants}
              aria-label={DEVELOPER_INFO.name}
            >
              {namePlain}
              <br className="hidden sm:block" />
              <span className="text-accent-cyan [text-shadow:0_0_30px_rgba(0,212,255,0.3)]">{nameAccent}</span>
            </m.h1>

            {/* Tagline */}
            <m.p
              className="font-sans text-sm sm:text-base text-text-tertiary max-w-md mx-auto lg:mx-0 font-light leading-relaxed uppercase tracking-wider"
              variants={itemVariants}
            >
              {DEVELOPER_INFO.tagline}
            </m.p>

            {/* Typewriter role */}
            <m.div
              className="font-mono text-sm sm:text-base text-text-secondary tracking-wide h-6 flex items-center justify-center lg:justify-start gap-1"
              variants={itemVariants}
            >
              <span aria-hidden="true" className="text-accent-cyan">&gt;</span>
              <span className="sr-only">{DEVELOPER_INFO.roles.join(', ')}</span>
              <span aria-hidden="true">{typedRole}</span>
              {!shouldReduceMotion && (
                <span
                  className={`w-[2px] h-4 bg-accent-cyan ml-0.5 rounded-full ${typewriterIdle ? 'animate-pulse' : ''}`}
                  aria-hidden="true"
                />
              )}
            </m.div>

            {/* CTAs */}
            <m.div
              className="flex flex-col sm:flex-row items-center lg:items-start gap-4 mt-1"
              variants={itemVariants}
            >
              <Magnetic>
                <button
                  onClick={() => scrollTo('#contact')}
                  className="btn-primary !py-3 text-sm"
                >
                  Contact Me
                </button>
              </Magnetic>
              <Magnetic strength={0.4}>
                <a
                  href={DEVELOPER_INFO.resume}
                  download
                  className="px-7 py-3 rounded-full font-sans font-bold text-sm uppercase tracking-wider inline-flex items-center gap-2 text-text-secondary border border-glass/20 hover:border-accent-cyan hover:text-accent-cyan hover:shadow-[0_0_20px_rgba(0,212,255,0.25)] transition-all duration-300 active:scale-95"
                >
                  <FaDownload size={12} aria-hidden="true" />
                  Resume
                </a>
              </Magnetic>
              <button
                onClick={() => scrollTo('#about')}
                className="group font-sans text-sm font-medium text-text-secondary hover:text-text-primary transition-colors inline-flex items-center gap-1.5 sm:self-center"
              >
                <span className="link-underline">About Me</span>
                <span className="transition-transform duration-300 group-hover:translate-x-1" aria-hidden="true">→</span>
              </button>
            </m.div>

            {/* Social links */}
            <m.div className="flex items-center justify-center lg:justify-start gap-4 mt-2" variants={itemVariants}>
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
                    className="w-10 h-10 rounded-full border border-glass/10 flex items-center justify-center text-text-secondary hover:text-accent-cyan hover:border-accent-cyan hover:shadow-[0_0_15px_rgba(0,212,255,0.3)] hover:bg-accent-cyan/10 transition-all duration-300"
                  >
                    <Icon size={16} />
                  </a>
                </Magnetic>
              ))}
            </m.div>
          </m.div>

          {/* ─── RIGHT COLUMN: Greeting Character ─── */}
          <m.div
            className="relative order-1 lg:order-2 flex items-center justify-center min-h-[260px] sm:min-h-[320px] md:min-h-[380px] lg:min-h-[370px]"
            initial={shouldReduceMotion ? { opacity: 1 } : { opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 1, delay: 0.5, ease: [0.16, 1, 0.3, 1] }}
          >
            {/* Entrance: bouncy spring, then wave-greet rock, then idle float.
                The whole group drifts opposite the cursor (spring parallax). */}
            <m.div
              className="relative z-10"
              style={shouldReduceMotion ? {} : { x: springX, y: springY }}
            >
              <m.div
                initial={shouldReduceMotion ? { opacity: 1 } : { opacity: 0, y: 60, scale: 0.85 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                transition={{ delay: 0.7, duration: 0.9, type: 'spring', bounce: 0.45 }}
              >
                {/* Speech bubble with waving hand */}
                <m.div
                  className="absolute top-2 -left-2 sm:top-4 sm:left-0 z-20 flex items-center gap-1.5 px-4 py-2 rounded-2xl rounded-bl-sm backdrop-blur-xl select-none bg-[#0d1f3c]/90 border border-accent-cyan/35 shadow-[0_8px_32px_rgba(0,0,0,0.3),0_0_20px_rgba(0,212,255,0.15)]"
                  initial={shouldReduceMotion ? { opacity: 1 } : { opacity: 0, scale: 0, y: 10 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  transition={{ delay: 1.5, type: 'spring', bounce: 0.6, duration: 0.7 }}
                  aria-hidden="true"
                >
                  <m.span
                    className="text-lg inline-block"
                    style={{ transformOrigin: '70% 70%' }}
                    animate={shouldReduceMotion ? {} : { rotate: [0, 22, -12, 22, -12, 16, 0] }}
                    transition={{ delay: 1.4, duration: 1.6, ease: 'easeInOut', repeat: Infinity, repeatDelay: 4.5 }}
                  >
                    👋
                  </m.span>
                  <span className="font-sans text-sm font-semibold text-white whitespace-nowrap">
                    Hi, I am {DEVELOPER_INFO.nickname}!
                  </span>
                </m.div>

                {/* Idle float loop */}
                <m.div
                  animate={shouldReduceMotion ? {} : { y: [0, -12, 0] }}
                  transition={{ delay: 3.2, duration: 4.5, repeat: Infinity, ease: 'easeInOut' }}
                >
                  {/* Two-layer character: static body + independently waving hand.
                      Both PNGs share the same canvas, so inset-0 self-aligns them. */}
                  <div
                    className="relative"
                    style={{ filter: 'drop-shadow(0 20px 40px rgba(0,0,0,0.45))' }}
                  >
                    <img
                      src="/assets/greeting-body.png"
                      alt="Developer character waving hello"
                      className="w-auto max-h-[320px] sm:max-h-[380px] md:max-h-[440px] lg:max-h-[500px] object-contain"
                    />
                    <m.img
                      src="/assets/greeting-hand.png"
                      alt=""
                      aria-hidden="true"
                      className="absolute inset-0 w-full h-full object-contain [transform-origin:33.2%_33.2%]"
                      animate={shouldReduceMotion ? {} : { rotate: [0, 14, -10, 14, -10, 8, 0] }}
                      transition={{
                        delay: 1.4,
                        duration: 1.6,
                        ease: 'easeInOut',
                        repeat: Infinity,
                        repeatDelay: 4.5,
                      }}
                    />
                  </div>
                </m.div>

                {/* Soft ground glow so the float reads as hovering */}
                <m.div
                  className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-3/4 h-6 rounded-[50%] blur-xl bg-accent-cyan/25"
                  animate={shouldReduceMotion ? {} : { scaleX: [1, 0.82, 1], opacity: [0.6, 0.35, 0.6] }}
                  transition={{ delay: 3.2, duration: 4.5, repeat: Infinity, ease: 'easeInOut' }}
                  aria-hidden="true"
                />
              </m.div>
            </m.div>
          </m.div>
        </div>

        {/* ─── Feature Cards Row ─── */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-3 max-w-4xl mx-auto lg:mx-0">
          <FeatureCard
            icon="🎨"
            title="Design Principles"
            description="Crafting clean, user-centric interfaces with focus on aesthetics and usability."
            delay={1.0}
            cta="How I work"
            onClick={() => scrollTo('#about')}
          />
          <FeatureCard
            icon="⚙️"
            title="Development"
            description="Building robust full-stack applications with Python, Flask, React and modern tools."
            delay={1.15}
            cta="See projects"
            onClick={() => scrollTo('#projects')}
          />
          <FeatureCard
            icon="🤖"
            title="AI/ML Solutions"
            description="Creating intelligent systems powered by machine learning and data science."
            delay={1.3}
            cta="My skills"
            onClick={() => scrollTo('#skills')}
          />
        </div>

        {/* ─── Stats ─── */}
        <m.div
          className="grid grid-cols-2 sm:grid-cols-4 gap-4 sm:gap-6 max-w-2xl mx-auto lg:mx-0 mt-3 md:mt-4"
          variants={containerVariants}
          initial={shouldReduceMotion ? 'visible' : 'hidden'}
          animate="visible"
        >
          {STATS.map((stat, i) => (
            <StatCounter key={stat.label} stat={stat} delay={800 + i * 150} />
          ))}
        </m.div>
      </m.div>

      {/* Scroll cue */}
      <button
        onClick={() => scrollTo('#about')}
        className="absolute bottom-4 left-1/2 -translate-x-1/2 hidden [@media(min-height:960px)]:flex flex-col items-center gap-2 text-text-tertiary hover:text-accent-cyan transition-colors z-20"
        aria-label="Scroll to About section"
      >
        <span className="font-mono text-[10px] tracking-[0.3em] uppercase">Scroll</span>
        <m.div
          animate={shouldReduceMotion ? {} : { y: [0, 8, 0] }}
          transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
        >
          <FaArrowDown size={14} />
        </m.div>
      </button>
    </section>
  );
};

export default Hero;
