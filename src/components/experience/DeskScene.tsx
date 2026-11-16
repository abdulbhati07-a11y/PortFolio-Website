'use client';

import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { ContactShadows, RoundedBox } from '@react-three/drei';
import { useLayoutEffect, useMemo, useRef } from 'react';
import * as THREE from 'three';
import { AssistantBot, BadgeBoard, Bookcase, ContactPhone, DeskLamp, RoomShell } from './RoomDetails';
import type { QualityProfile } from '@/lib/quality';

export type Destination = 'room' | 'projects' | 'journey' | 'about' | 'contact';
export type PreviewKey = Exclude<Destination, 'room'> | 'assistant';

const cameraStops: Record<Destination, { position: [number, number, number]; target: [number, number, number] }> = {
  room: { position: [0, 3.15, 10.2], target: [0, 1.65, -.65] },
  projects: { position: [0.2, 2.3, 4.05], target: [0, 1.85, 0] },
  journey: { position: [-2.85, 2.55, 2.4], target: [-3.65, 2.05, -2.76] },
  about: { position: [2.55, 2.35, 3.6], target: [2, 1.46, -.28] },
  contact: { position: [2.05, 2.2, 3.15], target: [2.34, 1.28, 1.03] },
};

function CameraController({ destination, reduced }: { destination: Destination; reduced: boolean }) {
  const { camera, size } = useThree();
  const mobile = size.width < 640;
  useFrame((_, delta) => {
    const stop = cameraStops[destination];
    const targetPosition = new THREE.Vector3(...stop.position);
    if (mobile && destination === 'room') targetPosition.set(0, 3.5, 12.8);
    if (mobile && destination !== 'room') targetPosition.z += 1.1;
    const targetLook = new THREE.Vector3(...stop.target);
    const alpha = reduced ? 1 : 1 - Math.exp(-delta * 3.2);
    camera.position.lerp(targetPosition, alpha);
    const currentLook = new THREE.Vector3(0, 1.4, 0);
    camera.getWorldDirection(currentLook).multiplyScalar(4).add(camera.position);
    currentLook.lerp(targetLook, alpha);
    camera.lookAt(currentLook);
  });
  return null;
}

function WindowCity() {
  const blocks = useMemo(() => Array.from({ length: 28 }, (_, i) => {
    const x = -2.75 + i * .205;
    const height = .55 + ((i * 17) % 9) * .13;
    const z = .04 + (i % 4) * .02;
    return { x, height, z };
  }), []);
  const lights = useMemo(() => blocks.flatMap((block, i) => Array.from({ length: Math.max(2, Math.floor(block.height / .17)) }, (_, row) => ({
    x: block.x, y: -.74 + row * .17, z: block.z + .064, lit: (row + i) % 3 === 0,
  }))), [blocks]);
  const lightMesh = useRef<THREE.InstancedMesh>(null);
  useLayoutEffect(() => {
    const mesh = lightMesh.current;
    if (!mesh) return;
    const object = new THREE.Object3D();
    lights.forEach((light, index) => {
      object.position.set(light.x, light.y, light.z);
      object.scale.set(.11, .035, 1);
      object.updateMatrix();
      mesh.setMatrixAt(index, object.matrix);
      mesh.setColorAt(index, new THREE.Color(light.lit ? '#ffd9a8' : '#8d8293'));
    });
    mesh.instanceMatrix.needsUpdate = true;
    if (mesh.instanceColor) mesh.instanceColor.needsUpdate = true;
  }, [lights]);
  return <group position={[0, 2.28, -2.66]}>
    <mesh position={[0, .1, -.2]}><planeGeometry args={[6.05, 2.8]} /><meshBasicMaterial color="#777d9e" /></mesh>
    <mesh position={[0, -.12, -.18]}><planeGeometry args={[6.05, 1.1]} /><meshBasicMaterial color="#d2a489" transparent opacity={.34} /></mesh>
    {blocks.map((block, i) => <group key={i} position={[block.x, -.84 + block.height / 2, block.z]}>
      <mesh><boxGeometry args={[.18, block.height, .12]} /><meshStandardMaterial color={i % 3 === 0 ? '#45495e' : '#5f5b70'} roughness={.88} /></mesh>
    </group>)}
    <instancedMesh ref={lightMesh} args={[undefined, undefined, lights.length]}><planeGeometry args={[1, 1]} /><meshBasicMaterial color="white" transparent opacity={.72} /></instancedMesh>
    <mesh position={[0, 0, -.02]}><planeGeometry args={[6.1, 2.82]} /><meshPhysicalMaterial color="#9da0bd" transparent opacity={.08} roughness={.08} metalness={.22} /></mesh>
    {[-3.07, 0, 3.07].map((x) => <mesh key={x} position={[x, 0, .02]}><boxGeometry args={[.08, 2.9, .09]} /><meshStandardMaterial color="#151a27" metalness={.8} roughness={.3} /></mesh>)}
    {[-1.45, 1.45].map((y) => <mesh key={y} position={[0, y, .02]}><boxGeometry args={[6.2, .08, .09]} /><meshStandardMaterial color="#151a27" metalness={.8} roughness={.3} /></mesh>)}
  </group>;
}

