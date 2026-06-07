import { Variants } from 'framer-motion';

export const fadeUp: Variants = {
  hidden: { opacity: 0, y: 30 },
  visible: { 
    opacity: 1, 
    y: 0, 
    transition: { duration: 0.6, ease: 'easeOut' } 
  }
};

export const fadeIn: Variants = {
  hidden: { opacity: 0 },
  visible: { 
    opacity: 1, 
    transition: { duration: 0.6, ease: 'easeOut' } 
  }
};

export const staggerContainer: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.1
    }
  }
};

export const staggerItem: Variants = {
  hidden: { opacity: 0, y: 20 },
  visible: { 
    opacity: 1, 
    y: 0, 
    transition: { duration: 0.5, ease: 'easeOut' } 
  }
};

export const scaleIn: Variants = {
  hidden: { opacity: 0, scale: 0.85 },
  visible: { 
    opacity: 1, 
    scale: 1, 
    transition: { duration: 0.5, ease: 'easeOut' } 
  }
};

export const slideInLeft: Variants = {
  hidden: { opacity: 0, x: -30 },
  visible: { 
    opacity: 1, 
    x: 0, 
    transition: { duration: 0.6, ease: 'easeOut' } 
  }
};

/**
 * Checks if the user prefers reduced motion using CSS media queries.
 */
export const shouldReduceMotion = (): boolean => {
  if (typeof window === 'undefined') return false;
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
};

/**
 * Utility to return a variant or a no-op version based on the reduced motion flag.
 * If reduced motion is true, it overrides the 'hidden' state to match the 'visible' state,
 * completely disabling the animation effect while retaining visibility.
 */
export const getVariant = (variant: Variants, reduced: boolean): Variants => {
  if (!reduced) return variant;
  
  // Resolve visible state if it happens to be a function
  const visibleState = typeof variant.visible === 'function' ? variant.visible() : variant.visible;
  
  return {
    hidden: { ...visibleState, transition: { duration: 0 } },
    visible: { ...visibleState, transition: { duration: 0 } }
  };
};
