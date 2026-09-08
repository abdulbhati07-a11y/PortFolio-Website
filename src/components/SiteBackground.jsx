import React, { useMemo } from 'react';
import { useReducedMotion } from 'framer-motion';

/* ────────────────────────────────────────────────────────────────────────
   SiteBackground — global fixed circuit board behind every section.

   All geometry is confined to the left margin (x ≤ 180) and right margin
   (x ≥ 1250) of the 1440×900 viewBox so traces never overlap content cards.
   Per-element SVG filter blur removed — one GPU compositor layer via
   will-change: transform handles the whole background cheaply.
──────────────────────────────────────────────────────────────────────── */

/* Left margin: x ≤ 180. Right margin: x ≥ 1250. Center stays clear. */
const TRACES = [
  'M 0 80 H 120 L 165 125 V 240',
  'M 0 380 H 100 L 145 335 H 175 V 500',
  'M 0 680 H 130 L 180 630 V 480',
  'M 90 0 V 70 L 140 120 H 170',
  'M 1440 150 H 1330 L 1280 205 V 350',
  'M 1440 520 H 1350 L 1290 460 V 310',
  'M 1440 780 H 1300 L 1250 720 V 590',
  'M 1360 900 V 830 H 1285 L 1260 800',
];

const NODES = [
  { x: 165,  y: 240, r: 3.5, glow: 28 },
  { x: 175,  y: 500, r: 3,   glow: 24 },
  { x: 180,  y: 630, r: 4,   glow: 30 },
  { x: 140,  y: 120, r: 2.5, glow: 20 },
  { x: 1280, y: 350, r: 4,   glow: 32 },
  { x: 1290, y: 310, r: 3,   glow: 24 },
  { x: 1250, y: 590, r: 3.5, glow: 28 },
  { x: 1260, y: 800, r: 3,   glow: 22 },
];

const RINGS = [
  { x: 55,   y: 450, r: 22 },
  { x: 1395, y: 290, r: 26 },
  { x: 1380, y: 660, r: 18 },
];

const PARTICLES = [
  { x: 75,   y: 195, r: 1.5, dx:  8, dy:  -8, dur: 15 },
  { x: 115,  y: 560, r: 1.3, dx: -6, dy:  10, dur: 19 },
  { x: 55,   y: 760, r: 1.6, dx: 10, dy:  -6, dur: 17 },
  { x: 1360, y: 175, r: 1.4, dx: -8, dy:   8, dur: 21 },
  { x: 1400, y: 450, r: 1.5, dx:  6, dy: -10, dur: 16 },
  { x: 1325, y: 730, r: 1.3, dx: -8, dy:   6, dur: 20 },
];

