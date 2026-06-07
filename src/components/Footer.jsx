import React from 'react';
import { m } from 'framer-motion';
import { FaGithub, FaLinkedin, FaEnvelope, FaHeart, FaArrowUp } from 'react-icons/fa';
import { DEVELOPER_INFO } from '../utils/constants';

const Footer = ({ setActiveTab }) => {
  const currentYear = new Date().getFullYear();
  const displayYear = currentYear > 2026 ? `2026–${currentYear}` : '2026';

  const navLinks = [
    { id: 'overview', label: 'Overview' },
    { id: 'projects', label: 'Work' },
    { id: 'contact', label: 'Contact' },
  ];

  const socialLinks = [
    { icon: FaGithub, href: DEVELOPER_INFO.github, label: 'GitHub', color: '#ffffff' },
    { icon: FaLinkedin, href: DEVELOPER_INFO.linkedin, label: 'LinkedIn', color: '#0A66C2' },
    { icon: FaEnvelope, href: `mailto:${DEVELOPER_INFO.email}`, label: 'Email', color: '#00D9FF' },
  ];

  return (
    <footer className="w-full border-t border-white/[0.05] bg-primary/60 backdrop-blur-xl">
      {/* Top section */}
      <div className="max-w-screen-2xl mx-auto px-4 md:px-8 lg:px-16 2xl:px-0 py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-10 items-start">

          {/* Brand */}
          <div className="flex flex-col gap-4 text-center md:text-left">
            <div className="flex items-center justify-center md:justify-start gap-3">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-accent-cyan to-accent-purple flex items-center justify-center text-primary font-mono font-bold text-sm shadow-[0_0_15px_rgba(0,217,255,0.3)]">
                AB
              </div>
              <span className="font-mono font-bold text-white text-sm tracking-tight">{DEVELOPER_INFO.name}</span>
            </div>
            <p className="font-sans text-text-secondary text-sm leading-relaxed font-light max-w-xs mx-auto md:mx-0">
              {DEVELOPER_INFO.tagline}
            </p>
            {/* Social icons */}
            <div className="flex justify-center md:justify-start gap-3 mt-2">
              {socialLinks.map(({ icon: Icon, href, label, color }) => (
                <m.a
                  key={label}
                  href={href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={label}
                  whileHover={{ y: -2, scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  className="w-9 h-9 rounded-full border border-white/10 flex items-center justify-center text-text-secondary hover:text-white hover:border-white/30 transition-all duration-300"
                  style={{ '--hover-color': color }}
                >
                  <Icon size={15} />
                </m.a>
              ))}
            </div>
          </div>

          {/* Navigation */}
          <div className="text-center md:text-left">
            <h4 className="font-mono text-xs font-bold text-text-secondary tracking-widest uppercase mb-5">Navigation</h4>
            <ul className="flex flex-col gap-3 items-center md:items-start">
              {navLinks.map(({ id, label }) => (
                <li key={id}>
                  <button
                    onClick={() => { setActiveTab(id); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
                    className="font-sans text-sm text-text-secondary hover:text-white transition-colors duration-300 flex items-center gap-2 group"
                  >
                    <span className="w-0 h-px bg-accent-cyan transition-all duration-300 group-hover:w-4" />
                    {label}
                  </button>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div className="text-center md:text-left">
            <h4 className="font-mono text-xs font-bold text-text-secondary tracking-widest uppercase mb-5">Get In Touch</h4>
            <div className="flex flex-col gap-3 items-center md:items-start">
              <a href={`mailto:${DEVELOPER_INFO.email}`} className="font-sans text-sm text-text-secondary hover:text-accent-cyan transition-colors duration-300 break-all">
                {DEVELOPER_INFO.email}
              </a>
              <div className="flex items-center justify-center md:justify-start gap-2 mt-1">
                <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
                <span className="text-text-secondary text-xs">Open to opportunities</span>
              </div>
              <m.a
                href={DEVELOPER_INFO.resume}
                target="_blank"
                rel="noopener noreferrer"
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                className="mt-2 inline-flex items-center gap-2 px-4 py-2.5 bg-white/5 border border-white/10 rounded-full text-white text-xs font-sans font-medium hover:border-white/30 hover:bg-white/10 transition-all duration-300 w-fit mx-auto md:mx-0"
              >
                View Resume →
              </m.a>
            </div>
          </div>
        </div>
      </div>

      {/* Divider */}
      <div className="section-divider" />

      {/* Bottom bar */}
      <div className="max-w-screen-2xl mx-auto px-4 md:px-8 lg:px-16 2xl:px-0 py-5 flex flex-col sm:flex-row items-center justify-between gap-3 text-center sm:text-left">
        <p className="font-sans text-text-secondary text-xs flex flex-wrap items-center justify-center sm:justify-start gap-1.5">
          © {displayYear} {DEVELOPER_INFO.name}. Built with
          <FaHeart size={10} className="text-red-400 animate-pulse inline-block" />
          using React &amp; Tailwind CSS.
        </p>

        <m.button
          onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
          whileHover={{ y: -2, scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          aria-label="Back to top"
          className="w-8 h-8 rounded-full border border-white/10 flex items-center justify-center text-text-secondary hover:text-white hover:border-accent-cyan hover:shadow-[0_0_12px_rgba(0,217,255,0.3)] hover:bg-accent-cyan/10 transition-all duration-300"
        >
          <FaArrowUp size={12} />
        </m.button>
      </div>
    </footer>
  );
};

export default Footer;
