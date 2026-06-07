import React from 'react';
import { m, useReducedMotion } from 'framer-motion';
import { FaStar } from 'react-icons/fa';

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

const Reviews = () => {
  const shouldReduceMotion = useReducedMotion();
  const row1 = [...REVIEWS].sort(() => 0.5 - Math.random());
  const row2 = [...REVIEWS].sort(() => 0.5 - Math.random());

  return (
    <m.section 
      className="w-full py-20 overflow-hidden"
      initial={{ opacity: 0 }}
      whileInView={{ opacity: 1 }}
      viewport={{ once: true }}
      transition={{ duration: 0.6 }}
    >
      <div className="max-w-screen-2xl mx-auto px-4 md:px-8 lg:px-16 2xl:px-0 mb-12">
        <div className="flex items-center gap-3 mb-4">
          <span className="font-mono text-accent-cyan text-sm tracking-widest">Client Feedback</span>
          <div className="w-12 h-px bg-white/[0.06]" />
        </div>
        <h2 className="font-sans text-4xl md:text-5xl font-bold text-white tracking-tighter">
          What People <span className="text-gradient">Say</span>
        </h2>
      </div>

      <div 
        className="flex flex-col gap-6 relative"
        aria-label="Client testimonials carousel"
      >
        {/* Row 1: Left */}
        <div className="flex overflow-hidden pause-on-hover pause-on-focus relative group touch-pan-x">
          <div className={`flex w-max ${shouldReduceMotion ? '' : 'animate-marquee'}`}>
            {[...row1, ...row1, ...row1].map((review, i) => (
              <ReviewCard key={`r1-${i}`} review={review} />
            ))}
          </div>
        </div>

        {/* Row 2: Right */}
        <div className="flex overflow-hidden pause-on-hover pause-on-focus relative group touch-pan-x">
          <div className={`flex w-max ${shouldReduceMotion ? '' : 'animate-marquee-reverse'}`}>
            {[...row2, ...row2, ...row2].map((review, i) => (
              <ReviewCard key={`r2-${i}`} review={review} />
            ))}
          </div>
        </div>

        {/* Fades */}
        <div className="absolute inset-y-0 left-0 w-12 md:w-32 bg-gradient-to-r from-primary to-transparent z-10 pointer-events-none" />
        <div className="absolute inset-y-0 right-0 w-12 md:w-32 bg-gradient-to-l from-primary to-transparent z-10 pointer-events-none" />
      </div>
    </m.section>
  );
};

export default Reviews;
