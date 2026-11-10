import { useEffect } from 'react';

const reset = element => {
  if (!element) return;
  element.style.setProperty('--mag-x', '0px');
  element.style.setProperty('--mag-y', '0px');
};

export default function useMagneticMotion(root) {
  useEffect(() => {
    const container = root.current;
    if (!container) return;
    const finePointer = window.matchMedia('(hover: hover) and (pointer: fine)');
    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
    let active = null;

    const move = event => {
      if (event.pointerType !== 'mouse' || !finePointer.matches || reducedMotion.matches) return;
      const target = event.target.closest?.('[data-magnetic]');
      if (active !== target) reset(active);
      active = target;
      if (!target) return;

      const rect = target.getBoundingClientRect();
      const limit = target.dataset.magnetic === 'book' ? 12 : 8;
      const x = Math.max(-limit, Math.min(limit, (event.clientX - rect.left - rect.width / 2) * .14));
      const y = Math.max(-limit, Math.min(limit, (event.clientY - rect.top - rect.height / 2) * .14));
      target.style.setProperty('--mag-x', `${x.toFixed(1)}px`);
      target.style.setProperty('--mag-y', `${y.toFixed(1)}px`);
    };
    const leave = event => {
      if (active && !active.contains(event.relatedTarget)) {
        reset(active);
        active = null;
      }
    };
    const blur = () => { reset(active); active = null; };

    container.addEventListener('pointermove', move);
    container.addEventListener('pointerout', leave);
    window.addEventListener('blur', blur);
    return () => {
      reset(active);
      container.removeEventListener('pointermove', move);
      container.removeEventListener('pointerout', leave);
      window.removeEventListener('blur', blur);
    };
  }, [root]);
}
