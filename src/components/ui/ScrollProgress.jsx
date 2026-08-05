import React, { useEffect, useState } from 'react';
import { m, useScroll, useSpring, useReducedMotion } from 'framer-motion';

const SECTIONS = [
  { id: 'hero', label: 'Home' },
  { id: 'about', label: 'About' },
  { id: 'skills', label: 'Skills' },
  { id: 'projects', label: 'Projects' },
  { id: 'timeline', label: 'Journey' },
  { id: 'blog', label: 'Blog' },
  { id: 'certifications', label: 'Certifications' },
  { id: 'contact', label: 'Contact' },
];

/**
 * Top scroll-progress bar + minimal right-side section dot-nav.
 * The bar is driven by framer's passive useScroll; the active dot by one
 * IntersectionObserver (same pattern as the globe pause in Hero).
 */
const ScrollProgress = ({ scrollTo }) => {
  const shouldReduceMotion = useReducedMotion();
  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, { stiffness: 120, damping: 30, restDelta: 0.001 });
  const [active, setActive] = useState('hero');

  useEffect(() => {
    const observers = [];
    SECTIONS.forEach(({ id }) => {
      const el = document.getElementById(id);
      if (!el) return;
      const io = new IntersectionObserver(
        ([entry]) => entry.isIntersecting && setActive(id),
        { rootMargin: '-40% 0px -50% 0px' }
      );
      io.observe(el);
      observers.push(io);
    });
    return () => observers.forEach((io) => io.disconnect());
  }, []);

  return (
    <>
      {/* Top progress bar */}
      <m.div
        aria-hidden="true"
        className="fixed top-0 left-0 right-0 h-[2px] z-[200] origin-left"
        style={{
          scaleX: shouldReduceMotion ? scrollYProgress : scaleX,
          background: '#00d9ff',
        }}
      />

      {/* Section dot-nav (desktop only) */}
      <nav
        aria-label="Section navigation"
        className="fixed right-5 top-1/2 -translate-y-1/2 z-[150] hidden lg:flex flex-col items-center gap-3"
      >
        {SECTIONS.map(({ id, label }) => {
          const isActive = active === id;
          return (
            <button
              key={id}
              onClick={() => scrollTo(`#${id}`)}
              aria-label={`Go to ${label}`}
              aria-current={isActive ? 'true' : undefined}
              className="group relative flex items-center justify-center w-4 h-4"
            >
              <span
                className={`rounded-full transition-all duration-300 ${
                  isActive
                    ? 'w-2.5 h-2.5 bg-accent-cyan shadow-[0_0_10px_rgba(0,217,255,0.7)]'
                    : 'w-1.5 h-1.5 bg-text-tertiary/50 group-hover:bg-text-secondary'
                }`}
              />
              <span className="absolute right-6 px-2 py-1 rounded-md bg-secondary/90 border border-glass/10 text-[10px] font-mono text-text-secondary whitespace-nowrap opacity-0 group-hover:opacity-100 translate-x-1 group-hover:translate-x-0 transition-all duration-300 pointer-events-none">
                {label}
              </span>
            </button>
          );
        })}
      </nav>
    </>
  );
};

export default ScrollProgress;
