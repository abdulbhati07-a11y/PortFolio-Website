import React, { useState, useMemo, useEffect, useRef, useCallback } from 'react';
import { m, AnimatePresence, useInView, useReducedMotion, useMotionValue, useSpring } from 'framer-motion';
import { FaGithub, FaExternalLinkAlt, FaStar, FaTimes } from 'react-icons/fa';
import { PROJECTS, COMPETENCY_DETAILS, PROJECT_CATEGORIES } from '../utils/constants';
import SectionHeading from './ui/SectionHeading';

// Small SVG placeholder using project title initials (used when no logo asset exists)
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

const hasLink = (link) => link && link !== '#';

/* ─── Case Study Modal ────────────────────────────────────────────────── */
const CaseStudyModal = ({ project, onClose }) => {
  const closeRef = useRef(null);

  useEffect(() => {
    const onKey = (e) => e.key === 'Escape' && onClose();
    document.addEventListener('keydown', onKey);
    document.body.style.overflow = 'hidden';
    closeRef.current?.focus();
    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = '';
    };
  }, [onClose]);

  return (
    <m.div
      className="fixed inset-0 z-[300] flex items-center justify-center p-4 sm:p-6"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={onClose}
    >
      <div className="absolute inset-0 bg-black/70 backdrop-blur-md" aria-hidden="true" />
      <m.div
        role="dialog"
        aria-modal="true"
        aria-label={`${project.title} case study`}
        className="relative glass-card bg-secondary/95 dark:bg-secondary/90 rounded-3xl max-w-2xl w-full max-h-[88vh] overflow-y-auto p-6 sm:p-10"
        initial={{ opacity: 0, scale: 0.94, y: 24 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.96, y: 12 }}
        transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
        onClick={(e) => e.stopPropagation()}
      >
        <button
          ref={closeRef}
          onClick={onClose}
          aria-label="Close case study"
          className="absolute top-4 right-4 w-9 h-9 rounded-full border border-glass/10 bg-glass/5 flex items-center justify-center text-text-secondary hover:text-accent-emerald hover:border-accent-emerald/40 transition-colors"
        >
          <FaTimes size={14} />
        </button>

        {/* Header */}
        <div className={`w-full h-32 sm:h-44 rounded-2xl ${project.gradient} relative overflow-hidden flex items-center justify-center mb-6`}>
          {project.screenshot ? (
            <img
              src={project.screenshot}
              alt={`Screenshot of ${project.title}`}
              className="absolute inset-0 w-full h-full object-cover object-top"
            />
          ) : (
            <img
              src={project.logo || getPlaceholder(project.title)}
              alt=""
              className="w-16 h-16 object-contain"
              onError={(e) => { e.currentTarget.src = getPlaceholder(project.title); }}
            />
          )}
        </div>

        <div className="flex items-center gap-2 mb-3 flex-wrap">
          {project.featured && (
            <span className="inline-flex items-center px-2.5 py-1 rounded-full bg-accent-cyan/20 border border-accent-cyan/40 text-accent-cyan text-[10px] font-mono font-bold uppercase tracking-wider">
              <FaStar size={8} className="mr-1" /> Featured
            </span>
          )}
          <span className="inline-flex items-center px-2.5 py-1 rounded-full bg-glass/5 border border-glass/10 text-[10px] font-sans font-medium text-accent-cyan uppercase tracking-wider">
            {project.category}
          </span>
        </div>

        <h3 className="font-display text-2xl sm:text-3xl font-bold text-text-primary tracking-tight mb-3">
          {project.title}
        </h3>
        <p className="font-sans text-text-secondary text-sm sm:text-base leading-relaxed font-light mb-8">
          {project.description}
        </p>

        {/* Case study narrative */}
        {project.caseStudy && (
          <div className="flex flex-col gap-6 mb-8">
            {[
              { label: 'The Challenge', text: project.caseStudy.challenge, color: 'text-accent-cyan' },
              { label: 'The Solution', text: project.caseStudy.solution, color: 'text-accent-emerald' },
              { label: 'The Outcome', text: project.caseStudy.impact, color: 'text-accent-emerald' },
            ].map(({ label, text, color }) => (
              <div key={label}>
                <h4 className={`font-mono text-xs tracking-widest uppercase mb-2 ${color}`}>{label}</h4>
                <p className="font-sans text-text-secondary text-sm leading-relaxed font-light">{text}</p>
              </div>
            ))}
          </div>
        )}

        {/* Tech stack */}
        <div className="mb-8">
          <h4 className="font-mono text-xs tracking-widest uppercase mb-3 text-text-secondary">Technology Stack</h4>
          <div className="flex flex-wrap gap-2">
            {project.tech.map((t) => (
              <span key={t} className="px-3 py-1.5 rounded-full bg-glass/5 border border-glass/10 text-xs text-text-primary">
                {t}
              </span>
            ))}
          </div>
        </div>

        {/* Links */}
        <div className="flex gap-3 flex-wrap">
          {hasLink(project.links?.github) && (
            <a
              href={project.links.github}
              target="_blank"
              rel="noopener noreferrer"
              className="px-5 py-2.5 rounded-full bg-glass/10 border border-glass/20 text-sm text-text-primary hover:bg-glass hover:text-primary transition-colors flex items-center gap-2"
            >
              <FaGithub size={14} /> View Source
            </a>
          )}
          {hasLink(project.links?.demo) && (
            <a
              href={project.links.demo}
              target="_blank"
              rel="noopener noreferrer"
              className="px-5 py-2.5 rounded-full bg-accent-cyan/20 border border-accent-cyan/40 text-sm text-accent-cyan hover:bg-accent-cyan hover:text-slate-900 transition-colors flex items-center gap-2"
            >
              <FaExternalLinkAlt size={12} /> Live Demo
            </a>
          )}
          {!hasLink(project.links?.github) && !hasLink(project.links?.demo) && (
            <span className="text-text-tertiary text-xs font-sans">Source available on request.</span>
          )}
        </div>
      </m.div>
    </m.div>
  );
};

