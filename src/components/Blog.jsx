import React, { useState, useEffect } from 'react';
import { m, AnimatePresence } from 'framer-motion';
import { FaExternalLinkAlt, FaBookOpen } from 'react-icons/fa';
import { ARTICLES } from '../utils/constants';
import Skeleton from './Skeleton';

const containerVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.1 } },
};

const itemVariants = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: [0.16, 1, 0.3, 1] } },
};

const ArticleCard = ({ article }) => {
  return (
    <m.a
      href={article.link}
      target="_blank"
      rel="noopener noreferrer"
      variants={itemVariants}
      whileHover={{ y: -5 }}
      className="glass-card rounded-3xl p-6 md:p-8 flex flex-col group cursor-pointer hover:shadow-[0_15px_40px_rgba(0,0,0,0.4)] transition-all duration-500 overflow-hidden relative block"
    >
      <div className={`absolute inset-0 bg-gradient-to-br ${article.gradient} opacity-0 group-hover:opacity-100 transition-opacity duration-500 z-0`} />
      
      <div className="relative z-10 flex flex-col h-full">
        <div className="flex items-start justify-between mb-6">
          <div className="w-12 h-12 rounded-2xl bg-white/[0.04] border border-white/10 flex items-center justify-center text-2xl group-hover:scale-110 transition-transform duration-500">
            {article.icon}
          </div>
          <div className="flex items-center gap-2 text-text-secondary">
            <span className="font-mono text-xs uppercase tracking-widest">{article.date}</span>
            <span className="w-1 h-1 rounded-full bg-white/20" />
            <span className="font-mono text-xs uppercase tracking-widest text-accent-cyan">{article.readTime}</span>
          </div>
        </div>

        <h3 className="font-sans text-xl md:text-2xl font-bold text-white mb-4 group-hover:text-accent-cyan transition-colors leading-tight">
          {article.title}
        </h3>
        
        <p className="font-sans text-text-secondary/80 text-sm md:text-base leading-relaxed mb-8 flex-grow">
          {article.excerpt}
        </p>

        <div className="flex items-center justify-between mt-auto pt-6 border-t border-white/[0.06]">
          <div className="flex flex-wrap gap-2">
            {article.tags.map((tag) => (
              <span key={tag} className="font-mono text-[10px] uppercase tracking-wider px-2.5 py-1 rounded-full border border-white/10 text-text-secondary bg-white/[0.02]">
                {tag}
              </span>
            ))}
          </div>
          <div className="w-8 h-8 rounded-full bg-white/[0.04] border border-white/10 flex items-center justify-center text-text-secondary group-hover:bg-accent-cyan group-hover:text-primary transition-all duration-300 transform group-hover:rotate-45">
            <FaExternalLinkAlt size={12} />
          </div>
        </div>
      </div>
    </m.a>
  );
};

const Blog = () => {
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setIsLoaded(true), 1000);
    return () => clearTimeout(timer);
  }, []);

  return (
    <m.section
      className="w-full max-w-screen-2xl mx-auto px-4 md:px-8 lg:px-16 2xl:px-0 py-20 md:py-32"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      <m.div variants={itemVariants} className="mb-16">
        <div className="flex items-center gap-3 mb-4">
          <span className="font-mono text-accent-cyan text-sm tracking-widest">Articles</span>
          <div className="flex-1 h-px bg-white/[0.06]" />
        </div>
        <h2 className="font-sans text-4xl md:text-5xl font-bold text-white tracking-tighter">
          Technical <span className="text-gradient">Writing</span>
        </h2>
        <p className="text-text-secondary font-sans text-base mt-4 font-light max-w-xl">
          Thoughts, research, and deep dives into AI/ML, Data Science, and Backend Development.
        </p>
      </m.div>

      <AnimatePresence mode="wait">
        {!isLoaded ? (
          <m.div
            key="blog-skeletons"
            className="grid grid-cols-1 md:grid-cols-2 gap-6"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            {[1, 2, 3, 4].map(i => (
              <Skeleton key={i} width="100%" height="320px" borderRadius="24px" />
            ))}
          </m.div>
        ) : (
          <m.div
            key="blog-real"
            className="grid grid-cols-1 md:grid-cols-2 gap-6"
            variants={containerVariants}
            initial="hidden"
            animate="visible"
          >
            {ARTICLES.map((article) => (
              <ArticleCard key={article.id} article={article} />
            ))}
          </m.div>
        )}
      </AnimatePresence>

      <m.div variants={itemVariants} className="mt-16 text-center">
        <div className="inline-flex items-center gap-3 px-6 py-4 rounded-2xl bg-white/[0.02] border border-white/[0.05]">
          <FaBookOpen className="text-accent-purple" size={20} />
          <span className="font-sans text-sm text-text-secondary">More articles coming soon on Medium and Substack.</span>
        </div>
      </m.div>
    </m.section>
  );
};

export default Blog;
