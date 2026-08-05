import React from 'react';
import { m } from 'framer-motion';
import { FaExternalLinkAlt, FaBookOpen, FaPenNib } from 'react-icons/fa';
import { ARTICLES } from '../utils/constants';
import SectionHeading from './ui/SectionHeading';
import Reveal from './ui/Reveal';

const hasLink = (link) => link && link !== '#';

const ArticleCard = ({ article, index }) => {
  const published = hasLink(article.link);
  const Wrapper = published ? m.a : m.div;
  const wrapperProps = published
    ? { href: article.link, target: '_blank', rel: 'noopener noreferrer', whileHover: { y: -5 } }
    : {};

  return (
    <Reveal delay={index * 0.08}>
      <Wrapper
        {...wrapperProps}
        className={`glass-card glass-card-hover rounded-3xl p-5 sm:p-6 md:p-8 flex flex-col group transition-all duration-500 overflow-hidden relative h-full ${
          published ? 'cursor-pointer hover:shadow-[0_15px_40px_rgba(0,0,0,0.4)]' : ''
        }`}
      >
        <div className={`absolute inset-0 ${article.gradient} opacity-0 group-hover:opacity-100 transition-opacity duration-500 z-0`} />

        <div className="relative z-10 flex flex-col h-full">
          <div className="flex items-start justify-between mb-6">
            <div className="w-12 h-12 rounded-2xl bg-glass/[0.04] border border-glass/10 flex items-center justify-center text-2xl group-hover:scale-110 transition-transform duration-500" aria-hidden="true">
              {article.icon}
            </div>
            <div className="flex items-center gap-2 text-text-secondary">
              <span className="font-mono text-xs uppercase tracking-widest">{article.date}</span>
              <span className="w-1 h-1 rounded-full bg-glass/20" aria-hidden="true" />
              <span className="font-mono text-xs uppercase tracking-widest text-accent-cyan">{article.readTime}</span>
            </div>
          </div>

          <h3 className="font-display text-xl md:text-2xl font-bold text-text-primary mb-4 group-hover:text-accent-cyan transition-colors leading-tight">
            {article.title}
          </h3>

          <p className="font-sans text-text-secondary text-sm md:text-base leading-relaxed mb-8 flex-grow">
            {article.excerpt}
          </p>

          <div className="flex items-center justify-between mt-auto pt-6 border-t border-glass/[0.06]">
            <div className="flex flex-wrap gap-2">
              {article.tags.map((tag) => (
                <span key={tag} className="font-mono text-[10px] uppercase tracking-wider px-2.5 py-1 rounded-full border border-glass/10 text-text-secondary bg-glass/[0.02]">
                  {tag}
                </span>
              ))}
            </div>
            {published ? (
              <div className="w-8 h-8 rounded-full bg-glass/[0.04] border border-glass/10 flex items-center justify-center text-text-secondary group-hover:bg-accent-cyan group-hover:text-slate-900 transition-all duration-300 group-hover:rotate-45">
                <FaExternalLinkAlt size={12} aria-hidden="true" />
              </div>
            ) : (
              <span className="inline-flex items-center gap-1.5 font-mono text-[10px] uppercase tracking-wider px-3 py-1.5 rounded-full border border-accent-emerald/30 text-accent-emerald bg-accent-emerald/10">
                <FaPenNib size={9} aria-hidden="true" /> In progress
              </span>
            )}
          </div>
        </div>
      </Wrapper>
    </Reveal>
  );
};

const Blog = () => {
  return (
    <section
      id="writing"
      aria-label="Technical writing"
      className="w-full max-w-screen-2xl mx-auto px-4 md:px-8 lg:px-16 2xl:px-0 py-20 md:py-32"
    >
      <SectionHeading
        index="05"
        eyebrow="Articles"
        title="Technical"
        accent="Writing"
        subtitle="Thoughts, research, and deep dives into AI/ML, Data Science, and Backend Development."
        className="mb-16"
      />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {ARTICLES.map((article, i) => (
          <ArticleCard key={article.id} article={article} index={i} />
        ))}
      </div>

      <Reveal className="mt-16 text-center">
        <div className="inline-flex items-center gap-3 px-6 py-4 rounded-2xl bg-glass/[0.02] border border-glass/[0.05]">
          <FaBookOpen className="text-accent-emerald" size={20} aria-hidden="true" />
          <span className="font-sans text-sm text-text-secondary">More articles coming soon on Medium and Substack.</span>
        </div>
      </Reveal>
    </section>
  );
};

export default Blog;
