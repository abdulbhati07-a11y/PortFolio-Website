'use client';

import { RoundedBox } from '@react-three/drei';
import { useFrame } from '@react-three/fiber';
import { useMemo, useRef } from 'react';
import * as THREE from 'three';

function useFloorTexture() {
  return useMemo(() => {
    const canvas = document.createElement('canvas');
    canvas.width = 512; canvas.height = 512;
    const ctx = canvas.getContext('2d')!;
    ctx.fillStyle = '#202631'; ctx.fillRect(0, 0, 512, 512);
    for (let row = 0; row < 8; row++) {
      for (let col = 0; col < 8; col++) {
        const x = col * 64, y = row * 64;
        ctx.fillStyle = (row + col) % 2 ? '#252b35' : '#1b222d';
        ctx.fillRect(x + 2, y + 2, 60, 60);
        ctx.strokeStyle = '#303541'; ctx.lineWidth = 2;
        ctx.beginPath(); ctx.moveTo(x + 12, y + 56); ctx.lineTo(x + 56, y + 12); ctx.stroke();
        ctx.strokeStyle = '#151c25'; ctx.strokeRect(x, y, 64, 64);
      }
    }
    const texture = new THREE.CanvasTexture(canvas);
    texture.wrapS = texture.wrapT = THREE.RepeatWrapping;
    texture.repeat.set(8, 8);
    texture.colorSpace = THREE.SRGBColorSpace;
    return texture;
  }, []);
}

export function RoomShell() {
  const floor = useFloorTexture();
  return <group>
    <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -.025, 4]} receiveShadow><planeGeometry args={[30, 30]} /><meshStandardMaterial map={floor} roughness={.9} metalness={.03} /></mesh>
    <mesh position={[0, 2.3, -3.08]} receiveShadow><boxGeometry args={[30, 8, .18]} /><meshStandardMaterial color="#252630" roughness={.95} /></mesh>
    <mesh position={[-4.58, 2.3, 3.5]} receiveShadow><boxGeometry args={[.18, 8, 13]} /><meshStandardMaterial color="#23242e" roughness={.95} /></mesh>
    {Array.from({ length: 19 }, (_, i) => <mesh key={'v' + i} position={[-9 + i, 2, -2.975]}><boxGeometry args={[.012, 5.4, .017]} /><meshBasicMaterial color="#171923" /></mesh>)}
    {[.28, 1.52, 2.76, 4].map((y) => <mesh key={'h' + y} position={[0, y, -2.972]}><boxGeometry args={[30, .014, .017]} /><meshBasicMaterial color="#171923" /></mesh>)}
    {[-3.9, -2.85, -1.8, -.75, .3, 1.35, 2.4, 3.45, 4.5].map((z) => <mesh key={z} position={[-4.47, 2.15, z]}><boxGeometry args={[.018, 4.8, .012]} /><meshBasicMaterial color="#181a24" /></mesh>)}
    <mesh position={[0, .17, -2.94]}><boxGeometry args={[30, .34, .04]} /><meshStandardMaterial color="#151820" roughness={.62} /></mesh>
    <mesh position={[-4.45, .17, 3.5]}><boxGeometry args={[.04, .34, 13]} /><meshStandardMaterial color="#151820" roughness={.62} /></mesh>
    <mesh position={[0, .038, 1.2]} rotation={[-Math.PI / 2, 0, 0]}><planeGeometry args={[8, 4.05]} /><meshStandardMaterial color="#9d9693" roughness={1} /></mesh>
    <mesh position={[0, .043, 1.2]} rotation={[-Math.PI / 2, 0, 0]}><planeGeometry args={[7.55, 3.64]} /><meshStandardMaterial color="#c5bab0" roughness={1} /></mesh>
    <mesh position={[0, .048, 1.2]} rotation={[-Math.PI / 2, 0, 0]}><planeGeometry args={[7.27, 3.36]} /><meshStandardMaterial color="#bcb3aa" roughness={1} /></mesh>
    <mesh position={[0, 4.26, -3.02]}><boxGeometry args={[30, .1, .14]} /><meshStandardMaterial color="#151820" /></mesh>
  </group>;
}

