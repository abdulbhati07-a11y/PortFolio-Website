import React, { useRef, useMemo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import * as THREE from 'three';

/**
 * Premium transparent geodesic globe (Icosahedron wireframe) with inner glows
 * and clean orbits, matching the user's reference image while keeping the 
 * solid Emerald color scheme.
 */

/* ─── Orbit configuration ─────────────────────────────────────────────── */
const ORBITS = [
  // Wide horizontal-ish orbit
  { radius: 3.5, tilt: 0.2, speed: 0.3, moonSize: 0, color: '#00d4ff', opacity: 0.4 },
  // Tilted orbit
  { radius: 4.2, tilt: -0.3, speed: 0.2, moonSize: 0, color: '#90e0ef', opacity: 0.2 },
];

/* ─── Glow texture generator ──────────────────────────────────────────── */
function makeGlowTexture(rgb = '16,185,129', softness = 0.55) {
  const size = 256;
  const canvas = document.createElement('canvas');
  canvas.width = canvas.height = size;
  const ctx = canvas.getContext('2d');
  const g = ctx.createRadialGradient(size / 2, size / 2, 0, size / 2, size / 2, size / 2);
  g.addColorStop(0, `rgba(${rgb},${softness})`);
  g.addColorStop(0.3, `rgba(${rgb},${softness * 0.4})`);
  g.addColorStop(0.6, `rgba(${rgb},${softness * 0.1})`);
  g.addColorStop(1, `rgba(${rgb},0)`);
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, size, size);
  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace;
  return tex;
}

/* ─── Orbit Ring ──────────────────────────────────────────────────────── */
const Orbit = ({ radius, tilt, color, opacity }) => {
  return (
    <group rotation={[tilt, 0, tilt * 0.5]}>
      {/* Very clean, thin torus for the orbit line */}
      <mesh rotation={[Math.PI / 2, 0, 0]}>
        <torusGeometry args={[radius, 0.008, 16, 100]} />
        <meshBasicMaterial
          color={color}
          transparent
          opacity={opacity}
          blending={THREE.AdditiveBlending}
          depthWrite={false}
        />
      </mesh>
    </group>
  );
};

/* ─── Transparent Geodesic Globe ──────────────────────────────────────── */
const Planet = ({ reducedMotion }) => {
  const wire1Ref = useRef();
  const wire2Ref = useRef();

  useFrame((_, delta) => {
    if (reducedMotion) return;
    if (wire1Ref.current) {
      wire1Ref.current.rotation.y += delta * 0.05;
      wire1Ref.current.rotation.x += delta * 0.02;
    }
    if (wire2Ref.current) {
      wire2Ref.current.rotation.y += delta * 0.05;
      wire2Ref.current.rotation.x += delta * 0.02;
    }
  });

  return (
    <group>
      {/* Outer Prominent Geodesic Wireframe */}
      <mesh ref={wire1Ref}>
        <icosahedronGeometry args={[1.8, 1]} />
        <meshBasicMaterial 
          color="#00d4ff" 
          wireframe 
          transparent 
          opacity={0.8}
        />
      </mesh>

      {/* Inner Geodesic Wireframe (Double Lining Effect) */}
      <mesh ref={wire2Ref}>
        <icosahedronGeometry args={[1.72, 1]} />
        <meshBasicMaterial 
          color="#90e0ef" 
          wireframe 
          transparent 
          opacity={0.4}
        />
      </mesh>

      {/* Very faint dark core to help the front lines pop over the back lines */}
      <mesh scale={0.99}>
        <sphereGeometry args={[1.8, 32, 32]} />
        <meshBasicMaterial 
          color="#022c22" 
          transparent 
          opacity={0.8} 
          depthWrite={false} 
        />
      </mesh>

      {/* Internal soft glows (like the reference image) */}
      <sprite position={[0.6, 0.4, -0.2]} scale={[2.5, 2.5, 1]}>
        <spriteMaterial 
          map={useMemo(() => makeGlowTexture('52,211,153', 0.9), [])} 
          blending={THREE.AdditiveBlending} 
          transparent 
          opacity={0.8}
          depthWrite={false}
        />
      </sprite>
      
      <sprite position={[-0.7, -0.5, 0.3]} scale={[2.2, 2.2, 1]}>
        <spriteMaterial 
          map={useMemo(() => makeGlowTexture('16,185,129', 0.8), [])} 
          blending={THREE.AdditiveBlending} 
          transparent 
          opacity={0.6}
          depthWrite={false}
        />
      </sprite>

      <sprite position={[0, 0.8, 0.5]} scale={[1.5, 1.5, 1]}>
        <spriteMaterial 
          map={useMemo(() => makeGlowTexture('5,150,105', 0.7), [])} 
          blending={THREE.AdditiveBlending} 
          transparent 
          opacity={0.5}
          depthWrite={false}
        />
      </sprite>
    </group>
  );
};

/* ─── Full Scene ──────────────────────────────────────────────────────── */
const Scene = ({ reducedMotion }) => {
  const groupRef = useRef();
  
  // Ambient background glows (very subtle)
  const haloTexture = useMemo(() => makeGlowTexture('6,78,59', 0.2), []);

  useFrame((state, delta) => {
    if (!groupRef.current || reducedMotion) return;
    const t = state.clock.elapsedTime;
    
    // Smooth idle bobbing
    groupRef.current.position.y = Math.sin(t * 0.3) * 0.1;
    
    // Pointer-reactive tilt
    const targetX = 0.1 + state.pointer.y * 0.15;
    const targetZ = state.pointer.x * 0.10;
    groupRef.current.rotation.x += (targetX - groupRef.current.rotation.x) * delta * 2;
    groupRef.current.rotation.z += (targetZ - groupRef.current.rotation.z) * delta * 2;
  });

  return (
    <>
      <ambientLight intensity={1} />
      
      <group ref={groupRef} rotation={[0.1, 0, 0]}>
        <Planet reducedMotion={reducedMotion} />
        {ORBITS.map((o, i) => (
          <Orbit key={i} {...o} />
        ))}
      </group>

      {/* Wide, very subtle background ambient glow */}
      <sprite scale={[14, 14, 1]} position={[0, 0, -2]}>
        <spriteMaterial
          map={haloTexture}
          blending={THREE.AdditiveBlending}
          depthWrite={false}
          transparent
          opacity={0.4}
        />
      </sprite>
    </>
  );
};

/* ─── Canvas Wrapper ──────────────────────────────────────────────────── */
const HeroGlobe = ({ reducedMotion = false, active = true }) => (
  <Canvas
    className="!absolute inset-0"
    camera={{ position: [0, 0, 9], fov: 45 }}
    dpr={[1, 1.5]}
    frameloop={active ? 'always' : 'never'}
    gl={{ antialias: true, alpha: true, powerPreference: 'high-performance' }}
  >
    <Scene reducedMotion={reducedMotion} />
  </Canvas>
);

export default HeroGlobe;
