'use client';

import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { ContactShadows, RoundedBox } from '@react-three/drei';
import { useEffect, useLayoutEffect, useMemo, useRef } from 'react';
import * as THREE from 'three';
import { AssistantBot, BadgeBoard, Bookcase, ContactPhone, DeskLamp, RoomShell } from './RoomDetails';
import { LoungeCouch, PracticalFixtures, StudioChair } from './RoomFurnishings';
import { RoomSetDressing } from './RoomSetDressing';
import type { QualityProfile } from '@/lib/quality';

export type Destination = 'room' | 'projects' | 'journey' | 'about' | 'contact';
export type IntroStage = 'boot' | 'name' | 'bot' | 'reveal' | 'ready';
export type PreviewKey = Exclude<Destination, 'room'> | 'assistant';

const cameraStops: Record<Destination, { position: [number, number, number]; target: [number, number, number] }> = {
  room: { position: [4.35, 3.45, 8.1], target: [0, 1.55, -.55] },
  projects: { position: [0.2, 2.3, 4.05], target: [0, 1.85, .35] },
  journey: { position: [2.25, 2.65, 1.15], target: [2.42, 2.54, -2.76] },
  about: { position: [2.55, 2.45, 3.15], target: [1.58, 1.62, -.26] },
  contact: { position: [2.05, 2.2, 3.15], target: [2.34, 1.28, 1.03] },
};

const botStop = { position: [1.62, 1.91, 1.04] as [number, number, number], target: [1.58, 1.66, -.26] as [number, number, number] };
const mobileRoomPosition = new THREE.Vector3(2.75, 2.95, 11.2);
const mobileRoomTarget = new THREE.Vector3(0, .75, -.55);
const ease = (value: number) => value * value * (3 - 2 * value);
const ramp = (start: number, end: number, value: number) => ease(THREE.MathUtils.clamp((value - start) / (end - start), 0, 1));

function CameraController({ destination, introStage, reduced, onDrag }: { destination: Destination; introStage: IntroStage; reduced: boolean; onDrag: () => void }) {
  const { camera, size, gl } = useThree();
  const mobile = size.width < 640;
  const revealTime = useRef(0);
  const look = useRef(new THREE.Vector3(...botStop.target));
  const drag = useRef({ active: false, x: 0, y: 0, yaw: 0, pitch: 0, targetYaw: 0, targetPitch: 0 });
  useEffect(() => { if (introStage === 'reveal') revealTime.current = 0; }, [introStage]);
  useEffect(() => {
    const canvas = gl.domElement;
    function down(event: PointerEvent) {
      if (introStage !== 'ready' || destination !== 'room' || reduced) return;
      drag.current.active = true;
      drag.current.x = event.clientX;
      drag.current.y = event.clientY;
    }
    function move(event: PointerEvent) {
      if (!drag.current.active) return;
      const dx = event.clientX - drag.current.x;
      const dy = event.clientY - drag.current.y;
      if (Math.abs(dx) + Math.abs(dy) > 2) onDrag();
      drag.current.targetYaw = THREE.MathUtils.clamp(drag.current.targetYaw + dx * .0024, -.42, .42);
      drag.current.targetPitch = THREE.MathUtils.clamp(drag.current.targetPitch + dy * .003, -.35, .35);
      drag.current.x = event.clientX;
      drag.current.y = event.clientY;
    }
    function up() { drag.current.active = false; }
    canvas.addEventListener('pointerdown', down);
    window.addEventListener('pointermove', move);
    window.addEventListener('pointerup', up);
    return () => { canvas.removeEventListener('pointerdown', down); window.removeEventListener('pointermove', move); window.removeEventListener('pointerup', up); };
  }, [gl, introStage, destination, reduced, onDrag]);
  useFrame((_, delta) => {
    const botPosition = new THREE.Vector3(...botStop.position);
    if (mobile) { botPosition.x -= .2; botPosition.z += .12; }
    const botLook = new THREE.Vector3(...botStop.target);
    if (introStage === 'bot') {
      camera.position.copy(botPosition);
      look.current.copy(botLook);
      camera.lookAt(look.current);
      return;
    }
    if (introStage === 'reveal') {
      revealTime.current = Math.min(1, revealTime.current + delta / 4.2);
      const progress = ease(revealTime.current);
      const roomPosition = new THREE.Vector3(...cameraStops.room.position);
      if (mobile) roomPosition.copy(mobileRoomPosition);
      camera.position.lerpVectors(botPosition, roomPosition, progress);
      look.current.lerpVectors(botLook, mobile ? mobileRoomTarget : new THREE.Vector3(...cameraStops.room.target), progress);
      camera.lookAt(look.current);
      return;
    }
    const stop = cameraStops[destination];
    const targetPosition = new THREE.Vector3(...stop.position);
    if (mobile && destination === 'room') targetPosition.copy(mobileRoomPosition);
    if (mobile && destination !== 'room') targetPosition.z += 1.1;
    if (destination === 'room' && !reduced) {
      drag.current.yaw = THREE.MathUtils.damp(drag.current.yaw, drag.current.targetYaw, 3, delta);
      drag.current.pitch = THREE.MathUtils.damp(drag.current.pitch, drag.current.targetPitch, 3, delta);
      targetPosition.sub(new THREE.Vector3(...stop.target)).applyAxisAngle(new THREE.Vector3(0, 1, 0), drag.current.yaw).add(new THREE.Vector3(...stop.target));
      targetPosition.y += drag.current.pitch;
    }
    const alpha = reduced ? 1 : 1 - Math.exp(-delta * 3.2);
    camera.position.lerp(targetPosition, alpha);
    look.current.lerp(mobile && destination === 'room' ? mobileRoomTarget : new THREE.Vector3(...stop.target), alpha);
    camera.lookAt(look.current);
  });
  return null;
}

