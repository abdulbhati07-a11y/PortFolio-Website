import React from 'react';
import { m, useReducedMotion } from 'framer-motion';

const directions = {
  up: { y: 28, x: 0 },
  down: { y: -28, x: 0 },
  left: { x: 28, y: 0 },
  right: { x: -28, y: 0 },
  none: { x: 0, y: 0 },
};

/**
 * Scroll-triggered reveal. Animates children into place the first time they
 * enter the viewport; renders instantly for reduced-motion users.
 */
const Reveal = ({
  children,
  direction = 'up',
  delay = 0,
  duration = 0.7,
  className = '',
  as = 'div',
  once = true,
  amount = 0.25,
  blur = false,
}) => {
  const shouldReduceMotion = useReducedMotion();
  const offset = directions[direction] ?? directions.up;
  const Component = m[as] ?? m.div;

  if (shouldReduceMotion) {
    const Tag = as;
    return <Tag className={className}>{children}</Tag>;
  }

  return (
    <Component
      className={className}
      initial={{ opacity: 0, ...offset, ...(blur ? { filter: 'blur(8px)' } : {}) }}
      whileInView={{ opacity: 1, x: 0, y: 0, ...(blur ? { filter: 'blur(0px)' } : {}) }}
      viewport={{ once, amount }}
      transition={{ duration, delay, ease: [0.16, 1, 0.3, 1] }}
    >
      {children}
    </Component>
  );
};

export default Reveal;