const SiteBackground = () => {
  const reduce = useReducedMotion();

  const traceTimings = useMemo(
    () => TRACES.map((_, i) => ({ dur: 6.5 + (i % 4) * 1.6, delay: (i * 1.3) % 7 })),
    []
  );
  const nodeTimings = useMemo(
    () => NODES.map((_, i) => ({ dur: 3.2 + (i % 3) * 0.9, delay: (i * 0.6) % 4 })),
    []
  );

  return (
    <div
      className="fixed inset-0 z-0 overflow-hidden pointer-events-none"
      style={{ willChange: 'transform', transform: 'translateZ(0)' }}
      aria-hidden="true"
    >
      <div className="sb-glow-bg absolute inset-0" />

      <svg
        className="absolute inset-0 w-full h-full"
        viewBox="0 0 1440 900"
        preserveAspectRatio="xMidYMid slice"
        fill="none"
      >
        <defs>
          <pattern id="sb-grid" width="44" height="44" patternUnits="userSpaceOnUse">
            <path className="sb-grid-fine" d="M 44 0 L 0 0 0 44" fill="none" strokeWidth="1" />
          </pattern>
          <pattern id="sb-grid-lg" width="176" height="176" patternUnits="userSpaceOnUse">
            <path className="sb-grid-coarse" d="M 176 0 L 0 0 0 176" fill="none" strokeWidth="1" />
          </pattern>
        </defs>

        {/* Grid only in the side margins — clip to left and right columns */}
        <rect x="0"    width="185"  height="900" fill="url(#sb-grid)" />
        <rect x="0"    width="185"  height="900" fill="url(#sb-grid-lg)" />
        <rect x="1255" width="185"  height="900" fill="url(#sb-grid)" />
        <rect x="1255" width="185"  height="900" fill="url(#sb-grid-lg)" />

        {/* Static faint traces */}
        {TRACES.map((d, i) => (
          <path
            key={`base-${i}`}
            d={d}
            className="sb-trace-base"
            strokeWidth="1.25"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        ))}

        {/* Traveling light pulses — no per-element filter; glow is CSS only */}
        {!reduce &&
          TRACES.map((d, i) => (
            <path
              key={`pulse-${i}`}
              d={d}
              pathLength="100"
              className="sb-pulse"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              style={{
                strokeDasharray: '7 93',
                animation: `sb-flow ${traceTimings[i].dur}s linear ${traceTimings[i].delay}s infinite`,
              }}
            />
          ))}

        {/* Rings */}
        {RINGS.map((ring, i) => (
          <g key={`ring-${i}`}>
            <circle
              cx={ring.x}
              cy={ring.y}
              r={ring.r}
              className="sb-ring"
              strokeWidth="1.25"
              style={
                reduce
                  ? {}
                  : {
                      transformOrigin: `${ring.x}px ${ring.y}px`,
                      animation: `sb-ring-pulse ${7 + i * 2}s ease-in-out ${i}s infinite`,
                    }
              }
            />
            <circle cx={ring.x} cy={ring.y} r={2} className="sb-ring-dot" />
          </g>
        ))}

        {/* Connection nodes */}
        {NODES.map((n, i) => (
          <g key={`node-${i}`}>
            <circle
              cx={n.x}
              cy={n.y}
              r={n.glow}
              className="sb-node-glow"
              style={
                reduce
                  ? {}
                  : {
                      transformOrigin: `${n.x}px ${n.y}px`,
                      animation: `sb-node ${nodeTimings[i].dur}s ease-in-out ${nodeTimings[i].delay}s infinite`,
                    }
              }
            />
            <circle cx={n.x} cy={n.y} r={n.r} className="sb-node-dot" />
          </g>
        ))}

        {/* Drifting particles — kept to margins */}
        {!reduce &&
          PARTICLES.map((p, i) => (
            <circle
              key={`p-${i}`}
              cx={p.x}
              cy={p.y}
              r={p.r}
              className="sb-particle"
              style={{
                '--dx': `${p.dx}px`,
                '--dy': `${p.dy}px`,
                animation: `sb-drift ${p.dur}s ease-in-out ${(i * 0.7) % 5}s infinite`,
              }}
            />
          ))}
      </svg>

      <div className="sb-vignette absolute inset-0" />

      <style>{`
        .sb-glow-bg {
          background:
            radial-gradient(ellipse 30% 50% at 0% 40%,   var(--cb-glow-corner), transparent 70%),
            radial-gradient(ellipse 30% 50% at 100% 60%, var(--cb-glow-corner), transparent 70%),
            radial-gradient(ellipse 50% 30% at 50% -5%,  var(--cb-glow-top),    transparent 60%);
        }
        .sb-grid-fine   { stroke: var(--cb-grid-fine); }
        .sb-grid-coarse { stroke: var(--cb-grid-coarse); }
        .sb-trace-base  { stroke: var(--cb-trace-mid); }
        .sb-pulse       { stroke: var(--cb-pulse); filter: drop-shadow(0 0 3px var(--cb-pulse)); }
        .sb-ring        { stroke: var(--cb-ring); fill: none; }
        .sb-ring-dot    { fill: var(--cb-ring-dot); opacity: 0.6; }
        .sb-node-glow   { fill: var(--cb-node-glow); }
        .sb-node-dot    { fill: var(--cb-node-fill); }
        .sb-particle    { fill: var(--cb-particle); }
        .sb-vignette {
          background: radial-gradient(
            ellipse 80% 80% at 50% 45%,
            transparent 50%,
            var(--cb-vignette) 100%
          );
        }

        @keyframes sb-flow      { from { stroke-dashoffset: 100; } to { stroke-dashoffset: 0; } }
        @keyframes sb-node      {
          0%, 100% { opacity: 0.5; transform: scale(0.85); }
          50%      { opacity: 1;   transform: scale(1.15); }
        }
        @keyframes sb-ring-pulse {
          0%, 100% { opacity: 0.25; transform: scale(0.94); }
          50%      { opacity: 0.55; transform: scale(1.06); }
        }
        @keyframes sb-drift {
          0%, 100% { opacity: 0.15; transform: translate(0, 0); }
          50%      { opacity: 0.7;  transform: translate(var(--dx), var(--dy)); }
        }
        @media (prefers-reduced-motion: reduce) {
          svg [style*="animation"] { animation: none !important; }
        }
      `}</style>
    </div>
  );
};

export default SiteBackground;
