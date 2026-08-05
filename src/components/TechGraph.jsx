import React, { useState, useMemo, useRef, useEffect } from 'react';
import { m, useReducedMotion, AnimatePresence } from 'framer-motion';
import { TECH_STACK } from '../utils/constants';

/* Graph is authored in an 800×600 space; the container holds a 4:3 box so the
   SVG edges (viewBox units) and the HTML nodes (percentages) share one grid. */
const VW = 800;
const VH = 600;

/* Pure, deterministic: scale curated positions → viewBox, derive de-duped
   curved edges, and build a symmetric adjacency map for hover highlighting.
   Runs once (useMemo) — no simulation, no per-frame work. */
const computeGraph = (stack) => {
  const byId = new Map(stack.map((t) => [t.id, t]));
  const adj = new Map(stack.map((t) => [t.id, new Set()]));
  const seen = new Set();
  const edges = [];

  for (const t of stack) {
    for (const c of t.connections) {
      if (!byId.has(c)) continue;
      adj.get(t.id).add(c);
      adj.get(c).add(t.id);
      const key = [t.id, c].sort().join('|');
      if (seen.has(key)) continue;
      seen.add(key);

      const a = t.pos;
      const b = byId.get(c).pos;
      const ax = a.x * VW, ay = a.y * VH, bx = b.x * VW, by = b.y * VH;
      const mx = (ax + bx) / 2, my = (ay + by) / 2;
      const dx = bx - ax, dy = by - ay;
      // Nudge the control point perpendicular to the chord for a gentle bow.
      const cx = mx - dy * 0.13, cy = my + dx * 0.13;
      edges.push({ id: key, source: t.id, target: c, d: `M${ax},${ay} Q${cx},${cy} ${bx},${by}` });
    }
  }
  return { edges, adj };
};

/* ─── Node ────────────────────────────────────────────────────────────── */
const TechNode = ({ node, index, state, onEnter, onLeave, onActivate, reduce }) => {
  const Icon = node.icon;
  const { isCurrent, isNeighbor, isDimmed } = state;

  return (
    <button
      type="button"
      onMouseEnter={onEnter}
      onMouseLeave={onLeave}
      onFocus={onEnter}
      onBlur={onLeave}
      onClick={onActivate}
      aria-label={`${node.name} — ${node.proficiency}% proficiency, ${node.type}. Activate to see related projects.`}
      className="absolute -translate-x-1/2 -translate-y-1/2 focus:outline-none"
      style={{
        left: `${node.pos.x * 100}%`,
        top: `${node.pos.y * 100}%`,
        opacity: isDimmed ? 0.32 : 1,
        transition: 'opacity 0.35s cubic-bezier(0.16,1,0.3,1)',
        zIndex: isCurrent ? 30 : isNeighbor ? 20 : 10,
      }}
    >
      {/* Float lives here (framer translateY); hover-scale lives on the chip
          below so the two transforms never fight over one element. */}
      <m.span
        className="flex flex-col items-center gap-1.5"
        animate={reduce ? {} : { y: [0, -6, 0] }}
        transition={reduce ? {} : { duration: 5.5, repeat: Infinity, ease: 'easeInOut', delay: index * 0.18 }}
      >
        <span
          className="relative flex items-center justify-center rounded-2xl border backdrop-blur-md w-[clamp(38px,7vw,54px)] h-[clamp(38px,7vw,54px)]"
          style={{
            borderColor: isCurrent
              ? 'rgba(0,212,255,0.7)'
              : isNeighbor
              ? 'rgba(0,212,255,0.4)'
              : 'rgba(128,128,128,0.18)',
            background: isCurrent ? 'rgba(0,212,255,0.10)' : 'rgba(128,128,128,0.06)',
            boxShadow: isCurrent
              ? `0 0 24px -2px ${node.color}66, 0 8px 24px -8px rgba(0,0,0,0.45)`
              : isNeighbor
              ? '0 0 16px -4px rgba(0,212,255,0.35)'
              : '0 4px 14px -6px rgba(0,0,0,0.3)',
            transform: `scale(${isCurrent ? 1.16 : isNeighbor ? 1.06 : 1})`,
            transition:
              'transform 0.35s cubic-bezier(0.16,1,0.3,1), box-shadow 0.35s, border-color 0.35s, background 0.35s',
            willChange: 'transform',
          }}
        >
          <Icon
            size={26}
            className="transition-colors duration-300"
            style={{ color: isCurrent ? node.color : 'rgb(var(--text-secondary))' }}
            aria-hidden="true"
          />
        </span>
        <span
          className="font-sans text-[10px] sm:text-[11px] font-semibold tracking-tight whitespace-nowrap transition-colors duration-300"
          style={{ color: isCurrent ? 'rgb(var(--text-primary))' : 'rgb(var(--text-tertiary))' }}
        >
          {node.name}
        </span>
      </m.span>
    </button>
  );
};

