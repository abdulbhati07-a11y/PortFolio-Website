import React, { useRef, useMemo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import * as THREE from 'three';

/**
 * Subtle global backdrop for everything below the hero: a sparse field of
 * slowly drifting, twinkling stars plus a few small tumbling asteroids.
 * Deliberately calm — it should never compete with body text.
 */

const STAR_COUNT = 500;
const FIELD = { x: 24, y: 14, z: 10 };

/* Per-star twinkle handled in-shader so 500 stars cost one draw call. */
const StarPoints = ({ reducedMotion }) => {
  const materialRef = useRef();

  const { positions, seeds, sizes } = useMemo(() => {
    const positions = new Float32Array(STAR_COUNT * 3);
    const seeds = new Float32Array(STAR_COUNT);
    const sizes = new Float32Array(STAR_COUNT);
    for (let i = 0; i < STAR_COUNT; i++) {
      positions[i * 3] = (Math.random() - 0.5) * FIELD.x;
      positions[i * 3 + 1] = (Math.random() - 0.5) * FIELD.y;
      positions[i * 3 + 2] = -Math.random() * FIELD.z - 1;
      seeds[i] = Math.random() * Math.PI * 2;
      sizes[i] = 0.5 + Math.random() * 1.5;
    }
    return { positions, seeds, sizes };
  }, []);

  const shader = useMemo(
    () => ({
      uniforms: { uTime: { value: 0 } },
      vertexShader: /* glsl */ `
        attribute float aSeed;
        attribute float aSize;
        uniform float uTime;
        varying float vAlpha;
        void main() {
          vec3 p = position;
          // Very slow lateral drift, wrapped so stars never leave the field.
          p.x = mod(p.x + uTime * 0.06 + ${(FIELD.x / 2).toFixed(1)}, ${FIELD.x.toFixed(1)}) - ${(FIELD.x / 2).toFixed(1)};
          vec4 mvPos = modelViewMatrix * vec4(p, 1.0);
          // Twinkle: gentle per-star brightness sine ("sparking" stars).
          float tw = 0.55 + 0.45 * sin(uTime * (0.6 + fract(aSeed) * 0.9) + aSeed * 7.0);
          vAlpha = tw;
          gl_PointSize = aSize * tw * (140.0 / -mvPos.z);
          gl_Position = projectionMatrix * mvPos;
        }
      `,
      fragmentShader: /* glsl */ `
        varying float vAlpha;
        void main() {
          // Soft round star: radial falloff, no texture needed.
          float d = length(gl_PointCoord - 0.5);
          float a = smoothstep(0.5, 0.05, d) * vAlpha;
          gl_FragColor = vec4(0.85, 0.93, 1.0, a);
        }
      `,
    }),
    []
  );

  useFrame(({ clock }) => {
    if (materialRef.current && !reducedMotion) {
      materialRef.current.uniforms.uTime.value = clock.elapsedTime;
    }
  });

  return (
    <points>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" count={STAR_COUNT} array={positions} itemSize={3} />
        <bufferAttribute attach="attributes-aSeed" count={STAR_COUNT} array={seeds} itemSize={1} />
        <bufferAttribute attach="attributes-aSize" count={STAR_COUNT} array={sizes} itemSize={1} />
      </bufferGeometry>
      <shaderMaterial
        ref={materialRef}
        args={[shader]}
        transparent
        depthWrite={false}
        blending={THREE.AdditiveBlending}
      />
    </points>
  );
};

/* A few small, dark low-poly rocks slowly tumbling across the field. */
const ASTEROIDS = [
  { size: 0.14, y: 3.2, z: -4, speed: 0.14, spin: 0.3, color: '#334155' },
  { size: 0.1, y: -2.6, z: -5, speed: 0.1, spin: 0.45, color: '#3b4a63' },
  { size: 0.18, y: 1.1, z: -7, speed: 0.07, spin: 0.2, color: '#2b3850' },
  { size: 0.08, y: -4.2, z: -3.5, speed: 0.18, spin: 0.6, color: '#42526e' },
];

const Asteroid = ({ size, y, z, speed, spin, color, index, reducedMotion }) => {
  const ref = useRef();
  const offset = index * 7.3;

  useFrame(({ clock }) => {
    if (!ref.current) return;
    const t = reducedMotion ? 0 : clock.elapsedTime;
    // Drift right→left, wrapping around the field width.
    const span = FIELD.x + 4;
    ref.current.position.x = ((t * speed + offset) % span) - span / 2;
    ref.current.position.y = y + Math.sin(t * 0.2 + offset) * 0.4;
    ref.current.rotation.x = t * spin;
    ref.current.rotation.y = t * spin * 0.7;
  });

  return (
    <mesh ref={ref} position={[0, y, z]}>
      <icosahedronGeometry args={[size, 0]} />
      <meshStandardMaterial color={color} roughness={0.9} metalness={0.15} flatShading />
    </mesh>
  );
};

const StarfieldBackground = ({ reducedMotion = false }) => (
  // Sits at the very back; the hero galaxy paints over it and fades away,
  // leaving only this calm field behind the rest of the page.
  <div
    className="fixed inset-0 -z-20 opacity-[0.18] dark:opacity-45 transition-opacity duration-700"
    aria-hidden="true"
  >
    <Canvas
      className="!absolute inset-0"
      camera={{ position: [0, 0, 8], fov: 55 }}
      dpr={1}
      frameloop={reducedMotion ? 'demand' : 'always'}
      gl={{ antialias: false, alpha: true, powerPreference: 'low-power' }}
    >
      <ambientLight intensity={0.5} />
      <directionalLight position={[4, 6, 3]} intensity={0.6} color="#bfe9ff" />
      <StarPoints reducedMotion={reducedMotion} />
      {ASTEROIDS.map((a, i) => (
        <Asteroid key={i} {...a} index={i} reducedMotion={reducedMotion} />
      ))}
    </Canvas>
  </div>
);

export default StarfieldBackground;
