import React from 'react';
import { m } from 'framer-motion';
import { FaExternalLinkAlt, FaCertificate, FaCheckCircle } from 'react-icons/fa';
import { CERTIFICATES } from '../utils/constants';
import SectionHeading from './ui/SectionHeading';
import Reveal from './ui/Reveal';

const CertCard = ({ cert, index }) => (
  <Reveal delay={index * 0.1}>
    <m.a
      href={encodeURI(cert.file)}
      target="_blank"
      rel="noopener noreferrer"
      whileHover={{ y: -6 }}
      aria-label={`View ${cert.title} certificate (opens PDF in a new tab)`}
      className="glass-card glass-card-hover rounded-3xl p-6 sm:p-8 flex flex-col group cursor-pointer relative overflow-hidden h-full transition-all duration-500 hover:shadow-[0_20px_50px_rgba(0,0,0,0.4)]"
    >
      <div className={`absolute inset-0 ${cert.gradient} opacity-0 group-hover:opacity-100 transition-opacity duration-500 z-0`} />

      <div className="relative z-10 flex flex-col h-full">
        {/* Page-1 preview of the actual certificate PDF */}
        {cert.thumbnail ? (
          <div className="relative w-full h-40 sm:h-48 rounded-2xl overflow-hidden border border-glass/10 mb-6 bg-white">
            <img
              src={cert.thumbnail}
              alt=""
              className="absolute inset-0 w-full h-full object-cover object-top transition-transform duration-700 group-hover:scale-[1.03]"
              loading="lazy"
            />
            <span className="absolute top-3 right-3 inline-flex items-center gap-1.5 font-mono text-[10px] uppercase tracking-wider px-2.5 py-1 rounded-full border border-accent-emerald/40 text-accent-emerald bg-white/85 backdrop-blur-sm">
              <FaCheckCircle size={9} aria-hidden="true" /> Verified
            </span>
          </div>
        ) : (
          <div className="flex items-start justify-between mb-6">
            <div className="w-14 h-14 rounded-2xl bg-glass/[0.04] border border-glass/10 flex items-center justify-center text-3xl" aria-hidden="true">
              {cert.icon}
            </div>
            <span className="inline-flex items-center gap-1.5 font-mono text-[10px] uppercase tracking-wider px-2.5 py-1 rounded-full border border-accent-emerald/30 text-accent-emerald bg-accent-emerald/10">
              <FaCheckCircle size={9} aria-hidden="true" /> Verified
            </span>
          </div>
        )}

        <h3 className="font-display text-lg md:text-xl font-bold text-text-primary mb-2 leading-snug group-hover:text-accent-cyan transition-colors">
          {cert.title}
        </h3>

        <div className="flex items-center gap-2 text-text-secondary mb-6">
          <FaCertificate size={12} className="text-accent-emerald" aria-hidden="true" />
          <span className="font-sans text-sm">{cert.issuer}</span>
          <span className="w-1 h-1 rounded-full bg-glass/20" aria-hidden="true" />
          <span className="font-mono text-xs">{cert.date}</span>
        </div>

        <div className="flex flex-wrap gap-2 mb-8">
          {cert.skills.map((skill) => (
            <span key={skill} className="font-mono text-[10px] uppercase tracking-wider px-2.5 py-1 rounded-full border border-glass/10 text-text-secondary bg-glass/[0.02]">
              {skill}
            </span>
          ))}
        </div>

        <div className="flex items-center justify-between mt-auto pt-5 border-t border-glass/[0.06]">
          <span className="font-sans text-sm text-text-secondary group-hover:text-text-primary transition-colors">
            View Certificate
          </span>
          <div className="w-9 h-9 rounded-full bg-glass/[0.04] border border-glass/10 flex items-center justify-center text-text-secondary group-hover:bg-accent-cyan group-hover:text-slate-900 transition-all duration-300 group-hover:rotate-45">
            <FaExternalLinkAlt size={12} aria-hidden="true" />
          </div>
        </div>
      </div>
    </m.a>
  </Reveal>
);

const Certifications = () => (
  <section
    id="certifications"
    aria-label="Certifications"
    className="w-full max-w-screen-2xl mx-auto px-4 md:px-8 lg:px-16 2xl:px-0 py-20 md:py-32"
  >
    <SectionHeading
      index="06"
      eyebrow="Credentials"
      title="Certifications"
      accent="& Courses"
      subtitle="Verified certificates from the courses that shaped my foundation in Data Science and Python."
      className="mb-16"
    />

    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto">
      {CERTIFICATES.map((cert, i) => (
        <CertCard key={cert.id} cert={cert} index={i} />
      ))}
    </div>
  </section>
);

export default Certifications;