export function BadgeBoard({ onClick }: { onClick: () => void }) {
  return <group position={[2.42, 2.54, -2.76]} onClick={onClick}>
    <RoundedBox args={[2.27, 1.36, .13]} radius={.025} castShadow><meshStandardMaterial color="#40404f" roughness={.72} emissive="#5f5d8b" emissiveIntensity={.22} /></RoundedBox>
    {Array.from({ length: 9 }, (_, row) => Array.from({ length: 16 }, (_, col) => <mesh key={row + '-' + col} position={[-1.03 + col * .137, -.55 + row * .137, .071]}><cylinderGeometry args={[.015, .015, .008, 8]} /><meshBasicMaterial color="#161921" /></mesh>))}
    {[-.82, -.41, 0, .41, .82].map((x, i) => <group key={i} position={[x, -.14, .15]} rotation={[0, 0, (i - 2) * .025]}>
      <mesh position={[0, .42, 0]}><boxGeometry args={[.035, .62, .02]} /><meshStandardMaterial color={['#d05769', '#48b9aa', '#7281c9', '#d09b58', '#ab82c9'][i]} /></mesh>
      <RoundedBox args={[.31, .44, .03]} radius={.02} castShadow><meshStandardMaterial color="#eee8e7" roughness={.85} /></RoundedBox>
      <mesh position={[0, .11, .018]}><planeGeometry args={[.29, .14]} /><meshBasicMaterial color={['#d05769', '#48b9aa', '#7281c9', '#d09b58', '#ab82c9'][i]} /></mesh>
      <mesh position={[0, -.11, .018]}><planeGeometry args={[.2, .018]} /><meshBasicMaterial color="#696b75" /></mesh>
    </group>)}
    <mesh position={[0, 0, -.052]}><boxGeometry args={[2.38, 1.48, .025]} /><meshBasicMaterial color="#abb5d9" transparent opacity={.08} /></mesh>
  </group>;
}

export function Bookcase() {
  return <group position={[-3.89, 0, -1.5]}>
    {[.75, 1.55, 2.35].map((y) => <mesh key={y} position={[0, y, 0]} castShadow><boxGeometry args={[.82, .08, 1.35]} /><meshStandardMaterial color="#554c48" metalness={.1} roughness={.64} /></mesh>)}
    {[0, 1].map((side) => <mesh key={side} position={[0, 1.55, side ? .63 : -.63]}><boxGeometry args={[.76, 1.65, .06]} /><meshStandardMaterial color="#3b4148" roughness={.78} /></mesh>)}
    {Array.from({ length: 13 }, (_, i) => <mesh key={i} position={[.03, 1.77, -.5 + i * .08]} rotation={[0, 0, ((i * 3) % 5 - 2) * .05]}><boxGeometry args={[.38 + (i % 3) * .07, .35 + (i % 4) * .07, .066]} /><meshStandardMaterial color={['#68877c', '#a48a73', '#626b80', '#a1aea5'][i % 4]} roughness={.88} /></mesh>)}
    <mesh position={[0, 2.54, .1]}><cylinderGeometry args={[.15, .21, .22, 20]} /><meshStandardMaterial color="#9b7f6f" /></mesh>
    {[-.07, 0, .07].map((x) => <mesh key={x} position={[x, 2.76, .1]} rotation={[x * 3, 0, x * 5]}><coneGeometry args={[.12, .4, 5]} /><meshStandardMaterial color="#496b60" side={THREE.DoubleSide} /></mesh>)}
  </group>;
}

export function DeskLamp() {
  return <group position={[-2.6, .96, -.52]}>
    <mesh><cylinderGeometry args={[.18, .22, .06, 24]} /><meshStandardMaterial color="#202632" metalness={.5} /></mesh>
    <mesh position={[.08, .35, 0]} rotation={[0, 0, -.35]}><cylinderGeometry args={[.035, .035, .75, 12]} /><meshStandardMaterial color="#7a8587" metalness={.7} /></mesh>
    <mesh position={[.22, .75, 0]} rotation={[0, 0, .55]}><cylinderGeometry args={[.033, .033, .6, 12]} /><meshStandardMaterial color="#7a8587" metalness={.7} /></mesh>
    <mesh position={[.36, .98, 0]} rotation={[0, 0, -.5]}><coneGeometry args={[.28, .3, 32, 1, true]} /><meshStandardMaterial color="#789385" metalness={.3} roughness={.55} side={THREE.DoubleSide} /></mesh>
    <mesh position={[.43, .85, 0]} rotation={[-Math.PI / 2, 0, 0]}><circleGeometry args={[.16, 24]} /><meshBasicMaterial color="#ffe4b7" /></mesh>
  </group>;
}

