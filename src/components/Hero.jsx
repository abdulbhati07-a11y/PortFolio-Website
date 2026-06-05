import React, { useRef, useState, useEffect } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Sphere, Box, Octahedron, Tetrahedron, Icosahedron } from '@react-three/drei';
import { motion, AnimatePresence } from 'framer-motion';
import { FaGithub, FaLinkedin, FaEnvelope, FaArrowDown } from 'react-icons/fa';
import { DEVELOPER_INFO, STATS } from '../utils/constants';

/* ─── 3D Floating Shape ──────────────────────────────────────────────── */
const FloatingShape = ({ position, rotationSpeed, scale, color, type }) => {
  const meshRef = useRef();
  useFrame((state, delta) => {
    meshRef.current.rotation.x += rotationSpeed.x * delta;
    meshRef.current.rotation.y += rotationSpeed.y * delta;
    meshRef.current.position.x = Math.sin(state.clock.elapsedTime * rotationSpeed.orbit) * position[0];
    meshRef.current.position.z = Math.cos(state.clock.elapsedTime * rotationSpeed.orbit) * position[2];
  });

  const material = (
    <meshStandardMaterial
      color={color}
      emissive={color}
      emissiveIntensity={0.4}
      wireframe={false}
      transparent
      opacity={0.7}
    />
  );

  const shapes = {
    box: <Box ref={meshRef} args={[1, 1, 1]} scale={scale}>{material}</Box>,
    octa: <Octahedron ref={meshRef} args={[1, 0]} scale={scale}>{material}</Octahedron>,
    tetra: <Tetrahedron ref={meshRef} args={[1, 0]} scale={scale}>{material}</Tetrahedron>,
    icosa: <Icosahedron ref={meshRef} args={[1, 0]} scale={scale}>{material}</Icosahedron>,
  };
  return shapes[type] || <Sphere ref={meshRef} args={[0.5, 32, 32]} scale={scale}>{material}</Sphere>;
};

/* ─── Particle System ─────────────────────────────────────────────────── */
const ParticleSystem = () => {
  const particlesRef = useRef();
  const positions = new Float32Array(600).map(() => (Math.random() - 0.5) * 25);

  useFrame((state) => {
    if (particlesRef.current) {
      particlesRef.current.rotation.y = state.clock.elapsedTime * 0.04;
      particlesRef.current.rotation.x = Math.sin(state.clock.elapsedTime * 0.02) * 0.1;
    }
  });

  return (
    <points ref={particlesRef}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" count={200} array={positions} itemSize={3} />
      </bufferGeometry>
      <pointsMaterial size={0.04} color="#00D9FF" transparent opacity={0.5} />
    </points>
  );
};

/* ─── Typewriter Hook ─────────────────────────────────────────────────── */
const useTypewriter = (words, speed = 80, pause = 2000) => {
  const [index, setIndex] = useState(0);
  const [subIndex, setSubIndex] = useState(0);
  const [deleting, setDeleting] = useState(false);
  const [text, setText] = useState('');

  useEffect(() => {
    if (subIndex === words[index].length + 1 && !deleting) {
      const timeout = setTimeout(() => setDeleting(true), pause);
      return () => clearTimeout(timeout);
    }
    if (subIndex === 0 && deleting) {
      setDeleting(false);
      setIndex((prev) => (prev + 1) % words.length);
      return;
    }
    const timeout = setTimeout(() => {
      setSubIndex((prev) => prev + (deleting ? -1 : 1));
      setText(words[index].substring(0, subIndex));
    }, deleting ? speed / 2 : speed);
    return () => clearTimeout(timeout);
  }, [subIndex, index, deleting, words, speed, pause]);

  return text;
};

/* ─── Stat Counter ────────────────────────────────────────────────────── */
const StatCounter = ({ stat, delay }) => {
  const [count, setCount] = useState(0);

  useEffect(() => {
    const timeout = setTimeout(() => {
      const duration = 1800;
      const steps = 60;
      const increment = stat.value / steps;
      let current = 0;
      const interval = setInterval(() => {
        current += increment;
        if (current >= stat.value) {
          setCount(stat.value);
          clearInterval(interval);
        } else {
          setCount(current);
        }
      }, duration / steps);
      return () => clearInterval(interval);
    }, delay);
    return () => clearTimeout(timeout);
  }, [stat.value, delay]);

  return (
    <motion.div
      className="flex flex-col items-center gap-1"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: delay / 1000 + 1.2, duration: 0.6 }}
    >
      <span className="font-mono text-2xl md:text-3xl font-bold text-white">
        {stat.decimals > 0 ? count.toFixed(1) : Math.floor(count)}
        <span className="text-accent-cyan">{stat.suffix}</span>
      </span>
      <span className="font-sans text-xs text-text-secondary tracking-widest uppercase">{stat.label}</span>
    </motion.div>
  );
};

