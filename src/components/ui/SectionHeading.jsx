import React from 'react';
import Reveal from './Reveal';

/**
 * Consistent numbered section heading used across the narrative:
 *   03 · ————————————
 *   Selected <gradient>Projects</gradient>
 *   optional subtitle
 */
const SectionHeading = ({ index, eyebrow, title, accent, subtitle, align = 'left', className = '' }) => {
  const centered = align === 'center';
  return (
    <Reveal blur direction={centered ? 'up' : 'right'} className={`${centered ? 'text-center' : ''} ${className}`}>
      <div className={`flex items-center gap-3 mb-5 ${centered ? 'justify-center' : ''}`}>
        <span className="font-mono text-accent-cyan text-sm tracking-widest uppercase">
          {index ? `${index}.` : ''} {eyebrow}
        </span>
        <div className={`h-px bg-glass/[0.08] ${centered ? 'w-12' : 'flex-1'}`} />
      </div>
      <h2 className="fluid-h2 font-bold text-text-primary">
        {title} {accent && <span className="text-accent-cyan">{accent}</span>}
      </h2>
      {subtitle && (
        <p className={`text-text-secondary font-sans text-base mt-4 font-light max-w-xl ${centered ? 'mx-auto' : ''}`}>
          {subtitle}
        </p>
      )}
    </Reveal>
  );
};

export default SectionHeading;