/* ─── Project Card ────────────────────────────────────────────────────── */
const TILT_MAX = 6; // degrees

const ProjectCard = ({ project, index, onOpen }) => {
  const cardRef = useRef(null);
  const isInView = useInView(cardRef, { once: true, margin: '-50px' });
  const shouldReduceMotion = useReducedMotion();

  // 3D tilt (springs reused from the Magnetic pattern) + cursor spotlight.
  const rotateX = useMotionValue(0);
  const rotateY = useMotionValue(0);
  const springRX = useSpring(rotateX, { stiffness: 220, damping: 20, mass: 0.6 });
  const springRY = useSpring(rotateY, { stiffness: 220, damping: 20, mass: 0.6 });

  const handleMouseMove = (e) => {
    if (shouldReduceMotion || !cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    const px = (e.clientX - rect.left) / rect.width;   // 0..1
    const py = (e.clientY - rect.top) / rect.height;   // 0..1
    rotateY.set((px - 0.5) * 2 * TILT_MAX);
    rotateX.set(-(py - 0.5) * 2 * TILT_MAX);
    // Spotlight position (CSS vars, no re-render)
    cardRef.current.style.setProperty('--mx', `${e.clientX - rect.left}px`);
    cardRef.current.style.setProperty('--my', `${e.clientY - rect.top}px`);
  };

  const handleMouseLeave = () => {
    rotateX.set(0);
    rotateY.set(0);
  };

  return (
    <div style={{ perspective: 1000 }} className="h-full">
      <m.article
        ref={cardRef}
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
        initial={shouldReduceMotion ? false : { opacity: 0, y: 30 }}
        animate={shouldReduceMotion || isInView ? { opacity: 1, y: 0 } : {}}
        transition={{ delay: (index % 3) * 0.1, duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
        style={shouldReduceMotion ? undefined : { rotateX: springRX, rotateY: springRY, transformStyle: 'preserve-3d' }}
        data-cursor="View"
        className="glass-card glass-card-hover rounded-3xl relative flex flex-col h-full overflow-hidden group hover:-translate-y-1.5 hover:shadow-[0_24px_60px_-12px_rgba(0,217,255,0.18),0_24px_60px_-24px_rgba(168,85,247,0.18)] transition-shadow duration-500"
      >
        {/* Cursor spotlight — solid glow on hover */}
        <div
          aria-hidden="true"
          className="absolute inset-0 z-10 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none bg-accent-cyan/5"
        />

        {/* Visual header: real screenshot when we have one, logo card otherwise */}
        <m.div
          className={`w-full h-36 sm:h-44 relative overflow-hidden ${project.gradient} shrink-0`}
          initial={shouldReduceMotion ? false : { clipPath: 'inset(0 0 100% 0)' }}
          animate={shouldReduceMotion || isInView ? { clipPath: 'inset(0 0 0% 0)' } : {}}
          transition={{ delay: (index % 3) * 0.1 + 0.15, duration: 0.9, ease: [0.16, 1, 0.3, 1] }}
        >
          {project.screenshot ? (
            <img
              src={project.screenshot}
              alt={`Screenshot of ${project.title}`}
              className="absolute inset-0 w-full h-full object-cover object-top transition-transform duration-700 group-hover:scale-105"
              loading="lazy"
            />
          ) : (
            <div className="absolute inset-0 flex items-center justify-center transition-transform duration-700 group-hover:scale-110">
              <img
                src={project.logo || getPlaceholder(project.title)}
                alt=""
                className="w-20 h-20 object-contain drop-shadow-[0_8px_24px_rgba(0,0,0,0.4)]"
                loading="lazy"
                onError={(e) => { e.currentTarget.src = getPlaceholder(project.title); }}
              />
            </div>
          )}
        </m.div>

      <div className="p-4 sm:p-6 flex flex-col flex-1 gap-3">
        <div className="flex items-center gap-2 flex-wrap">
          {project.featured && (
            <span className="inline-flex items-center px-2.5 py-1 rounded-full bg-accent-cyan/20 border border-accent-cyan/40 text-accent-cyan text-[10px] font-mono font-bold uppercase tracking-wider">
              <FaStar size={8} className="mr-1" /> Featured
            </span>
          )}
          <span className="inline-flex items-center px-2.5 py-1 rounded-full bg-glass/5 border border-glass/10 text-[10px] font-sans font-medium text-accent-cyan uppercase tracking-wider">
            {project.category || project.tech[0]}
          </span>
        </div>

        <h3 className="font-display text-xl font-bold text-text-primary tracking-tight group-hover:text-accent-cyan transition-colors">
          {project.title}
        </h3>

        <p className="font-sans text-text-secondary text-sm leading-relaxed font-light line-clamp-3 flex-1">
          {project.description}
        </p>

        <div className="flex flex-wrap gap-1.5">
          {project.tech.slice(0, 4).map((t) => (
            <span key={t} className="px-2.5 py-1 rounded-full bg-glass/5 border border-glass/10 text-[11px] text-text-primary">
              {t}
            </span>
          ))}
          {project.tech.length > 4 && (
            <span className="px-2.5 py-1 rounded-full text-[11px] text-text-tertiary">+{project.tech.length - 4}</span>
          )}
        </div>

        <div className="flex gap-2 items-center border-t border-glass/[0.06] pt-3 mt-1">
          <button
            onClick={() => onOpen(project)}
            className="px-4 py-1.5 rounded-full bg-accent-cyan/10 border border-accent-cyan/30 text-[12px] text-accent-cyan hover:bg-accent-cyan hover:text-slate-900 transition-colors font-medium"
          >
            Case Study
          </button>
          {hasLink(project.links?.github) && (
            <a
              href={project.links.github}
              target="_blank"
              rel="noopener noreferrer"
              className="px-3 py-1.5 rounded-full bg-glass/10 border border-glass/20 text-[11px] text-text-primary hover:bg-glass hover:text-primary transition-colors flex items-center gap-1.5"
              aria-label={`View ${project.title} on GitHub`}
            >
              <FaGithub size={12} /> Code
            </a>
          )}
          {hasLink(project.links?.demo) && (
            <a
              href={project.links.demo}
              target="_blank"
              rel="noopener noreferrer"
              className="px-3 py-1.5 rounded-full bg-glass/5 border border-glass/10 text-[11px] text-accent-cyan hover:border-accent-cyan/50 transition-colors flex items-center gap-1.5"
              aria-label={`View ${project.title} live demo`}
            >
              <FaExternalLinkAlt size={10} /> Live
            </a>
          )}
        </div>
      </div>
      </m.article>
    </div>
  );
};

/* ─── Projects Section ────────────────────────────────────────────────── */
const Projects = ({ activeFilter, clearFilter }) => {
  const [categoryFilter, setCategoryFilter] = useState('All');
  const [openProject, setOpenProject] = useState(null);

  const handleOpen = useCallback((project) => setOpenProject(project), []);

  const filteredProjects = useMemo(() => {
    let list = PROJECTS;
    if (activeFilter) {
      list = list.filter((p) =>
        p.tech.some(
          (t) =>
            t.toLowerCase().includes(activeFilter.toLowerCase()) ||
            activeFilter.toLowerCase().includes(t.toLowerCase())
        ) || p.category === activeFilter
      );
    }
    if (categoryFilter !== 'All') {
      list = list.filter(
        (p) =>
          p.category === categoryFilter ||
          p.tech.some((t) => t.toLowerCase().includes(categoryFilter.toLowerCase()))
      );
    }
    // Featured first
    return [...list].sort((a, b) => (b.featured === true) - (a.featured === true));
  }, [activeFilter, categoryFilter]);

  return (
    <section
      id="projects"
      aria-label="Projects"
      className="w-full max-w-screen-2xl mx-auto py-20 md:py-32"
    >
      <div className="px-4 md:px-8 lg:px-16 2xl:px-0">
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-8 gap-4">
          <SectionHeading
            index="03"
            eyebrow="Proof of work"
            title={activeFilter ? `${activeFilter}` : 'Selected'}
            accent={activeFilter ? 'Work' : 'Projects'}
            subtitle={activeFilter ? undefined : 'Each project is a small case study — the problem, the approach, and what it proves.'}
          />
          {activeFilter && (
            <button
              onClick={() => { clearFilter(); setCategoryFilter('All'); }}
              className="text-sm font-sans font-medium text-text-secondary hover:text-text-primary border border-glass/10 hover:border-glass/30 px-4 py-2 rounded-full transition-all duration-300 flex items-center gap-2 shrink-0"
            >
              Clear Filter <span className="text-accent-cyan" aria-hidden="true">✕</span>
            </button>
          )}
        </div>

        {/* Competency detail */}
        <AnimatePresence>
          {activeFilter && COMPETENCY_DETAILS[activeFilter] && (
            <m.div
              key="filter-details"
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="glass-card rounded-2xl p-6 md:p-8 mb-8 border-l-4 border-l-accent-cyan overflow-hidden"
            >
              <h3 className="text-text-primary font-display text-lg font-semibold mb-2 tracking-tight">
                My Expertise in {activeFilter}
              </h3>
              <p className="text-text-secondary font-sans text-sm leading-relaxed font-light max-w-4xl">
                {COMPETENCY_DETAILS[activeFilter]}
              </p>
            </m.div>
          )}
        </AnimatePresence>

        {/* Category tabs */}
        {!activeFilter && (
          <div className="flex flex-wrap gap-2 mb-12" role="group" aria-label="Filter projects by category">
            {PROJECT_CATEGORIES.map((cat) => (
              <button
                key={cat}
                onClick={() => setCategoryFilter(cat)}
                aria-pressed={categoryFilter === cat}
                className={`px-5 py-2 rounded-full text-sm font-sans font-medium transition-all duration-300 ${
                  categoryFilter === cat
                    ? 'bg-accent-cyan text-slate-900 shadow-[0_0_20px_rgba(0,217,255,0.4)]'
                    : 'border border-glass/10 text-text-secondary hover:border-glass/30 hover:text-text-primary'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        )}

        {/* Grid */}
        {filteredProjects.length === 0 ? (
          <div className="w-full py-24 flex flex-col items-center justify-center text-center glass-card rounded-3xl">
            <div className="text-5xl mb-5" aria-hidden="true">🔍</div>
            <h3 className="text-text-primary font-display text-2xl font-bold mb-2">No projects found</h3>
            <p className="text-text-secondary text-sm mb-6">
              I have experience in {activeFilter || categoryFilter}, but no specific projects are listed yet.
            </p>
            <button
              onClick={() => { clearFilter(); setCategoryFilter('All'); }}
              className="px-6 py-3 bg-glass/5 border border-glass/10 rounded-full text-text-primary hover:bg-glass/10 transition-all duration-300"
            >
              View All Projects
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-7 items-stretch">
            {filteredProjects.map((project, index) => (
              <ProjectCard key={project.id} project={project} index={index} onOpen={handleOpen} />
            ))}
          </div>
        )}
      </div>

      {/* Case study modal */}
      <AnimatePresence>
        {openProject && <CaseStudyModal project={openProject} onClose={() => setOpenProject(null)} />}
      </AnimatePresence>
    </section>
  );
};

export default Projects;