/* ─── Hero Component ──────────────────────────────────────────────────── */
const Hero = ({ setActiveTab }) => {
  const typedRole = useTypewriter(DEVELOPER_INFO.roles, 75, 2200);

  return (
    <motion.section
      className="relative w-full min-h-[calc(100vh-5rem)] flex items-center justify-center overflow-hidden"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.6 }}
    >
      {/* Grid background */}
      <div className="absolute inset-0 grid-pattern opacity-50 z-0 pointer-events-none" />

      {/* 3D Canvas */}
      <div className="absolute inset-0 z-0">
        <Canvas camera={{ position: [0, 0, 8], fov: 60 }}>
          <ambientLight intensity={0.2} />
          <directionalLight position={[10, 10, 5]} intensity={0.5} />
          <pointLight position={[-10, -10, -5]} intensity={0.5} color="#00D9FF" />
          <pointLight position={[10, -5, 5]} intensity={0.3} color="#A855F7" />
          <FloatingShape position={[3, 2, 0]} rotationSpeed={{ x: 0.1, y: 0.2, orbit: 0.05 }} scale={1.2} color="#00D9FF" type="icosa" />
          <FloatingShape position={[-3, -1, 2]} rotationSpeed={{ x: 0.2, y: 0.1, orbit: -0.08 }} scale={0.8} color="#A855F7" type="octa" />
          <FloatingShape position={[2, -2, -2]} rotationSpeed={{ x: 0.1, y: 0.3, orbit: 0.1 }} scale={1.0} color="#1E293B" type="tetra" />
          <FloatingShape position={[-2, 2, -1]} rotationSpeed={{ x: 0.2, y: 0.2, orbit: -0.05 }} scale={0.9} color="#0F172A" type="box" />
          <ParticleSystem />
        </Canvas>
      </div>

      {/* Radial glow gradients */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-accent-cyan/5 rounded-full blur-3xl pointer-events-none z-0" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-accent-purple/5 rounded-full blur-3xl pointer-events-none z-0" />

      {/* Main content */}
      <div className="z-10 text-center max-w-5xl px-6 pointer-events-none mt-[-3%]">

        {/* Status badge */}
        <motion.div
          className="flex justify-center mb-8"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.1 }}
        >
          <div className="floating-badge pointer-events-auto">
            <span className="w-2 h-2 rounded-full bg-green-400 shadow-[0_0_8px_rgba(74,222,128,0.8)] animate-pulse" />
            Available for opportunities
          </div>
        </motion.div>

        {/* Name */}
        <motion.h1
          className="font-sans text-5xl md:text-7xl lg:text-[82px] font-bold text-white mb-4 tracking-tighter leading-[1.05]"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
        >
          {DEVELOPER_INFO.name.split(' ').slice(0, 2).join(' ')}
          <br />
          <span className="text-gradient">{DEVELOPER_INFO.name.split(' ').slice(2).join(' ')}</span>
        </motion.h1>

        {/* Typewriter role */}
        <motion.div
          className="font-mono text-xl md:text-2xl font-medium text-accent-cyan mb-6 tracking-wide h-8 flex items-center justify-center gap-1"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1, delay: 0.5 }}
        >
          <span>&gt;</span>
          <span>{typedRole}</span>
          <span className="w-[2px] h-6 bg-accent-cyan animate-pulse ml-0.5 rounded-full" />
        </motion.div>

        {/* Tagline */}
        <motion.p
          className="font-sans text-lg md:text-xl text-text-secondary/80 mb-10 mx-auto max-w-2xl leading-relaxed font-light"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, delay: 0.7, ease: [0.16, 1, 0.3, 1] }}
        >
          {DEVELOPER_INFO.tagline}
        </motion.p>

        {/* CTA Buttons */}
        <motion.div
          className="flex flex-col sm:flex-row gap-4 justify-center mb-12 pointer-events-auto"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, delay: 0.9, ease: [0.16, 1, 0.3, 1] }}
        >
          <button
            onClick={() => setActiveTab('projects')}
            className="btn-primary"
          >
            Explore Projects
          </button>
          <button
            onClick={() => setActiveTab('contact')}
            className="btn-secondary"
          >
            Get In Touch
          </button>
          <a
            href={DEVELOPER_INFO.resume}
            target="_blank"
            rel="noopener noreferrer"
            className="btn-secondary"
          >
            View Resume
          </a>
        </motion.div>

        {/* Social links */}
        <motion.div
          className="flex items-center justify-center gap-6 mb-16 pointer-events-auto"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.1, duration: 0.8 }}
        >
          {[
            { icon: FaGithub, link: DEVELOPER_INFO.github, label: 'GitHub' },
            { icon: FaLinkedin, link: DEVELOPER_INFO.linkedin, label: 'LinkedIn' },
            { icon: FaEnvelope, link: `mailto:${DEVELOPER_INFO.email}`, label: 'Email' },
          ].map(({ icon: Icon, link, label }) => (
            <a
              key={label}
              href={link}
              target="_blank"
              rel="noopener noreferrer"
              aria-label={label}
              className="w-11 h-11 rounded-full border border-white/10 flex items-center justify-center text-text-secondary hover:text-white hover:border-accent-cyan hover:shadow-[0_0_15px_rgba(0,217,255,0.3)] hover:bg-accent-cyan/10 transition-all duration-300"
            >
              <Icon size={18} />
            </a>
          ))}
        </motion.div>

        {/* Stats */}
        <motion.div
          className="grid grid-cols-2 sm:grid-cols-4 gap-6 max-w-2xl mx-auto pointer-events-none"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.2, duration: 0.6 }}
        >
          {STATS.map((stat, i) => (
            <StatCounter key={stat.label} stat={stat} delay={i * 150} />
          ))}
        </motion.div>
      </div>

      {/* Scroll indicator */}
      <motion.div
        className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 pointer-events-none"
        initial={{ opacity: 0 }}
        animate={{ opacity: 0.5 }}
        transition={{ delay: 1.8, duration: 1 }}
      >
        <span className="font-mono text-[10px] tracking-[0.3em] text-text-secondary uppercase">Scroll</span>
        <motion.div
          animate={{ y: [0, 8, 0] }}
          transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
        >
          <FaArrowDown size={14} className="text-text-secondary" />
        </motion.div>
      </motion.div>
    </motion.section>
  );
};

export default Hero;
