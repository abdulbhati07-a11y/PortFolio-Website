'use client';

import { RoundedBox } from '@react-three/drei';

export function RoomSetDressing() {
  return <group>
    <group position={[3.55, 0, -1.92]}>
      <RoundedBox args={[1.17, .62, .52]} radius={.04} position={[0, .33, 0]} castShadow><meshStandardMaterial color="#171923" roughness={.62} /></RoundedBox>
      <mesh position={[0, .65, 0]}><boxGeometry args={[1.22, .04, .59]} /><meshStandardMaterial color="#30303d" metalness={.38} roughness={.4} /></mesh>
      <mesh position={[-.29, .38, .29]} rotation={[Math.PI / 2, 0, 0]}><torusGeometry args={[.21, .04, 10, 28]} /><meshStandardMaterial color="#d38caa" metalness={.65} roughness={.25} emissive="#a34e78" emissiveIntensity={.4} /></mesh>
      <mesh position={[-.29, .38, .304]}><circleGeometry args={[.14, 24]} /><meshStandardMaterial color="#111622" roughness={.55} /></mesh>
      <RoundedBox args={[.29, .04, .21]} radius={.02} position={[.34, .7, 0]}><meshStandardMaterial color="#9da0ab" metalness={.4} roughness={.36} /></RoundedBox>
      {[-.16, .16].map((x) => <mesh key={x} position={[x, .38, .307]}><boxGeometry args={[.025, .16, .009]} /><meshBasicMaterial color="#dfa9ba" /></mesh>)}
    </group>
    <group position={[3.95, 0, 1.25]}>
      {[-.52, .52].map((x) => <mesh key={x} position={[x, .44, 0]}><boxGeometry args={[.065, .88, .58]} /><meshStandardMaterial color="#242831" metalness={.34} roughness={.5} /></mesh>)}
      <RoundedBox args={[1.3, .07, .73]} radius={.03} position={[0, .87, 0]} castShadow><meshStandardMaterial color="#242631" metalness={.22} roughness={.58} /></RoundedBox>
      <RoundedBox args={[.95, .05, .62]} radius={.03} position={[0, .93, 0]}><meshStandardMaterial color="#131722" metalness={.45} roughness={.38} /></RoundedBox>
      <group rotation={[-.18, .08, 0]} position={[0, 1.33, -.23]}>
        <RoundedBox args={[1.03, .68, .045]} radius={.025} castShadow><meshStandardMaterial color="#171824" metalness={.48} roughness={.32} /></RoundedBox>
        <mesh position={[0, 0, .027]}><planeGeometry args={[.94, .58]} /><meshBasicMaterial color="#171521" /></mesh>
        {Array.from({ length: 9 }, (_, i) => <mesh key={i} position={[-.35 + i * .085, .1 - (i % 3) * .07, .029]}><planeGeometry args={[.05, .018]} /><meshBasicMaterial color={i % 3 === 0 ? '#e8a5c0' : '#a9a5be'} /></mesh>)}
        {[0, 1, 2, 3].map((i) => <mesh key={'bar-' + i} position={[.12, -.21 + i * .045, .029]}><planeGeometry args={[.52 - i * .05, .014]} /><meshBasicMaterial color="#e6a2c3" /></mesh>)}
      </group>
      <mesh position={[0, .38, .1]}><boxGeometry args={[.6, .045, .42]} /><meshStandardMaterial color="#c9c8cb" metalness={.42} roughness={.34} /></mesh>
    </group>
    <group position={[4.08, 0, -.22]}>
      <mesh position={[0, .24, 0]} castShadow><cylinderGeometry args={[.32, .22, .5, 18]} /><meshStandardMaterial color="#d6d3d3" roughness={.85} /></mesh>
      <mesh position={[0, 1.03, 0]}><cylinderGeometry args={[.026, .04, 1.2, 8]} /><meshStandardMaterial color="#485748" roughness={.95} /></mesh>
      {[-.95, -.55, -.15, .25, .65, 1.05].map((angle, i) => <mesh key={i} position={[Math.sin(angle) * .3, 1.41 + (i % 2) * .13, Math.cos(angle) * .2]} rotation={[.15, 0, -angle]} scale={[.13, .47, .18]}><sphereGeometry args={[1, 10, 8]} /><meshStandardMaterial color={i % 2 ? '#526d58' : '#6b8265'} roughness={.98} /></mesh>)}
    </group>
    <group position={[-4.45, 2.9, -.8]} rotation={[0, Math.PI / 2, 0]}>
      {[-.75, .56].map((x, i) => <group key={x} position={[x, 0, 0]} rotation={[0, 0, i ? -.06 : .05]}>
        <RoundedBox args={[.9, 1.08, .055]} radius={.02}><meshStandardMaterial color="#10131d" roughness={.4} /></RoundedBox>
        <mesh position={[0, 0, .032]}><planeGeometry args={[.76, .92]} /><meshBasicMaterial color={i ? '#9b6385' : '#405070'} /></mesh>
        <mesh position={[0, -.18, .034]}><planeGeometry args={[.65, .25]} /><meshBasicMaterial color={i ? '#e4a77f' : '#c6a2a9'} /></mesh>
      </group>)}
    </group>
    <group position={[-4.42, 2.03, -1.05]} rotation={[0, Math.PI / 2, 0]}>
      <mesh position={[0, -.43, 0]}><boxGeometry args={[2.05, .085, .36]} /><meshStandardMaterial color="#272830" metalness={.25} roughness={.52} /></mesh>
      {Array.from({ length: 12 }, (_, i) => <mesh key={i} position={[-.87 + i * .15, -.12 + (i % 4) * .025, .02]} rotation={[0, 0, (i % 3 - 1) * .045]}><boxGeometry args={[.12, .55 + (i % 4) * .1, .18]} /><meshStandardMaterial color={['#345078', '#7d5b82', '#ae6e67', '#bd9a75'][i % 4]} roughness={.8} /></mesh>)}
    </group>
  </group>;
}
