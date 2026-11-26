import { Vector3 } from 'three';

// Follow the smoothed camera, not raw pointer events. Two damped stages keep
// direction changes soft, while bounded angular speed prevents fast-drag snaps.
export function createRobotGaze(head) {
  const origin = new Vector3();
  let enabled = false, referenceYaw = 0, referencePitch = 0, aimYaw = 0, aimPitch = 0;
  const sample = { yaw: 0, pitch: 0 };
  function measure(camera) {
    head.getWorldPosition(origin);
    const dx = camera.position.x - origin.x, dz = camera.position.z - origin.z;
    sample.yaw = Math.atan2(dx, dz);
    sample.pitch = Math.atan2(camera.position.y - origin.y, Math.hypot(dx, dz));
  }
  function begin(camera) {
    if (enabled) return;
    measure(camera); referenceYaw = sample.yaw; referencePitch = sample.pitch; enabled = true;
  }
  function update(camera, elapsed, allowed = true, reduced = false) {
    const dt = Math.min(Math.max(elapsed, 0), .05);
    let yaw = 0, pitch = 0;
    if (enabled && allowed && !reduced) {
      measure(camera);
      // Sine remains continuous even when the camera circles behind the robot.
      yaw = Math.sin(sample.yaw - referenceYaw) * .60;
      pitch = Math.max(-.24, Math.min(.24, -(sample.pitch - referencePitch) * .65));
    }
    const aimBlend = 1 - Math.exp(-dt * 8), headBlend = 1 - Math.exp(-dt * 7);
    aimYaw += (yaw - aimYaw) * aimBlend; aimPitch += (pitch - aimPitch) * aimBlend;
    const turn = (value, target, speed) => value + Math.max(-speed * dt, Math.min(speed * dt, (target - value) * headBlend));
    head.rotation.y = turn(head.rotation.y, aimYaw, .95);
    head.rotation.x = turn(head.rotation.x, aimPitch, .65);
    head.rotation.z += (-head.rotation.y * .07 - head.rotation.z) * headBlend;
  }
  return { begin, update, reset: () => { enabled = false; } };
}