function LightingRig({ introStage, quality }: { introStage: IntroStage; quality: QualityProfile }) {
  const ambient = useRef<THREE.AmbientLight>(null);
  const key = useRef<THREE.DirectionalLight>(null);
  const magenta = useRef<THREE.PointLight>(null);
  const teal = useRef<THREE.PointLight>(null);
  const lamp = useRef<THREE.SpotLight>(null);
  const monitor = useRef<THREE.PointLight>(null);
  const desk = useRef<THREE.PointLight>(null);
  const couch = useRef<THREE.PointLight>(null);
  const cove = useRef<THREE.PointLight>(null);
  const ceilingWarm = useRef<THREE.PointLight>(null);
  const ceilingCool = useRef<THREE.PointLight>(null);
  const revealTime = useRef(0);
  useEffect(() => { if (introStage === 'reveal') revealTime.current = 0; }, [introStage]);
  useFrame((_, delta) => {
    if (introStage === 'reveal') revealTime.current = Math.min(1, revealTime.current + delta / 4.2);
    const progress = introStage === 'ready' || introStage === 'name' ? 1 : introStage === 'reveal' ? revealTime.current : 0;
    if (ambient.current) ambient.current.intensity = .04 + 1.76 * ramp(.22, .92, progress);
    if (key.current) key.current.intensity = 3.1 * ramp(.26, .86, progress);
    if (teal.current) teal.current.intensity = 9 * ramp(.17, .66, progress);
    if (monitor.current) monitor.current.intensity = 6 * ramp(.12, .48, progress);
    if (desk.current) desk.current.intensity = 8 * ramp(.25, .64, progress);
    if (lamp.current) lamp.current.intensity = 17 * ramp(.42, .77, progress);
    if (magenta.current) magenta.current.intensity = 13 * ramp(.55, .95, progress);
    if (couch.current) couch.current.intensity = 7 * ramp(.44, .88, progress);
    if (cove.current) cove.current.intensity = 6 * ramp(.3, .82, progress);
    if (ceilingWarm.current) ceilingWarm.current.intensity = 5 * ramp(.4, .85, progress);
    if (ceilingCool.current) ceilingCool.current.intensity = 4 * ramp(.5, .9, progress);
  });
  return <>
    <ambientLight ref={ambient} intensity={.04} color="#b6bfd5" />
    <directionalLight ref={key} position={[-3, 6, 4]} intensity={0} color="#ffe2bd" castShadow={quality === 'high'} shadow-mapSize={[1024, 1024]} shadow-bias={-.0003} />
    <pointLight ref={magenta} position={[2.4, 3.2, -1]} color="#ec94b8" intensity={0} distance={4} />
    <pointLight ref={teal} position={[-2.7, 2.8, -1]} color="#80c9bf" intensity={0} distance={3.5} />
    <spotLight ref={lamp} position={[-2.18, 1.83, -.47]} color="#ffd3a1" intensity={0} angle={.65} distance={3} penumbra={.8} />
    <pointLight ref={monitor} position={[0, 1.9, .55]} color="#719bc0" intensity={0} distance={2.8} />
    <pointLight ref={desk} position={[0, .55, 1.8]} color="#ffa75d" intensity={0} distance={3.8} />
    <pointLight ref={couch} position={[-3.3, 2.2, 2]} color="#ffc894" intensity={0} distance={3.5} />
    <pointLight ref={cove} position={[.5, 3.5, -2.5]} color="#a9cfe8" intensity={0} distance={4.5} />
    <pointLight ref={ceilingWarm} position={[-2.45, 3.5, 1.12]} color="#ffe1b9" intensity={0} distance={4} />
    <pointLight ref={ceilingCool} position={[2.55, 3.5, 1.12]} color="#b7d7e3" intensity={0} distance={4} />
  </>;
}

