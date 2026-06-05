import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FaGithub, FaExternalLinkAlt, FaStar } from 'react-icons/fa';
import { PROJECTS, COMPETENCY_DETAILS, PROJECT_CATEGORIES } from '../utils/constants';

const containerVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.08 } },
};

const cardVariants = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.7, ease: [0.16, 1, 0.3, 1] } },
};

/* ─── Project Card ────────────────────────────────────────────────────── */
const ProjectCard = ({ project, activeFilter }) => {
  const [hovered, setHovered] = useState(false);

  return (
    <motion.article
      variants={cardVariants}
      layout
      className="glass-card rounded-3xl overflow-hidden group flex flex-col relative card-hover"
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      {/* Featured badge */}
      {project.featured && (
        <div className="absolute top-4 right-4 z-20 flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-accent-cyan/20 border border-accent-cyan/40 text-accent-cyan text-xs font-mono font-bold">
          <FaStar size={9} />
          Featured
        </div>
      )}

      {/* Thumbnail */}
      <div className={`w-full h-48 relative overflow-hidden bg-gradient-to-br ${project.gradient} border-b border-white/[0.05]`}>
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="text-6xl select-none">{project.icon}</span>
        </div>
        {/* Animated overlay on hover */}
        <motion.div
          className="absolute inset-0 bg-gradient-to-t from-primary/80 to-transparent"
          animate={{ opacity: hovered ? 1 : 0.5 }}
          transition={{ duration: 0.3 }}
        />
        {/* Tech peek on hover */}
        <AnimatePresence>
          {hovered && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 10 }}
              className="absolute bottom-3 left-0 right-0 flex justify-center flex-wrap gap-1.5 px-3"
            >
              {project.tech.slice(0, 3).map((t) => (
                <span key={t} className="text-xs font-mono bg-primary/80 text-accent-cyan px-2 py-0.5 rounded-full border border-accent-cyan/30">
                  {t}
                </span>
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Content */}
      <div className="p-7 flex flex-col flex-grow">
        <h3 className="font-sans text-xl font-bold text-white mb-2 tracking-tight group-hover:text-accent-cyan transition-colors duration-300">
          {project.title}
        </h3>
        <p className="font-sans text-text-secondary text-sm leading-relaxed mb-5 flex-grow font-light">
          {project.description}
        </p>

        {/* Tags */}
        <div className="flex flex-wrap gap-2 mb-6">
          {project.tech.map((t, idx) => (
            <span
              key={idx}
              className={`tag text-xs ${
                activeFilter &&
                (t.toLowerCase().includes(activeFilter.toLowerCase()) ||
                  activeFilter.toLowerCase().includes(t.toLowerCase()))
                  ? 'tag-active'
                  : ''
              }`}
            >
              {t}
            </span>
          ))}
        </div>

        {/* Links */}
        <div className="flex gap-3 mt-auto">
          {project.links.github && project.links.github !== '#' && (
            <a
              href={project.links.github}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 text-xs font-sans font-medium text-white border border-white/20 px-4 py-2 rounded-full hover:bg-white hover:text-primary transition-all duration-300"
              aria-label={`View ${project.title} on GitHub`}
            >
              <FaGithub size={13} /> GitHub
            </a>
          )}
          {project.links.demo && project.links.demo !== '#' && (
            <a
              href={project.links.demo}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 text-xs font-sans font-medium text-primary bg-white px-4 py-2 rounded-full hover:bg-white/90 transition-all duration-300"
              aria-label={`View ${project.title} live demo`}
            >
              <FaExternalLinkAlt size={11} /> Live Demo
            </a>
          )}
        </div>
      </div>
    </motion.article>
  );
};

/* ─── Projects Section ────────────────────────────────────────────────── */
const Projects = ({ activeFilter, clearFilter }) => {
  const [categoryFilter, setCategoryFilter] = useState('All');

  const filteredProjects = useMemo(() => {
    let list = PROJECTS;
    // Skill filter from About section
    if (activeFilter) {
      list = list.filter((p) =>
        p.tech.some(
          (t) =>
            t.toLowerCase().includes(activeFilter.toLowerCase()) ||
            activeFilter.toLowerCase().includes(t.toLowerCase())
        )
      );
    }
    // Category tab filter
    if (categoryFilter !== 'All') {
      list = list.filter(
        (p) =>
          p.category === categoryFilter ||
          p.tech.some((t) => t.toLowerCase().includes(categoryFilter.toLowerCase()))
      );
    }
    return list;
  }, [activeFilter, categoryFilter]);

  const featuredProjects = PROJECTS.filter((p) => p.featured);

  return (
    <motion.section
      className="w-full max-w-7xl mx-auto px-6 py-20 md:py-32"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      exit="hidden"
    >
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-6 gap-4">
        <motion.div variants={cardVariants}>
          <div className="flex items-center gap-3 mb-3">
            <span className="font-mono text-accent-cyan text-sm tracking-widest">Projects</span>
            <div className="w-12 h-px bg-white/[0.06]" />
          </div>
          <h2 className="font-sans text-4xl md:text-5xl font-bold text-white tracking-tighter">
            {activeFilter ? (
              <>{activeFilter} <span className="text-gradient">Work</span></>
            ) : (
              <>Selected <span className="text-gradient">Projects</span></>
            )}
          </h2>
        </motion.div>

        {activeFilter && (
          <motion.button
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            onClick={() => { clearFilter(); setCategoryFilter('All'); }}
            className="text-sm font-sans font-medium text-text-secondary hover:text-white border border-white/10 hover:border-white/30 px-4 py-2 rounded-full transition-all duration-300 flex items-center gap-2"
          >
            Clear Filter <span className="text-accent-cyan">✕</span>
          </motion.button>
        )}
      </div>

      {/* Competency detail box */}
      <AnimatePresence mode="wait">
        {activeFilter && COMPETENCY_DETAILS[activeFilter] && (
          <motion.div
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
          </motion.div>
        )}
      </AnimatePresence>

      {/* Category filter tabs */}
      {!activeFilter && (
        <motion.div variants={cardVariants} className="flex flex-wrap gap-2 mb-12">
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
        </motion.div>
      )}

      {/* Featured spotlight (only on "All" with no skill filter) */}
      <AnimatePresence>
        {!activeFilter && categoryFilter === 'All' && (
          <motion.div
            variants={cardVariants}
            className="mb-14"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <h3 className="font-mono text-sm text-text-secondary tracking-widest uppercase mb-5 flex items-center gap-3">
              <FaStar className="text-accent-cyan" size={12} />
              Featured Work
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {featuredProjects.map((project) => (
                <motion.article
                  key={project.id}
                  layout
                  className="glass-card rounded-3xl overflow-hidden group flex flex-col md:flex-row card-hover relative"
                >
                  <div className={`w-full md:w-40 h-36 md:h-auto bg-gradient-to-br ${project.gradient} flex-shrink-0 flex items-center justify-center relative`}>
                    <span className="text-5xl">{project.icon}</span>
                    <div className="absolute inset-0 bg-primary/30" />
                  </div>
                  <div className="p-6 flex flex-col flex-grow">
                    <div className="flex items-start justify-between mb-2">
                      <h3 className="font-sans text-lg font-bold text-white tracking-tight group-hover:text-accent-cyan transition-colors duration-300">
                        {project.title}
                      </h3>
                      <div className="flex items-center gap-1 px-2 py-1 rounded-full bg-accent-cyan/10 border border-accent-cyan/30 text-accent-cyan text-[10px] font-mono ml-2 flex-shrink-0">
                        <FaStar size={8} /> Featured
                      </div>
                    </div>
                    <p className="text-text-secondary text-xs leading-relaxed mb-4 font-light flex-grow">{project.description}</p>
                    <div className="flex flex-wrap gap-1.5 mb-4">
                      {project.tech.slice(0, 3).map((t) => (
                        <span key={t} className="tag text-[11px]">{t}</span>
                      ))}
                    </div>
                    <div className="flex gap-3">
                      {project.links.github && project.links.github !== '#' && (
                        <a href={project.links.github} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1.5 text-xs text-white border border-white/20 px-3 py-1.5 rounded-full hover:bg-white hover:text-primary transition-all duration-300">
                          <FaGithub size={11} /> GitHub
                        </a>
                      )}
                    </div>
                  </div>
                </motion.article>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Divider before all projects */}
      {!activeFilter && categoryFilter === 'All' && (
        <div className="section-divider mb-12" />
      )}

      {/* All / filtered projects grid */}
      {filteredProjects.length === 0 ? (
        <motion.div
          variants={cardVariants}
          className="w-full py-24 flex flex-col items-center justify-center text-center glass-card rounded-3xl"
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
        </motion.div>
      ) : (
        <motion.div layout className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-7">
          <AnimatePresence>
            {filteredProjects.map((project) => (
              <ProjectCard key={project.id} project={project} activeFilter={activeFilter || categoryFilter !== 'All' ? categoryFilter : null} />
            ))}
          </AnimatePresence>
        </motion.div>
      )}
    </motion.section>
  );
};

export default Projects;
