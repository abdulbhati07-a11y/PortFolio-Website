import React, { useState, useEffect } from 'react';
import { m, AnimatePresence, useScroll, useSpring } from 'framer-motion';
import { FaSun, FaMoon } from 'react-icons/fa';
import { DEVELOPER_INFO } from '../utils/constants';
import { useTheme } from '../hooks/useTheme';

const links = [
  { id: 'about', label: 'About' },
  { id: 'skills', label: 'Skills' },
  { id: 'projects', label: 'Work' },
  { id: 'journey', label: 'Journey' },
  { id: 'writing', label: 'Writing' },
  { id: 'certifications', label: 'Credentials' },
  { id: 'contact', label: 'Contact' },
];

const Navigation = ({ scrollTo }) => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [activeSection, setActiveSection] = useState('');
  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, { stiffness: 100, damping: 30, restDelta: 0.001 });
  const { theme, toggleTheme } = useTheme();

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Scrollspy: highlight the section currently in view
  useEffect(() => {
    const sections = links
      .map(({ id }) => document.getElementById(id))
      .filter(Boolean);
    if (!sections.length) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) setActiveSection(entry.target.id);
        });
      },
      { rootMargin: '-40% 0px -55% 0px' }
    );
    sections.forEach((s) => observer.observe(s));
    return () => observer.disconnect();
  }, []);

  const handleLinkClick = (id) => {
    setIsMobileMenuOpen(false);
    scrollTo(`#${id}`);
  };

  return (
    <>
      {/* Scroll progress bar */}
      <m.div
        className="fixed top-0 left-0 right-0 h-[2px] bg-accent-cyan z-[200] origin-left"
        style={{ scaleX }}
        aria-hidden="true"
      />

      <m.header
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.8 }}
        className={`fixed top-0 w-full z-[100] transition-all duration-500 ${
          scrolled
            ? 'bg-primary/80 backdrop-blur-2xl border-b border-glass/[0.06] shadow-[0_4px_30px_rgba(0,0,0,0.1)] dark:shadow-[0_4px_30px_rgba(0,0,0,0.4)]'
            : 'bg-transparent backdrop-blur-xl border-b border-glass/[0.03]'
        }`}
      >
        <div className="max-w-screen-2xl mx-auto h-20 px-4 md:px-8 lg:px-16 2xl:px-0 flex items-center justify-between">
          {/* Logo + status */}
          <button
            className="flex items-center gap-4 cursor-pointer group select-none bg-transparent border-0"
            onClick={() => scrollTo('#hero')}
            aria-label="Back to top"
          >
            <div className="w-8 h-8 rounded-lg bg-accent-cyan flex items-center justify-center text-slate-900 font-mono font-bold text-xs shadow-[0_0_15px_rgba(0,217,255,0.4)]">
              MAB
            </div>
            <div className="hidden lg:flex items-center gap-2 px-3 py-1.5 rounded-full bg-glass/5 text-[11px] text-text-secondary font-medium tracking-wide">
              <span className="w-1.5 h-1.5 rounded-full bg-accent-emerald shadow-[0_0_8px_rgba(74,222,128,0.8)] animate-pulse" />
              Available for opportunities
            </div>
            <span className="text-text-primary font-mono font-bold text-base tracking-tight group-hover:text-accent-cyan transition-colors hidden sm:block">
              {DEVELOPER_INFO.name.split(' ').slice(0, 2).join(' ')}
            </span>
          </button>

          {/* Desktop nav */}
          <nav
            aria-label="Primary"
            className="hidden md:flex items-center gap-1 bg-glass/[0.04] rounded-full px-2 py-1.5 backdrop-blur-md h-12"
          >
            {links.map((link) => (
              <button
                key={link.id}
                className="relative px-4 py-2 rounded-full text-sm font-sans tracking-wide transition-all duration-300 flex items-center justify-center"
                onClick={() => handleLinkClick(link.id)}
                aria-current={activeSection === link.id ? 'true' : undefined}
              >
                {activeSection === link.id && (
                  <m.div
                    layoutId="activeLinkBg"
                    className="absolute inset-0 bg-glass/10 rounded-full"
                    initial={false}
                    transition={{ type: 'spring', stiffness: 400, damping: 35 }}
                  />
                )}
                <span
                  className={`relative z-10 transition-colors duration-200 ${
                    activeSection === link.id
                      ? 'text-text-primary font-medium'
                      : 'text-text-secondary hover:text-text-primary'
                  }`}
                >
                  {link.label}
                </span>
              </button>
            ))}
          </nav>

          {/* Desktop actions */}
          <div className="hidden md:flex items-center gap-3">
            <m.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={toggleTheme}
              className="w-10 h-10 rounded-full flex items-center justify-center bg-glass/5 hover:bg-glass/10 transition-colors text-text-secondary hover:text-accent-cyan"
              aria-label={theme === 'dark' ? 'Switch to light theme' : 'Switch to dark theme'}
            >
              {theme === 'dark' ? <FaSun size={16} /> : <FaMoon size={16} />}
            </m.button>
            <m.a
              href={`mailto:${DEVELOPER_INFO.email}`}
              className="px-5 py-2 text-sm font-sans font-medium text-text-primary bg-accent-cyan/20 border border-accent-cyan/30 rounded-full hover:border-accent-cyan hover:shadow-[0_0_20px_rgba(0,217,255,0.3)] transition-all duration-300 flex items-center justify-center h-10"
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
            >
              Hire Me
            </m.a>
          </div>

          {/* Mobile actions */}
          <div className="md:hidden flex items-center gap-4">
            <button
              onClick={toggleTheme}
              className="w-9 h-9 rounded-full flex items-center justify-center bg-glass/5 text-text-secondary"
              aria-label={theme === 'dark' ? 'Switch to light theme' : 'Switch to dark theme'}
            >
              {theme === 'dark' ? <FaSun size={14} /> : <FaMoon size={14} />}
            </button>
            <button
              className="cursor-pointer p-2 flex flex-col gap-1.5 z-50 rounded-lg hover:bg-glass/5 transition-colors"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              aria-label="Toggle menu"
              aria-expanded={isMobileMenuOpen}
            >
              <span className={`block w-6 h-[1.5px] bg-text-primary transition-all duration-300 rounded-full ${isMobileMenuOpen ? 'rotate-45 translate-y-[7px]' : ''}`} />
              <span className={`block w-6 h-[1.5px] bg-text-primary transition-all duration-300 rounded-full ${isMobileMenuOpen ? 'opacity-0 scale-x-0' : ''}`} />
              <span className={`block w-6 h-[1.5px] bg-text-primary transition-all duration-300 rounded-full ${isMobileMenuOpen ? '-rotate-45 -translate-y-[7px]' : ''}`} />
            </button>
          </div>
        </div>

        {/* Mobile overlay */}
        <AnimatePresence>
          {isMobileMenuOpen && (
            <m.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ type: 'tween', duration: 0.25, ease: [0.4, 0, 0.2, 1] }}
              className="absolute inset-x-0 top-20 bg-primary/95 backdrop-blur-2xl border-t border-glass/[0.06] flex flex-col md:hidden px-8 pt-8 pb-10 gap-2 shadow-[0_20px_60px_rgba(0,0,0,0.3)]"
            >
              {links.map((link, i) => (
                <m.button
                  key={link.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.06 + 0.05 }}
                  className={`flex items-center gap-4 py-4 px-4 rounded-xl text-left transition-all duration-200 ${
                    activeSection === link.id
                      ? 'bg-glass/[0.08] text-text-primary'
                      : 'text-text-secondary hover:text-text-primary hover:bg-glass/[0.04]'
                  }`}
                  onClick={() => handleLinkClick(link.id)}
                >
                  <span className="font-mono text-accent-cyan text-xs w-8">0{i + 1}.</span>
                  <span className="font-sans text-xl font-medium">{link.label}</span>
                  {activeSection === link.id && (
                    <span className="ml-auto w-1.5 h-1.5 rounded-full bg-accent-cyan shadow-[0_0_8px_rgba(0,217,255,0.8)]" />
                  )}
                </m.button>
              ))}
              <div className="mt-4 pt-6 border-t border-glass/[0.06]">
                <a
                  href={`mailto:${DEVELOPER_INFO.email}`}
                  className="w-full flex items-center justify-center gap-2 px-6 py-3.5 bg-accent-cyan/20 border border-accent-cyan/30 rounded-full text-text-primary font-sans font-medium hover:border-accent-cyan transition-all duration-300"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  Hire Me
                </a>
              </div>
            </m.div>
          )}
        </AnimatePresence>
      </m.header>
    </>
  );
};

export default Navigation;
