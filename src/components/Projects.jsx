import React, { useState, useMemo, useEffect, useRef } from 'react';
import { m, AnimatePresence, useInView } from 'framer-motion';
import { FaGithub, FaExternalLinkAlt, FaStar } from 'react-icons/fa';
import { PROJECTS, COMPETENCY_DETAILS, PROJECT_CATEGORIES } from '../utils/constants';
import Skeleton from './Skeleton';

// Generate a small SVG placeholder data URL using project title initials
const getPlaceholder = (text, size = 96, bg = '#0ea5a6', fg = '#ffffff') => {
  const initials = (text || '')
    .split(' ')
    .map((w) => w[0] || '')
    .slice(0, 2)
    .join('')
    .toUpperCase();
  const fontSize = Math.floor(size / 2.8);
  const svg = `<svg xmlns='http://www.w3.org/2000/svg' width='${size}' height='${size}' viewBox='0 0 ${size} ${size}'><rect width='100%' height='100%' fill='${bg}' rx='18'/><text x='50%' y='50%' dominant-baseline='middle' text-anchor='middle' font-family='Inter,Arial,Helvetica,sans-serif' font-size='${fontSize}' fill='${fg}'>${initials}</text></svg>`;
  return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
};
const cardVariants = {
  hidden: { opacity: 0, y: 30 },
  visible: (i) => ({ 
    opacity: 1, 
    y: 0, 
    transition: { delay: i * 0.1, duration: 0.7, ease: [0.16, 1, 0.3, 1] } 
  }),
};

const REVIEWS = [
  { id: 1, name: 'Alice Smith', role: 'Product Manager', text: 'An absolute pleasure to work with. Delivered on time and exceeded expectations.', rating: 5, avatar: 'AS' },
  { id: 2, name: 'Bob Johnson', role: 'Senior Developer', text: 'Clean code, great communication, and highly skilled in modern tech stacks.', rating: 5, avatar: 'BJ' },
  { id: 3, name: 'Charlie Lee', role: 'Startup Founder', text: 'Transformed our rough ideas into a polished, high-performing application.', rating: 5, avatar: 'CL' },
  { id: 4, name: 'Diana Prince', role: 'UX Designer', text: 'Exceptional attention to detail. The UI implementations were pixel perfect.', rating: 5, avatar: 'DP' },
  { id: 5, name: 'Evan Wright', role: 'Engineering Lead', text: 'Quick learner and very adaptable. A valuable addition to any engineering team.', rating: 5, avatar: 'EW' },
  { id: 6, name: 'Fiona Gallagher', role: 'Marketing Director', text: 'The new site increased our conversions by 40%. Fantastic work all around!', rating: 5, avatar: 'FG' },
];

const ReviewCard = ({ review }) => (
  <div className="glass-card w-[280px] p-6 flex flex-col gap-4 mx-3 flex-shrink-0 snap-center">
    <div className="flex items-center gap-3">
      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-accent-cyan/20 to-accent-purple/20 border border-white/10 flex items-center justify-center text-white font-mono font-bold text-sm">
        {review.avatar}
      </div>
      <div>
        <h4 className="font-sans font-bold text-white text-sm">{review.name}</h4>
        <p className="font-mono text-accent-cyan text-[10px] tracking-wider uppercase">{review.role}</p>
      </div>
    </div>
    <div className="flex gap-1 text-accent-cyan">
      {[...Array(review.rating)].map((_, i) => (
        <FaStar key={i} size={12} />
      ))}
    </div>
    <p className="font-sans text-text-secondary text-sm leading-relaxed font-light">
      "{review.text}"
    </p>
  </div>
);

