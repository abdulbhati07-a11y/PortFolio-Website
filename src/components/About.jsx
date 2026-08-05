import React from 'react';
import { FaCode, FaBrain, FaRocket, FaDatabase } from 'react-icons/fa';
import { DEVELOPER_INFO, PRINCIPLES } from '../utils/constants';
import Reveal from './ui/Reveal';
import SectionHeading from './ui/SectionHeading';

const highlights = [
  { icon: FaCode, label: '1.5+ Years Experience', color: 'text-accent-cyan', bg: 'bg-accent-cyan/10' },
  { icon: FaBrain, label: 'AI/ML Specialization', color: 'text-accent-emerald', bg: 'bg-accent-emerald/10' },
  { icon: FaRocket, label: '4th Semester CS Student', color: 'text-accent-emerald', bg: 'bg-accent-emerald/10' },
  { icon: FaDatabase, label: 'Data Science Track', color: 'text-accent-emerald', bg: 'bg-accent-emerald/10' },
];

const About = () => {
  return (
    <section
      id="about"
      aria-label="About me"
      className="w-full max-w-screen-2xl mx-auto px-4 md:px-8 lg:px-16 2xl:px-0 py-20 md:py-32"
    >
      <div className="max-w-5xl mx-auto">
        <SectionHeading index="01" eyebrow="Who I am" title="About" accent="Me" className="mb-10" />

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-16">
          {/* Profile card */}
          <Reveal delay={0.1} className="lg:col-span-1">
            <div className="glass-card glass-card-hover rounded-3xl p-6 flex flex-col items-center text-center gap-4 h-full">
              <div className="relative w-32 h-32 rounded-full flex items-center justify-center overflow-hidden border-2 border-glass/10 bg-secondary">
                <div className="absolute inset-0 bg-accent-cyan/20 flex items-center justify-center font-mono font-bold text-4xl text-text-primary">
                  AB
                </div>
                <div className="absolute -bottom-1 -right-1 w-7 h-7 bg-accent-emerald rounded-full border-2 border-primary flex items-center justify-center z-20">
                  <div className="w-2 h-2 rounded-full bg-white animate-pulse" />
                </div>
              </div>

              <div>
                <h3 className="font-display font-bold text-text-primary text-lg tracking-tight">{DEVELOPER_INFO.name}</h3>
                <p className="font-mono text-accent-cyan text-xs tracking-widest mt-1">{DEVELOPER_INFO.role}</p>
              </div>

              <div className="w-full section-divider" />

              <dl className="flex flex-col gap-2.5 w-full text-left">
                <div className="flex justify-between items-center">
                  <dt className="text-text-secondary text-xs">Location</dt>
                  <dd className="text-text-primary text-xs font-medium">Pakistan 🇵🇰</dd>
                </div>
                <div className="flex justify-between items-center">
                  <dt className="text-text-secondary text-xs">Availability</dt>
                  <dd className="text-accent-emerald text-xs font-medium flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-accent-emerald animate-pulse" />
                    Open to work
                  </dd>
                </div>
                <div className="flex justify-between items-center">
                  <dt className="text-text-secondary text-xs">Education</dt>
                  <dd className="text-text-primary text-xs font-medium">4th Sem CS</dd>
                </div>
              </dl>
            </div>
          </Reveal>

          {/* Bio + highlights */}
          <Reveal delay={0.2} className="lg:col-span-2">
            <div className="glass-card glass-card-hover rounded-3xl p-5 sm:p-8 flex flex-col gap-6 h-full">
              <p className="font-sans text-text-secondary text-base md:text-lg leading-relaxed font-light">
                {DEVELOPER_INFO.bio}
              </p>
              <p className="font-sans text-text-secondary text-base md:text-lg leading-relaxed font-light">
                I bridge the gap between intelligent backend systems and beautiful frontends — from
                Python AI/ML pipelines and Flask APIs to responsive React interfaces and C++ algorithm
                implementations.
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {highlights.map(({ icon: Icon, label, color, bg }) => (
                  <div
                    key={label}
                    className="flex items-center gap-3 p-3 rounded-xl bg-glass/[0.03] border border-glass/[0.05]"
                  >
                    <div className={`w-8 h-8 rounded-lg ${bg} flex items-center justify-center flex-shrink-0`}>
                      <Icon className={color} size={15} aria-hidden="true" />
                    </div>
                    <span className="text-text-primary font-sans text-sm font-medium">{label}</span>
                  </div>
                ))}
              </div>
            </div>
          </Reveal>
        </div>

        {/* How I think — engineering philosophy */}
        <Reveal className="mb-8">
          <h3 className="font-sans text-sm font-medium text-text-secondary tracking-widest uppercase flex items-center gap-3">
            <span className="w-8 h-px bg-glass/20" />
            How I think
          </h3>
        </Reveal>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {PRINCIPLES.map((principle, i) => (
            <Reveal key={principle.title} delay={i * 0.08}>
              <div className="glass-card glass-card-hover rounded-2xl p-6 h-full group hover:-translate-y-1 transition-transform duration-500">
                <div className="flex items-center gap-3 mb-3">
                  <span className="text-2xl" aria-hidden="true">{principle.icon}</span>
                  <h4 className="font-display text-base font-bold text-text-primary tracking-tight group-hover:text-accent-cyan transition-colors">
                    {principle.title}
                  </h4>
                </div>
                <p className="font-sans text-text-secondary text-sm leading-relaxed font-light">
                  {principle.text}
                </p>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
};

export default About;
