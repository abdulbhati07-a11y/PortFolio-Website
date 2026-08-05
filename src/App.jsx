import React, { useState, useEffect, useRef, Suspense, lazy } from 'react';
import Lenis from '@studio-freight/lenis';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { AnimatePresence, m, LazyMotion, domAnimation } from 'framer-motion';
import Navigation from './components/Navigation';
import Hero from './components/Hero';
import About from './components/About';
import Skills from './components/Skills';
import Timeline from './components/Timeline';
import Contact from './components/Contact';
import Footer from './components/Footer';
import Blog from './components/Blog';
import Certifications from './components/Certifications';
import SEO from './components/SEO';
import CustomCursor from './components/CustomCursor';
import ScrollProgress from './components/ui/ScrollProgress';
import Skeleton from './components/Skeleton';
import ChatAssistant from './components/ChatAssistant';

const Projects = lazy(() => import('./components/Projects'));
const GalaxyBackground = lazy(() => import('./components/GalaxyBackground'));
const StarfieldBackground = lazy(() => import('./components/StarfieldBackground'));

gsap.registerPlugin(ScrollTrigger);

const prefersReducedMotion = () =>
  typeof window !== 'undefined' &&
  window.matchMedia('(prefers-reduced-motion: reduce)').matches;

/* ─── Loading Screen ──────────────────────────────────────────────────── */
const EASE_OUT_EXPO = [0.16, 1, 0.3, 1];

