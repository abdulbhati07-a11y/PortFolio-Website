import React, { useEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';

const CustomCursor = () => {
  const [mousePos, setMousePos] = useState({ x: -200, y: -200 });
  const [trailPos, setTrailPos] = useState({ x: -200, y: -200 });
  const [isHovering, setIsHovering] = useState(false);
  const [isClicking, setIsClicking] = useState(false);
  const [isVisible, setIsVisible] = useState(false);
  const rafRef = useRef(null);
  const trailRef = useRef({ x: -200, y: -200 });
  const mouseRef = useRef({ x: -200, y: -200 });

  useEffect(() => {
    const onMouseMove = (e) => {
      mouseRef.current = { x: e.clientX, y: e.clientY };
      setMousePos({ x: e.clientX, y: e.clientY });
      if (!isVisible) setIsVisible(true);
    };

    const onMouseOver = (e) => {
      const target = e.target;
      const isInteractive =
        target.tagName === 'A' ||
        target.tagName === 'BUTTON' ||
        target.closest('a') ||
        target.closest('button') ||
        window.getComputedStyle(target).cursor === 'pointer';
      setIsHovering(!!isInteractive);
    };

    const onMouseDown = () => setIsClicking(true);
    const onMouseUp = () => setIsClicking(false);
    const onMouseLeave = () => setIsVisible(false);
    const onMouseEnter = () => setIsVisible(true);

    window.addEventListener('mousemove', onMouseMove, { passive: true });
    window.addEventListener('mouseover', onMouseOver, { passive: true });
    window.addEventListener('mousedown', onMouseDown);
    window.addEventListener('mouseup', onMouseUp);
    document.documentElement.addEventListener('mouseleave', onMouseLeave);
    document.documentElement.addEventListener('mouseenter', onMouseEnter);

    // Smooth trail
    const animate = () => {
      trailRef.current = {
        x: trailRef.current.x + (mouseRef.current.x - trailRef.current.x) * 0.12,
        y: trailRef.current.y + (mouseRef.current.y - trailRef.current.y) * 0.12,
      };
      setTrailPos({ ...trailRef.current });
      rafRef.current = requestAnimationFrame(animate);
    };
    rafRef.current = requestAnimationFrame(animate);

    return () => {
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mouseover', onMouseOver);
      window.removeEventListener('mousedown', onMouseDown);
      window.removeEventListener('mouseup', onMouseUp);
      document.documentElement.removeEventListener('mouseleave', onMouseLeave);
      document.documentElement.removeEventListener('mouseenter', onMouseEnter);
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, [isVisible]);

  return (
    <div className="hidden md:block pointer-events-none">
      {/* Dot — snaps to cursor */}
      <motion.div
        className="fixed top-0 left-0 z-[9999] pointer-events-none"
        animate={{
          x: mousePos.x - 4,
          y: mousePos.y - 4,
          scale: isClicking ? 0.5 : isHovering ? 0 : 1,
          opacity: isVisible ? 1 : 0,
        }}
        transition={{ type: 'tween', duration: 0, ease: 'linear' }}
      >
        <div className="w-2 h-2 bg-accent-cyan rounded-full shadow-[0_0_8px_rgba(0,217,255,0.9)]" />
      </motion.div>

      {/* Ring — smooth follow */}
      <div
        className="fixed top-0 left-0 z-[9998] pointer-events-none"
        style={{
          transform: `translate(${trailPos.x - 18}px, ${trailPos.y - 18}px)`,
          opacity: isVisible ? 1 : 0,
          transition: 'opacity 0.3s',
        }}
      >
        <div
          className="relative"
          style={{
            width: isHovering ? 48 : isClicking ? 28 : 36,
            height: isHovering ? 48 : isClicking ? 28 : 36,
            transition: 'width 0.3s ease, height 0.3s ease',
          }}
        >
          <div
            className="absolute inset-0 rounded-full border transition-all duration-300"
            style={{
              borderColor: isHovering ? 'rgba(0,217,255,0.6)' : 'rgba(0,217,255,0.3)',
              backgroundColor: isHovering ? 'rgba(0,217,255,0.08)' : 'transparent',
              boxShadow: isHovering ? '0 0 20px rgba(0,217,255,0.2)' : 'none',
            }}
          />
          {/* Spinning arc */}
          <div
            className="absolute inset-0 rounded-full border-t border-r border-accent-cyan/60 animate-spin"
            style={{ animationDuration: isHovering ? '0.8s' : '3s' }}
          />
        </div>
      </div>
    </div>
  );
};

export default CustomCursor;
