import React, { useState, useRef, useEffect } from 'react';
import { m, useReducedMotion, useInView } from 'framer-motion';
import { SKILLS } from '../utils/constants';
import SectionHeading from './ui/SectionHeading';
import Reveal from './ui/Reveal';
import SkillSphere from './SkillSphere';

const SPHERE_SKILLS = ['Python', 'C++', 'Data Science', 'AI/ML', 'Full Stack', 'Web Projects', 'SQL', 'React', 'Flask'];

/* ─── Skill Bar Card ──────────────────────────────────────────────────── */
const SkillCard = ({ skill, index }) => {
  const [fill, setFill] = useState(0);
  const shouldReduceMotion = useReducedMotion();
  const cardRef = useRef(null);
  const isInView = useInView(cardRef, { once: true, margin: '-50px' });

  useEffect(() => {
    if (!isInView) return;
    if (shouldReduceMotion) {
      setFill(skill.level);
      return;
    }
    const timer = setTimeout(() => setFill(skill.level), 200 + index * 80);
    return () => clearTimeout(timer);
  }, [skill.level, index, isInView, shouldReduceMotion]);

  const levelColor =
    skill.level >= 85 ? 'bg-accent-cyan' :
    skill.level >= 75 ? 'bg-accent-purple' :
    'bg-accent-emerald';

  return (
    <m.div
      ref={cardRef}
      className="glass-card glass-card-hover p-4 sm:p-5 rounded-2xl group flex flex-col gap-3 justify-between h-full hover:-translate-y-1 transition-all duration-500 hover:shadow-[0_10px_40px_rgba(0,0,0,0.4)]"
      initial={shouldReduceMotion ? false : { opacity: 0, scale: 0.9 }}
      animate={shouldReduceMotion || isInView ? { opacity: 1, scale: 1 } : {}}
      transition={{ delay: index * 0.05, duration: 0.5 }}
    >
      <div className="flex justify-between items-center mb-1">
        <div className="flex items-center gap-2.5">
          <span className="text-xl" aria-hidden="true">{skill.icon}</span>
          <h4 className="font-sans text-base font-semibold text-text-primary tracking-tight group-hover:text-accent-cyan transition-colors duration-300">
            {skill.name}
          </h4>
        </div>
        <div className="flex items-center gap-2">
          <span className="font-mono text-sm font-bold text-accent-cyan">{Math.round(fill)}%</span>
          <span className="font-mono text-[9px] font-bold text-text-secondary uppercase tracking-widest border border-glass/10 px-2 py-0.5 rounded-full group-hover:border-accent-cyan/30 transition-colors">
            {skill.type}
          </span>
        </div>
      </div>

      <div
        className="w-full h-1.5 bg-glass/5 rounded-full overflow-hidden"
        role="progressbar"
        aria-valuenow={skill.level}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-label={`${skill.name} proficiency`}
      >
        <m.div
          className={`h-full ${levelColor} rounded-full relative`}
          initial={{ width: shouldReduceMotion ? `${skill.level}%` : 0 }}
          animate={{ width: `${fill}%` }}
          transition={{ duration: 1.4, ease: [0.16, 1, 0.3, 1] }}
        >
          <div className="absolute right-0 top-0 bottom-0 w-3 bg-white/40 blur-[2px] rounded-full" />
        </m.div>
      </div>
    </m.div>
  );
};

