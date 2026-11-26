import test from 'node:test';
import assert from 'node:assert/strict';
import { Group, PerspectiveCamera } from 'three';
import { createRobotGaze } from '../src/lib/robotGaze.js';

function setup() {
  const head = new Group(), camera = new PerspectiveCamera();
  camera.position.set(0, 2, 5);
  return { head, camera, gaze: createRobotGaze(head) };
}
function advance(gaze, camera, seconds, fps = 60) {
  for (let frame = 0; frame < seconds * fps; frame++) gaze.update(camera, 1 / fps);
}
test('tracking starts gently and stays within a natural neck range on fast drags', () => {
  const { head, camera, gaze } = setup();
  advance(gaze, camera, 1); assert.equal(head.rotation.y, 0);
  gaze.begin(camera); camera.position.set(5, 5, 0);
  gaze.update(camera, 1 / 60);
  assert.ok(head.rotation.y > 0 && head.rotation.y < .02);
  let previous = head.rotation.y;
  for (let frame = 0; frame < 180; frame++) {
    if (frame === 60) camera.position.set(-5, -3, -.01);
    gaze.update(camera, 1 / 60);
    assert.ok(Math.abs(head.rotation.y - previous) <= .95 / 60 + 1e-9);
    assert.ok(Math.abs(head.rotation.y) <= .60 && Math.abs(head.rotation.x) <= .24);
    previous = head.rotation.y;
  }
});
test('damping behaves consistently at 60 and 120 frames per second', () => {
  const atRate = fps => {
    const { head, camera, gaze } = setup(); gaze.begin(camera); camera.position.set(4, 4, 2);
    advance(gaze, camera, 1, fps); return [head.rotation.x, head.rotation.y];
  };
  const a = atRate(60), b = atRate(120);
  a.forEach((angle, index) => assert.ok(Math.abs(angle - b[index]) < .005));
});
test('navigation resets the head smoothly and reduced motion keeps it neutral', () => {
  const { head, camera, gaze } = setup(); gaze.begin(camera); camera.position.set(4, 3, 1);
  advance(gaze, camera, 1); const turned = head.rotation.y; assert.ok(turned > .1);
  gaze.reset(); assert.equal(head.rotation.y, turned);
  advance(gaze, camera, 3); assert.ok(Math.abs(head.rotation.y) < .001);
  gaze.begin(camera); camera.position.set(-4, 3, 1);
  for (let i = 0; i < 120; i++) gaze.update(camera, 1 / 60, true, true);
  assert.ok(Math.abs(head.rotation.y) < .001);
});