/* ─── Project Card ────────────────────────────────────────────────────── */
const ProjectCard = ({ project, index }) => {
  const [hovered, setHovered] = useState(false);
  const cardRef = useRef(null);
  const isInView = useInView(cardRef, { once: true, margin: "-50px" });

  const overlayVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.3, ease: "easeOut" } }
  };

  return (
    <m.article
      ref={cardRef}
      custom={index}
      variants={cardVariants}
      initial="hidden"
      animate={isInView ? "visible" : "hidden"}
      className="glass-card rounded-3xl relative flex flex-col h-full bg-secondary/30"
      style={{
        border: '1px solid rgba(255, 255, 255, 0.08)',
        overflow: 'hidden'
      }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      onFocus={() => setHovered(true)}
      onBlur={() => setHovered(false)}
      tabIndex={0}
      aria-label={`${project.title} project — press Enter to view details`}
    >
      {/* Top area: project image (unchanged) */}
      <div className={`w-full h-48 relative overflow-hidden bg-gradient-to-br ${project.gradient} shrink-0`}>
        <div className="absolute inset-0 flex items-center justify-center w-full h-full object-cover z-10">
          {project.logo ? (
            <img src={project.logo} alt={`${project.title} logo`} className="w-20 h-20 object-contain" />
          ) : (
            <img src={getPlaceholder(project.title)} alt={`${project.title} logo`} className="w-20 h-20 object-contain" />
          )}
        </div>
        <div className="absolute inset-0 bg-primary/10 z-0" />
      </div>

      {/* Middle & Bottom areas (Resting State) */}
      <div className="p-7 flex flex-col flex-1 relative z-0">
        
        {/* Middle: type badge + project title — nothing else */}
        <div className="flex-1">
          <div className="mb-3 flex items-center gap-2">
             {project.featured && (
               <span className="inline-flex items-center justify-center px-2.5 py-1 rounded-full bg-accent-cyan/20 border border-accent-cyan/40 text-accent-cyan text-[10px] font-mono font-bold uppercase tracking-wider">
                 <FaStar size={8} className="mr-1" /> Featured
               </span>
             )}
             <span className="inline-flex items-center justify-center px-2.5 py-1 rounded-full bg-white/5 border border-white/10 text-[10px] font-sans font-medium text-accent-cyan uppercase tracking-wider">
               {project.category || project.tech[0]}
             </span>
          </div>
          <h3 className="font-sans text-xl font-bold text-white mb-2 tracking-tight line-clamp-2">
            {project.title}
          </h3>
        </div>

        {/* Bottom: tech stack and buttons */}
        <div className="mt-auto pt-4 relative z-20 flex flex-col gap-3">
          <div className="flex flex-wrap gap-2 items-center">
            {project.tech.map((t, idx) => (
              <span key={idx} className="px-3 py-1.5 rounded-full bg-white/5 border border-white/10 text-[11px] text-white">
                {t}
              </span>
            ))}
          </div>
          
          <div className="flex gap-2 items-center min-h-[28px] border-t border-white/[0.04] pt-3 mt-1">
            {/* GitHub pill button */}
            {(!project.links?.github || project.links.github === '#') ? (
              <span
                className="px-3 py-1.5 rounded-full bg-white/5 border border-white/5 text-[11px] text-white/30 cursor-not-allowed flex items-center gap-1.5"
                aria-label={`${project.title} GitHub repository not available`}
              >
                <FaGithub size={12} /> GitHub
              </span>
            ) : (
              <a
                href={project.links.github}
                target="_blank"
                rel="noopener noreferrer"
                className="px-3 py-1.5 rounded-full bg-white/10 border border-white/20 text-[11px] text-white hover:bg-white hover:text-black transition-colors flex items-center gap-1.5"
                aria-label={`View ${project.title} on GitHub`}
              >
                <FaGithub size={12} /> GitHub
              </a>
            )}

            {/* Demo pill button */}
            {(!project.links?.demo || project.links.demo === '#') ? (
              <span
                className="px-3 py-1.5 rounded-full bg-accent-cyan/5 border border-accent-cyan/10 text-[11px] text-accent-cyan/30 cursor-not-allowed flex items-center gap-1.5"
                aria-label={`${project.title} live demo not available`}
              >
                <FaExternalLinkAlt size={10} /> Demo
              </span>
            ) : (
              <a
                href={project.links.demo}
                target="_blank"
                rel="noopener noreferrer"
                className="px-3 py-1.5 rounded-full bg-accent-cyan/20 border border-accent-cyan/40 text-[11px] text-accent-cyan hover:bg-accent-cyan hover:text-black transition-colors flex items-center gap-1.5"
                aria-label={`View ${project.title} live demo`}
              >
                <FaExternalLinkAlt size={10} /> Demo
              </a>
            )}
          </div>
        </div>
      </div>

      {/* HOVER OVERLAY */}
      <m.div
        className="absolute inset-0 z-10 flex flex-col items-center justify-center text-center"
        style={{ 
          background: 'rgba(0, 0, 0, 0.85)',
          padding: '1.5rem',
          pointerEvents: hovered ? "auto" : "none"
        }}
        variants={overlayVariants}
        initial="hidden"
        animate={hovered ? "visible" : "hidden"}
      >
        <p className="font-sans text-white text-sm leading-relaxed font-light">
          {project.description}
        </p>
      </m.div>
    </m.article>
  );
};

