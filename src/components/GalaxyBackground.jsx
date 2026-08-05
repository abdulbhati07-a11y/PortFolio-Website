import React, { useRef, useMemo, useState, useEffect } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import * as THREE from 'three';

/* ─── Cinematic spiral galaxy ─────────────────────────────────────────── */
const COUNT = 9000;
const BRANCHES = 5;
const RADIUS = 10;
const SPIN = 0.9;
const RANDOMNESS = 0.35;
const RANDOM_POWER = 3;

// Solid cyan core
const COLOR_CORE = new THREE.Color('#00d4ff');

// Round, soft-edged star sprite so points aren't hard squares.
function makeStarTexture() {
  const size = 64;
  const canvas = document.createElement('canvas');
  canvas.width = canvas.height = size;
  const ctx = canvas.getContext('2d');
  const g = ctx.createRadialGradient(size / 2, size / 2, 0, size / 2, size / 2, size / 2);
  g.addColorStop(0, 'rgba(255,255,255,1)');
  g.addColorStop(0.2, 'rgba(255,255,255,0.9)');
  g.addColorStop(0.45, 'rgba(255,255,255,0.35)');
  g.addColorStop(1, 'rgba(255,255,255,0)');
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, size, size);
  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace;
  return tex;
}

const Galaxy = ({ reducedMotion, scrollRef }) => {
  const pointsRef = useRef();
  const materialRef = useRef();
  const starTexture = useMemo(makeStarTexture, []);

  const { positions, colors } = useMemo(() => {
    const positions = new Float32Array(COUNT * 3);
    const colors = new Float32Array(COUNT * 3);

    for (let i = 0; i < COUNT; i++) {
      const i3 = i * 3;
      const t = Math.random();
      const radius = Math.pow(t, 1.6) * RADIUS; // denser toward the core
      const branchAngle = ((i % BRANCHES) / BRANCHES) * Math.PI * 2;
      const spinAngle = radius * SPIN;

      const rand = () =>
        Math.pow(Math.random(), RANDOM_POWER) *
        (Math.random() < 0.5 ? 1 : -1) *
        RANDOMNESS *
        radius;

      positions[i3] = Math.cos(branchAngle + spinAngle) * radius + rand();
      positions[i3 + 1] = rand() * 0.4; // thin disc
      positions[i3 + 2] = Math.sin(branchAngle + spinAngle) * radius + rand();

      // Solid color for all stars.
      const c = new THREE.Color();
      c.copy(COLOR_CORE);
      colors[i3] = c.r;
      colors[i3 + 1] = c.g;
      colors[i3 + 2] = c.b;
    }
    return { positions, colors };
  }, []);

  useFrame((state, delta) => {
    if (!pointsRef.current) return;
    const scroll = scrollRef.current || 0;
    if (!reducedMotion) pointsRef.current.rotation.y += delta * 0.035;
    pointsRef.current.rotation.x = -0.5 + scroll * 0.5;
    pointsRef.current.position.y = scroll * 2.5;
    // Gentle core brightness pulse.
    if (materialRef.current && !reducedMotion) {
      materialRef.current.opacity = 0.85 + Math.sin(state.clock.elapsedTime * 0.6) * 0.08;
    }
  });

  return (
    <points ref={pointsRef} rotation={[-0.5, 0, 0]}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" count={COUNT} array={positions} itemSize={3} />
        <bufferAttribute attach="attributes-color" count={COUNT} array={colors} itemSize={3} />
      </bufferGeometry>
      <pointsMaterial
        ref={materialRef}
        size={0.06}
        sizeAttenuation
        map={starTexture}
        alphaMap={starTexture}
        depthWrite={false}
        blending={THREE.AdditiveBlending}
        vertexColors
        transparent
        opacity={0.9}
      />
    </points>
  );
};

/* ─── Bright galactic core glow (billboard sprite) ────────────────────── */
const CoreGlow = () => {
  const texture = useMemo(makeStarTexture, []);
  return (
    <sprite scale={[6, 6, 1]}>
      <spriteMaterial
        map={texture}
        color="#bfe9ff"
        blending={THREE.AdditiveBlending}
        depthWrite={false}
        transparent
        opacity={0.55}
      />
    </sprite>
  );
};

const GalaxyBackground = ({ reducedMotion = false, scrollRef }) => {
  // The galaxy belongs to the hero: fade it out over the first viewport of
  // scroll (handing off to the subtle global starfield), and stop rendering
  // entirely once it's invisible so it costs zero GPU below the fold.
  const fadeRef = useRef(null);
  const [paused, setPaused] = useState(false);

  useEffect(() => {
    let raf = 0;
    const update = () => {
      raf = 0;
      const fade = Math.max(0, 1 - window.scrollY / (window.innerHeight * 1.1));
      if (fadeRef.current) fadeRef.current.style.opacity = fade.toFixed(3);
      setPaused(fade <= 0.001);
    };
    const onScroll = () => {
      if (!raf) raf = requestAnimationFrame(update);
    };
    update();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => {
      window.removeEventListener('scroll', onScroll);
      if (raf) cancelAnimationFrame(raf);
    };
  }, []);

  return (
    // Dimmed in light mode (additive stars need a dark backdrop to read well);
    // the scrim keeps text legible over bright star clusters in dark mode.
    <div className="fixed inset-0 -z-10 opacity-[0.35] dark:opacity-100 transition-opacity duration-700" aria-hidden="true">
      <div ref={fadeRef} className="absolute inset-0">
        <Canvas
          className="!absolute inset-0"
          camera={{ position: [0, 2.5, 10], fov: 62 }}
          dpr={1}
          frameloop={paused ? 'never' : 'always'}
          gl={{ antialias: false, alpha: true, powerPreference: 'high-performance' }}
        >
          <Galaxy reducedMotion={reducedMotion} scrollRef={scrollRef} />
          <CoreGlow />
        </Canvas>
        <div className="absolute inset-0 galaxy-scrim" />
      </div>
    </div>
  );
};

export default GalaxyBackground;
