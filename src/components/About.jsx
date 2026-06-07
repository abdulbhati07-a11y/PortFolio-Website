import React, { useState, useRef, useEffect } from 'react';
import { m, useScroll, useTransform, useReducedMotion, useInView, AnimatePresence } from 'framer-motion';
import { FaCode, FaBrain, FaRocket, FaDatabase } from 'react-icons/fa';
import { DEVELOPER_INFO, TIMELINE } from '../utils/constants';
import Skeleton from './Skeleton';

// Generate a tiny SVG placeholder for timeline entries
const getPlaceholder = (text, size = 48, bg = '#2563eb', fg = '#ffffff') => {
  const initials = (text || '')
    .split(' ')
    .map((w) => w[0] || '')
    .slice(0, 2)
    .join('')
    .toUpperCase();
  const fontSize = Math.floor(size / 2.6);
  const svg = `<svg xmlns='http://www.w3.org/2000/svg' width='${size}' height='${size}' viewBox='0 0 ${size} ${size}'><rect width='100%' height='100%' fill='${bg}' rx='12'/><text x='50%' y='50%' dominant-baseline='middle' text-anchor='middle' font-family='Inter,Arial,Helvetica,sans-serif' font-size='${fontSize}' fill='${fg}'>${initials}</text></svg>`;
  return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
};

const highlights = [
  { icon: FaCode, label: '1.5+ Years Experience', color: 'text-accent-cyan', bg: 'bg-accent-cyan/10' },
  { icon: FaBrain, label: 'AI/ML Specialization', color: 'text-accent-purple', bg: 'bg-accent-purple/10' },
  { icon: FaRocket, label: '4th Semester CS Student', color: 'text-green-400', bg: 'bg-green-400/10' },
  { icon: FaDatabase, label: 'Data Science Track', color: 'text-orange-400', bg: 'bg-orange-400/10' },
];

const skills = ['Python', 'C++', 'Data Science', 'AI/ML', 'Full Stack', 'Web Dev', 'SQL', 'React', 'Flask'];

