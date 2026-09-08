import React from 'react';

/* ────────────────────────────────────────────────────────────────────────
   SiteBackground — subtle global depth wash behind every section.

   The circuit board (traces / nodes / rings / grid and all of its animation)
   was removed site-wide. What remains is pure, static ambience: a faint
   corner/top glow and an edge vignette, both theme-aware via the --cb-glow-*
   and --cb-vignette custom properties. No SVG, no animation, no circuit.
──────────────────────────────────────────────────────────────────────── */

const SiteBackground = () => {
  return (
    <div
      className="fixed inset-0 z-0 overflow-hidden pointer-events-none"
      aria-hidden="true"
    >
      <div className="sb-glow-bg absolute inset-0" />
      <div className="sb-vignette absolute inset-0" />

      <style>{`
        .sb-glow-bg {
          background:
            radial-gradient(ellipse 30% 50% at 0% 40%,   var(--cb-glow-corner), transparent 70%),
            radial-gradient(ellipse 30% 50% at 100% 60%, var(--cb-glow-corner), transparent 70%),
            radial-gradient(ellipse 50% 30% at 50% -5%,  var(--cb-glow-top),    transparent 60%);
        }
        .sb-vignette {
          background: radial-gradient(
            ellipse 80% 80% at 50% 45%,
            transparent 50%,
            var(--cb-vignette) 100%
          );
        }
      `}</style>
    </div>
  );
};

export default SiteBackground;
