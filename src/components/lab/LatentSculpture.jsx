import React, { useMemo } from 'react';

// A projected (2,3) torus knot. No textures, model downloads or WebGL context.
function center(t) {
  const radius = 1.9 + .62 * Math.cos(3 * t);
  return [radius * Math.cos(2 * t), radius * Math.sin(2 * t), .9 * Math.sin(3 * t)];
}
function project([x, y, z]) {
  const a = .72, b = -.48;
  const yy = y * Math.cos(a) - z * Math.sin(a);
  const zz = y * Math.sin(a) + z * Math.cos(a);
  const xx = x * Math.cos(b) + zz * Math.sin(b);
  const depth = -x * Math.sin(b) + zz * Math.cos(b);
  const perspective = 8 / (8 - depth * .22);
  return [400 + xx * 110 * perspective, 365 + yy * 110 * perspective];
}
export default function LatentSculpture() {
  const paths = useMemo(() => Array.from({ length: 54 }, (_, strand) => {
    const phase = strand / 54 * Math.PI * 2;
    const points = Array.from({ length: 260 }, (_, i) => {
      const t = i / 259 * Math.PI * 2;
      const c = center(t), next = center(t + .001);
      const tangent = next.map((v,j) => v - c[j]);
      const length = Math.hypot(...tangent);
      const dir = tangent.map(v => v / length);
      const normalLength = Math.hypot(dir[0], dir[1]);
      const normal = [-dir[1] / normalLength, dir[0] / normalLength, 0];
      const binormal = [dir[1]*normal[2]-dir[2]*normal[1], dir[2]*normal[0]-dir[0]*normal[2], dir[0]*normal[1]-dir[1]*normal[0]];
      const tube = c.map((v,j) => v + .39 * (Math.cos(phase) * normal[j] + Math.sin(phase) * binormal[j]));
      return project(tube).map(v => v.toFixed(1)).join(',');
    });
    return { d: `M${points.join(' L')}`, light: (Math.sin(phase) + 1) / 2 };
  }), []);
  return <svg viewBox="0 0 800 730" className="latent-sculpture" aria-hidden="true"><defs><linearGradient id="silk" x1=".1" y1="0" x2=".9" y2="1"><stop stopColor="#f3e4dc"/><stop offset=".3" stopColor="#c5ade9"/><stop offset=".65" stopColor="#60506f"/><stop offset="1" stopColor="#e6ab91"/></linearGradient><radialGradient id="sculpture-halo"><stop stopColor="#b69cde" stopOpacity=".13"/><stop offset="1" stopColor="#b69cde" stopOpacity="0"/></radialGradient></defs><circle cx="400" cy="365" r="340" fill="url(#sculpture-halo)"/>{paths.map((p,i)=><path key={i} d={p.d} fill="none" stroke="url(#silk)" strokeWidth={p.light > .6 ? 1.45 : .7} opacity={.24 + p.light * .73}/>)}<ellipse cx="400" cy="667" rx="170" ry="8" fill="#09080b" opacity=".35"/></svg>;
}
