import React, { useState, useEffect } from 'react';
import { m, AnimatePresence, useScroll, useSpring } from 'framer-motion';
import { FaSun, FaMoon } from 'react-icons/fa';
import { DEVELOPER_INFO } from '../utils/constants';
import { useTheme } from '../hooks/useTheme';

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
  const { theme, toggleTheme } = useTheme();

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
      <m.div
        className="fixed top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-accent-cyan to-accent-purple z-[200] origin-left"
        style={{ scaleX }}
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
          {/* Logo and Status */}
          <m.div
            className="flex items-center gap-4 cursor-pointer group select-none"
            onClick={() => handleTabClick('overview')}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-accent-cyan to-accent-purple flex items-center justify-center text-white font-mono font-bold text-sm shadow-[0_0_15px_rgba(0,217,255,0.4)]">
              MAB
            </div>
            
            {/* Status Badge */}
            <div className="hidden lg:flex items-center gap-2 px-3 py-1.5 rounded-full border border-glass/10 bg-glass/5 text-[11px] text-text-secondary font-medium tracking-wide">
              <span className="w-1.5 h-1.5 rounded-full bg-green-400 shadow-[0_0_8px_rgba(74,222,128,0.8)] animate-pulse" />
              Available for opportunities
            </div>

            <span className="text-text-primary font-mono font-bold text-base tracking-tight group-hover:text-accent-cyan transition-colors hidden sm:block mt-0.5">
              {DEVELOPER_INFO.name.split(' ').slice(0, 2).join(' ')}
            </span>
          </m.div>

          {/* Desktop Nav */}
          <nav className="hidden md:flex items-center gap-1 bg-glass/[0.04] border border-glass/[0.06] rounded-full px-2 py-1.5 backdrop-blur-md h-12">
            {tabs.map((tab) => (
              <m.button
                key={tab.id}
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                className="relative px-5 py-2 rounded-full text-sm font-sans tracking-wide transition-all duration-300 focus:outline-none flex items-center justify-center"
                onClick={() => handleTabClick(tab.id)}
              >
                {activeTab === tab.id && (
                  <m.div
                    layoutId="activeTabBg"
                    className="absolute inset-0 bg-glass/10 rounded-full"
                    initial={false}
                    transition={{ type: 'spring', stiffness: 400, damping: 35 }}
                  />
                )}
                <span
                  className={`relative z-10 transition-colors duration-200 mt-0.5 ${
                    activeTab === tab.id ? 'text-text-primary font-medium' : 'text-text-secondary hover:text-text-primary'
                  }`}
                >
                  {tab.label}
                </span>
                {activeTab === tab.id && (
                  <m.div
                    layoutId="activeTabDot"
                    className="absolute -bottom-0.5 left-1/2 -translate-x-1/2 w-1 h-1 bg-accent-cyan rounded-full shadow-[0_0_6px_rgba(0,217,255,1)]"
                    initial={false}
                    transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                  />
                )}
              </m.button>
            ))}
          </nav>

          {/* Desktop CTA & Theme Toggle */}
          <div className="hidden md:flex items-center gap-3">
            <m.button
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              onClick={toggleTheme}
              className="w-10 h-10 rounded-full flex items-center justify-center bg-glass/5 hover:bg-glass/10 border border-glass/10 transition-colors text-text-secondary hover:text-accent-cyan"
              aria-label="Toggle theme"
            >
              {theme === 'dark' ? <FaSun size={16} /> : <FaMoon size={16} />}
            </m.button>
            <m.a
              href={`mailto:${DEVELOPER_INFO.email}`}
              className="px-5 py-2 text-sm font-sans font-medium text-text-primary bg-gradient-to-r from-accent-cyan/20 to-accent-purple/20 border border-accent-cyan/30 rounded-full hover:border-accent-cyan hover:shadow-[0_0_20px_rgba(0,217,255,0.3)] transition-all duration-300 flex items-center justify-center h-10"
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
            >
              <span className="mt-0.5">Hire Me</span>
            </m.a>
          </div>

          {/* Mobile Hamburger */}
          <div className="md:hidden flex items-center gap-4">
            <m.button
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              onClick={toggleTheme}
              className="w-9 h-9 rounded-full flex items-center justify-center bg-glass/5 border border-glass/10 text-text-secondary"
              aria-label="Toggle theme"
            >
              {theme === 'dark' ? <FaSun size={14} /> : <FaMoon size={14} />}
            </m.button>
            <m.button
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              className="cursor-pointer p-2 flex flex-col gap-1.5 z-50 rounded-lg hover:bg-glass/5 transition-colors"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              aria-label="Toggle menu"
              aria-expanded={isMobileMenuOpen}
            >
              <span
                className={`block w-6 h-[1.5px] bg-text-primary transition-all duration-300 rounded-full ${
                  isMobileMenuOpen ? 'rotate-45 translate-y-[7px]' : ''
                }`}
              />
              <span
                className={`block w-6 h-[1.5px] bg-text-primary transition-all duration-300 rounded-full ${
                  isMobileMenuOpen ? 'opacity-0 scale-x-0' : ''
                }`}
              />
              <span
                className={`block w-6 h-[1.5px] bg-text-primary transition-all duration-300 rounded-full ${
                  isMobileMenuOpen ? '-rotate-45 -translate-y-[7px]' : ''
                }`}
              />
            </m.button>
          </div>
        </div>

        {/* Mobile Overlay */}
        <AnimatePresence>
          {isMobileMenuOpen && (
            <m.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ type: 'tween', duration: 0.25, ease: [0.4, 0, 0.2, 1] }}
              className="absolute inset-x-0 top-20 bg-primary/95 backdrop-blur-2xl border-t border-glass/[0.06] flex flex-col md:hidden px-8 pt-8 pb-10 gap-2 shadow-[0_20px_60px_rgba(0,0,0,0.3)] dark:shadow-[0_20px_60px_rgba(0,0,0,0.5)]"
            >
              {tabs.map((tab, i) => (
                <m.button
                  key={tab.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.07 + 0.05 }}
                  className={`flex items-center gap-4 py-4 px-4 rounded-xl text-left transition-all duration-200 ${
                    activeTab === tab.id
                      ? 'bg-glass/[0.08] text-text-primary'
                      : 'text-text-secondary hover:text-text-primary hover:bg-glass/[0.04]'
                  }`}
                  onClick={() => handleTabClick(tab.id)}
                >
                  <span className="font-mono text-accent-cyan text-xs w-8">0{i + 1}.</span>
                  <span className="font-sans text-xl font-medium">{tab.label}</span>
                  {activeTab === tab.id && (
                    <span className="ml-auto w-1.5 h-1.5 rounded-full bg-accent-cyan shadow-[0_0_8px_rgba(0,217,255,0.8)]" />
                  )}
                </m.button>
              ))}

              <m.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.3 }}
                className="mt-4 pt-6 border-t border-glass/[0.06]"
              >
                <m.a
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.97 }}
                  href={`mailto:${DEVELOPER_INFO.email}`}
                  className="w-full flex items-center justify-center gap-2 px-6 py-3.5 bg-gradient-to-r from-accent-cyan/20 to-accent-purple/20 border border-accent-cyan/30 rounded-full text-text-primary font-sans font-medium hover:border-accent-cyan transition-all duration-300"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  Hire Me
                </m.a>
              </m.div>
            </m.div>
          )}
        </AnimatePresence>
      </m.header>
    </>
  );
};

export default Navigation;