const LoadingScreen = ({ onComplete }) => {
  const reduced = prefersReducedMotion();
  const [count, setCount] = useState(reduced ? 100 : 0);
  const [pageLoaded, setPageLoaded] = useState(document.readyState === 'complete');

  useEffect(() => {
    if (pageLoaded) return;
    const handleLoad = () => setPageLoaded(true);
    window.addEventListener('load', handleLoad);
    return () => window.removeEventListener('load', handleLoad);
  }, [pageLoaded]);

  // 0 → 100 counter, eased. Holds at 99 until the window has actually loaded.
  useEffect(() => {
    if (reduced) return;
    let rafId;
    let start;
    const duration = 1200;
    const tick = (now) => {
      if (start === undefined) start = now;
      const progress = Math.min((now - start) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setCount(Math.round(eased * 100));
      if (progress < 1) rafId = requestAnimationFrame(tick);
    };
    rafId = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(rafId);
  }, [reduced]);

  const displayCount = pageLoaded ? count : Math.min(count, 99);

  useEffect(() => {
    if (pageLoaded && displayCount >= 100) {
      const t = setTimeout(onComplete, 300);
      return () => clearTimeout(t);
    }
  }, [pageLoaded, displayCount, onComplete]);

  return (
    <m.div
      className="fixed inset-0 z-[999] flex flex-col items-center justify-center gap-8"
      // Root stays put while the curtains and content run their exits below;
      // AnimatePresence waits for the longest descendant exit.
      exit={{ transition: { duration: reduced ? 0.2 : 0.9 } }}
      role="status"
      aria-label="Loading portfolio"
    >
      {/* Curtain panels — split apart on exit to reveal the hero */}
      <m.div
        className="absolute inset-x-0 top-0 h-1/2 bg-primary"
        exit={reduced ? { opacity: 0 } : { y: '-100%' }}
        transition={{ duration: 0.8, ease: EASE_OUT_EXPO }}
        aria-hidden="true"
      />
      <m.div
        className="absolute inset-x-0 bottom-0 h-1/2 bg-primary"
        exit={reduced ? { opacity: 0 } : { y: '100%' }}
        transition={{ duration: 0.8, ease: EASE_OUT_EXPO, delay: 0.08 }}
        aria-hidden="true"
      />

      {/* Loader content */}
      <m.div
        className="relative flex flex-col items-center gap-8"
        exit={{ opacity: 0, scale: 0.96 }}
        transition={{ duration: 0.3, ease: EASE_OUT_EXPO }}
      >
        <div className="flex flex-col items-center gap-4">
          <div className="w-16 h-16 rounded-2xl bg-accent-cyan flex items-center justify-center text-slate-900 font-mono font-bold text-2xl shadow-[0_0_40px_rgba(0,217,255,0.4)] animate-pulse-glow">
            AB
          </div>
          <div className="font-mono text-text-secondary text-xs tracking-[0.4em] uppercase">
            Portfolio
          </div>
        </div>
        <div className="flex flex-col items-center gap-3">
          <span className="font-mono text-3xl font-bold text-text-primary tabular-nums" aria-hidden="true">
            {displayCount}
            <span className="text-accent-cyan text-lg">%</span>
          </span>
          <div className="w-48 h-[2px] bg-glass/[0.06] rounded-full overflow-hidden">
            <div
              className="h-full bg-accent-cyan rounded-full"
              style={{ width: `${displayCount}%` }}
            />
          </div>
        </div>
      </m.div>
    </m.div>
  );
};

/* ─── App ─────────────────────────────────────────────────────────────── */
function App() {
  const [isLoaded, setIsLoaded] = useState(false);
  const [activeFilter, setActiveFilter] = useState(null);
  const [galaxyReady, setGalaxyReady] = useState(false);
  const lenisRef = useRef(null);
  const scrollProgress = useRef(0); // 0..1, fed to the galaxy for parallax

  // Smooth scrolling + GSAP ScrollTrigger, bridged through one rAF loop.
  // (Skipped entirely for reduced-motion users.)
  useEffect(() => {
    if (prefersReducedMotion()) return;

    const lenis = new Lenis({
      lerp: 0.08,             // low lerp = long, buttery glide (very smooth)
      wheelMultiplier: 1,
      touchMultiplier: 1.6,
      smoothWheel: true,
      syncTouch: true,        // smooth momentum on touch devices too
    });
    lenisRef.current = lenis;

    // Track normalized scroll progress for the galaxy parallax.
    lenis.on('scroll', ({ scroll, limit }) => {
      scrollProgress.current = limit > 0 ? scroll / limit : 0;
      ScrollTrigger.update();
    });

    // Drive Lenis from GSAP's ticker so both share one clock.
    const tick = (time) => lenis.raf(time * 1000);
    gsap.ticker.add(tick);
    gsap.ticker.lagSmoothing(0);

    return () => {
      gsap.ticker.remove(tick);
      lenis.destroy();
      lenisRef.current = null;
    };
  }, []);

  // Mount the galaxy once idle so it never blocks first paint.
  useEffect(() => {
    if (!isLoaded || prefersReducedMotion()) return;
    const idle = window.requestIdleCallback
      ? window.requestIdleCallback(() => setGalaxyReady(true), { timeout: 2000 })
      : setTimeout(() => setGalaxyReady(true), 800);
    return () => {
      if (window.cancelIdleCallback && typeof idle === 'number') window.cancelIdleCallback(idle);
      else clearTimeout(idle);
    };
  }, [isLoaded]);

  // GSAP ScrollTrigger reveals for section dividers, set up after content mounts.
  useEffect(() => {
    if (!isLoaded || prefersReducedMotion()) return;

    const ctx = gsap.context(() => {
      gsap.utils.toArray('[data-gsap="divider"]').forEach((el) => {
        gsap.fromTo(
          el,
          { scaleX: 0, opacity: 0 },
          {
            scaleX: 1,
            opacity: 1,
            duration: 1.1,
            ease: 'power3.out',
            scrollTrigger: { trigger: el, start: 'top 92%' },
          }
        );
      });

      gsap.utils.toArray('[data-gsap="section"]').forEach((el) => {
        gsap.from(el, {
          y: 48,
          opacity: 0,
          filter: 'blur(6px)',
          duration: 0.9,
          ease: 'expo.out',
          scrollTrigger: { trigger: el, start: 'top 85%' },
          clearProps: 'filter', // don't leave a stale filter that breaks fixed/sticky children
        });
      });
    });

    ScrollTrigger.refresh();
    return () => ctx.revert();
  }, [isLoaded]);

  const scrollTo = (target) => {
    if (lenisRef.current) {
      lenisRef.current.scrollTo(target, { offset: -80 });
    } else {
      const el = typeof target === 'string' ? document.querySelector(target) : target;
      el?.scrollIntoView({ block: 'start' });
    }
  };

  const handleSkillClick = (skill) => {
    setActiveFilter(skill);
    scrollTo('#projects');
  };

  return (
    <LazyMotion features={domAnimation}>
      <SEO />
      <AnimatePresence mode="wait">
        {!isLoaded && <LoadingScreen key="loader" onComplete={() => setIsLoaded(true)} />}
      </AnimatePresence>

      {isLoaded && (
        <div className="min-h-screen flex flex-col relative">
          {/* Background elements removed for solid look */}
          <a href="#main-content" className="skip-link">Skip to content</a>
          <div className="grain-overlay" aria-hidden="true" />
          <CustomCursor />
          <ScrollProgress scrollTo={scrollTo} />
          <Navigation scrollTo={scrollTo} />

          <main id="main-content" className="flex-grow pt-20 max-w-screen-2xl mx-auto w-full">
            <Hero scrollTo={scrollTo} />
            <div data-gsap="divider" className="section-divider mx-6 md:mx-12 origin-left" />
            <About />
            <div data-gsap="divider" className="section-divider mx-6 md:mx-12 origin-left" />
            <Skills onSkillClick={handleSkillClick} />
            <Suspense
              fallback={
                <div className="px-4 md:px-8 lg:px-16 py-24 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-7">
                  {[1, 2, 3].map((i) => (
                    <Skeleton key={i} width="100%" height="380px" borderRadius="24px" />
                  ))}
                </div>
              }
            >
              <Projects activeFilter={activeFilter} clearFilter={() => setActiveFilter(null)} />
            </Suspense>
            <div data-gsap="divider" className="section-divider mx-6 md:mx-12 origin-left" />
            <Timeline />
            <div data-gsap="divider" className="section-divider mx-6 md:mx-12 origin-left" />
            <Blog />
            <div data-gsap="divider" className="section-divider mx-6 md:mx-12 origin-left" />
            <Certifications />
            <Contact />
          </main>

          <Footer scrollTo={scrollTo} />

          <ChatAssistant scrollTo={scrollTo} />
        </div>
      )}
    </LazyMotion>
  );
}

export default App;
