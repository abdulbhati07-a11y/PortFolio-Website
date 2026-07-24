import React, { useRef, useMemo, useState } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Text, OrbitControls } from '@react-three/drei';
import * as THREE from 'three';

const Word = ({ children, position, onHover }) => {
  const ref = useRef();
  const [hovered, setHovered] = useState(false);
  const color = useMemo(() => new THREE.Color(), []);
  
  useFrame(({ camera }) => {
    if (!ref.current) return;
    // Make text always face the camera
    ref.current.quaternion.copy(camera.quaternion);
    
    // Calculate distance to camera to fade things out slightly in the back
    // Not strictly necessary, but adds depth
    const dist = camera.position.distanceTo(ref.current.getWorldPosition(new THREE.Vector3()));
    const targetOpacity = Math.max(0.3, 1 - (dist - 5) / 10);
    ref.current.fillOpacity += (targetOpacity - ref.current.fillOpacity) * 0.1;
  });

  return (
    <Text
      ref={ref}
      position={position}
      color={hovered ? '#A855F7' : '#00D9FF'}
      fontSize={hovered ? 0.7 : 0.6}
      letterSpacing={0.02}
      textAlign="center"
      anchorX="center"
      anchorY="middle"
      onPointerOver={(e) => {
        e.stopPropagation();
        setHovered(true);
        document.body.style.cursor = 'pointer';
        if (onHover) onHover(children);
      }}
      onPointerOut={() => {
        setHovered(false);
        document.body.style.cursor = 'auto';
      }}
    >
      {children}
    </Text>
  );
};

const SkillCloud = ({ skills, radius = 4, onSkillClick }) => {
  const groupRef = useRef();

  // Auto rotate the sphere slowly
  useFrame((state, delta) => {
    if (groupRef.current) {
      groupRef.current.rotation.y += delta * 0.15;
      groupRef.current.rotation.x += delta * 0.05;
    }
  });

  // Distribute skills evenly using Fibonacci sphere/Golden spiral
  const positions = useMemo(() => {
    const numPoints = skills.length;
    const pts = [];
    const phi = Math.PI * (3 - Math.sqrt(5)); // Golden angle
    
    for (let i = 0; i < numPoints; i++) {
      const y = 1 - (i / (numPoints - 1)) * 2; // y goes from 1 to -1
      const radiusAtY = Math.sqrt(1 - y * y); // radius at y
      const theta = phi * i; // golden angle increment
      
      const x = Math.cos(theta) * radiusAtY;
      const z = Math.sin(theta) * radiusAtY;
      
      pts.push([x * radius, y * radius, z * radius]);
    }
    return pts;
  }, [skills, radius]);

  return (
    <group ref={groupRef}>
      {skills.map((skill, i) => (
        <group key={skill} onClick={() => onSkillClick && onSkillClick(skill)}>
          <Word position={positions[i]}>
            {skill}
          </Word>
        </group>
      ))}
    </group>
  );
};

const SkillSphere = ({ skills, onSkillClick }) => {
  return (
    <div className="w-full h-full min-h-[300px] md:min-h-[400px] relative rounded-3xl overflow-hidden glass-card cursor-grab active:cursor-grabbing border-white/5">
      <div className="absolute inset-0 bg-gradient-to-br from-accent-cyan/5 to-accent-purple/5 opacity-50 z-0 pointer-events-none" />
      <Canvas camera={{ position: [0, 0, 8], fov: 60 }} className="z-10">
        <ambientLight intensity={0.5} />
        <pointLight position={[10, 10, 10]} intensity={1} />
        <OrbitControls 
          enableZoom={false} 
          enablePan={false} 
          autoRotate={false} 
          minPolarAngle={Math.PI / 4} 
          maxPolarAngle={Math.PI - Math.PI / 4}
        />
        <SkillCloud skills={skills} radius={3.5} onSkillClick={onSkillClick} />
      </Canvas>
      <div className="absolute bottom-4 left-0 right-0 text-center pointer-events-none z-20">
        <span className="font-mono text-[10px] tracking-widest text-text-secondary uppercase">
          Drag to rotate • Click a skill
        </span>
      </div>
    </div>
  );
};

export default SkillSphere;