function Hotspot({ position, onClick, onPreview, active }: { position: [number, number, number]; onClick: () => void; onPreview: () => void; active: boolean }) {
  return <group position={position}>
    <mesh onClick={onClick} onPointerOver={(event) => { if (event.pointerType === 'mouse') onPreview(); }}><sphereGeometry args={[.1, 16, 16]} /><meshBasicMaterial color={active ? '#ffe4ad' : '#a6f4e1'} /></mesh>
  </group>;
}

function Desk({ onSelect, onPreview, onChat, active }: { onSelect: (destination: Destination) => void; onPreview: (preview: PreviewKey) => void; onChat: () => void; active: Destination }) {
  const monitorTexture = useMemo(() => {
    const canvas = document.createElement('canvas');
    canvas.width = 1024; canvas.height = 600;
    const ctx = canvas.getContext('2d')!;
    const gradient = ctx.createLinearGradient(0, 0, 1024, 600);
    gradient.addColorStop(0, '#101c2b'); gradient.addColorStop(1, '#1d3440');
    ctx.fillStyle = gradient; ctx.fillRect(0, 0, 1024, 600);
    ctx.strokeStyle = '#5b8882'; ctx.lineWidth = 2; ctx.strokeRect(25, 25, 974, 550);
    ctx.fillStyle = '#aef0d5'; ctx.font = 'bold 27px monospace'; ctx.fillText('ABDULLAH.OS / WORKBENCH', 62, 82);
    ctx.fillStyle = '#e9e5d8'; ctx.font = 'bold 88px sans-serif'; ctx.fillText('PROJECTS', 62, 265);
    ctx.fillStyle = '#99bcb7'; ctx.font = '28px monospace'; ctx.fillText('A collection of things built with intent.', 64, 316);
    ['AI', 'WEB', 'PYTHON', 'DATA'].forEach((label, i) => {
      ctx.fillStyle = i % 2 ? '#254a4c' : '#35594e';
      ctx.fillRect(62 + i * 230, 395, 205, 116);
      ctx.fillStyle = '#d9f9e7'; ctx.font = 'bold 31px monospace'; ctx.fillText(label, 80 + i * 230, 465);
    });
    const texture = new THREE.CanvasTexture(canvas); texture.colorSpace = THREE.SRGBColorSpace;
    return texture;
  }, []);
  return <group>
    <RoundedBox args={[6.5, .27, 2.5]} radius={.09} position={[0, .76, .65]} castShadow receiveShadow><meshStandardMaterial color="#252835" roughness={.34} metalness={.25} /></RoundedBox>
    <RoundedBox args={[6.47, .032, 2.45]} radius={.02} position={[0, .895, .65]}><meshStandardMaterial color="#625549" roughness={.48} metalness={.18} /></RoundedBox>
    <mesh position={[0, .58, 1.91]}><boxGeometry args={[6.22, .025, .04]} /><meshBasicMaterial color="#ffc47e" /></mesh>
    <pointLight position={[0, .55, 1.8]} color="#ffa75d" intensity={8} distance={3.8} />
    {[-2.85, 2.85].map((x) => <RoundedBox key={x} args={[.28, .72, 2.12]} radius={.06} position={[x, .36, .65]} castShadow><meshStandardMaterial color="#1a1c27" roughness={.7} /></RoundedBox>)}
    <RoundedBox args={[2.6, .08, .76]} radius={.06} position={[0, .956, 1.45]}><meshStandardMaterial color="#14171d" roughness={.82} /></RoundedBox>
    {Array.from({ length: 44 }, (_, i) => <mesh key={i} position={[-1.18 + (i % 11) * .215, 1.005, 1.16 + Math.floor(i / 11) * .16]}><boxGeometry args={[.16, .025, .105]} /><meshStandardMaterial color={i % 8 === 0 ? '#485969' : '#303643'} roughness={.75} /></mesh>)}
    <RoundedBox args={[.2, .06, .32]} radius={.06} position={[1.63, .96, 1.49]}><meshStandardMaterial color="#2d3342" /></RoundedBox>
    <group onClick={() => onSelect('projects')} onPointerOver={(event) => { if (event.pointerType === 'mouse') onPreview('projects'); }}>
      <RoundedBox args={[2.57, 1.56, .13]} radius={.09} position={[0, 1.94, .04]} castShadow><meshStandardMaterial color="#10141d" metalness={.55} roughness={.24} /></RoundedBox>
      <mesh position={[0, 1.94, .115]}><planeGeometry args={[2.37, 1.35]} /><meshBasicMaterial map={monitorTexture} toneMapped={false} /></mesh>
      <mesh position={[0, 1.16, .04]}><boxGeometry args={[.12, .55, .1]} /><meshStandardMaterial color="#181b23" metalness={.6} /></mesh>
      <RoundedBox args={[.7, .05, .42]} radius={.025} position={[0, .93, .13]}><meshStandardMaterial color="#191c25" /></RoundedBox>
      <pointLight position={[0, 1.9, .55]} color="#719bc0" intensity={6} distance={2.8} />
    </group>
    <group onClick={() => onSelect('about')} onPointerOver={(event) => { if (event.pointerType === 'mouse') onPreview('about'); }}>
      <RoundedBox args={[1.05, .08, .8]} radius={.03} position={[-1.9, .96, .72]} rotation={[0, -.12, 0]} castShadow><meshStandardMaterial color="#d3c4aa" roughness={.87} /></RoundedBox>
      <mesh position={[-1.9, 1.008, .72]} rotation={[-Math.PI / 2, 0, -.12]}><planeGeometry args={[.87, .65]} /><meshStandardMaterial color="#e9dfc7" roughness={.96} /></mesh>
      {Array.from({ length: 5 }, (_, i) => <mesh key={i} position={[-1.9, 1.013, .5 + i * .085]} rotation={[-Math.PI / 2, 0, -.12]}><planeGeometry args={[.68, .008]} /><meshBasicMaterial color="#8c8490" /></mesh>)}
    </group>
    <AssistantBot onClick={onChat} onHover={() => onPreview('assistant')} />
    <ContactPhone onClick={() => onSelect('contact')} onHover={() => onPreview('contact')} />
    <DeskLamp />
    <Hotspot position={[.6, 2.72, .28]} onClick={() => onSelect('projects')} onPreview={() => onPreview('projects')} active={active === 'projects'} />
    <Hotspot position={[-3.65, 2.9, -2.55]} onClick={() => onSelect('journey')} onPreview={() => onPreview('journey')} active={active === 'journey'} />
    <Hotspot position={[-1.9, 1.12, .72]} onClick={() => onSelect('about')} onPreview={() => onPreview('about')} active={active === 'about'} />
    <Hotspot position={[2.34, 1.9, 1]} onClick={() => onSelect('contact')} onPreview={() => onPreview('contact')} active={active === 'contact'} />
  </group>;
}

