import { Mesh } from 'three';
import { mergeGeometries } from 'three/addons/utils/BufferGeometryUtils.js';

// Consolidate opaque, stationary details without touching animated objects,
// clickable surfaces, transparent layers, or their existing shadow settings.
export function batchRoomMeshes(scene, animatedRoots) {
  scene.updateMatrixWorld(true);
  const animated = new Set(animatedRoots.filter(Boolean)), groups = new Map();
  scene.traverse(mesh => {
    if (!mesh.isMesh || mesh.isInstancedMesh || Array.isArray(mesh.material) || mesh.material.transparent || mesh.userData.go || mesh.userData.hover) return;
    for (let node = mesh; node; node = node.parent) if (animated.has(node) || !node.visible) return;
    if (mesh.matrixWorld.determinant() <= 0) return;
    const geometry = mesh.geometry;
    const attributes = Object.keys(geometry.attributes).sort().map(key => {
      const attribute = geometry.attributes[key];
      return `${key}:${attribute.itemSize}:${attribute.normalized}:${attribute.array.constructor.name}`;
    }).join(',');
    const key = `${mesh.material.uuid}|${mesh.castShadow}|${mesh.receiveShadow}|${mesh.renderOrder}|${mesh.layers.mask}|${Boolean(geometry.index)}|${attributes}`;
    if (!groups.has(key)) groups.set(key, []);
    groups.get(key).push(mesh);
  });
  const retired = new Set();
  for (const meshes of groups.values()) {
    if (meshes.length < 2) continue;
    const copies = meshes.map(mesh => mesh.geometry.clone().applyMatrix4(mesh.matrixWorld));
    const geometry = mergeGeometries(copies, false);
    copies.forEach(copy => copy.dispose());
    if (!geometry) continue;
    const first = meshes[0], combined = new Mesh(geometry, first.material);
    combined.name = 'room-static-batch';
    combined.castShadow = first.castShadow;
    combined.receiveShadow = first.receiveShadow;
    combined.renderOrder = first.renderOrder;
    combined.layers.mask = first.layers.mask;
    meshes.forEach(mesh => { mesh.removeFromParent(); retired.add(mesh.geometry); });
    scene.add(combined);
  }
  // Some details share geometry with an animated object: retain those buffers.
  scene.traverse(mesh => { if (mesh.geometry) retired.delete(mesh.geometry); });
  retired.forEach(geometry => geometry.dispose());
}