const About = ({ onSkillClick }) => {
  const [avatarLoaded, setAvatarLoaded] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);
  const timelineRef = useRef(null);
  const shouldReduceMotion = useReducedMotion();

  const section1Ref = useRef(null);
  const isInView1 = useInView(section1Ref, { once: true, margin: "-100px" });

  const section2Ref = useRef(null);
  const isInView2 = useInView(section2Ref, { once: true, margin: "-100px" });

  const section3Ref = useRef(null);
  const isInView3 = useInView(section3Ref, { once: true, margin: "-100px" });

  useEffect(() => {
    // Simulate data loading
    const timer = setTimeout(() => {
      setIsLoaded(true);
    }, 1000);
    return () => clearTimeout(timer);
  }, []);

  // Scroll-driven animation for timeline line
  const { scrollYProgress } = useScroll({
    target: timelineRef,
    offset: ["start center", "end center"]
  });

  const lineHeight = useTransform(scrollYProgress, [0, 1], ["0%", "100%"]);

  return (
    <m.section
      className="w-full max-w-screen-2xl mx-auto px-4 md:px-8 lg:px-16 2xl:px-0 py-20 md:py-32"
    >
      {/* ── About Me ───────────────────────────────────────────────────── */}
      <m.div 
        ref={section1Ref}
        className="mb-28 max-w-5xl mx-auto"
      >
        <AnimatePresence mode="wait">
          {!isLoaded ? (
            <m.div
              key="about-header-skeleton"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="mb-10"
            >
              <Skeleton width="100px" height="24px" className="mb-4" />
              <Skeleton width="250px" height="48px" />
            </m.div>
          ) : (
            <m.div
              key="about-header-real"
              initial={shouldReduceMotion ? { opacity: 1, x: 0 } : { opacity: 0, x: -30 }}
              animate={shouldReduceMotion || isInView1 ? { opacity: 1, x: 0 } : { opacity: 0, x: -30 }}
              transition={{ duration: 0.6 }}
              className="mb-10"
            >
              <div className="flex items-center gap-3 mb-6">
                <span className="font-mono text-accent-cyan text-sm tracking-widest">01.</span>
                <div className="flex-1 h-px bg-white/[0.06]" />
              </div>
              <h2 className="font-sans text-4xl md:text-5xl font-bold text-white tracking-tighter">
                About <span className="text-gradient">Me</span>
              </h2>
            </m.div>
          )}
        </AnimatePresence>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Profile card */}
          <m.div 
            className="lg:col-span-1"
            initial={shouldReduceMotion ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
            animate={shouldReduceMotion || isInView1 ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
            transition={{ duration: 0.8, delay: 0.1 }}
          >
            <div className="glass-card rounded-3xl p-6 flex flex-col items-center text-center gap-4 h-full">
              {/* Avatar */}
              <div className="relative w-32 h-32 rounded-full flex items-center justify-center overflow-hidden border-2 border-white/10 bg-secondary">
                {!avatarLoaded && (
                  <Skeleton className="absolute inset-0 z-10" width="100%" height="100%" borderRadius="999px" />
                )}
                {/* Fallback initials */}
                <div className={`absolute inset-0 bg-gradient-to-br from-accent-cyan/20 to-accent-purple/20 flex items-center justify-center font-mono font-bold text-4xl text-white/80 transition-opacity duration-300 ${avatarLoaded ? 'opacity-100' : 'opacity-0'}`}>
                  AB
                  <img src="data:image/gif;base64,R0lGODlhAQABAAD/ACwAAAAAAQABAAACADs=" alt="dummy" className="hidden" onLoad={() => setAvatarLoaded(true)} />
                </div>
                
                {avatarLoaded && (
                  <div className="absolute -bottom-1 -right-1 w-7 h-7 bg-green-400 rounded-full border-2 border-primary flex items-center justify-center z-20">
                    <div className="w-2 h-2 rounded-full bg-white animate-pulse" />
                  </div>
                )}
              </div>

              <div>
                <h3 className="font-sans font-bold text-white text-lg tracking-tight">{DEVELOPER_INFO.name}</h3>
                <p className="font-mono text-accent-cyan text-xs tracking-widest mt-1">{DEVELOPER_INFO.role}</p>
              </div>

              <div className="w-full section-divider" />

              <div className="flex flex-col gap-2.5 w-full text-left">
                <div className="flex justify-between items-center">
                  <span className="text-text-secondary text-xs">Location</span>
                  <span className="text-text-primary text-xs font-medium">Pakistan 🇵🇰</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-text-secondary text-xs">Availability</span>
                  <span className="text-green-400 text-xs font-medium flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
                    Open to work
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-text-secondary text-xs">Education</span>
                  <span className="text-text-primary text-xs font-medium">4th Sem CS</span>
                </div>
              </div>
            </div>
          </m.div>

          {/* Bio + highlights */}
          <m.div 
            className="lg:col-span-2 glass-card rounded-3xl p-8 flex flex-col gap-6"
            initial={shouldReduceMotion ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
            animate={shouldReduceMotion || isInView1 ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
            transition={{ duration: 0.8, delay: 0.2 }}
          >
            <p className="font-sans text-text-secondary text-base md:text-lg leading-relaxed font-light">
              {DEVELOPER_INFO.bio}
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {highlights.map(({ icon: Icon, label, color, bg }) => (
                <div key={label} className="flex items-center gap-3 p-3 rounded-xl bg-white/[0.03] border border-white/[0.05]">
                  <div className={`w-8 h-8 rounded-lg ${bg} flex items-center justify-center flex-shrink-0`}>
                    <Icon className={color} size={15} />
                  </div>
                  <span className="text-text-primary font-sans text-sm font-medium">{label}</span>
                </div>
              ))}
            </div>
          </m.div>
        </div>
      </m.div>

      {/* ── Timeline ────────────────────────────────────────────────────── */}
      <m.div ref={section2Ref} className="mb-28 w-full">
        <div className="max-w-5xl mx-auto mb-16">
          <AnimatePresence mode="wait">
            {!isLoaded ? (
              <m.div
                key="timeline-header-skeleton"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
              >
                <Skeleton width="100px" height="24px" className="mb-4" />
                <Skeleton width="250px" height="48px" />
              </m.div>
            ) : (
              <m.div
                key="timeline-header-real"
                initial={shouldReduceMotion ? { opacity: 1, x: 0 } : { opacity: 0, x: -30 }}
                animate={shouldReduceMotion || isInView2 ? { opacity: 1, x: 0 } : { opacity: 0, x: -30 }}
                transition={{ duration: 0.6 }}
              >
                <div className="flex items-center gap-3 mb-6">
                  <span className="font-mono text-accent-cyan text-sm tracking-widest">02.</span>
                  <div className="flex-1 h-px bg-white/[0.06]" />
                </div>
                <h2 className="font-sans text-4xl md:text-5xl font-bold text-white tracking-tighter">
                  My <span className="text-gradient">Journey</span>
                </h2>
              </m.div>
            )}
          </AnimatePresence>
        </div>

        <div className="relative max-w-6xl mx-auto" ref={timelineRef}>
          {/* Vertical line background */}
          <div className="absolute left-6 md:left-1/2 md:-translate-x-1/2 top-0 bottom-0 w-px bg-white/[0.05]" />
          
          {/* Animated vertical progress line */}
          <m.div 
            className="absolute left-6 md:left-1/2 md:-translate-x-1/2 top-0 w-px bg-gradient-to-b from-accent-cyan via-accent-purple to-accent-cyan origin-top shadow-[0_0_15px_rgba(0,217,255,0.5)]" 
            style={{ height: shouldReduceMotion ? '100%' : lineHeight }}
          />

          <AnimatePresence mode="wait">
            {!isLoaded ? (
              <m.div key="timeline-skeletons" className="space-y-16" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                {[1, 2, 3].map((_, idx) => (
                  <div key={idx} className={`relative flex flex-col md:flex-row items-center justify-between ${idx % 2 === 0 ? 'md:flex-row-reverse' : ''}`}>
                    <div className="hidden md:block md:w-5/12" />
                    <div className="w-full pl-16 md:pl-0 md:w-5/12">
                      <Skeleton width="100%" height="150px" borderRadius="16px" />
                    </div>
                  </div>
                ))}
              </m.div>
            ) : (
              <m.div key="timeline-real" className="space-y-16" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.5 }}>
                {TIMELINE.map((item, idx) => {
                  const isEven = idx % 2 === 0;
                  return (
                    <TimelineItem key={idx} item={item} isEven={isEven} shouldReduceMotion={shouldReduceMotion} />
                  );
                })}
              </m.div>
            )}
          </AnimatePresence>
        </div>
      </m.div>

      {/* ── Core Competencies ───────────────────────────────────────────── */}
      <m.div ref={section3Ref} className="max-w-5xl mx-auto">
        <AnimatePresence mode="wait">
          {!isLoaded ? (
            <m.div
              key="comp-header-skeleton"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="mb-10"
            >
              <Skeleton width="100px" height="24px" className="mb-4" />
              <Skeleton width="300px" height="48px" />
            </m.div>
          ) : (
            <m.div
              key="comp-header-real"
              initial={shouldReduceMotion ? { opacity: 1, x: 0 } : { opacity: 0, x: -30 }}
              animate={shouldReduceMotion || isInView3 ? { opacity: 1, x: 0 } : { opacity: 0, x: -30 }}
              transition={{ duration: 0.6 }}
              className="mb-10"
            >
              <div className="flex items-center gap-3 mb-6">
                <span className="font-mono text-accent-cyan text-sm tracking-widest">03.</span>
                <div className="flex-1 h-px bg-white/[0.06]" />
              </div>
              <h2 className="font-sans text-4xl md:text-5xl font-bold text-white tracking-tighter">
                Core <span className="text-gradient">Competencies</span>
              </h2>
            </m.div>
          )}
        </AnimatePresence>

        <AnimatePresence mode="wait">
          {!isLoaded ? (
            <m.div key="comp-skeletons" className="flex flex-wrap gap-3" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              {[1, 2, 3, 4, 5, 6, 7].map(i => <Skeleton key={i} width="120px" height="48px" borderRadius="999px" />)}
            </m.div>
          ) : (
            <m.div key="comp-real" className="flex flex-wrap gap-3" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
              {skills.map((skill, idx) => (
                <m.button
                  key={idx}
                  onClick={() => onSkillClick && onSkillClick(skill)}
                  className="px-6 py-3 rounded-full border border-white/10 text-text-primary font-sans font-medium hover:border-accent-cyan hover:text-accent-cyan hover:shadow-[0_0_20px_rgba(0,217,255,0.2)] hover:bg-accent-cyan/5 transition-all duration-300"
                  whileHover={shouldReduceMotion ? {} : { scale: 1.05 }}
                  whileTap={shouldReduceMotion ? {} : { scale: 0.95 }}
                  initial={{ opacity: 0, scale: shouldReduceMotion ? 1 : 0.8 }}
                  animate={shouldReduceMotion || isInView3 ? { opacity: 1, scale: 1 } : { opacity: 0, scale: 0.8 }}
                  transition={{ delay: shouldReduceMotion ? 0 : idx * 0.06 }}
                >
                  {skill}
                </m.button>
              ))}
            </m.div>
          )}
        </AnimatePresence>
      </m.div>
    </m.section>
  );
};

