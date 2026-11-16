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
    <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -.03, 0]} receiveShadow><planeGeometry args={[30, 30]} /><meshStandardMaterial map={floor} roughness={.92} /></mesh>
    <mesh position={[0, 2, -3.05]} receiveShadow><boxGeometry args={[12, 4.2, .16]} /><meshStandardMaterial color="#202432" roughness={.94} /></mesh>
    <mesh position={[-4.5, 2, 0]} receiveShadow><boxGeometry args={[.16, 4.2, 7]} /><meshStandardMaterial color="#1c2230" roughness={.95} /></mesh>
    <mesh position={[4.5, 2, 0]} receiveShadow><boxGeometry args={[.16, 4.2, 7]} /><meshStandardMaterial color="#1d222e" roughness={.95} /></mesh>
    {[-4.25, -3.4, 3.4, 4.25].map((x) => <mesh key={x} position={[x, 2.1, -2.93]}><boxGeometry args={[.025, 3.8, .025]} /><meshStandardMaterial color="#30394a" metalness={.3} /></mesh>)}
    {[.25, 1.35, 2.45, 3.55].map((y) => <mesh key={y} position={[-3.7, y, -2.93]}><boxGeometry args={[1.25, .018, .03]} /><meshStandardMaterial color="#30394a" /></mesh>)}
    <mesh position={[0, .04, 1.2]} rotation={[-Math.PI / 2, 0, 0]}><planeGeometry args={[7.8, 3.5]} /><meshStandardMaterial color="#2e3037" roughness={1} /></mesh>
    <mesh position={[0, .045, 1.2]} rotation={[-Math.PI / 2, 0, 0]}><planeGeometry args={[7.25, 2.95]} /><meshStandardMaterial color="#353540" roughness={1} /></mesh>
    <mesh position={[0, 4.05, -1]}><boxGeometry args={[9, .12, 4]} /><meshStandardMaterial color="#171c28" /></mesh>
  </group>;
}