export default function DeskScene({ destination, onSelect, onPreview, onChat, reduced, quality, onFailure }: { destination: Destination; onSelect: (destination: Destination) => void; onPreview: (preview: PreviewKey) => void; onChat: () => void; reduced: boolean; quality: QualityProfile; onFailure: () => void }) {
  return <Canvas className="desk-canvas" shadows={quality === 'high'} dpr={quality === 'high' ? [1, 1.7] : [1, 1.15]} camera={{ position: [0, 3.15, 10.2], fov: 50 }} onCreated={({ gl }) => { gl.outputColorSpace = THREE.SRGBColorSpace; gl.toneMapping = THREE.ACESFilmicToneMapping; gl.toneMappingExposure = 1.5; gl.domElement.addEventListener('webglcontextlost', onFailure, { once: true }); }}>
    <color attach="background" args={['#101521']} />
    <fog attach="fog" args={['#101521', 8, 17]} />
    <ambientLight intensity={1.8} color="#b6bfd5" />
    <directionalLight position={[-3, 6, 4]} intensity={3.1} color="#ffe2bd" castShadow={quality === 'high'} shadow-mapSize={[1024, 1024]} shadow-bias={-.0003} />
    <pointLight position={[2.4, 3.2, -1]} color="#ec94b8" intensity={13} distance={4} />
    <pointLight position={[-2.7, 2.8, -1]} color="#80c9bf" intensity={9} distance={3.5} />
    <RoomShell />
    <WindowCity />
    <BadgeBoard onClick={() => onSelect('journey')} onHover={() => onPreview('journey')} />
    <Bookcase />
    <Desk onSelect={onSelect} onPreview={onPreview} onChat={onChat} active={destination} />
    {quality === 'high' && <ContactShadows position={[0, .001, .4]} opacity={.5} scale={10} blur={2.5} far={4} frames={1} />}
    <CameraController destination={destination} reduced={reduced} />
  </Canvas>;
}
