'use client';

import { RoundedBox } from '@react-three/drei';
import { useFrame } from '@react-three/fiber';
import { useEffect, useRef } from 'react';
import * as THREE from 'three';

export function StudioChair() {
  return <group position={[1.72, 0, 2.27]} rotation={[0, .64, 0]}>
    <mesh position={[0, .39, 0]} castShadow><cylinderGeometry args={[.055, .07, .72, 12]} /><meshStandardMaterial color="#263039" metalness={.75} roughness={.29} /></mesh>
    <mesh position={[0, .13, 0]} castShadow><cylinderGeometry args={[.16, .19, .09, 18]} /><meshStandardMaterial color="#19242c" metalness={.64} roughness={.4} /></mesh>
    {[0, 1, 2, 3, 4].map((index) => <group key={index} rotation={[0, index * Math.PI * 2 / 5, 0]}>
      <mesh position={[0, .17, .28]}><boxGeometry args={[.075, .045, .55]} /><meshStandardMaterial color="#29343a" metalness={.55} roughness={.4} /></mesh>
      <mesh position={[0, .09, .53]}><cylinderGeometry args={[.09, .09, .09, 12]} /><meshStandardMaterial color="#11181d" roughness={.7} /></mesh>
    </group>)}
    <RoundedBox args={[.88, .15, .8]} radius={.08} position={[0, .79, 0]} castShadow><meshStandardMaterial color="#34434b" roughness={.78} /></RoundedBox>
    <RoundedBox args={[.75, .07, .65]} radius={.035} position={[0, .88, -.04]}><meshStandardMaterial color="#567169" roughness={.94} /></RoundedBox>
    <RoundedBox args={[.9, .78, .18]} radius={.13} position={[0, 1.25, .42]} rotation={[-.12, 0, 0]} castShadow><meshStandardMaterial color="#26343d" roughness={.79} /></RoundedBox>
    <RoundedBox args={[.71, .59, .025]} radius={.11} position={[0, 1.25, .312]} rotation={[-.12, 0, 0]}><meshStandardMaterial color="#3a5957" roughness={.87} /></RoundedBox>
    {[-.52, .52].map((x) => <group key={x}>
      <mesh position={[x, .91, .13]}><cylinderGeometry args={[.035, .035, .35, 10]} /><meshStandardMaterial color="#1c292f" metalness={.55} /></mesh>
      <RoundedBox args={[.13, .065, .51]} radius={.03} position={[x, 1.1, -.05]}><meshStandardMaterial color="#344a4b" roughness={.68} /></RoundedBox>
    </group>)}
  </group>;
}

function SleepingCat() {
  return <group position={[.17, .98, .06]} rotation={[0, -.22, 0]}>
    <mesh castShadow position={[.13, 0, -.07]} scale={[.37, .22, .24]}><sphereGeometry args={[1, 24, 16]} /><meshStandardMaterial color="#d9bfa0" roughness={.92} /></mesh>
    <mesh castShadow position={[-.16, .06, .1]} scale={[.2, .18, .18]}><sphereGeometry args={[1, 24, 16]} /><meshStandardMaterial color="#e8d1af" roughness={.94} /></mesh>
    {[-.27, -.08].map((x) => <mesh key={x} castShadow position={[x, .25, .08]} rotation={[0, 0, x < -.2 ? .2 : -.2]}><coneGeometry args={[.09, .18, 4]} /><meshStandardMaterial color="#e1c5a2" roughness={.94} /></mesh>)}
    <mesh position={[-.17, .01, .27]} scale={[.08, .045, .014]}><sphereGeometry args={[1, 12, 8]} /><meshStandardMaterial color="#9b7772" roughness={.85} /></mesh>
    {[-.25, -.09].map((x) => <mesh key={x} position={[x, .12, .257]} rotation={[0, 0, x < -.2 ? -.2 : .2]}><torusGeometry args={[.035, .008, 5, 12, Math.PI]} /><meshBasicMaterial color="#5d5858" /></mesh>)}
    <mesh castShadow position={[.37, .13, -.13]} rotation={[.2, 0, -.48]}><torusGeometry args={[.21, .07, 9, 20, Math.PI * 1.45]} /><meshStandardMaterial color="#d9bfa0" roughness={.93} /></mesh>
    {[-.03, .17].map((x) => <mesh key={x} castShadow position={[x, -.13, .12]} scale={[.11, .065, .1]}><sphereGeometry args={[1, 12, 8]} /><meshStandardMaterial color="#ead1b0" roughness={.92} /></mesh>)}
  </group>;
}