export function BadgeBoard({ onClick, onHover }: { onClick: () => void; onHover: () => void }) {
  return <group position={[-3.65, 2.05, -2.76]} onClick={onClick} onPointerOver={(event) => { if (event.pointerType === 'mouse') onHover(); }}>
    <RoundedBox args={[1.45, 1.3, .13]} radius={.03} castShadow><meshStandardMaterial color="#343b43" roughness={.72} /></RoundedBox>
    {Array.from({ length: 8 }, (_, row) => Array.from({ length: 9 }, (_, col) => <mesh key={row + '-' + col} position={[-.59 + col * .147, -.5 + row * .145, .073]}><cylinderGeometry args={[.013, .013, .008, 8]} /><meshStandardMaterial color="#141c24" /></mesh>))}
    {[-.38, 0, .38].map((x, i) => <group key={i} position={[x, -.04 + (i % 2) * .08, .15]} rotation={[0, 0, (i - 1) * .08]}>
      <mesh position={[0, .35, 0]}><boxGeometry args={[.035, .52, .02]} /><meshStandardMaterial color={['#a8d5c2', '#d9ac7b', '#9aafc1'][i]} /></mesh>
      <RoundedBox args={[.3, .4, .03]} radius={.02} castShadow><meshStandardMaterial color="#e6e3d7" roughness={.85} /></RoundedBox>
      <mesh position={[0, .07, .018]}><planeGeometry args={[.22, .08]} /><meshBasicMaterial color="#36595a" /></mesh>
      <mesh position={[0, -.11, .018]}><planeGeometry args={[.2, .025]} /><meshBasicMaterial color="#808c89" /></mesh>
    </group>)}
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

export function AssistantBot({ onClick, onHover }: { onClick: () => void; onHover: () => void }) {
  const eyes = useRef<THREE.Group>(null);
  useFrame(({ clock }) => { if (eyes.current) eyes.current.scale.y = Math.sin(clock.elapsedTime * 1.15) > .995 ? .12 : 1; });
  return <group position={[2.0, 1.55, -.28]} onClick={onClick} onPointerOver={(event) => { if (event.pointerType === 'mouse') onHover(); }}>
    <RoundedBox args={[.54, .1, .46]} radius={.04} position={[0, -.47, 0]} castShadow><meshStandardMaterial color="#566c6a" metalness={.38} roughness={.4} /></RoundedBox>
    {[-.19, .19].map((x) => <group key={x}>
      <RoundedBox args={[.17, .32, .2]} radius={.05} position={[x, -.51, .17]} rotation={[.38, 0, 0]}><meshStandardMaterial color="#aab5ad" metalness={.26} roughness={.48} /></RoundedBox>
      <RoundedBox args={[.23, .09, .3]} radius={.04} position={[x, -.68, .29]}><meshStandardMaterial color="#526a68" metalness={.38} roughness={.38} /></RoundedBox>
    </group>)}
    <RoundedBox args={[.88, .66, .55]} radius={.12} castShadow><meshStandardMaterial color="#d0d3ca" metalness={.18} roughness={.45} /></RoundedBox>
    <RoundedBox args={[.75, .54, .045]} radius={.09} position={[0, .04, .287]}><meshStandardMaterial color="#9cb9b3" metalness={.68} roughness={.22} /></RoundedBox>
    <RoundedBox args={[.68, .48, .03]} radius={.08} position={[0, .04, .315]}><meshStandardMaterial color="#071a23" emissive="#174f51" emissiveIntensity={.48} roughness={.1} metalness={.35} /></RoundedBox>
    <group ref={eyes}>{[-.16, .16].map((x) => <group key={x} position={[x, .09, .34]}>
      <mesh><circleGeometry args={[.09, 24]} /><meshBasicMaterial color="#5dceb5" transparent opacity={.18} /></mesh>
      <mesh position={[0, 0, .005]}><sphereGeometry args={[.055, 20, 20]} /><meshBasicMaterial color="#b1ffdb" /></mesh>
      <mesh position={[-.01, .018, .057]}><sphereGeometry args={[.012, 12, 12]} /><meshBasicMaterial color="#ffffff" /></mesh>
    </group>)}</group>
    <mesh position={[0, -.1, .342]}><boxGeometry args={[.16, .018, .005]} /><meshBasicMaterial color="#b1ffdb" /></mesh>
    {[-.33, .33].map((x) => [-.19, .26].map((y) => <mesh key={x + '-' + y} position={[x, y, .315]} rotation={[Math.PI / 2, 0, 0]}><cylinderGeometry args={[.012, .012, .008, 12]} /><meshStandardMaterial color="#e6f1df" metalness={.8} roughness={.24} /></mesh>))}
    {[-.48, .48].map((x) => <group key={x} position={[x, .02, 0]}>
      <mesh rotation={[0, 0, Math.PI / 2]}><cylinderGeometry args={[.13, .13, .08, 24]} /><meshStandardMaterial color="#648d86" metalness={.65} roughness={.28} /></mesh>
      <mesh position={[x < 0 ? -.05 : .05, 0, 0]} rotation={[0, 0, Math.PI / 2]}><cylinderGeometry args={[.075, .075, .015, 24]} /><meshBasicMaterial color="#a6edd2" /></mesh>
    </group>)}
    <mesh position={[0, -.44, 0]}><cylinderGeometry args={[.18, .23, .27, 20]} /><meshStandardMaterial color="#9ea8a2" metalness={.28} /></mesh>
    <RoundedBox args={[.18, .08, .018]} radius={.02} position={[0, -.42, .197]}><meshBasicMaterial color="#8ce5c8" /></RoundedBox>
    {[-.52, .52].map((x) => <mesh key={x} position={[x, -.21, 0]}><sphereGeometry args={[.12, 16, 16]} /><meshStandardMaterial color="#728a86" metalness={.42} /></mesh>)}
    <mesh position={[0, .42, 0]}><cylinderGeometry args={[.015, .015, .2, 8]} /><meshStandardMaterial color="#c4c9ba" /></mesh>
    <mesh position={[0, .54, 0]}><sphereGeometry args={[.055, 12, 12]} /><meshBasicMaterial color="#e9bd82" /></mesh>
    <pointLight position={[0, .04, .45]} color="#73d5c1" intensity={3} distance={1.4} />
  </group>;
}

export function ContactPhone({ onClick, onHover }: { onClick: () => void; onHover: () => void }) {
  return <group position={[2.34, 1.28, 1.03]} rotation={[0, -.28, -.1]} onClick={onClick} onPointerOver={(event) => { if (event.pointerType === 'mouse') onHover(); }}>
    <RoundedBox args={[.44, .78, .075]} radius={.07} castShadow><meshStandardMaterial color="#1b222c" metalness={.72} roughness={.2} /></RoundedBox>
    <mesh position={[0, 0, .041]}><planeGeometry args={[.38, .68]} /><meshStandardMaterial color="#1d3d43" emissive="#338c8c" emissiveIntensity={.44} /></mesh>
    <mesh position={[0, .16, .046]}><circleGeometry args={[.055, 16]} /><meshBasicMaterial color="#aef0d5" /></mesh>
    <mesh position={[0, -.04, .046]}><planeGeometry args={[.25, .02]} /><meshBasicMaterial color="#bdd4c6" /></mesh>
    <mesh position={[0, -.12, .046]}><planeGeometry args={[.19, .016]} /><meshBasicMaterial color="#91b6ae" /></mesh>
    <mesh position={[0, -.3, .046]}><planeGeometry args={[.12, .012]} /><meshBasicMaterial color="#b9d2c4" /></mesh>
    <pointLight position={[0, .1, .2]} color="#8ae6d7" intensity={2} distance={1} />
  </group>;
}
