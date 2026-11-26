import * as THREE from 'three';

export function createRobotMechanics({ add, box, round, cylinder, material, glowing }) {
  const alloy = material('#7b8796', { metalness: .72, roughness: .38 });
  const graphite = material('#202938', { metalness: .5, roughness: .55 });
  const brushed = material('#485569', { metalness: .65, roughness: .4 });
  const core = glowing('#83c6ce', .55, 'accents');
  const shapes = new Map();

  function bolts(parent, radius, depth, count, size) {
    const geometry = new THREE.CylinderGeometry(size, size, .008, 6);
    const batch = new THREE.InstancedMesh(geometry, alloy, count);
    const matrix = new THREE.Matrix4(), position = new THREE.Vector3(), scale = new THREE.Vector3(1, 1, 1);
    const rotation = new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(1, 0, 0), Math.PI / 2);
    for (let i = 0; i < count; i++) {
      const angle = i / count * Math.PI * 2 + Math.PI / 4;
      position.set(Math.cos(angle) * radius, Math.sin(angle) * radius, depth);
      batch.setMatrixAt(i, matrix.compose(position, rotation, scale));
    }
    batch.instanceMatrix.needsUpdate = true; batch.computeBoundingSphere(); parent.add(batch);
  }

  function gearGeometry(radius) {
    if (shapes.has(radius)) return shapes.get(radius);
    const outline = new THREE.Shape(), teeth = 12;
    for (let step = 0; step < teeth * 4; step++) {
      const angle = step / (teeth * 4) * Math.PI * 2;
      const r = radius * (step % 4 === 1 || step % 4 === 2 ? 1 : .82);
      const x = Math.cos(angle) * r, y = Math.sin(angle) * r;
      if (step === 0) outline.moveTo(x, y); else outline.lineTo(x, y);
    }
    outline.closePath();
    const hole = new THREE.Path(); hole.absarc(0, 0, radius * .4, 0, Math.PI * 2, true); outline.holes.push(hole);
    const geometry = new THREE.ExtrudeGeometry(outline, { depth: .025, bevelEnabled: true, bevelSize: .003, bevelThickness: .003, bevelSegments: 2, curveSegments: 12 });
    geometry.translate(0, 0, -.0125); shapes.set(radius, geometry); return geometry;
  }

  function joint(position, side, radius, parent) {
    const group = new THREE.Group(); group.name = 'robot-cog-joint'; group.position.set(...position); group.rotation.y = side * Math.PI / 2; parent.add(group);
    add(gearGeometry(radius), alloy, [0, 0, 0], group);
    const hub = cylinder(radius * .43, .034, [0, 0, .008], graphite, group); hub.rotation.x = Math.PI / 2;
    const cap = cylinder(radius * .21, .041, [0, 0, .012], brushed, group); cap.rotation.x = Math.PI / 2;
    bolts(group, radius * .60, .02, 4, radius * .075);
    return group;
  }

  function torso(parent) {
    const panel = new THREE.Group(); panel.name = 'robot-futuristic-core'; panel.position.y = .08; parent.add(panel);
    round(.46, .55, .025, .06, [0, 1.82, .24], brushed, panel);
    round(.39, .47, .012, .045, [0, 1.82, .265], graphite, panel);
    add(new THREE.TorusGeometry(.104, .012, 8, 36), alloy, [0, 1.89, .314], panel);
    const disc = cylinder(.088, .012, [0, 1.89, .319], graphite, panel); disc.rotation.x = Math.PI / 2;
    const hexagon = add(new THREE.CylinderGeometry(.055, .055, .012, 6), core, [0, 1.89, .332], panel); hexagon.rotation.x = Math.PI / 2;
    for (const x of [-.072, -.024, .024, .072]) box([.023, .006, .009], [x, 1.75, .308], core, panel).castShadow = false;
    for (const y of [1.65, 1.685]) box([.21, .013, .01], [0, y, .307], alloy, panel);
    for (const x of [-.17, .17]) box([.008, .21, .008], [x, 1.88, .305], core, panel).castShadow = false;
    const fasteners = new THREE.Group(); fasteners.position.set(0, 1.82, .30); panel.add(fasteners);
    bolts(fasteners, .235, .01, 4, .01);
  }
  return { joint, torso };
}
