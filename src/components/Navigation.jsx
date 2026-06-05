import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence, useScroll, useSpring } from 'framer-motion';
import { DEVELOPER_INFO } from '../utils/constants';

const tabs = [
  { id: 'overview', label: 'Overview' },
  { id: 'projects', label: 'Work' },
  { id: 'contact', label: 'Contact' },
];

const Navigation = ({ activeTab, setActiveTab }) => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, { stiffness: 100, damping: 30, restDelta: 0.001 });

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Close mobile menu on tab change
  const handleTabClick = (id) => {
    setActiveTab(id);
    setIsMobileMenuOpen(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <>
      {/* Scroll Progress Bar */}
      <motion.div
        className="fixed top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-accent-cyan to-accent-purple z-[200] origin-left"
        style={{ scaleX }}
      />

      <header
        className={`fixed top-0 w-full z-[100] h-20 px-6 md:px-12 flex items-center justify-between transition-all duration-500 ${
          scrolled
            ? 'bg-primary/80 backdrop-blur-2xl border-b border-white/[0.06] shadow-[0_4px_30px_rgba(0,0,0,0.4)]'
            : 'bg-transparent backdrop-blur-xl border-b border-white/[0.03]'
        }`}
      >
        {/* Logo */}
        <motion.div
          className="flex items-center gap-3 cursor-pointer group select-none"
          onClick={() => handleTabClick('overview')}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-accent-cyan to-accent-purple flex items-center justify-center text-primary font-mono font-bold text-sm shadow-[0_0_15px_rgba(0,217,255,0.4)]">
            AB
          </div>
          <span className="text-text-primary font-mono font-bold text-base tracking-tight group-hover:text-white transition-colors hidden sm:block">
            {DEVELOPER_INFO.name.split(' ').slice(0, 2).join(' ')}
          </span>
        </motion.div>

        {/* Desktop Nav */}
        <nav className="hidden md:flex items-center gap-1 bg-white/[0.04] border border-white/[0.06] rounded-full px-2 py-1.5 backdrop-blur-md">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              className="relative px-5 py-2 rounded-full text-sm font-sans tracking-wide transition-all duration-300 focus:outline-none"
              onClick={() => handleTabClick(tab.id)}
            >
              {activeTab === tab.id && (
                <motion.div
                  layoutId="activeTabBg"
                  className="absolute inset-0 bg-white/10 rounded-full"
                  initial={false}
                  transition={{ type: 'spring', stiffness: 400, damping: 35 }}
                />
              )}
              <span
                className={`relative z-10 transition-colors duration-200 ${
                  activeTab === tab.id ? 'text-white font-medium' : 'text-text-secondary hover:text-white'
                }`}
              >
                {tab.label}
              </span>
              {activeTab === tab.id && (
                <motion.div
                  layoutId="activeTabDot"
                  className="absolute -bottom-0.5 left-1/2 -translate-x-1/2 w-1 h-1 bg-accent-cyan rounded-full shadow-[0_0_6px_rgba(0,217,255,1)]"
                  initial={false}
                  transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                />
              )}
            </button>
          ))}
        </nav>

        {/* Desktop CTA */}
        <div className="hidden md:flex items-center gap-3">
          <motion.a
            href={`mailto:${DEVELOPER_INFO.email}`}
            className="px-5 py-2 text-sm font-sans font-medium text-white bg-gradient-to-r from-accent-cyan/20 to-accent-purple/20 border border-accent-cyan/30 rounded-full hover:border-accent-cyan hover:shadow-[0_0_20px_rgba(0,217,255,0.3)] transition-all duration-300"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            Hire Me
          </motion.a>
        </div>

        {/* Mobile Hamburger */}
        <button
          className="md:hidden cursor-pointer p-2.5 flex flex-col gap-1.5 z-50 rounded-lg hover:bg-white/5 transition-colors"
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          aria-label="Toggle menu"
          aria-expanded={isMobileMenuOpen}
        >
          <span
            className={`block w-6 h-[1.5px] bg-white transition-all duration-300 rounded-full ${
              isMobileMenuOpen ? 'rotate-45 translate-y-[7px]' : ''
            }`}
          />
          <span
            className={`block w-6 h-[1.5px] bg-white transition-all duration-300 rounded-full ${
              isMobileMenuOpen ? 'opacity-0 scale-x-0' : ''
            }`}
          />
          <span
            className={`block w-6 h-[1.5px] bg-white transition-all duration-300 rounded-full ${
              isMobileMenuOpen ? '-rotate-45 -translate-y-[7px]' : ''
            }`}
          />
        </button>

        {/* Mobile Overlay */}
        <AnimatePresence>
          {isMobileMenuOpen && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ type: 'tween', duration: 0.25, ease: [0.4, 0, 0.2, 1] }}
              className="absolute inset-x-0 top-20 bg-primary/95 backdrop-blur-2xl border-t border-white/[0.06] flex flex-col md:hidden px-8 pt-8 pb-10 gap-2 shadow-[0_20px_60px_rgba(0,0,0,0.5)]"
            >
              {tabs.map((tab, i) => (
                <motion.button
                  key={tab.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.07 + 0.05 }}
                  className={`flex items-center gap-4 py-4 px-4 rounded-xl text-left transition-all duration-200 ${
                    activeTab === tab.id
                      ? 'bg-white/[0.08] text-white'
                      : 'text-text-secondary hover:text-white hover:bg-white/[0.04]'
                  }`}
                  onClick={() => handleTabClick(tab.id)}
                >
                  <span className="font-mono text-accent-cyan text-xs w-8">0{i + 1}.</span>
                  <span className="font-sans text-xl font-medium">{tab.label}</span>
                  {activeTab === tab.id && (
                    <span className="ml-auto w-1.5 h-1.5 rounded-full bg-accent-cyan shadow-[0_0_8px_rgba(0,217,255,0.8)]" />
                  )}
                </motion.button>
              ))}

              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.3 }}
                className="mt-4 pt-6 border-t border-white/[0.06]"
              >
                <a
                  href={`mailto:${DEVELOPER_INFO.email}`}
                  className="w-full flex items-center justify-center gap-2 px-6 py-3.5 bg-gradient-to-r from-accent-cyan/20 to-accent-purple/20 border border-accent-cyan/30 rounded-full text-white font-sans font-medium hover:border-accent-cyan transition-all duration-300"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  Hire Me
                </a>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </header>
    </>
  );
};

export default Navigation;