function WindowCity({ introStage }: { introStage: IntroStage }) {
  const sky = useMemo(() => {
    const canvas = document.createElement('canvas');
    canvas.width = 512; canvas.height = 512;
    const ctx = canvas.getContext('2d')!;
    const gradient = ctx.createLinearGradient(0, 0, 0, 512);
    gradient.addColorStop(0, '#55465f'); gradient.addColorStop(.48, '#b47786'); gradient.addColorStop(1, '#f0b77d');
    ctx.fillStyle = gradient; ctx.fillRect(0, 0, 512, 512);
    const texture = new THREE.CanvasTexture(canvas); texture.colorSpace = THREE.SRGBColorSpace;
    return texture;
  }, []);
  const blocks = useMemo(() => Array.from({ length: 23 }, (_, i) => {
    const x = -1.62 + i * .145;
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
      mesh.setColorAt(index, new THREE.Color(light.lit ? '#ffdc99' : '#756a7f'));
    });
    mesh.instanceMatrix.needsUpdate = true;
    if (mesh.instanceColor) mesh.instanceColor.needsUpdate = true;
  }, [lights]);
  return <group position={[-1.35, 2.35, -2.66]} visible={introStage === 'reveal' || introStage === 'name' || introStage === 'ready'}>
    <mesh position={[0, .1, -.2]}><planeGeometry args={[3.55, 2.8]} /><meshBasicMaterial map={sky} /></mesh>
    <mesh position={[0, -.67, -.17]}><planeGeometry args={[3.55, .35]} /><meshBasicMaterial color="#dcab88" transparent opacity={.7} /></mesh>
    {blocks.map((block, i) => <group key={i} position={[block.x, -.84 + block.height / 2, block.z]}>
      <mesh><boxGeometry args={[.18, block.height, .12]} /><meshStandardMaterial color={i % 3 === 0 ? '#494454' : '#6b566b'} roughness={.88} /></mesh>
    </group>)}
    <instancedMesh ref={lightMesh} args={[undefined, undefined, lights.length]}><planeGeometry args={[1, 1]} /><meshBasicMaterial color="white" transparent opacity={.72} /></instancedMesh>
    <group position={[.55, -.52, .21]}>
      <mesh position={[0, -.42, 0]} rotation={[0, 0, -.14]}><cylinderGeometry args={[.028, .06, 1.8, 7]} /><meshStandardMaterial color="#514f45" roughness={.9} /></mesh>
      {[-1.25, -.75, -.25, .25, .75, 1.25].map((angle, index) => <mesh key={index} position={[Math.sin(angle) * .3, .43 - Math.abs(angle) * .12, .02]} rotation={[0, 0, -angle]} scale={[.15, .55, .06]}><sphereGeometry args={[1, 10, 8]} /><meshStandardMaterial color={index % 2 ? '#496a54' : '#627455'} roughness={.94} /></mesh>)}
    </group>
    <mesh position={[0, 0, -.02]}><planeGeometry args={[3.6, 2.82]} /><meshPhysicalMaterial color="#c0b4c5" transparent opacity={.06} roughness={.08} metalness={.22} /></mesh>
    {[-1.8, 0, 1.8].map((x) => <mesh key={x} position={[x, 0, .02]}><boxGeometry args={[.08, 2.9, .09]} /><meshStandardMaterial color="#151a27" metalness={.8} roughness={.3} /></mesh>)}
    {[-1.45, 1.45].map((y) => <mesh key={y} position={[0, y, .02]}><boxGeometry args={[3.67, .08, .09]} /><meshStandardMaterial color="#151a27" metalness={.8} roughness={.3} /></mesh>)}
  </group>;
}

