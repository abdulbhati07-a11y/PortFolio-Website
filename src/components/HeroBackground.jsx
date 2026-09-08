import React, { useMemo } from 'react';
import { useReducedMotion } from 'framer-motion';

/* ────────────────────────────────────────────────────────────────────────
   HeroBackground — a premium "cyber interface" circuit board.

   Pure SVG + CSS keyframes (no canvas, no extra deps). Everything animates
   with transform / opacity / stroke-dashoffset only, so it stays cheap and
   GPU-friendly. It draws on a near-black field:

     • an extremely subtle grid
     • thin cyan PCB traces with 45° jogs
     • light pulses that travel ALONG the traces (stroke-dash trick)
     • gently pulsing connection nodes with soft radial glow
     • a couple of large outlined rings
     • slow-drifting particles

   viewBox is 1440×900 and the SVG is sliced to cover any viewport, so the
   circuitry always reaches the screen edges — no dead margins.

   Respects prefers-reduced-motion: motion elements (pulses, particles,
   ring spin) are dropped and the static circuit is shown instead.
──────────────────────────────────────────────────────────────────────── */

// Traces are normalized to pathLength=100 so a single dash keyframe works
// for every path regardless of its real length.
const TRACES = [
  'M 0 130 H 150 L 205 185 V 300 L 250 345 H 360',
  'M 0 470 H 95 L 150 415 H 300 L 345 460 V 560',
  'M 0 760 H 210 L 275 695 V 545',
  'M 1440 220 H 1270 L 1205 285 V 430 L 1160 475',
  'M 1440 600 H 1300 L 1235 535 H 1070',
  'M 1440 820 H 1250 L 1190 760 V 640',
  'M 470 900 V 815 L 535 750 H 720',
  'M 980 900 V 810 H 1180 L 1245 745 V 660',
];

const NODES = [
  { x: 360, y: 345, r: 4, glow: 34 },
  { x: 345, y: 560, r: 3, glow: 26 },
  { x: 275, y: 545, r: 4, glow: 30 },
  { x: 1160, y: 475, r: 4, glow: 34 },
  { x: 1070, y: 535, r: 3, glow: 26 },
  { x: 1190, y: 640, r: 3.5, glow: 28 },
  { x: 720, y: 750, r: 3, glow: 24 },
  { x: 1245, y: 660, r: 4, glow: 30 },
  { x: 150, y: 130, r: 2.5, glow: 20 },
  { x: 1300, y: 600, r: 3, glow: 26 },
];

const RINGS = [
  { x: 1360, y: 300, r: 26 },
  { x: 90, y: 610, r: 20 },
  { x: 1320, y: 610, r: 40 },
];

// Deterministic particle field (no per-frame React, no Math.random at render).
const PARTICLES = [
  { x: 220, y: 250, r: 1.6, dx: 14, dy: -10, dur: 15 },
  { x: 520, y: 160, r: 1.2, dx: -10, dy: 12, dur: 19 },
  { x: 900, y: 240, r: 1.8, dx: 12, dy: 14, dur: 17 },
  { x: 1180, y: 180, r: 1.3, dx: -14, dy: 8, dur: 21 },
  { x: 700, y: 460, r: 1.5, dx: 10, dy: -12, dur: 16 },
  { x: 300, y: 700, r: 1.4, dx: 14, dy: 10, dur: 20 },
  { x: 1080, y: 760, r: 1.7, dx: -12, dy: -10, dur: 18 },
  { x: 620, y: 820, r: 1.2, dx: 8, dy: -14, dur: 22 },
  { x: 1300, y: 440, r: 1.5, dx: -10, dy: 12, dur: 15 },
];