/* ─── Tooltip ─────────────────────────────────────────────────────────── */
const TechTooltip = ({ node, reduce }) => {
  // Anchor so the card never clips against the graph edges. tx/ty are percent
  // of the tooltip's own box — passed through framer's x/y so they compose
  // cleanly with the scale/opacity entrance (no transform conflicts).
  const alignX = node.pos.x < 0.26 ? 'left' : node.pos.x > 0.74 ? 'right' : 'center';
  const below = node.pos.y < 0.5;
  const tx = alignX === 'center' ? '-50%' : alignX === 'left' ? '-8%' : '-92%';
  const ty = below ? '18%' : '-118%';

  return (
    <m.div
      role="tooltip"
      className="absolute z-40 w-[min(78vw,260px)] pointer-events-none"
      style={{ left: `${node.pos.x * 100}%`, top: `${node.pos.y * 100}%` }}
      initial={reduce ? { opacity: 0, x: tx, y: ty } : { opacity: 0, scale: 0.94, x: tx, y: ty }}
      animate={{ opacity: 1, scale: 1, x: tx, y: ty }}
      exit={{ opacity: 0, scale: 0.96, x: tx, y: ty }}
      transition={{ duration: 0.24, ease: [0.16, 1, 0.3, 1] }}
    >
      <div className="rounded-2xl border border-accent-cyan/30 bg-secondary/90 backdrop-blur-xl p-4 shadow-[0_16px_48px_-12px_rgba(0,0,0,0.5)]">
        <div className="flex items-center justify-between gap-3 mb-2.5">
          <div className="flex items-center gap-2">
            <node.icon size={18} style={{ color: node.color }} aria-hidden="true" />
            <span className="font-display text-sm font-bold text-text-primary tracking-tight">{node.name}</span>
          </div>
          <span className="font-mono text-[9px] font-bold uppercase tracking-widest text-text-secondary border border-glass/15 rounded-full px-2 py-0.5">
            {node.type}
          </span>
        </div>

        {/* Proficiency */}
        <div className="flex items-center gap-2 mb-3">
          <div className="flex-1 h-1.5 rounded-full bg-glass/10 overflow-hidden">
            <m.div
              className="h-full rounded-full bg-accent-cyan"
              initial={{ width: reduce ? `${node.proficiency}%` : 0 }}
              animate={{ width: `${node.proficiency}%` }}
              transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
            />
          </div>
          <span className="font-mono text-xs font-bold text-accent-cyan">{node.proficiency}%</span>
        </div>

        <p className="font-sans text-[11px] leading-relaxed text-text-secondary mb-2.5">{node.useCase}</p>

        {node.projects.length > 0 && (
          <div className="flex flex-wrap gap-1.5">
            {node.projects.slice(0, 3).map((p) => (
              <span
                key={p}
                className="font-mono text-[9px] tracking-wide text-accent-cyan bg-accent-cyan/10 border border-accent-cyan/20 rounded-full px-2 py-0.5"
              >
                {p}
              </span>
            ))}
          </div>
        )}
      </div>
    </m.div>
  );
};

/* ─── Graph ───────────────────────────────────────────────────────────── */
const TechGraph = ({ onSkillClick }) => {
  const reduce = useReducedMotion();
  const [hoveredId, setHoveredId] = useState(null);
  const [activeId, setActiveId] = useState(null); // touch: first tap selects
  const canHover = useRef(true);

  useEffect(() => {
    canHover.current =
      typeof window !== 'undefined' && window.matchMedia?.('(hover: hover)').matches;
  }, []);

  const { edges, adj } = useMemo(() => computeGraph(TECH_STACK), []);

  const currentId = hoveredId ?? activeId;
  const currentNode = useMemo(
    () => (currentId ? TECH_STACK.find((t) => t.id === currentId) : null),
    [currentId]
  );
  const neighbors = currentId ? adj.get(currentId) : null;

  const handleActivate = (node) => {
    // Fine pointer: click filters immediately. Coarse (touch): first tap
    // reveals the tooltip, a second tap on the same node filters.
    if (canHover.current || activeId === node.id) {
      onSkillClick?.(node.name);
    } else {
      setActiveId(node.id);
    }
  };

  return (
    <div className="glass-card !bg-secondary backdrop-blur-none rounded-3xl p-4 sm:p-6 h-full flex flex-col">
      <div
        className="relative w-full aspect-[4/3]"
        onMouseLeave={() => setHoveredId(null)}
      >
        {/* Ambient wash */}
        <div className="absolute inset-0 rounded-2xl bg-[radial-gradient(circle_at_50%_40%,rgba(0,212,255,0.06),transparent_65%)] pointer-events-none" />

        {/* Edges */}
        <svg
          viewBox={`0 0 ${VW} ${VH}`}
          preserveAspectRatio="none"
          className="absolute inset-0 w-full h-full pointer-events-none"
          aria-hidden="true"
        >
          {edges.map((e) => {
            const active = currentId && (e.source === currentId || e.target === currentId);
            return (
              <path
                key={e.id}
                d={e.d}
                fill="none"
                stroke="#00d4ff"
                strokeWidth={active ? 1.6 : 1}
                strokeLinecap="round"
                style={{
                  opacity: currentId ? (active ? 0.65 : 0.06) : 0.16,
                  transition: 'opacity 0.35s ease, stroke-width 0.35s ease',
                }}
                vectorEffect="non-scaling-stroke"
              />
            );
          })}
        </svg>

        {/* Nodes */}
        {TECH_STACK.map((node, i) => (
          <TechNode
            key={node.id}
            node={node}
            index={i}
            reduce={reduce}
            state={{
              isCurrent: currentId === node.id,
              isNeighbor: !!neighbors && neighbors.has(node.id),
              isDimmed: !!currentId && currentId !== node.id && !(neighbors && neighbors.has(node.id)),
            }}
            onEnter={() => setHoveredId(node.id)}
            onLeave={() => setHoveredId(null)}
            onActivate={() => handleActivate(node)}
          />
        ))}

        {/* Tooltip */}
        <AnimatePresence>
          {currentNode && <TechTooltip key={currentNode.id} node={currentNode} reduce={reduce} />}
        </AnimatePresence>
      </div>

      {/* Hint */}
      <div className="mt-3 pt-3 border-t border-glass/10 flex items-center justify-between gap-3">
        <span className="font-mono text-[10px] tracking-widest text-text-tertiary uppercase">
          Hover to trace the stack
        </span>
        <span className="font-mono text-[10px] tracking-widest text-accent-cyan uppercase">
          Tap a node → see the work
        </span>
      </div>
    </div>
  );
};

export default TechGraph;
