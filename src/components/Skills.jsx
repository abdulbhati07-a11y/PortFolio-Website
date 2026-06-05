import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { SKILLS } from '../utils/constants';

const containerVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.08 } },
};

/* ─── Skill Bar Card ──────────────────────────────────────────────────── */
const SkillCard = ({ skill, index }) => {
  const [fill, setFill] = useState(0);

  useEffect(() => {
    const timer = setTimeout(() => setFill(skill.level), 400 + index * 80);
    return () => clearTimeout(timer);
  }, [skill.level, index]);

  const levelColor =
    skill.level >= 85 ? 'from-accent-cyan to-accent-purple' :
    skill.level >= 75 ? 'from-accent-purple to-accent-cyan' :
    'from-orange-400 to-accent-purple';

  return (
    <motion.div
      className="glass-card p-5 rounded-2xl group flex flex-col gap-3 hover:-translate-y-1 transition-all duration-500 hover:shadow-[0_10px_40px_rgba(0,0,0,0.4)]"
      variants={{
        hidden: { opacity: 0, y: 20 },
        visible: { opacity: 1, y: 0, transition: { duration: 0.7, ease: [0.16, 1, 0.3, 1] } },
      }}
    >
      <div className="flex justify-between items-center">
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
        <motion.div
          className={`h-full bg-gradient-to-r ${levelColor} rounded-full relative`}
          initial={{ width: 0 }}
          animate={{ width: `${fill}%` }}
          transition={{ duration: 1.4, ease: [0.16, 1, 0.3, 1] }}
        >
          <div className="absolute right-0 top-0 bottom-0 w-3 bg-white/40 blur-[2px] rounded-full" />
        </motion.div>
      </div>
    </motion.div>
  );
};

/* ─── Skill Radial Badge ──────────────────────────────────────────────── */
const RadialBadge = ({ skill, index }) => {
  const radius = 30;
  const circ = 2 * Math.PI * radius;
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const t = setTimeout(() => setProgress(skill.level), 300 + index * 100);
    return () => clearTimeout(t);
  }, [skill.level, index]);

  const offset = circ - (progress / 100) * circ;

  return (
    <motion.div
      className="glass-card rounded-2xl p-5 flex flex-col items-center gap-3 hover:-translate-y-1 transition-all duration-500 hover:shadow-[0_10px_40px_rgba(0,0,0,0.4)] group"
      variants={{
        hidden: { opacity: 0, scale: 0.9 },
        visible: { opacity: 1, scale: 1, transition: { duration: 0.6, ease: [0.16, 1, 0.3, 1] } },
      }}
    >
      <div className="relative w-16 h-16">
        <svg width="64" height="64" viewBox="0 0 64 64" className="-rotate-90">
          <circle cx="32" cy="32" r={radius} fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth="4" />
          <motion.circle
            cx="32"
            cy="32"
            r={radius}
            fill="none"
            stroke="url(#grad)"
            strokeWidth="4"
            strokeLinecap="round"
            strokeDasharray={circ}
            initial={{ strokeDashoffset: circ }}
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
    </motion.div>
  );
};

/* ─── Skills Section ──────────────────────────────────────────────────── */
const Skills = () => {
  return (
    <motion.section
      className="w-full max-w-6xl mx-auto px-6 py-20 md:py-32"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      exit="hidden"
    >
      {/* Header */}
      <motion.div
        className="mb-16"
        variants={{ hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0 } }}
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
      </motion.div>

      {/* Programming Languages — bar cards */}
      <div className="mb-14">
        <motion.h3
          className="font-sans text-sm font-medium text-text-secondary mb-5 tracking-widest uppercase flex items-center gap-3"
          variants={{ hidden: { opacity: 0, x: -20 }, visible: { opacity: 1, x: 0 } }}
        >
          <span className="w-8 h-px bg-white/20" />
          Programming Languages
        </motion.h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {SKILLS.programming.map((skill, idx) => (
            <SkillCard key={skill.name} skill={skill} index={idx} />
          ))}
        </div>
      </div>

      {/* Frameworks — bar cards */}
      <div className="mb-14">
        <motion.h3
          className="font-sans text-sm font-medium text-text-secondary mb-5 tracking-widest uppercase flex items-center gap-3"
          variants={{ hidden: { opacity: 0, x: 20 }, visible: { opacity: 1, x: 0 } }}
        >
          <span className="w-8 h-px bg-white/20" />
          Frameworks &amp; Libraries
        </motion.h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {SKILLS.frameworks.map((skill, idx) => (
            <SkillCard key={skill.name} skill={skill} index={idx + 4} />
          ))}
        </div>
      </div>

      {/* Tools — radial badges */}
      <div>
        <motion.h3
          className="font-sans text-sm font-medium text-text-secondary mb-5 tracking-widest uppercase flex items-center gap-3"
          variants={{ hidden: { opacity: 0, y: 10 }, visible: { opacity: 1, y: 0 } }}
        >
          <span className="w-8 h-px bg-white/20" />
          Tools &amp; Platforms
        </motion.h3>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {SKILLS.tools.map((skill, idx) => (
            <RadialBadge key={skill.name} skill={skill} index={idx} />
          ))}
        </div>
      </div>
    </motion.section>
  );
};

export default Skills;
