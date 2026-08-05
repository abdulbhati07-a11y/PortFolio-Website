import React, { useRef, useMemo, useState, useEffect } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Html } from '@react-three/drei';
import * as THREE from 'three';

const CYAN_PALETTE = ['#00d4ff', '#00b4d8', '#48cae4', '#90e0ef', '#caf0f8', '#FFC107'];

const SkillNode = ({ skill, position, color, size }) => {
  const [hovered, setHovered] = useState(false);
  const meshRef = useRef();

  useFrame(({ clock }) => {
    if (meshRef.current) {
      const t = clock.elapsedTime;
      const scaleBase = hovered ? size * 1.4 : size;
      const pulse = Math.sin(t * 2 + position[0]) * 0.05 + 1;
      
      // Smooth scale interpolation for hover effect
      meshRef.current.scale.lerp(new THREE.Vector3().setScalar(scaleBase * pulse), 0.1);
    }
  });

  return (
    <group position={position}>
      <mesh
        ref={meshRef}
        onPointerOver={(e) => { e.stopPropagation(); setHovered(true); }}
        onPointerOut={() => setHovered(false)}
      >
        <sphereGeometry args={[1, 32, 32]} />
        <meshStandardMaterial 
          color={color} 
          roughness={0.2} 
          metalness={0.8}
          emissive={color}
          emissiveIntensity={hovered ? 0.8 : 0.2}
        />
      </mesh>
      
      {/* HTML tooltip on hover */}
      <Html 
        distanceFactor={15} 
        style={{
          transition: 'all 0.2s',
          opacity: hovered ? 1 : 0,
          transform: `translate3d(-50%, -150%, 0) scale(${hovered ? 1 : 0.5})`,
          pointerEvents: 'none'
        }}
        zIndexRange={[100, 0]}
      >
        <div className="bg-[#0a1628]/90 backdrop-blur-md border border-[#00d4ff]/30 text-white px-3 py-1.5 rounded-lg text-sm font-bold whitespace-nowrap shadow-xl">
          {skill}
        </div>
      </Html>
    </group>
  );
};

const SkillCloud = ({ skills, radius = 3.5 }) => {
  const groupRef = useRef();

  useFrame((state, delta) => {
    if (groupRef.current) {
      groupRef.current.rotation.y += delta * 0.1;
      groupRef.current.rotation.x += delta * 0.05;
    }
  });

  // Distribute skills evenly using a Fibonacci sphere
  const nodes = useMemo(() => {
    const numPoints = skills.length;
    const pts = [];
    const phi = Math.PI * (3 - Math.sqrt(5));
    for (let i = 0; i < numPoints; i++) {
      const y = 1 - (i / (numPoints - 1)) * 2;
      const radiusAtY = Math.sqrt(1 - y * y);
      const theta = phi * i;
      
      // We push the nodes slightly further out than the wireframe radius so they sit "on" it
      const offsetRadius = radius + 0.1; 
      
      pts.push({
        skill: skills[i],
        position: [Math.cos(theta) * radiusAtY * offsetRadius, y * offsetRadius, Math.sin(theta) * radiusAtY * offsetRadius],
        color: CYAN_PALETTE[i % CYAN_PALETTE.length],
        // Randomize size slightly between 0.15 and 0.35
        size: 0.15 + (Math.random() * 0.2)
      });
    }
    return pts;
  }, [skills, radius]);

  return (
    <group ref={groupRef}>
      {/* Central Wireframe Globe */}
      <mesh>
        <icosahedronGeometry args={[radius, 3]} />
        <meshBasicMaterial color="#00d4ff" wireframe transparent opacity={0.15} />
      </mesh>

      {/* 3D Skill Nodes */}
      {nodes.map((node, i) => (
        <SkillNode key={i} {...node} />
      ))}
    </group>
  );
};

const SkillSphere = ({ skills }) => {
  const containerRef = useRef(null);
  const [visible, setVisible] = useState(true);

  // Pause the render loop while the section is offscreen.
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const io = new IntersectionObserver(([entry]) => setVisible(entry.isIntersecting), { rootMargin: '100px' });
    io.observe(el);
    return () => io.disconnect();
  }, []);

  return (
    <div
      ref={containerRef}
      className="w-full h-full min-h-[400px] md:min-h-[500px] relative rounded-3xl overflow-hidden glass-card cursor-grab active:cursor-grabbing"
    >
      <div className="absolute inset-0 bg-accent-cyan/5 opacity-50 z-0 pointer-events-none" />
      <Canvas
        camera={{ position: [0, 0, 9], fov: 60 }}
        className="z-10"
        dpr={[1, 1.5]}
        frameloop={visible ? 'always' : 'never'}
      >
        <ambientLight intensity={0.5} />
        <directionalLight position={[10, 10, 5]} intensity={1.5} color="#90e0ef" />
        <pointLight position={[-10, -10, -5]} intensity={1} color="#0077b6" />
        
        <OrbitControls
          enableZoom={false}
          enablePan={false}
          autoRotate={true}
          autoRotateSpeed={0.5}
        />
        <SkillCloud skills={skills} radius={3.5} />
      </Canvas>
      <div className="absolute bottom-4 left-0 right-0 text-center pointer-events-none z-20">
        <span className="font-mono text-[10px] tracking-widest text-text-secondary uppercase">
          Drag to rotate • Hover for details
        </span>
      </div>
    </div>
  );
};

export default SkillSphere;
