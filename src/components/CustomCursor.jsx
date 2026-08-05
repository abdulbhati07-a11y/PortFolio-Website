import React, { useEffect, useState } from 'react';
import { m, useMotionValue, useSpring, useReducedMotion } from 'framer-motion';

/**
 * Custom desktop cursor.
 * Position is driven entirely by motion values + a spring — the pointermove
 * handler never calls setState, so moving the mouse triggers zero React
 * re-renders. Only the low-frequency hover/click booleans use state.
 * Disabled for touch/coarse pointers and for reduced-motion users.
 */
const CustomCursor = () => {
  const prefersReducedMotion = useReducedMotion();
  const [enabled, setEnabled] = useState(false);
  const [isHovering, setIsHovering] = useState(false);
  const [isClicking, setIsClicking] = useState(false);
  const [isVisible, setIsVisible] = useState(false);
  const [label, setLabel] = useState('');

  // Raw pointer position — drives the dot instantly.
  const x = useMotionValue(-200);
  const y = useMotionValue(-200);

  // Spring-smoothed position — drives the trailing ring.
  const ringX = useSpring(x, { damping: 28, stiffness: 350, mass: 0.6 });
  const ringY = useSpring(y, { damping: 28, stiffness: 350, mass: 0.6 });

  // Only enable on devices with a fine pointer (mouse/trackpad).
  useEffect(() => {
    if (prefersReducedMotion) return;
    const mq = window.matchMedia('(pointer: fine)');
    const apply = () => setEnabled(mq.matches);
    apply();
    mq.addEventListener('change', apply);
    return () => mq.removeEventListener('change', apply);
  }, [prefersReducedMotion]);

  useEffect(() => {
    if (!enabled) return;

    const onMove = (e) => {
      x.set(e.clientX);
      y.set(e.clientY);
      if (!isVisible) setIsVisible(true);
    };

    const onOver = (e) => {
      const target = e.target;
      const interactive =
        target.closest('a, button, [role="button"], input, textarea, select, label') ||
        window.getComputedStyle(target).cursor === 'pointer';
      setIsHovering(!!interactive);
      // Contextual cursor label ("View", "Drag", …) from data-cursor attributes.
      const labelled = target.closest('[data-cursor]');
      setLabel(labelled ? labelled.dataset.cursor : '');
    };

    const onDown = () => setIsClicking(true);
    const onUp = () => setIsClicking(false);
    const onLeave = () => setIsVisible(false);
    const onEnter = () => setIsVisible(true);

    window.addEventListener('pointermove', onMove, { passive: true });
    window.addEventListener('pointerover', onOver, { passive: true });
    window.addEventListener('pointerdown', onDown);
    window.addEventListener('pointerup', onUp);
    document.documentElement.addEventListener('pointerleave', onLeave);
    document.documentElement.addEventListener('pointerenter', onEnter);

    return () => {
      window.removeEventListener('pointermove', onMove);
      window.removeEventListener('pointerover', onOver);
      window.removeEventListener('pointerdown', onDown);
      window.removeEventListener('pointerup', onUp);
      document.documentElement.removeEventListener('pointerleave', onLeave);
      document.documentElement.removeEventListener('pointerenter', onEnter);
    };
    // isVisible intentionally omitted: it flips once then stays true.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [enabled]);

  if (!enabled) return null;

  return (
    <div className="pointer-events-none" aria-hidden="true">
      {/* Dot — snaps to the raw pointer position */}
      <m.div
        className="fixed top-0 left-0 z-[9999] pointer-events-none -translate-x-1/2 -translate-y-1/2"
        style={{ x, y }}
        animate={{
          scale: isClicking ? 0.5 : isHovering ? 0 : 1,
          opacity: isVisible ? 1 : 0,
        }}
        transition={{ duration: 0.2 }}
      >
        <div className="w-2 h-2 bg-accent-cyan rounded-full shadow-[0_0_8px_rgba(0,217,255,0.9)]" />
      </m.div>

      {/* Ring — spring-follows the pointer */}
      <m.div
        className="fixed top-0 left-0 z-[9998] pointer-events-none -translate-x-1/2 -translate-y-1/2"
        style={{ x: ringX, y: ringY }}
        animate={{ opacity: isVisible ? 1 : 0 }}
        transition={{ duration: 0.3 }}
      >
        <m.div
          className="relative rounded-full border flex items-center justify-center"
          animate={{
            width: label ? 64 : isHovering ? 48 : isClicking ? 28 : 36,
            height: label ? 64 : isHovering ? 48 : isClicking ? 28 : 36,
            borderColor: isHovering ? 'rgba(0,217,255,0.6)' : 'rgba(0,217,255,0.3)',
            backgroundColor: label ? 'rgba(0,217,255,0.14)' : isHovering ? 'rgba(0,217,255,0.08)' : 'rgba(0,217,255,0)',
            boxShadow: isHovering ? '0 0 20px rgba(0,217,255,0.2)' : '0 0 0 rgba(0,217,255,0)',
          }}
          transition={{ duration: 0.3, ease: 'easeOut' }}
        >
          <div
            className="absolute inset-0 rounded-full border-t border-r border-accent-cyan/60 animate-spin"
            style={{ animationDuration: isHovering ? '0.8s' : '3s' }}
          />
          {label && (
            <span className="font-mono text-[9px] font-bold tracking-widest uppercase text-accent-cyan select-none">
              {label}
            </span>
          )}
        </m.div>
      </m.div>
    </div>
  );
};

export default CustomCursor;
