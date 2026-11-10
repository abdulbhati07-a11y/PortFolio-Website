import React, { useEffect, useRef } from 'react';

export default function LabCursor() {
  const cursor = useRef(null);

  useEffect(() => {
    const finePointer = matchMedia('(min-width: 701px) and (pointer: fine) and (prefers-reduced-motion: no-preference)');
    if (!finePointer.matches) return;

    const move = event => {
      if (event.pointerType !== 'mouse') return;
      const node = cursor.current;
      if (!node) return;
      node.style.transform = `translate3d(${event.clientX}px,${event.clientY}px,0)`;
      node.classList.add('is-visible');
      node.classList.toggle('is-interactive', Boolean(event.target instanceof Element && event.target.closest('a,button,summary,[role="button"]')));
    };
    const hide = () => cursor.current?.classList.remove('is-visible');
    const press = () => cursor.current?.classList.add('is-pressed');
    const release = () => cursor.current?.classList.remove('is-pressed');
    document.addEventListener('pointermove', move, { passive: true });
    document.addEventListener('pointerleave', hide);
    window.addEventListener('blur', hide);
    document.addEventListener('pointerdown', press);
    document.addEventListener('pointerup', release);
    return () => {
      document.removeEventListener('pointermove', move);
      document.removeEventListener('pointerleave', hide);
      window.removeEventListener('blur', hide);
      document.removeEventListener('pointerdown', press);
      document.removeEventListener('pointerup', release);
    };
  }, []);

  return <div ref={cursor} className="lab-cursor" aria-hidden="true">
    <span className="cursor-glow" />
    <svg viewBox="0 0 32 39" fill="none" focusable="false" aria-hidden="true">
      <path d="M3 2.5V33.5L10.8 25.7L16.4 37L22.2 34.3L16.7 23.2L29.8 22.3L3 2.5Z" fill="#0B1B22" stroke="#78F7E5" strokeWidth="2.2" strokeLinejoin="round" />
      <path d="M7.4 10.2V24.4L11.5 20.3" stroke="#E8FFF9" strokeWidth="1.1" strokeLinecap="round" opacity=".85" />
    </svg>
  </div>;
}