export function LoungeCouch() {
  return <group position={[-3.08, 0, 2.67]} rotation={[0, .18, 0]}>
    {[-.68, .68].map((x) => <mesh key={x} castShadow position={[x, .17, .28]}><cylinderGeometry args={[.055, .07, .31, 12]} /><meshStandardMaterial color="#2e3032" metalness={.42} /></mesh>)}
    <RoundedBox args={[1.94, .27, .95]} radius={.12} position={[0, .48, 0]} castShadow receiveShadow><meshStandardMaterial color="#40545a" roughness={.85} /></RoundedBox>
    <RoundedBox args={[1.84, .17, .8]} radius={.075} position={[0, .69, .05]} castShadow><meshStandardMaterial color="#587176" roughness={.92} /></RoundedBox>
    <RoundedBox args={[1.92, .77, .22]} radius={.1} position={[0, .89, -.45]} castShadow><meshStandardMaterial color="#31464d" roughness={.88} /></RoundedBox>
    {[-.88, .88].map((x) => <RoundedBox key={x} args={[.23, .47, .95]} radius={.1} position={[x, .73, 0]} castShadow><meshStandardMaterial color="#344a50" roughness={.87} /></RoundedBox>)}
    <RoundedBox args={[.56, .29, .12]} radius={.055} position={[-.55, .95, -.27]} rotation={[0, 0, -.1]}><meshStandardMaterial color="#ad8978" roughness={.96} /></RoundedBox>
    <RoundedBox args={[.35, .2, .12]} radius={.05} position={[.65, .88, -.3]} rotation={[0, 0, .15]}><meshStandardMaterial color="#759d91" roughness={.95} /></RoundedBox>
    <mesh position={[-.48, .78, .13]} rotation={[-Math.PI / 2, 0, .06]}><planeGeometry args={[.86, .58]} /><meshStandardMaterial color="#9eab9d" roughness={1} side={THREE.DoubleSide} /></mesh>
    <SleepingCat />
  </group>;
}

export function PracticalFixtures({ introStage }: { introStage: 'boot' | 'name' | 'bot' | 'reveal' | 'ready' }) {
  const cove = useRef<THREE.MeshBasicMaterial>(null);
  const warm = useRef<THREE.MeshBasicMaterial>(null);
  const rose = useRef<THREE.MeshBasicMaterial>(null);
  const couchGlow = useRef<THREE.MeshBasicMaterial>(null);
  const revealTime = useRef(0);
  useEffect(() => { if (introStage === 'reveal') revealTime.current = 0; }, [introStage]);
  useFrame((_, delta) => {
    if (introStage === 'reveal') revealTime.current = Math.min(1, revealTime.current + delta / 5.6);
    const progress = introStage === 'ready' ? 1 : introStage === 'reveal' ? revealTime.current : 0;
    if (cove.current) cove.current.opacity = THREE.MathUtils.smoothstep(progress, .25, .78) * .88;
    if (warm.current) warm.current.opacity = THREE.MathUtils.smoothstep(progress, .43, .85) * .95;
    if (rose.current) rose.current.opacity = THREE.MathUtils.smoothstep(progress, .55, .93) * .82;
    if (couchGlow.current) couchGlow.current.opacity = THREE.MathUtils.smoothstep(progress, .44, .88) * .7;
  });
  return <group>
    <mesh position={[0, 3.98, 1.1]}><boxGeometry args={[6.35, .09, .13]} /><meshStandardMaterial color="#202b35" metalness={.72} roughness={.27} /></mesh>
    {[-2.45, 0, 2.45].map((x) => <group key={x} position={[x, 3.88, 1.1]}>
      <mesh><cylinderGeometry args={[.17, .22, .16, 20]} /><meshStandardMaterial color="#26353c" metalness={.65} roughness={.3} /></mesh>
      <mesh position={[0, -.088, 0]} rotation={[Math.PI / 2, 0, 0]}><circleGeometry args={[.145, 20]} /><meshBasicMaterial color={x < 0 ? '#ffe3bd' : x > 0 ? '#bbdfed' : '#d5e8de'} /></mesh>
    </group>)}
    <mesh position={[0, 3.83, -2.79]}><boxGeometry args={[7.6, .035, .045]} /><meshBasicMaterial ref={cove} color="#a9dfff" transparent opacity={0} toneMapped={false} /></mesh>
    <mesh position={[-4.26, 3.73, -.8]}><boxGeometry args={[.045, .04, 4.2]} /><meshBasicMaterial color="#799db6" transparent opacity={introStage === 'ready' ? .65 : .18} toneMapped={false} /></mesh>
    <mesh position={[4.26, 3.73, -.8]}><boxGeometry args={[.045, .04, 4.2]} /><meshBasicMaterial color="#dba0bb" transparent opacity={introStage === 'ready' ? .65 : .18} toneMapped={false} /></mesh>
    {[-3.56, 3.56].map((x) => <group key={x} position={[x, 2.28, -2.76]}>
      <RoundedBox args={[.26, .64, .12]} radius={.07}><meshStandardMaterial color="#27323c" metalness={.63} roughness={.35} /></RoundedBox>
      <mesh position={[0, 0, .068]}><boxGeometry args={[.095, .48, .018]} /><meshBasicMaterial ref={x < 0 ? warm : rose} color={x < 0 ? '#ffd29a' : '#dba5c8'} transparent opacity={0} toneMapped={false} /></mesh>
    </group>)}
    <mesh position={[-3.08, .19, 2.67]}><boxGeometry args={[1.75, .025, .65]} /><meshBasicMaterial ref={couchGlow} color="#ffc089" transparent opacity={0} toneMapped={false} /></mesh>
  </group>;
}