export function AssistantBot({ onClick, introStage, reduced }: { onClick: () => void; introStage: 'boot' | 'name' | 'bot' | 'reveal' | 'ready'; reduced: boolean }) {
  const eyes = useRef<THREE.Group>(null);
  const head = useRef<THREE.Group>(null);
  useFrame(({ clock, pointer }, delta) => {
    if (eyes.current) eyes.current.scale.y = Math.sin(clock.elapsedTime * 1.15) > .997 ? .1 : 1;
    if (!head.current) return;
    const turn = introStage === 'ready' || introStage === 'name' ? 1.55 : introStage === 'reveal' ? .8 : 0;
    const targetY = reduced ? turn : turn + (introStage === 'ready' ? pointer.x * .24 + Math.sin(clock.elapsedTime * .7) * .07 : 0);
    head.current.rotation.y = THREE.MathUtils.damp(head.current.rotation.y, targetY, 2.2, delta);
    head.current.rotation.x = THREE.MathUtils.damp(head.current.rotation.x, introStage === 'ready' && !reduced ? pointer.y * -.09 : 0, 2.5, delta);
    head.current.position.y = reduced ? 0 : Math.sin(clock.elapsedTime * 1.3) * .012;
  });
  return <group position={[1.72, 1.58, 2.27]} rotation={[0, -2.5, 0]} onClick={onClick}>
    <RoundedBox args={[.54, .1, .46]} radius={.04} position={[0, -.47, 0]} castShadow><meshStandardMaterial color="#566c6a" metalness={.38} roughness={.4} /></RoundedBox>
    {[-.19, .19].map((x) => <group key={x}>
      <RoundedBox args={[.17, .32, .2]} radius={.05} position={[x, -.51, .17]} rotation={[.38, 0, 0]}><meshStandardMaterial color="#aab5ad" metalness={.26} roughness={.48} /></RoundedBox>
      <RoundedBox args={[.23, .09, .3]} radius={.04} position={[x, -.68, .29]}><meshStandardMaterial color="#526a68" metalness={.38} roughness={.38} /></RoundedBox>
    </group>)}
    <group ref={head}>
    <RoundedBox args={[.88, .66, .55]} radius={.12} castShadow><meshStandardMaterial color="#eee8e3" metalness={.18} roughness={.45} /></RoundedBox>
    <RoundedBox args={[.75, .54, .045]} radius={.09} position={[0, .04, .287]}><meshStandardMaterial color="#23202b" metalness={.48} roughness={.22} /></RoundedBox>
    <RoundedBox args={[.68, .48, .03]} radius={.08} position={[0, .04, .315]}><meshStandardMaterial color="#efbbcf" emissive="#b66b96" emissiveIntensity={.3} roughness={.14} metalness={.12} /></RoundedBox>
    <RoundedBox args={[.51, .25, .02]} radius={.05} position={[0, .02, -.288]}><meshStandardMaterial color="#47766f" metalness={.56} roughness={.3} emissive="#1b504b" emissiveIntensity={.5} /></RoundedBox>
    <mesh position={[0, .02, -.302]} rotation={[0, Math.PI, 0]}><torusGeometry args={[.072, .012, 8, 24]} /><meshBasicMaterial color="#9ff1d4" /></mesh>
    <group ref={eyes}>{[-.16, .16].map((x) => <group key={x} position={[x, .09, .34]}>
      <RoundedBox args={[.075, .12, .012]} radius={.014} position={[0, 0, .011]}><meshBasicMaterial color="#201923" /></RoundedBox>
    </group>)}</group>
    <mesh position={[0, -.1, .342]}><boxGeometry args={[.16, .023, .005]} /><meshBasicMaterial color="#201923" /></mesh>
    {[-.33, .33].map((x) => [-.19, .26].map((y) => <mesh key={x + '-' + y} position={[x, y, .315]} rotation={[Math.PI / 2, 0, 0]}><cylinderGeometry args={[.012, .012, .008, 12]} /><meshStandardMaterial color="#e6f1df" metalness={.8} roughness={.24} /></mesh>))}
    {[-.48, .48].map((x) => <group key={x} position={[x, .02, 0]}>
      <mesh rotation={[0, 0, Math.PI / 2]}><cylinderGeometry args={[.13, .13, .08, 24]} /><meshStandardMaterial color="#648d86" metalness={.65} roughness={.28} /></mesh>
      <mesh position={[x < 0 ? -.05 : .05, 0, 0]} rotation={[0, 0, Math.PI / 2]}><cylinderGeometry args={[.075, .075, .015, 24]} /><meshBasicMaterial color="#e8b0cb" /></mesh>
    </group>)}
    {[-.19, .19].map((x) => <group key={x} position={[x, .44, 0]} rotation={[0, 0, x < 0 ? -.42 : .42]}>
      <mesh position={[0, .08, 0]}><cylinderGeometry args={[.013, .013, .2, 8]} /><meshStandardMaterial color="#27232c" /></mesh>
      <mesh position={[0, .2, 0]}><sphereGeometry args={[.04, 12, 12]} /><meshBasicMaterial color="#e8b0cb" /></mesh>
    </group>)}
    </group>
    <mesh position={[0, -.44, 0]}><cylinderGeometry args={[.18, .23, .27, 20]} /><meshStandardMaterial color="#9ea8a2" metalness={.28} /></mesh>
    <RoundedBox args={[.18, .08, .018]} radius={.02} position={[0, -.42, .197]}><meshBasicMaterial color="#8ce5c8" /></RoundedBox>
    {[-.52, .52].map((x) => <mesh key={x} position={[x, -.21, 0]}><sphereGeometry args={[.12, 16, 16]} /><meshStandardMaterial color="#728a86" metalness={.42} /></mesh>)}
    {[-.52, .52].map((x) => <group key={'typing-' + x} position={[x, -.31, .2]} rotation={[-.58, 0, x < 0 ? -.12 : .12]}>
      <RoundedBox args={[.16, .31, .16]} radius={.06}><meshStandardMaterial color="#b4c6bb" metalness={.22} roughness={.5} /></RoundedBox>
      <mesh position={[0, -.18, .02]}><sphereGeometry args={[.09, 12, 12]} /><meshStandardMaterial color="#91b9ae" roughness={.43} /></mesh>
    </group>)}
    <pointLight position={[0, .04, .45]} color="#e7a5c8" intensity={3} distance={1.4} />
  </group>;
}