const TimelineItem = ({ item, isEven, shouldReduceMotion }) => {
  const itemRef = useRef(null);
  const isInView = useInView(itemRef, { once: true, margin: "-100px" });

  return (
    <m.div
      ref={itemRef}
      className={`relative flex flex-col md:flex-row items-center justify-between ${
        isEven ? 'md:flex-row-reverse' : ''
      }`}
      initial={{ opacity: 0, x: shouldReduceMotion ? 0 : (isEven ? 50 : -50) }}
      animate={shouldReduceMotion || isInView ? { opacity: 1, x: 0 } : { opacity: 0, x: isEven ? 50 : -50 }}
      transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
    >
      {/* Empty space for desktop alternating layout */}
      <div className="hidden md:block md:w-5/12" />

      {/* Center Dot and Year Badge */}
      <div className="absolute left-6 md:left-1/2 -translate-x-[5px] md:-translate-x-1/2 flex items-center justify-center z-10">
        <div
          className={`w-3 h-3 rounded-full ring-4 ring-primary transition-all duration-300 ${
            item.color === 'accent-cyan'
              ? 'bg-accent-cyan shadow-[0_0_12px_rgba(0,217,255,0.8)]'
              : item.color === 'accent-purple'
              ? 'bg-accent-purple shadow-[0_0_12px_rgba(168,85,247,0.8)]'
              : 'bg-green-400 shadow-[0_0_12px_rgba(74,222,128,0.8)]'
          }`}
        />
        
        {/* Sticky Chapter Label */}
        <m.div 
          className="absolute left-8 md:left-auto md:-right-24 sticky top-[80px]"
          initial={{ opacity: 0 }}
          animate={isInView ? { opacity: 1 } : { opacity: 0 }}
          transition={{ duration: 0.3 }}
        >
          <span className="font-mono text-xs text-text-secondary border border-white/10 px-3 py-1.5 rounded-full bg-primary/80 backdrop-blur-sm whitespace-nowrap">
            {item.year}
          </span>
        </m.div>
      </div>

      {/* Content Card */}
      <div className="w-full pl-16 md:pl-0 md:w-5/12">
        <div className="glass-card rounded-2xl p-6 md:p-8 hover:border-white/[0.15] transition-all duration-300 group">
          <div className="flex items-start justify-between mb-3 gap-4 flex-wrap">
            <div className="flex items-center gap-3">
              {item.logo ? (
                <img src={item.logo} alt={`${item.title} logo`} className="w-10 h-10 rounded-md object-cover z-10" />
              ) : (
                <img src={getPlaceholder(item.title)} alt={`${item.title} logo`} className="w-10 h-10 rounded-md object-cover z-10" />
              )}
              <h3 className="font-sans text-xl font-bold text-white tracking-tight group-hover:text-accent-cyan transition-colors">{item.title}</h3>
            </div>
            <div className="flex items-center gap-2 flex-shrink-0">
              <span className="md:hidden font-mono text-[10px] text-text-secondary border border-white/10 px-2 py-1 rounded-full">
                {item.year}
              </span>
              <span
                className={`font-mono text-[10px] uppercase tracking-wider px-2.5 py-1 rounded-full border ${
                  item.color === 'accent-green' || item.subtitle === 'Current'
                    ? 'border-green-400/30 text-green-400 bg-green-400/10'
                    : 'border-white/10 text-text-secondary'
                }`}
              >
                {item.subtitle}
              </span>
            </div>
          </div>
          <p className="font-sans text-text-secondary/80 text-sm leading-relaxed">{item.description}</p>
        </div>
      </div>
    </m.div>
  );
};

export default About;