/* ─── Radial Badge ────────────────────────────────────────────────────── */
const RadialBadge = ({ skill, index }) => {
  const radius = 30;
  const circ = 2 * Math.PI * radius;
  const [progress, setProgress] = useState(0);
  const shouldReduceMotion = useReducedMotion();
  const cardRef = useRef(null);
  const isInView = useInView(cardRef, { once: true, margin: '-50px' });

  useEffect(() => {
    if (!isInView) return;
    if (shouldReduceMotion) {
      setProgress(skill.level);
      return;
    }
    const t = setTimeout(() => setProgress(skill.level), 150 + index * 100);
    return () => clearTimeout(t);
  }, [skill.level, index, isInView, shouldReduceMotion]);

  const offset = circ - (progress / 100) * circ;

  return (
    <m.div
      ref={cardRef}
      className="glass-card glass-card-hover rounded-2xl p-5 flex flex-col items-center gap-3 hover:-translate-y-1 transition-all duration-500 hover:shadow-[0_10px_40px_rgba(0,0,0,0.4)] group"
      initial={shouldReduceMotion ? false : { opacity: 0, scale: 0.9 }}
      animate={shouldReduceMotion || isInView ? { opacity: 1, scale: 1 } : {}}
      transition={{ delay: index * 0.05, duration: 0.5 }}
    >
      <div className="relative w-16 h-16">
        <svg width="64" height="64" viewBox="0 0 64 64" className="-rotate-90" aria-hidden="true">
          <circle cx="32" cy="32" r={radius} fill="none" stroke="rgba(128,128,128,0.15)" strokeWidth="4" />
          <m.circle
            cx="32" cy="32" r={radius} fill="none"
            stroke={`url(#skill-grad-${index})`}
            strokeWidth="4" strokeLinecap="round" strokeDasharray={circ}
            initial={{ strokeDashoffset: shouldReduceMotion ? offset : circ }}
            animate={{ strokeDashoffset: offset }}
            transition={{ duration: 1.4, ease: [0.16, 1, 0.3, 1] }}
          />
          <defs>
            <linearGradient id={`skill-grad-${index}`} x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#00D9FF" />
              <stop offset="100%" stopColor="#00D9FF" />
            </linearGradient>
          </defs>
        </svg>
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="text-xl" aria-hidden="true">{skill.icon}</span>
        </div>
      </div>
      <div className="text-center">
        <div className="font-sans text-sm font-semibold text-text-primary group-hover:text-accent-cyan transition-colors">{skill.name}</div>
        <div className="font-mono text-xs text-accent-cyan font-bold mt-0.5">{skill.level}%</div>
      </div>
    </m.div>
  );
};

/* ─── Group heading ───────────────────────────────────────────────────── */
const GroupHeading = ({ children }) => (
  <Reveal direction="right" className="mb-5">
    <h3 className="font-sans text-sm font-medium text-text-secondary tracking-widest uppercase flex items-center gap-3">
      <span className="w-8 h-px bg-glass/20" />
      {children}
    </h3>
  </Reveal>
);

/* ─── Skills Section ──────────────────────────────────────────────────── */
const Skills = ({ onSkillClick }) => {
  return (
    <section
      id="skills"
      aria-label="Skills"
      className="w-full max-w-screen-2xl mx-auto px-4 md:px-8 lg:px-16 2xl:px-0 py-20 md:py-32"
    >
      <SectionHeading
        index="02"
        eyebrow="Skills"
        title="Technical"
        accent="Arsenal"
        subtitle="A snapshot of the languages, frameworks, and tools I work with most. Click a competency in the constellation to see related work."
        className="mb-16"
      />

      {/* Interactive 3D constellation + keyboard-accessible competency list */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-16 items-stretch">
        <Reveal>
          <div data-cursor="Drag" className="h-full">
            <SkillSphere skills={SPHERE_SKILLS} onSkillClick={onSkillClick} />
          </div>
        </Reveal>
        <Reveal delay={0.15}>
          <div className="glass-card rounded-3xl p-6 sm:p-8 h-full flex flex-col justify-center gap-4">
            <h3 className="font-display text-lg font-bold text-text-primary tracking-tight">Core Competencies</h3>
            <p className="font-sans text-text-secondary text-sm font-light leading-relaxed">
              Each competency maps to real, shipped work. Choose one to jump straight to the projects that prove it.
            </p>
            <div className="flex flex-wrap gap-2" role="group" aria-label="Filter projects by competency">
              {SPHERE_SKILLS.map((skill) => (
                <button
                  key={skill}
                  onClick={() => onSkillClick?.(skill)}
                  className="px-4 py-2 rounded-full border border-glass/10 bg-glass/[0.04] text-sm font-sans text-text-secondary hover:text-accent-cyan hover:border-accent-cyan/40 hover:bg-accent-cyan/5 transition-all duration-300"
                >
                  {skill}
                </button>
              ))}
            </div>
          </div>
        </Reveal>
      </div>

      {/* Programming languages */}
      <div className="mb-14">
        <GroupHeading>Programming Languages</GroupHeading>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {SKILLS.programming.map((skill, idx) => (
            <SkillCard key={skill.name} skill={skill} index={idx} />
          ))}
        </div>
      </div>

      {/* Frameworks */}
      <div className="mb-14">
        <GroupHeading>Frameworks &amp; Libraries</GroupHeading>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {SKILLS.frameworks.map((skill, idx) => (
            <SkillCard key={skill.name} skill={skill} index={idx} />
          ))}
        </div>
      </div>

      {/* Tools */}
      <div>
        <GroupHeading>Tools &amp; Platforms</GroupHeading>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {SKILLS.tools.map((skill, idx) => (
            <RadialBadge key={skill.name} skill={skill} index={idx} />
          ))}
        </div>
      </div>
    </section>
  );
};

export default Skills;