export function ContactPhone({ onClick }: { onClick: () => void }) {
  return <group position={[2.34, 1.28, 1.03]} rotation={[0, -.28, -.1]} onClick={onClick}>
    <RoundedBox args={[.44, .78, .075]} radius={.07} castShadow><meshStandardMaterial color="#1b222c" metalness={.72} roughness={.2} /></RoundedBox>
    <mesh position={[0, 0, .041]}><planeGeometry args={[.38, .68]} /><meshStandardMaterial color="#1d3d43" emissive="#338c8c" emissiveIntensity={.44} /></mesh>
    <mesh position={[0, .16, .046]}><circleGeometry args={[.055, 16]} /><meshBasicMaterial color="#aef0d5" /></mesh>
    <mesh position={[0, -.04, .046]}><planeGeometry args={[.25, .02]} /><meshBasicMaterial color="#bdd4c6" /></mesh>
    <mesh position={[0, -.12, .046]}><planeGeometry args={[.19, .016]} /><meshBasicMaterial color="#91b6ae" /></mesh>
    <mesh position={[0, -.3, .046]}><planeGeometry args={[.12, .012]} /><meshBasicMaterial color="#b9d2c4" /></mesh>
    <pointLight position={[0, .1, .2]} color="#8ae6d7" intensity={2} distance={1} />
  </group>;
}