function Desk({ onPreview, onChat, introStage, reduced }: { onPreview: (preview: PreviewKey) => void; onChat: () => void; introStage: IntroStage; reduced: boolean }) {
  const monitorMaterial = useRef<THREE.MeshBasicMaterial>(null);
  const stripMaterial = useRef<THREE.MeshBasicMaterial>(null);
  useFrame((_, delta) => {
    const target = introStage === 'ready' || introStage === 'name' ? 1 : introStage === 'reveal' ? .7 : .015;
    const alpha = 1 - Math.exp(-delta * 2.4);
    if (monitorMaterial.current) monitorMaterial.current.color.lerp(new THREE.Color().setScalar(target), alpha);
    if (stripMaterial.current) stripMaterial.current.color.lerp(new THREE.Color('#ffc47e').multiplyScalar(target), alpha);
  });
  const monitorTexture = useMemo(() => {
    const canvas = document.createElement('canvas');
    canvas.width = 1024; canvas.height = 600;
    const ctx = canvas.getContext('2d')!;
    const gradient = ctx.createLinearGradient(0, 0, 1024, 600);
    gradient.addColorStop(0, '#0d0e1a'); gradient.addColorStop(1, '#161426');
    ctx.fillStyle = gradient; ctx.fillRect(0, 0, 1024, 600);
    ctx.strokeStyle = '#816478'; ctx.lineWidth = 2; ctx.strokeRect(25, 25, 974, 550);
    ctx.fillStyle = '#ecacc9'; ctx.font = 'bold 27px monospace'; ctx.fillText('ABDULLAH.OS / WORKBENCH', 62, 82);
    ctx.fillStyle = '#f2b0cc'; ctx.font = 'bold 88px sans-serif'; ctx.fillText('PROJECTS', 62, 265);
    ctx.fillStyle = '#c9aab8'; ctx.font = '28px monospace'; ctx.fillText('A collection of things built with intent.', 64, 316);
    ['AI', 'WEB', 'PYTHON', 'DATA'].forEach((label, i) => {
      ctx.fillStyle = i % 2 ? '#3a293d' : '#4c3448';
      ctx.fillRect(62 + i * 230, 395, 205, 116);
      ctx.fillStyle = '#f3d9e3'; ctx.font = 'bold 31px monospace'; ctx.fillText(label, 80 + i * 230, 465);
    });
    const texture = new THREE.CanvasTexture(canvas); texture.colorSpace = THREE.SRGBColorSpace;
    return texture;
  }, []);
  const rearTexture = useMemo(() => {
    const canvas = document.createElement('canvas');
    canvas.width = 1024; canvas.height = 600;
    const ctx = canvas.getContext('2d')!;
    ctx.fillStyle = '#141724'; ctx.fillRect(0, 0, 1024, 600);
    ctx.fillStyle = '#e9a8c6'; ctx.font = 'bold 104px monospace';
    ctx.textAlign = 'center'; ctx.fillText('PROJECTS', 512, 325);
    ctx.fillStyle = '#b8a8b5'; ctx.font = '27px monospace';
    ctx.fillText('ABDULLAH.OS  /  EXPLORE THE WORK', 512, 391);
    const texture = new THREE.CanvasTexture(canvas); texture.colorSpace = THREE.SRGBColorSpace;
    return texture;
  }, []);
  return <group>
    <RoundedBox args={[6.02, .73, 2.15]} radius={.14} position={[0, .41, .64]} castShadow><meshStandardMaterial color="#151721" roughness={.63} metalness={.16} /></RoundedBox>
    <RoundedBox args={[6.5, .27, 2.5]} radius={.09} position={[0, .76, .65]} castShadow receiveShadow><meshStandardMaterial color="#252835" roughness={.34} metalness={.25} /></RoundedBox>
    <RoundedBox args={[6.47, .032, 2.45]} radius={.02} position={[0, .895, .65]}><meshStandardMaterial color="#20202a" roughness={.38} metalness={.36} /></RoundedBox>
    <mesh position={[0, .58, 1.91]}><boxGeometry args={[6.22, .025, .04]} /><meshBasicMaterial ref={stripMaterial} color="#010101" /></mesh>
    {[-3.12, 3.12].map((x) => <mesh key={x} position={[x, .59, .65]}><boxGeometry args={[.025, .024, 2.3]} /><meshBasicMaterial color="#ffc88e" toneMapped={false} /></mesh>)}
    <RoundedBox args={[2.6, .08, .76]} radius={.06} position={[0, .956, 1.45]}><meshStandardMaterial color="#14171d" roughness={.82} /></RoundedBox>
    {Array.from({ length: 44 }, (_, i) => <mesh key={i} position={[-1.18 + (i % 11) * .215, 1.005, 1.16 + Math.floor(i / 11) * .16]}><boxGeometry args={[.16, .025, .105]} /><meshStandardMaterial color={i % 8 === 0 ? '#485969' : '#303643'} roughness={.75} /></mesh>)}
    <RoundedBox args={[.2, .06, .32]} radius={.06} position={[1.63, .96, 1.49]}><meshStandardMaterial color="#2d3342" /></RoundedBox>
    <group onClick={() => onPreview('projects')}>
      <RoundedBox args={[2.57, 1.56, .13]} radius={.09} position={[0, 1.94, .04]} castShadow><meshStandardMaterial color="#10141d" metalness={.55} roughness={.24} /></RoundedBox>
      <mesh position={[0, 1.94, -.115]} rotation={[0, Math.PI, 0]}><planeGeometry args={[2.37, 1.35]} /><meshBasicMaterial ref={monitorMaterial} map={monitorTexture} color="#010101" toneMapped={false} /></mesh>
      <mesh position={[0, 1.94, .116]}><planeGeometry args={[2.37, 1.35]} /><meshBasicMaterial map={rearTexture} toneMapped={false} /></mesh>
      <mesh position={[0, 1.16, .04]}><boxGeometry args={[.12, .55, .1]} /><meshStandardMaterial color="#181b23" metalness={.6} /></mesh>
      <RoundedBox args={[.7, .05, .42]} radius={.025} position={[0, .93, .13]}><meshStandardMaterial color="#191c25" /></RoundedBox>
    </group>
    <group onClick={() => onPreview('about')}>
      <RoundedBox args={[1.05, .08, .8]} radius={.03} position={[-1.9, .96, .72]} rotation={[0, -.12, 0]} castShadow><meshStandardMaterial color="#d3c4aa" roughness={.87} /></RoundedBox>
      <mesh position={[-1.9, 1.008, .72]} rotation={[-Math.PI / 2, 0, -.12]}><planeGeometry args={[.87, .65]} /><meshStandardMaterial color="#e9dfc7" roughness={.96} /></mesh>
      {Array.from({ length: 5 }, (_, i) => <mesh key={i} position={[-1.9, 1.013, .5 + i * .085]} rotation={[-Math.PI / 2, 0, -.12]}><planeGeometry args={[.68, .008]} /><meshBasicMaterial color="#8c8490" /></mesh>)}
    </group>
    <AssistantBot onClick={onChat} introStage={introStage} reduced={reduced} />
    {(introStage === 'reveal' || introStage === 'ready') && <ContactPhone onClick={() => onPreview('contact')} />}
    <DeskLamp />
  </group>;
}

