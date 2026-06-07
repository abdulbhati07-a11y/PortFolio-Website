import React, { useEffect, useState, useRef } from 'react';
import { m, useReducedMotion, useInView, AnimatePresence } from 'framer-motion';
import { SKILLS } from '../utils/constants';
import Skeleton from './Skeleton';

/* ─── Skill Bar Card ──────────────────────────────────────────────────── */
const SkillCard = ({ skill, index }) => {
  const [fill, setFill] = useState(0);
  const shouldReduceMotion = useReducedMotion();
  const cardRef = useRef(null);
  const isInView = useInView(cardRef, { once: true, margin: "-50px" });

  useEffect(() => {
    if (!isInView) return;
    const timer = setTimeout(() => setFill(skill.level), 400 + index * 80);
    return () => clearTimeout(timer);
  }, [skill.level, index, isInView]);

  const levelColor =
    skill.level >= 85 ? 'from-accent-cyan to-accent-purple' :
    skill.level >= 75 ? 'from-accent-purple to-accent-cyan' :
    'from-orange-400 to-accent-purple';

  return (
    <m.div
      ref={cardRef}
      className="glass-card p-5 rounded-2xl group flex flex-col gap-3 justify-between h-full hover:-translate-y-1 transition-all duration-500 hover:shadow-[0_10px_40px_rgba(0,0,0,0.4)]"
      initial={shouldReduceMotion ? { opacity: 1, scale: 1 } : { opacity: 0, scale: 0.8 }}
      animate={shouldReduceMotion || isInView ? { opacity: 1, scale: 1 } : { opacity: 0, scale: 0.8 }}
      transition={{ delay: index * 0.05, duration: 0.5 }}
    >
      <div className="flex justify-between items-center mb-3">
        <div className="flex items-center gap-2.5">
          <span className="text-xl">{skill.icon}</span>
          <h4 className="font-sans text-base font-semibold text-white tracking-tight group-hover:text-accent-cyan transition-colors duration-300">
            {skill.name}
          </h4>
        </div>
        <div className="flex items-center gap-2">
          <span className="font-mono text-sm font-bold text-accent-cyan">{Math.round(fill)}%</span>
          <span className="font-mono text-[9px] font-bold text-text-secondary uppercase tracking-widest border border-white/10 px-2 py-0.5 rounded-full group-hover:border-accent-cyan/30 transition-colors">
            {skill.type}
          </span>
        </div>
      </div>

      {/* Progress bar */}
      <div className="w-full h-1.5 bg-white/5 rounded-full overflow-hidden">
        <m.div
          className={`h-full bg-gradient-to-r ${levelColor} rounded-full relative`}
          initial={{ width: shouldReduceMotion ? `${fill}%` : 0 }}
          animate={{ width: `${fill}%` }}
          transition={{ duration: 1.4, ease: [0.16, 1, 0.3, 1] }}
        >
          <div className="absolute right-0 top-0 bottom-0 w-3 bg-white/40 blur-[2px] rounded-full" />
        </m.div>
      </div>
    </m.div>
  );
};

/* ─── Skill Radial Badge ──────────────────────────────────────────────── */
const RadialBadge = ({ skill, index }) => {
  const radius = 30;
  const circ = 2 * Math.PI * radius;
  const [progress, setProgress] = useState(0);
  const shouldReduceMotion = useReducedMotion();
  const cardRef = useRef(null);
  const isInView = useInView(cardRef, { once: true, margin: "-50px" });

  useEffect(() => {
    if (!isInView) return;
    const t = setTimeout(() => setProgress(skill.level), 300 + index * 100);
    return () => clearTimeout(t);
  }, [skill.level, index, isInView]);

  const offset = circ - (progress / 100) * circ;

  return (
    <m.div
      ref={cardRef}
      className="glass-card rounded-2xl p-5 flex flex-col items-center gap-3 hover:-translate-y-1 transition-all duration-500 hover:shadow-[0_10px_40px_rgba(0,0,0,0.4)] group"
      initial={shouldReduceMotion ? { opacity: 1, scale: 1 } : { opacity: 0, scale: 0.8 }}
      animate={shouldReduceMotion || isInView ? { opacity: 1, scale: 1 } : { opacity: 0, scale: 0.8 }}
      transition={{ delay: index * 0.05, duration: 0.5 }}
    >
      <div className="relative w-16 h-16">
        <svg width="64" height="64" viewBox="0 0 64 64" className="-rotate-90">
          <circle cx="32" cy="32" r={radius} fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth="4" />
          <m.circle
            cx="32"
            cy="32"
            r={radius}
            fill="none"
            stroke="url(#grad)"
            strokeWidth="4"
            strokeLinecap="round"
            strokeDasharray={circ}
            initial={{ strokeDashoffset: shouldReduceMotion ? offset : circ }}
            animate={{ strokeDashoffset: offset }}
            transition={{ duration: 1.4, ease: [0.16, 1, 0.3, 1] }}
          />
          <defs>
            <linearGradient id="grad" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#00D9FF" />
              <stop offset="100%" stopColor="#A855F7" />
            </linearGradient>
          </defs>
        </svg>
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="text-xl">{skill.icon}</span>
        </div>
      </div>
      <div className="text-center">
        <div className="font-sans text-sm font-semibold text-white group-hover:text-accent-cyan transition-colors">{skill.name}</div>
        <div className="font-mono text-xs text-accent-cyan font-bold mt-0.5">{skill.level}%</div>
      </div>
    </m.div>
  );
};

