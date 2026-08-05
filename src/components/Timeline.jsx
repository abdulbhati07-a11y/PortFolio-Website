import React, { useRef, useEffect } from 'react';
import { m, useScroll, useTransform, useReducedMotion, useInView } from 'framer-motion';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { TIMELINE } from '../utils/constants';
import SectionHeading from './ui/SectionHeading';

gsap.registerPlugin(ScrollTrigger);

const dotColors = {
  'accent-cyan': 'bg-accent-cyan shadow-[0_0_12px_rgba(0,217,255,0.8)]',
  'accent-emerald': 'bg-accent-emerald shadow-[0_0_12px_rgba(168,85,247,0.8)]',
  'accent-green': 'bg-accent-emerald shadow-[0_0_12px_rgba(74,222,128,0.8)]',
};

const TimelineItem = ({ item, isEven, shouldReduceMotion }) => {
  const itemRef = useRef(null);
  const isInView = useInView(itemRef, { once: true, margin: '-100px' });

  return (
    <m.li
      ref={itemRef}
      className={`relative flex flex-col md:flex-row items-center justify-between list-none ${
        isEven ? 'md:flex-row-reverse' : ''
      }`}
      initial={{ opacity: 0, x: shouldReduceMotion ? 0 : isEven ? 50 : -50 }}
      animate={shouldReduceMotion || isInView ? { opacity: 1, x: 0 } : {}}
      transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
    >
      {/* Empty space for the alternating desktop layout */}
      <div className="hidden md:block md:w-5/12" />

      {/* Center dot + year */}
      <div className="absolute left-6 md:left-1/2 -translate-x-[5px] md:-translate-x-1/2 flex items-center justify-center z-10">
        <div data-tl-dot className={`w-3 h-3 rounded-full ring-4 ring-primary ${dotColors[item.color] ?? dotColors['accent-green']}`} />
        <div className="absolute left-8 md:left-auto md:-right-24 hidden md:block">
          <span data-tl-year className="inline-block font-mono text-xs text-text-secondary border border-glass/10 px-3 py-1.5 rounded-full bg-primary/80 backdrop-blur-sm whitespace-nowrap">
            {item.year}
          </span>
        </div>
      </div>

      {/* Content card */}
      <div className="w-full pl-16 md:pl-0 md:w-5/12">
        <div className="glass-card glass-card-hover rounded-2xl p-4 sm:p-6 md:p-8 transition-all duration-300 group">
          <div className="flex items-start justify-between mb-3 gap-4 flex-wrap">
            <h3 className="font-display text-base sm:text-xl font-bold text-text-primary tracking-tight group-hover:text-accent-cyan transition-colors">
              {item.title}
            </h3>
            <div className="flex items-center gap-2 flex-shrink-0">
              <span className="md:hidden font-mono text-[10px] text-text-secondary border border-glass/10 px-2 py-1 rounded-full">
                {item.year}
              </span>
              <span
                className={`font-mono text-[10px] uppercase tracking-wider px-2.5 py-1 rounded-full border ${
                  item.subtitle === 'Current'
                    ? 'border-accent-emerald/30 text-accent-emerald bg-accent-emerald/10'
                    : 'border-glass/10 text-text-secondary'
                }`}
              >
                {item.subtitle}
              </span>
            </div>
          </div>
          <p className="font-sans text-text-secondary text-sm leading-relaxed">{item.description}</p>
        </div>
      </div>
    </m.li>
  );
};

const Timeline = () => {
  const timelineRef = useRef(null);
  const shouldReduceMotion = useReducedMotion();

  const { scrollYProgress } = useScroll({
    target: timelineRef,
    offset: ['start center', 'end center'],
  });
  const lineHeight = useTransform(scrollYProgress, [0, 1], ['0%', '100%']);

  // Signature moment: dots and year badges pop in with an elastic bounce as
  // the progress line reaches them.
  useEffect(() => {
    if (shouldReduceMotion) return;
    const ctx = gsap.context(() => {
      gsap.utils.toArray('[data-tl-dot], [data-tl-year]').forEach((el) => {
        gsap.from(el, {
          scale: 0,
          opacity: 0,
          duration: 0.9,
          ease: 'elastic.out(1, 0.45)',
          scrollTrigger: { trigger: el, start: 'top 78%' },
        });
      });
    }, timelineRef);
    return () => ctx.revert();
  }, [shouldReduceMotion]);

  return (
    <section
      id="journey"
      aria-label="My journey"
      className="w-full max-w-screen-2xl mx-auto px-4 md:px-8 lg:px-16 2xl:px-0 py-20 md:py-32"
    >
      <div className="max-w-5xl mx-auto mb-16">
        <SectionHeading
          index="04"
          eyebrow="The story so far"
          title="My"
          accent="Journey"
          subtitle="From first lines of code to AI-integrated applications — each chapter built on the last."
        />
      </div>

      <div className="relative max-w-6xl mx-auto" ref={timelineRef}>
        {/* Track */}
        <div className="absolute left-6 md:left-1/2 md:-translate-x-1/2 top-0 bottom-0 w-px bg-glass/[0.05]" aria-hidden="true" />
        {/* Scroll-driven progress */}
        <m.div
          className="absolute left-6 md:left-1/2 md:-translate-x-1/2 top-0 w-px bg-accent-cyan origin-top shadow-[0_0_15px_rgba(0,217,255,0.5)]"
          style={{ height: shouldReduceMotion ? '100%' : lineHeight }}
          aria-hidden="true"
        />

        <ol className="space-y-16">
          {TIMELINE.map((item, idx) => (
            <TimelineItem key={`${item.year}-${item.title}`} item={item} isEven={idx % 2 === 0} shouldReduceMotion={shouldReduceMotion} />
          ))}
        </ol>
      </div>
    </section>
  );
};

export default Timeline;
