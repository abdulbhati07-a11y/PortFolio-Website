import React, { useState, useEffect, Suspense, lazy } from 'react';
import Lenis from '@studio-freight/lenis';
import { AnimatePresence, m, LazyMotion, domAnimation } from 'framer-motion';
import Navigation from './components/Navigation';
import Hero from './components/Hero';
import About from './components/About';
import Skills from './components/Skills';
import Contact from './components/Contact';
import Footer from './components/Footer';

const Projects = lazy(() => import('./components/Projects'));

import CustomCursor from './components/CustomCursor';
import { DEVELOPER_INFO } from './utils/constants';

/* ─── Page transition config ──────────────────────────────────────────── */
const pageVariants = {
  initial: { opacity: 0, y: 16 },
  enter: { opacity: 1, y: 0, transition: { duration: 0.55, ease: [0.16, 1, 0.3, 1] } },
  exit: { opacity: 0, y: -12, transition: { duration: 0.3, ease: [0.4, 0, 1, 1] } },
};

/* ─── Loading Screen ──────────────────────────────────────────────────── */
const LoadingScreen = ({ onComplete }) => {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    // Real mount-based load state
    const handleLoad = () => {
      setProgress(100);
      setTimeout(onComplete, 300);
    };

    if (document.readyState === 'complete') {
      handleLoad();
    } else {
      window.addEventListener('load', handleLoad);
      return () => window.removeEventListener('load', handleLoad);
    }
  }, [onComplete]);

  return (
    <m.div
      className="fixed inset-0 z-[999] bg-primary flex flex-col items-center justify-center gap-8"
      exit={{ opacity: 0, scale: 1.02 }}
      transition={{ duration: 0.5, ease: [0.4, 0, 0.2, 1] }}
    >
      {/* Logo */}
      <div className="flex flex-col items-center gap-4">
        <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-accent-cyan to-accent-purple flex items-center justify-center text-primary font-mono font-bold text-2xl shadow-[0_0_40px_rgba(0,217,255,0.4)] animate-pulse-glow">
          AB
        </div>
        <div className="font-mono text-text-secondary text-xs tracking-[0.4em] uppercase">
          Portfolio
        </div>
      </div>

      {/* Progress bar */}
      <div className="w-48 h-[2px] bg-white/[0.06] rounded-full overflow-hidden">
        <m.div
          className="h-full bg-gradient-to-r from-accent-cyan to-accent-purple rounded-full"
          animate={{ width: `${Math.min(progress, 100)}%` }}
          transition={{ duration: 0.1 }}
        />
      </div>

      <div className="font-mono text-[10px] text-text-tertiary tracking-widest">
        {Math.min(Math.round(progress), 100)}%
      </div>
    </m.div>
  );
};

/* ─── App ─────────────────────────────────────────────────────────────── */
function App() {
  const [activeTab, setActiveTab] = useState('overview');
  const [activeFilter, setActiveFilter] = useState(null);
  const [isLoaded, setIsLoaded] = useState(false);

  const handleSkillClick = (skill) => {
    setActiveFilter(skill);
    setActiveTab('projects');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Smooth scrolling
  useEffect(() => {
    const lenis = new Lenis({
      duration: 1.2,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      smooth: true,
    });
    function raf(time) {
      lenis.raf(time);
      requestAnimationFrame(raf);
    }
    requestAnimationFrame(raf);
    return () => lenis.destroy();
  }, []);

  // Scroll to top on tab change
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [activeTab]);

  const renderContent = () => {
    switch (activeTab) {
      case 'overview':
        return (
          <div key="overview" className="flex flex-col">
            <Hero setActiveTab={setActiveTab} />
            <div className="section-divider mx-6 md:mx-12" />
            <About onSkillClick={handleSkillClick} />
            <div className="section-divider mx-6 md:mx-12" />
            <Skills />
          </div>
        );
      case 'projects':
        return (
          <div key="projects">
            <Suspense fallback={<div className="min-h-[50vh] flex items-center justify-center"><div className="w-8 h-8 rounded-full border-2 border-accent-cyan border-t-transparent animate-spin"></div></div>}>
              <Projects activeFilter={activeFilter} clearFilter={() => setActiveFilter(null)} />
            </Suspense>
          </div>
        );
      case 'contact':
        return (
          <div key="contact">
            <Contact />
          </div>
        );
      default:
        return (
          <div key="hero">
            <Hero setActiveTab={setActiveTab} />
          </div>
        );
    }
  };

  return (
    <LazyMotion features={domAnimation}>
      <AnimatePresence mode="wait">
        {!isLoaded && (
          <LoadingScreen key="loader" onComplete={() => setIsLoaded(true)} />
        )}
      </AnimatePresence>

      {isLoaded && (
        <div className="min-h-screen flex flex-col relative max-w-screen-2xl mx-auto">
          <CustomCursor />
          <Navigation activeTab={activeTab} setActiveTab={setActiveTab} />

          <main className="flex-grow pt-20">
            <AnimatePresence mode="wait" initial={false}>
              <m.div
                key={activeTab}
                variants={pageVariants}
                initial="initial"
                animate="enter"
                exit="exit"
              >
                {renderContent()}
              </m.div>
            </AnimatePresence>
          </main>

          <Footer setActiveTab={setActiveTab} />
        </div>
      )}
    </LazyMotion>
  );
}

export default App;