/* ─── Skills Section ──────────────────────────────────────────────────── */
const Skills = () => {
  const [isLoaded, setIsLoaded] = useState(false);
  const shouldReduceMotion = useReducedMotion();
  const sectionRef = useRef(null);
  const isInView = useInView(sectionRef, { once: true, margin: "-100px" });

  useEffect(() => {
    // Simulate data loading
    const timer = setTimeout(() => {
      setIsLoaded(true);
    }, 1000);
    return () => clearTimeout(timer);
  }, []);

  return (
    <m.section
      ref={sectionRef}
      className="w-full max-w-screen-2xl mx-auto px-4 md:px-8 lg:px-16 2xl:px-0 py-20 md:py-32"
    >
      {/* Header */}
      <AnimatePresence mode="wait">
        {!isLoaded ? (
          <m.div
            key="header-skeleton"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="mb-16"
          >
            <Skeleton width="150px" height="24px" className="mb-4" />
            <Skeleton width="300px" height="48px" className="mb-4" />
            <Skeleton width="100%" height="24px" className="max-w-xl" />
          </m.div>
        ) : (
          <m.div
            key="header-content"
            className="mb-16"
            initial={shouldReduceMotion ? { opacity: 1, x: 0 } : { opacity: 0, x: -30 }}
            animate={shouldReduceMotion || isInView ? { opacity: 1, x: 0 } : { opacity: 0, x: -30 }}
            transition={{ duration: 0.6 }}
          >
            <div className="flex items-center gap-3 mb-4">
              <span className="font-mono text-accent-cyan text-sm tracking-widest">Skills</span>
              <div className="flex-1 h-px bg-white/[0.06]" />
            </div>
            <h2 className="font-sans text-4xl md:text-5xl font-bold text-white tracking-tighter">
              Technical <span className="text-gradient">Arsenal</span>
            </h2>
            <p className="text-text-secondary font-sans text-base mt-4 font-light max-w-xl">
              A snapshot of the languages, frameworks, and tools I work with most.
            </p>
          </m.div>
        )}
      </AnimatePresence>

      {/* Programming Languages — bar cards */}
      <div className="mb-14">
        <m.h3
          className="font-sans text-sm font-medium text-text-secondary mb-5 tracking-widest uppercase flex items-center gap-3"
          initial={shouldReduceMotion ? { opacity: 1, x: 0 } : { opacity: 0, x: -20 }}
          animate={shouldReduceMotion || isInView ? { opacity: 1, x: 0 } : { opacity: 0, x: -20 }}
        >
          <span className="w-8 h-px bg-white/20" />
          Programming Languages
        </m.h3>
        
        <AnimatePresence mode="wait">
          {!isLoaded ? (
            <m.div key="prog-skeletons" className="grid grid-cols-1 sm:grid-cols-2 gap-4" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              {[1, 2, 3, 4].map(i => <Skeleton key={i} width="100%" height="88px" borderRadius="16px" />)}
            </m.div>
          ) : (
            <m.div key="prog-real" className="grid grid-cols-1 sm:grid-cols-2 gap-4" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.5 }}>
              {SKILLS.programming.map((skill, idx) => (
                <SkillCard key={skill.name} skill={skill} index={idx} />
              ))}
            </m.div>
          )}
        </AnimatePresence>
      </div>

      {/* Frameworks — bar cards */}
      <div className="mb-14">
        <m.h3
          className="font-sans text-sm font-medium text-text-secondary mb-5 tracking-widest uppercase flex items-center gap-3"
          initial={shouldReduceMotion ? { opacity: 1, x: 0 } : { opacity: 0, x: -20 }}
          animate={shouldReduceMotion || isInView ? { opacity: 1, x: 0 } : { opacity: 0, x: -20 }}
        >
          <span className="w-8 h-px bg-white/20" />
          Frameworks &amp; Libraries
        </m.h3>
        
        <AnimatePresence mode="wait">
          {!isLoaded ? (
            <m.div key="frame-skeletons" className="grid grid-cols-1 sm:grid-cols-2 gap-4" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              {[1, 2, 3, 4].map(i => <Skeleton key={i} width="100%" height="88px" borderRadius="16px" />)}
            </m.div>
          ) : (
            <m.div key="frame-real" className="grid grid-cols-1 sm:grid-cols-2 gap-4" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.5 }}>
              {SKILLS.frameworks.map((skill, idx) => (
                <SkillCard key={skill.name} skill={skill} index={idx + 4} />
              ))}
            </m.div>
          )}
        </AnimatePresence>
      </div>

      {/* Tools — radial badges */}
      <div>
        <m.h3
          className="font-sans text-sm font-medium text-text-secondary mb-5 tracking-widest uppercase flex items-center gap-3"
          initial={shouldReduceMotion ? { opacity: 1, x: 0 } : { opacity: 0, x: -20 }}
          animate={shouldReduceMotion || isInView ? { opacity: 1, x: 0 } : { opacity: 0, x: -20 }}
        >
          <span className="w-8 h-px bg-white/20" />
          Tools &amp; Platforms
        </m.h3>
        
        <AnimatePresence mode="wait">
          {!isLoaded ? (
            <m.div key="tools-skeletons" className="grid grid-cols-2 sm:grid-cols-4 gap-4" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              {[1, 2, 3, 4].map(i => <Skeleton key={i} width="100%" height="152px" borderRadius="16px" />)}
            </m.div>
          ) : (
            <m.div key="tools-real" className="grid grid-cols-2 sm:grid-cols-4 gap-4" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.5 }}>
              {SKILLS.tools.map((skill, idx) => (
                <RadialBadge key={skill.name} skill={skill} index={idx} />
              ))}
            </m.div>
          )}
        </AnimatePresence>
      </div>
    </m.section>
  );
};

export default Skills;