/* ─── Projects Section ────────────────────────────────────────────────── */
const Projects = ({ activeFilter, clearFilter }) => {
  const [categoryFilter, setCategoryFilter] = useState('All');
  const [isLoaded, setIsLoaded] = useState(false);

  const sectionRef = useRef(null);
  const isInView = useInView(sectionRef, { once: true, margin: "-100px" });

  useEffect(() => {
    // Simulate data loading
    const timer = setTimeout(() => {
      setIsLoaded(true);
    }, 1500);
    return () => clearTimeout(timer);
  }, []);

  const filteredProjects = useMemo(() => {
    let list = PROJECTS;
    if (activeFilter) {
      list = list.filter((p) =>
        p.tech.some(
          (t) =>
            t.toLowerCase().includes(activeFilter.toLowerCase()) ||
            activeFilter.toLowerCase().includes(t.toLowerCase())
        )
      );
    }
    if (categoryFilter !== 'All') {
      list = list.filter(
        (p) =>
          p.category === categoryFilter ||
          p.tech.some((t) => t.toLowerCase().includes(categoryFilter.toLowerCase()))
      );
    }
    return list;
  }, [activeFilter, categoryFilter]);

  return (
    <m.section
      ref={sectionRef}
      className="w-full max-w-screen-2xl mx-auto py-20 md:py-32"
    >
      <div className="px-4 md:px-8 lg:px-16 2xl:px-0">
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-6 gap-4 overflow-hidden">
          <div>
            <div className="flex items-center gap-3 mb-3">
              <span className="font-mono text-accent-cyan text-sm tracking-widest">Projects</span>
              <div className="w-12 h-px bg-white/[0.06]" />
            </div>
            <AnimatePresence mode="wait">
              {!isLoaded ? (
                <m.div key="skeleton-header" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="my-2">
                  <Skeleton width="300px" height="48px" borderRadius="8px" />
                </m.div>
              ) : (
                <m.h2 
                  key="real-header"
                  initial={{ opacity: 0, x: -30 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.6 }}
                  className="font-sans text-4xl md:text-5xl font-bold text-white tracking-tighter"
                >
                  {activeFilter ? (
                    <>{activeFilter} <span className="text-gradient">Work</span></>
                  ) : (
                    <>Selected <span className="text-gradient">Projects</span></>
                  )}
                </m.h2>
              )}
            </AnimatePresence>
          </div>

          {activeFilter && isLoaded && (
            <m.button
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              onClick={() => { clearFilter(); setCategoryFilter('All'); }}
              className="text-sm font-sans font-medium text-text-secondary hover:text-white border border-white/10 hover:border-white/30 px-4 py-2 rounded-full transition-all duration-300 flex items-center gap-2"
            >
              Clear Filter <span className="text-accent-cyan">✕</span>
            </m.button>
          )}
        </div>

        {/* Competency detail box */}
        <AnimatePresence mode="wait">
          {activeFilter && COMPETENCY_DETAILS[activeFilter] && isLoaded && (
            <m.div
              key="filter-details"
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="glass-card rounded-2xl p-6 md:p-8 mb-8 border-l-4 border-l-accent-cyan overflow-hidden"
            >
              <h3 className="text-white font-sans text-lg font-semibold mb-2 tracking-tight">
                My Expertise in {activeFilter}
              </h3>
              <p className="text-text-secondary font-sans text-sm leading-relaxed font-light max-w-4xl">
                {COMPETENCY_DETAILS[activeFilter]}
              </p>
            </m.div>
          )}
        </AnimatePresence>

        {/* Category filter tabs */}
        {!activeFilter && (
          <div className="flex flex-wrap gap-2 mb-12">
            <AnimatePresence mode="wait">
              {!isLoaded ? (
                <m.div key="skeleton-tabs" className="flex gap-2" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                  <Skeleton width="80px" height="36px" borderRadius="999px" />
                  <Skeleton width="100px" height="36px" borderRadius="999px" />
                  <Skeleton width="120px" height="36px" borderRadius="999px" />
                </m.div>
              ) : (
                <m.div key="real-tabs" className="flex flex-wrap gap-2" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
                  {PROJECT_CATEGORIES.map((cat) => (
                    <button
                      key={cat}
                      onClick={() => setCategoryFilter(cat)}
                      className={`px-5 py-2 rounded-full text-sm font-sans font-medium transition-all duration-300 ${
                        categoryFilter === cat
                          ? 'bg-accent-cyan text-primary shadow-[0_0_20px_rgba(0,217,255,0.4)]'
                          : 'border border-white/10 text-text-secondary hover:border-white/30 hover:text-white'
                      }`}
                    >
                      {cat}
                    </button>
                  ))}
                </m.div>
              )}
            </AnimatePresence>
          </div>
        )}

        {/* Projects Grid */}
        <AnimatePresence mode="wait">
          {!isLoaded ? (
            <m.div 
              key="skeleton-grid" 
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-7 items-stretch"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
            >
              <Skeleton width="100%" height="380px" borderRadius="24px" />
              <Skeleton width="100%" height="380px" borderRadius="24px" />
              <Skeleton width="100%" height="380px" borderRadius="24px" />
              <Skeleton width="100%" height="380px" borderRadius="24px" />
              <Skeleton width="100%" height="380px" borderRadius="24px" />
              <Skeleton width="100%" height="380px" borderRadius="24px" />
            </m.div>
          ) : filteredProjects.length === 0 ? (
            <m.div
              key="no-projects"
              className="w-full py-24 flex flex-col items-center justify-center text-center glass-card rounded-3xl"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <div className="text-5xl mb-5">🔍</div>
              <h3 className="text-white font-sans text-2xl font-bold mb-2">No projects found</h3>
              <p className="text-text-secondary text-sm mb-6">
                I have experience in {activeFilter || categoryFilter}, but no specific projects are listed yet.
              </p>
              <button
                onClick={() => { clearFilter(); setCategoryFilter('All'); }}
                className="px-6 py-3 bg-white/5 border border-white/10 rounded-full text-white hover:bg-white/10 transition-all duration-300"
              >
                View All Projects
              </button>
            </m.div>
          ) : (
            <m.div 
              key="real-grid" 
              layout 
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-7 items-stretch"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
            >
              {/* Show Featured Projects First if in 'All' view */}
              {!activeFilter && categoryFilter === 'All' && PROJECTS.filter(p => p.featured).map((project, index) => (
                <ProjectCard key={project.id} project={project} index={index} />
              ))}
              
              {/* Show the rest of the filtered projects */}
              {(!activeFilter && categoryFilter === 'All' ? filteredProjects.filter(p => !p.featured) : filteredProjects).map((project, index) => (
                <ProjectCard key={project.id} project={project} index={index + (categoryFilter === 'All' ? PROJECTS.filter(p => p.featured).length : 0)} />
              ))}
            </m.div>
          )}
        </AnimatePresence>
      </div>

      {/* Infinite Carousel of Reviews at the end of the Projects Page */}
      {isLoaded && (
        <div className="mt-32 w-full max-w-screen-2xl overflow-hidden relative" aria-label="Client reviews carousel">
          {/* Subtle separator */}
          <div className="flex items-center justify-center gap-3 mb-10 opacity-70">
            <div className="w-12 h-px bg-white/[0.06]" />
            <span className="font-mono text-accent-cyan text-xs tracking-widest uppercase">Client Feedback</span>
            <div className="w-12 h-px bg-white/[0.06]" />
          </div>

          <div className="flex overflow-hidden relative group">
            <div className="flex w-max animate-marquee hover:[animation-play-state:paused]">
              {[...REVIEWS, ...REVIEWS, ...REVIEWS].map((review, i) => (
                <ReviewCard key={`rev-${i}`} review={review} />
              ))}
            </div>
          </div>
          {/* Edge fade gradients to make the infinite scroll smooth visually */}
          <div className="absolute inset-y-0 left-0 w-12 md:w-32 bg-gradient-to-r from-primary to-transparent z-10 pointer-events-none" />
          <div className="absolute inset-y-0 right-0 w-12 md:w-32 bg-gradient-to-l from-primary to-transparent z-10 pointer-events-none" />
        </div>
      )}
    </m.section>
  );
};

export default Projects;
