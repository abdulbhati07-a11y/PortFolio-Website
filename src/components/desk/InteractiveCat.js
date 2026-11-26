import * as THREE from 'three';
import gsap from 'gsap';

export function createInteractiveCat({ host, reduced }) {
  const group = new THREE.Group();
  group.name = 'cat-lounge';
  // The cushion starts just beyond the front-left edge of the desktop.
  group.position.set(-3.1, 0, 1.68);
  const model = new THREE.Group();
  model.name = 'resting-cat'; model.rotation.y = 1.03; group.add(model);
  const coatCanvas = document.createElement('canvas'); coatCanvas.width = coatCanvas.height = 256;
  const coat = coatCanvas.getContext('2d'); coat.fillStyle = '#b9aca0'; coat.fillRect(0, 0, 256, 256);
  let seed = 19;
  const random = () => { seed = seed * 16807 % 2147483647; return (seed - 1) / 2147483646; };
  for (let i = 0; i < 3600; i += 1) {
    coat.strokeStyle = i % 2 ? '#e3d5c01c' : '#786c6015'; coat.lineWidth = .5;
    const x = random() * 256, y = random() * 256;
    coat.beginPath(); coat.moveTo(x, y); coat.lineTo(x + random() * 1.5 - .75, y + 2 + random() * 3); coat.stroke();
  }
  const furTexture = new THREE.CanvasTexture(coatCanvas); furTexture.colorSpace = THREE.SRGBColorSpace;
  const fur = new THREE.MeshStandardMaterial({ color: '#ffffff', map: furTexture, roughness: .94 });
  const cushion = new THREE.MeshStandardMaterial({ color: '#bc8b9a', roughness: .65 });
  const dark = new THREE.MeshStandardMaterial({ color: '#292735', roughness: .7 });
  const noseMaterial = new THREE.MeshStandardMaterial({ color: '#c19d98', roughness: .85 });
  const paleFur = new THREE.MeshStandardMaterial({ color: '#e0d4c5', roughness: .92 });
  const iris = new THREE.MeshStandardMaterial({ color: '#a3b685', roughness: .42 });
  const whiskerMaterial = new THREE.MeshStandardMaterial({ color: '#c4b4a0', roughness: 1, transparent: true, opacity: .8, depthWrite: false });
  const interactiveMeshes = [];
  function mesh(geometry, material, position, parent = model, interactive = true) {
    const object = new THREE.Mesh(geometry, material);
    object.position.set(...position);
    object.castShadow = object.receiveShadow = true;
    parent.add(object);
    if (interactive) { object.userData.action = 'pet-cat'; interactiveMeshes.push(object); }
    return object;
  }
  const ball = (radius, position, material = fur, parent = model) => mesh(new THREE.SphereGeometry(radius, 18, 12), material, position, parent);
  function limb(start, end, radius) {
    const a = new THREE.Vector3(...start), b = new THREE.Vector3(...end), delta = b.clone().sub(a);
    const leg = mesh(new THREE.CylinderGeometry(radius * .85, radius, delta.length(), 10), fur, a.clone().add(b).multiplyScalar(.5).toArray());
    leg.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), delta.normalize());
  }
  function line(points, material, parent = head) {
    const curve = new THREE.CatmullRomCurve3(points.map(point => new THREE.Vector3(...point)));
    const object = new THREE.Line(new THREE.BufferGeometry().setFromPoints(curve.getPoints(12)), material);
    parent.add(object);
    return object;
  }
  function whisker(points) {
    const curve = new THREE.CatmullRomCurve3(points.map(point => new THREE.Vector3(...point)));
    const geometry = new THREE.TubeGeometry(curve, 12, .0016, 3, false), vertices = geometry.attributes.position, point = new THREE.Vector3();
    for (let ring = 0; ring <= 12; ring += 1) {
      const center = curve.getPointAt(ring / 12), taper = 1 - ring / 12 * .85;
      for (let side = 0; side <= 3; side += 1) {
        const index = ring * 4 + side;
        point.fromBufferAttribute(vertices, index).sub(center).multiplyScalar(taper).add(center);
        vertices.setXYZ(index, point.x, point.y, point.z);
      }
    }
    geometry.computeVertexNormals();
    const hair = mesh(geometry, whiskerMaterial, [0, 0, 0], head, false); hair.castShadow = hair.receiveShadow = false;
  }
  const bean = mesh(new THREE.SphereGeometry(.55, 18, 12), cushion, [0, .39, 0], group, false);
  bean.name = 'cat-beanbag'; bean.scale.set(1, .65, .95);
  const body = ball(.22, [0, .80, -.055]); body.scale.set(.95, .70, 1.32);
  const chest = ball(.15, [0, .84, .12]); chest.scale.set(.9, .8, .9);
  const bib = ball(.105, [0, .835, .217], paleFur); bib.scale.set(.8, .95, .35);
  for (const side of [-1, 1]) {
    const thigh = ball(.12, [side * .15, .785, -.21]); thigh.scale.set(.8, .75, 1.1);
    limb([side * .195, .78, -.19], [side * .20, .735, -.035], .044);
    limb([side * .10, .85, .135], [side * .125, .735, .30], .043);
    for (const [x, z] of [[side * .125, .34], [side * .20, -.015]]) {
      const paw = ball(.064, [x, .735, z], paleFur); paw.scale.set(.82, .55, 1.15);
      for (const offset of [-.014, .014]) {
        const toe = ball(.006, [x + offset, .75, z + .056], fur); toe.scale.set(.4, .55, 1.5);
      }
    }
  }
  const tailPath = new THREE.CatmullRomCurve3([[.10, .78, -.23], [.29, .77, -.31], [.35, .75, -.1], [.29, .75, .09], [.22, .75, .14]].map(point => new THREE.Vector3(...point)));
  const tailGeometry = new THREE.TubeGeometry(tailPath, 24, .035, 8, false), tailPositions = tailGeometry.attributes.position;
  const tailPoint = new THREE.Vector3();
  for (let ring = 0; ring <= 24; ring += 1) {
    const center = tailPath.getPointAt(ring / 24), taper = .25 + .75 * Math.sqrt(1 - ring / 24);
    for (let side = 0; side <= 8; side += 1) {
      const index = ring * 9 + side;
      tailPoint.fromBufferAttribute(tailPositions, index).sub(center).multiplyScalar(taper).add(center);
      tailPositions.setXYZ(index, tailPoint.x, tailPoint.y, tailPoint.z);
    }
  }
  tailGeometry.computeVertexNormals(); mesh(tailGeometry, fur, [0, 0, 0]);

  const sleepY = .855, sleepTilt = .22;
  const head = new THREE.Group(); head.name = 'interactive-cat-head'; head.position.set(0, sleepY, .20); head.rotation.x = sleepTilt; model.add(head);
  const skull = mesh(new THREE.SphereGeometry(1, 32, 24), fur, [0, .055, .06], head); skull.scale.set(.148, .135, .136);
  for (const side of [-1, 1]) {
    const ear = new THREE.Group(); ear.position.set(side * .093, .175, .04); ear.rotation.z = -side * .12; head.add(ear);
    const outside = new THREE.Shape(); outside.moveTo(-.05, -.038); outside.quadraticCurveTo(-.048, .018, -.028, .052); outside.quadraticCurveTo(0, .083, .028, .052); outside.quadraticCurveTo(.048, .018, .05, -.038); outside.quadraticCurveTo(0, -.023, -.05, -.038);
    const earGeometry = new THREE.ExtrudeGeometry(outside, { depth: .02, bevelEnabled: true, bevelSize: .009, bevelThickness: .006, bevelSegments: 3, curveSegments: 10 }); earGeometry.translate(0, 0, -.01);
    mesh(earGeometry, fur, [0, 0, 0], ear);
    const inside = new THREE.Shape(); inside.moveTo(-.028, -.02); inside.quadraticCurveTo(-.024, .012, -.016, .033); inside.quadraticCurveTo(0, .05, .016, .033); inside.quadraticCurveTo(.024, .012, .028, -.02); inside.closePath();
    mesh(new THREE.ShapeGeometry(inside), noseMaterial, [0, 0, .018], ear);
    const cheek = ball(.048, [side * .034, .025, .169], paleFur, head); cheek.scale.set(1, .65, .55);
    for (const offset of [-.025, 0, .027]) whisker([[side * .045, .025 + offset * .35, .202], [side * .095, .032 + offset * .7, .21], [side * .15, .03 + offset * 1.1, .206], [side * (offset === 0 ? .205 : .19), .024 + offset * 1.5, .19]]);
  }
  const chin = ball(.045, [0, -.003, .162], paleFur, head); chin.scale.set(1.2, .55, .6);
  const eyes = [-.061, .061].map(x => {
    const eye = new THREE.Group(); eye.position.set(x, .078, .184); eye.scale.y = .05; eye.visible = false; head.add(eye);
    const rim = ball(.026, [0, 0, 0], dark, eye); rim.scale.set(1, .72, .18);
    const color = ball(.023, [0, 0, .006], iris, eye); color.scale.set(.92, .66, .18);
    const pupil = ball(.011, [0, 0, .01], dark, eye); pupil.scale.set(.78, 1.1, .15);
    ball(.0035, [-.005, .005, .012], paleFur, eye);
    return eye;
  });
  const eyelidMaterial = new THREE.LineBasicMaterial({ color: '#61534c' });
  const sleepingEyes = [-.061, .061].map(x => {
    const points = [[x - .023, .079], [x, .072], [x + .023, .079]].map(([px, py]) => [px, py, .06 + .136 * Math.sqrt(Math.max(0, 1 - (px / .148) ** 2 - ((py - .055) / .135) ** 2)) + .003]);
    return line(points, eyelidMaterial);
  });
  const nose = new THREE.Shape(); nose.moveTo(-.016, .007); nose.quadraticCurveTo(0, .014, .016, .007); nose.quadraticCurveTo(.014, -.003, 0, -.012); nose.quadraticCurveTo(-.014, -.003, -.016, .007);
  const noseGeometry = new THREE.ShapeGeometry(nose);
  mesh(noseGeometry, new THREE.MeshStandardMaterial({ color: '#b88790', roughness: .8, side: THREE.DoubleSide }), [0, .029, .205], head);
  const mouthMaterial = new THREE.LineBasicMaterial({ color: '#615058' });
  line([[0, .012, .20], [0, -.002, .20], [-.023, -.01, .195]], mouthMaterial);
  line([[0, -.002, .20], [.012, -.012, .198], [.025, -.008, .195]], mouthMaterial);
  const stripeMaterial = new THREE.LineBasicMaterial({ color: '#877366', transparent: true, opacity: .5 });
  for (const x of [-.034, 0, .034]) {
    const points = [[x * .7, .15], [x, .131], [x * 1.05, .114]].map(([px, py]) => [px, py, .06 + .136 * Math.sqrt(Math.max(0, 1 - (px / .148) ** 2 - ((py - .055) / .135) ** 2)) + .002]);
    line(points, stripeMaterial);
  }

  const announcement = document.createElement('span');
  announcement.className = 'cat-pet-announcement';
  announcement.setAttribute('role', 'status');
  announcement.setAttribute('aria-label', 'Cat reaction');
  announcement.setAttribute('aria-live', 'polite');
  host.appendChild(announcement);
  const bubbles = [], projected = new THREE.Vector3();
  const anchor = new THREE.Vector3(0, .98, .27).applyAxisAngle(new THREE.Vector3(0, 1, 0), model.rotation.y).add(group.position);
  let reaction, count = 0, awake = false, lookUntil = 0, lastUpdate = performance.now();
  host.dataset.catAwake = 'false';

  function pet() {
    count += 1;
    host.dataset.catPets = String(count);
    host.dataset.catAwake = 'true';
    awake = true; lookUntil = performance.now() + 850;
    eyes.forEach(eye => { eye.visible = true; }); sleepingEyes.forEach(lid => { lid.visible = false; });
    announcement.textContent = count % 2 ? 'Meow! The cat lifts her head.' : 'The cat looks up: meow!';
    reaction?.kill();
    const duration = reduced ? 0 : .24;
    reaction = gsap.timeline({ onComplete: () => {
      awake = false; host.dataset.catAwake = 'false';
      eyes.forEach(eye => { eye.visible = false; }); sleepingEyes.forEach(lid => { lid.visible = true; });
      announcement.textContent = 'The cat settles down and falls asleep again.';
    } })
      .to(head.position, { y: .99, duration, ease: 'power2.out' }, 0)
      .to(head.rotation, { x: -.12, duration, ease: 'power2.out' }, 0)
      .to(eyes.map(eye => eye.scale), { y: 1, duration }, 0)
      .to(head.position, { y: sleepY, duration: reduced ? 0 : .65, ease: 'sine.inOut' }, .85)
      .to(head.rotation, { x: sleepTilt, y: 0, duration: reduced ? 0 : .65, ease: 'sine.inOut' }, .85)
      .to(eyes.map(eye => eye.scale), { y: .05, duration: reduced ? 0 : .45 }, .95);

    // Every click gets its own word; cap the tiny transient DOM pool on rapid taps.
    if (bubbles.length >= 8) bubbles.shift().element.remove();
    const element = document.createElement('span');
    element.className = 'cat-meow'; element.textContent = 'meow';
    element.setAttribute('aria-hidden', 'true');
    host.appendChild(element);
    bubbles.push({ element, born: performance.now(), side: ((count - 1) % 3 - 1) * .08 });
  }

  function update(camera, visible) {
    const now = performance.now(), width = host.clientWidth, height = host.clientHeight;
    const dt = Math.min((now - lastUpdate) / 1000, .05); lastUpdate = now;
    if (visible) {
      if (!reduced) body.scale.y = .70 + Math.sin(now * .0017) * .008;
      if (awake && now < lookUntil) {
        const bearing = Math.atan2(camera.position.x - group.position.x, camera.position.z - group.position.z) - model.rotation.y;
        const gaze = THREE.MathUtils.clamp(THREE.MathUtils.euclideanModulo(bearing + Math.PI, Math.PI * 2) - Math.PI, -.55, .55);
        head.rotation.y += (gaze - head.rotation.y) * (reduced ? 1 : 1 - Math.exp(-dt * 7));
      }
    }
    for (let i = bubbles.length - 1; i >= 0; i -= 1) {
      const bubble = bubbles[i], progress = (now - bubble.born) / 1700;
      if (progress >= 1) { bubble.element.remove(); bubbles.splice(i, 1); continue; }
      projected.set(anchor.x + bubble.side, 1.38 + (reduced ? 0 : progress * .75), anchor.z).project(camera);
      bubble.element.hidden = !visible || projected.z > 1 || Math.abs(projected.x) > 1 || Math.abs(projected.y) > 1;
      bubble.element.style.transform = `translate3d(${(projected.x * .5 + .5) * width}px,${(-projected.y * .5 + .5) * height}px,0) translate(-50%,-50%)`;
      bubble.element.style.opacity = String(Math.min(progress / .1, 1, (1 - progress) / .4));
    }
  }
  function dispose() {
    reaction?.kill();
    furTexture.dispose();
    bubbles.forEach(bubble => bubble.element.remove());
    announcement.remove();
    host.removeAttribute('data-cat-pets'); host.removeAttribute('data-cat-awake');
  }
  return { group, interactiveMeshes, pet, update, dispose, anchor: anchor.toArray() };
}