function DiamondHotspot({ position, onClick, reduced }: { position: [number, number, number]; onClick: () => void; reduced: boolean }) {
  const marker = useRef<THREE.Group>(null);
  useFrame(({ clock }) => {
    if (marker.current && !reduced) marker.current.position.y = Math.sin(clock.elapsedTime * 1.7 + position[0]) * .065;
  });
  return <group position={position} onClick={(event) => { event.stopPropagation(); onClick(); }}>
    <group ref={marker}>
      <mesh rotation={[0, 0, Math.PI / 4]}><octahedronGeometry args={[.115]} /><meshBasicMaterial color="#f4accb" toneMapped={false} /></mesh>
      <mesh scale={1.55}><octahedronGeometry args={[.115]} /><meshBasicMaterial color="#f2a6ca" transparent opacity={.12} depthWrite={false} /></mesh>
      <pointLight color="#f4a5c9" intensity={.45} distance={.95} />
    </group>
  </group>;
}

export default function DeskScene({ destination, introStage, onPreview, onChat, onDrag, reduced, quality, onFailure }: { destination: Destination; introStage: IntroStage; onPreview: (preview: PreviewKey) => void; onChat: () => void; onDrag: () => void; reduced: boolean; quality: QualityProfile; onFailure: () => void }) {
  return <Canvas className="desk-canvas" style={{ pointerEvents: introStage === 'ready' ? 'auto' : 'none' }} shadows={quality === 'high'} dpr={quality === 'high' ? [1, 1.7] : [1, 1.15]} camera={{ position: botStop.position, fov: 48 }} onCreated={({ gl }) => { gl.outputColorSpace = THREE.SRGBColorSpace; gl.toneMapping = THREE.ACESFilmicToneMapping; gl.toneMappingExposure = 1.5; gl.domElement.addEventListener('webglcontextlost', onFailure, { once: true }); }}>
    <color attach="background" args={['#101521']} />
    <fog attach="fog" args={['#101521', 8, 17]} />
    <LightingRig introStage={introStage} quality={quality} />
    <RoomShell />
    <PracticalFixtures introStage={introStage} />
    <LoungeCouch />
    <StudioChair />
    <RoomSetDressing />
    <WindowCity introStage={introStage} />
    <BadgeBoard onClick={() => onPreview('journey')} />
    <Bookcase />
    <Desk onPreview={onPreview} onChat={onChat} introStage={introStage} reduced={reduced} />
    {introStage === 'ready' && <group>
      <DiamondHotspot position={[-.15, 2.94, .28]} onClick={() => onPreview('projects')} reduced={reduced} />
      <DiamondHotspot position={[2.42, 3.46, -2.62]} onClick={() => onPreview('journey')} reduced={reduced} />
      <DiamondHotspot position={[-1.9, 1.62, .72]} onClick={() => onPreview('about')} reduced={reduced} />
      <DiamondHotspot position={[2.34, 2.12, 1.03]} onClick={() => onPreview('contact')} reduced={reduced} />
      <DiamondHotspot position={[1.58, 2.48, -.26]} onClick={onChat} reduced={reduced} />
    </group>}
    {quality === 'high' && <ContactShadows position={[0, .001, .4]} opacity={.5} scale={10} blur={2.5} far={4} frames={1} />}
    <CameraController destination={destination} introStage={introStage} reduced={reduced} onDrag={onDrag} />
  </Canvas>;
}