const HeroBackground = () => {
  const reduce = useReducedMotion();

  // Stable pseudo-random-ish animation timings so nothing marches in lockstep.
  const traceTimings = useMemo(
    () => TRACES.map((_, i) => ({ dur: 6.5 + (i % 4) * 1.6, delay: (i * 1.3) % 7 })),
    []
  );
  const nodeTimings = useMemo(
    () => NODES.map((_, i) => ({ dur: 3.2 + (i % 3) * 0.9, delay: (i * 0.6) % 4 })),
    []
  );

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none" aria-hidden="true">
      {/* Base wash: near-black with a faint cyan depth glow top-center + corners */}
      <div className="absolute inset-0 bg-[#07090b]" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_60%_50%_at_50%_-10%,rgba(0,212,255,0.10),transparent_60%),radial-gradient(ellipse_40%_40%_at_100%_100%,rgba(0,180,216,0.08),transparent_60%)]" />

      <svg
        className="absolute inset-0 w-full h-full"
        viewBox="0 0 1440 900"
        preserveAspectRatio="xMidYMid slice"
        fill="none"
      >
        <defs>
          {/* Subtle grid */}
          <pattern id="hb-grid" width="44" height="44" patternUnits="userSpaceOnUse">
            <path d="M 44 0 L 0 0 0 44" fill="none" stroke="rgba(120,180,200,0.05)" strokeWidth="1" />
          </pattern>
          {/* Bigger accent grid every 4 cells */}
          <pattern id="hb-grid-lg" width="176" height="176" patternUnits="userSpaceOnUse">
            <path d="M 176 0 L 0 0 0 176" fill="none" stroke="rgba(0,212,255,0.05)" strokeWidth="1" />
          </pattern>
          <linearGradient id="hb-trace" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0" stopColor="#00d4ff" stopOpacity="0.0" />
            <stop offset="0.5" stopColor="#00d4ff" stopOpacity="0.35" />
            <stop offset="1" stopColor="#00b4d8" stopOpacity="0.1" />
          </linearGradient>
          <filter id="hb-glow" x="-120%" y="-120%" width="340%" height="340%">
            <feGaussianBlur stdDeviation="4" result="b" />
            <feMerge>
              <feMergeNode in="b" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        <rect width="1440" height="900" fill="url(#hb-grid)" />
        <rect width="1440" height="900" fill="url(#hb-grid-lg)" />

        {/* Static faint traces (always present so wires read even between pulses) */}
        {TRACES.map((d, i) => (
          <path key={`base-${i}`} d={d} stroke="url(#hb-trace)" strokeWidth="1.25" strokeLinecap="round" strokeLinejoin="round" />
        ))}

        {/* Traveling light pulses along the traces */}
        {!reduce &&
          TRACES.map((d, i) => (
            <path
              key={`pulse-${i}`}
              d={d}
              pathLength="100"
              stroke="#5ff2ff"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              filter="url(#hb-glow)"
              style={{
                strokeDasharray: '7 93',
                animation: `hb-flow ${traceTimings[i].dur}s linear ${traceTimings[i].delay}s infinite`,
              }}
            />
          ))}

        {/* Rings */}
        {RINGS.map((ring, i) => (
          <g key={`ring-${i}`} style={{ transformOrigin: `${ring.x}px ${ring.y}px` }}>
            <circle
              cx={ring.x}
              cy={ring.y}
              r={ring.r}
              stroke="rgba(0,212,255,0.28)"
              strokeWidth="1.25"
              style={
                reduce
                  ? {}
                  : {
                      transformOrigin: `${ring.x}px ${ring.y}px`,
                      animation: `hb-ring ${7 + i * 2}s ease-in-out ${i}s infinite`,
                    }
              }
            />
            <circle cx={ring.x} cy={ring.y} r={2} fill="#00d4ff" opacity="0.6" />
          </g>
        ))}

        {/* Nodes with soft radial glow + gentle pulse */}
        {NODES.map((n, i) => (
          <g key={`node-${i}`}>
            <circle
              cx={n.x}
              cy={n.y}
              r={n.glow}
              fill="rgba(0,212,255,0.06)"
              style={
                reduce
                  ? {}
                  : {
                      transformOrigin: `${n.x}px ${n.y}px`,
                      animation: `hb-node ${nodeTimings[i].dur}s ease-in-out ${nodeTimings[i].delay}s infinite`,
                    }
              }
            />
            <circle cx={n.x} cy={n.y} r={n.r} fill="#4de8ff" filter="url(#hb-glow)" />
          </g>
        ))}

        {/* Slow drifting particles */}
        {!reduce &&
          PARTICLES.map((p, i) => (
            <circle
              key={`p-${i}`}
              cx={p.x}
              cy={p.y}
              r={p.r}
              fill="#7af0ff"
              style={{
                '--dx': `${p.dx}px`,
                '--dy': `${p.dy}px`,
                animation: `hb-drift ${p.dur}s ease-in-out ${(i * 0.7) % 5}s infinite`,
              }}
            />
          ))}
      </svg>

      {/* Vignette so the composition darkens toward the edges and the
          content panels always stay dominant. */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_80%_at_50%_45%,transparent_50%,rgba(4,6,8,0.75)_100%)]" />

      {/* Scoped keyframes — transform / opacity / dashoffset only. */}
      <style>{`
        @keyframes hb-flow { from { stroke-dashoffset: 100; } to { stroke-dashoffset: 0; } }
        @keyframes hb-node {
          0%, 100% { opacity: 0.5; transform: scale(0.85); }
          50%      { opacity: 1;   transform: scale(1.15); }
        }
        @keyframes hb-ring {
          0%, 100% { opacity: 0.25; transform: scale(0.94); }
          50%      { opacity: 0.55; transform: scale(1.06); }
        }
        @keyframes hb-drift {
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

export default HeroBackground;
