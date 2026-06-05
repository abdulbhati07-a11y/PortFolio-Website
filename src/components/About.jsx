import React from 'react';
import { motion } from 'framer-motion';
import { FaCode, FaBrain, FaRocket, FaDatabase } from 'react-icons/fa';
import { DEVELOPER_INFO, TIMELINE } from '../utils/constants';

const containerVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.12 } },
};

const itemVariants = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.8, ease: [0.16, 1, 0.3, 1] } },
};

const highlights = [
  { icon: FaCode, label: '1.5+ Years Experience', color: 'text-accent-cyan', bg: 'bg-accent-cyan/10' },
  { icon: FaBrain, label: 'AI/ML Specialization', color: 'text-accent-purple', bg: 'bg-accent-purple/10' },
  { icon: FaRocket, label: '4th Semester CS Student', color: 'text-green-400', bg: 'bg-green-400/10' },
  { icon: FaDatabase, label: 'Data Science Track', color: 'text-orange-400', bg: 'bg-orange-400/10' },
];

const skills = ['Python', 'C++', 'Data Science', 'AI/ML', 'Full Stack', 'Web Dev', 'SQL', 'React', 'Flask'];

const About = ({ onSkillClick }) => {
  return (
    <motion.section
      className="w-full max-w-5xl mx-auto px-6 py-20 md:py-32"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      exit="hidden"
    >
      {/* ── About Me ───────────────────────────────────────────────────── */}
      <motion.div variants={itemVariants} className="mb-28">
        <div className="flex items-center gap-3 mb-6">
          <span className="font-mono text-accent-cyan text-sm tracking-widest">01.</span>
          <div className="flex-1 h-px bg-white/[0.06]" />
        </div>

        <h2 className="font-sans text-4xl md:text-5xl font-bold text-white mb-10 tracking-tighter">
          About <span className="text-gradient">Me</span>
        </h2>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Profile card */}
          <div className="lg:col-span-1">
            <div className="glass-card rounded-3xl p-6 flex flex-col items-center text-center gap-4 h-full">
              {/* Avatar placeholder */}
              <div className="relative w-32 h-32 rounded-full bg-gradient-to-br from-accent-cyan/30 to-accent-purple/30 border-2 border-white/10 flex items-center justify-center overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-accent-cyan/20 to-accent-purple/20 animate-gradient" />
                <span className="font-mono font-bold text-4xl text-white/80 relative z-10">AB</span>
                <div className="absolute -bottom-1 -right-1 w-7 h-7 bg-green-400 rounded-full border-2 border-primary flex items-center justify-center">
                  <div className="w-2 h-2 rounded-full bg-white animate-pulse" />
                </div>
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
          </div>

          {/* Bio + highlights */}
          <div className="lg:col-span-2 glass-card rounded-3xl p-8 flex flex-col gap-6">
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
          </div>
        </div>
      </motion.div>

      {/* ── Timeline ────────────────────────────────────────────────────── */}
      <motion.div variants={itemVariants} className="mb-28">
        <div className="flex items-center gap-3 mb-6">
          <span className="font-mono text-accent-cyan text-sm tracking-widest">02.</span>
          <div className="flex-1 h-px bg-white/[0.06]" />
        </div>

        <h2 className="font-sans text-4xl md:text-5xl font-bold text-white mb-12 tracking-tighter">
          My <span className="text-gradient">Journey</span>
        </h2>

        <div className="relative">
          {/* Vertical line */}
          <div className="absolute left-[7px] top-2 bottom-2 w-px bg-gradient-to-b from-accent-cyan via-accent-purple to-accent-cyan opacity-30" />

          <div className="space-y-10 ml-8">
            {TIMELINE.map((item, idx) => (
              <motion.div
                key={idx}
                className="relative group"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: idx * 0.1 + 0.3, duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
              >
                {/* Dot */}
                <div
                  className={`absolute -left-[37px] top-2 w-3 h-3 rounded-full ring-4 ring-primary transition-all duration-300 group-hover:scale-125 ${
                    item.color === 'accent-cyan'
                      ? 'bg-accent-cyan shadow-[0_0_12px_rgba(0,217,255,0.8)]'
                      : item.color === 'accent-purple'
                      ? 'bg-accent-purple shadow-[0_0_12px_rgba(168,85,247,0.8)]'
                      : 'bg-green-400 shadow-[0_0_12px_rgba(74,222,128,0.8)]'
                  }`}
                />

                <div className="glass-card rounded-2xl p-6 group-hover:border-white/[0.1] transition-all duration-300">
                  <div className="flex items-start justify-between mb-2 gap-4 flex-wrap">
                    <h3 className="font-sans text-lg font-semibold text-white tracking-tight">{item.title}</h3>
                    <div className="flex items-center gap-2 flex-shrink-0">
                      <span className="font-mono text-xs text-text-secondary border border-white/10 px-2.5 py-1 rounded-full">
                        {item.year}
                      </span>
                      <span
                        className={`font-mono text-xs px-2.5 py-1 rounded-full border ${
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
              </motion.div>
            ))}
          </div>
        </div>
      </motion.div>

      {/* ── Core Competencies ───────────────────────────────────────────── */}
      <motion.div variants={itemVariants}>
        <div className="flex items-center gap-3 mb-6">
          <span className="font-mono text-accent-cyan text-sm tracking-widest">03.</span>
          <div className="flex-1 h-px bg-white/[0.06]" />
        </div>

        <h2 className="font-sans text-4xl md:text-5xl font-bold text-white mb-10 tracking-tighter">
          Core <span className="text-gradient">Competencies</span>
        </h2>

        <div className="flex flex-wrap gap-3">
          {skills.map((skill, idx) => (
            <motion.button
              key={idx}
              onClick={() => onSkillClick && onSkillClick(skill)}
              className="px-6 py-3 rounded-full border border-white/10 text-text-primary font-sans font-medium hover:border-accent-cyan hover:text-accent-cyan hover:shadow-[0_0_20px_rgba(0,217,255,0.2)] hover:bg-accent-cyan/5 transition-all duration-300"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: idx * 0.06 + 0.5 }}
            >
              {skill}
            </motion.button>
          ))}
        </div>
      </motion.div>
    </motion.section>
  );
};

export default About;
