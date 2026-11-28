// Interior faces of the existing room. The inset clears the near plane and
// the window frames and shelves mounted just in front of the walls.
export const ROOM_BOUNDS = Object.freeze({
  min: Object.freeze([-4.54, 0, -3.34]),
  max: Object.freeze([5, 5, 4.6]),
});
export const CAMERA_MARGIN = .6;
export const ROOM_PITCH_LIMITS = Object.freeze({ min: -.24, max: .34 });

// Resist movement toward the nearest edge, without storing overscroll or
// making the reverse movement stick at that edge.
export function advanceRoomPitch(pitch, delta) {
  const { min, max } = ROOM_PITCH_LIMITS;
  const current = Math.max(min, Math.min(max, pitch));
  const distance = delta > 0 ? max - current : current - min;
  const step = Math.min(Math.abs(delta), distance * -Math.expm1(-Math.abs(delta) / ((max - min) / 2)));
  return current + Math.sign(delta) * step;
}

// Shorten an orbit ray instead of clamping its axes independently, so the
// camera keeps its viewing angle when it reaches a wall, floor, or ceiling.
export function constrainRoomCamera(position, focus) {
  let scale = 1;
  for (let axis = 0; axis < 3; axis++) {
    const delta = position[axis] - focus[axis];
    if (delta > 0) scale = Math.min(scale, (ROOM_BOUNDS.max[axis] - CAMERA_MARGIN - focus[axis]) / delta);
    else if (delta < 0) scale = Math.min(scale, (ROOM_BOUNDS.min[axis] + CAMERA_MARGIN - focus[axis]) / delta);
  }
  if (scale === 1) return [...position];
  return position.map((value, axis) => focus[axis] + (value - focus[axis]) * scale);
}

export function roomOrbitPosition(home, focus, yaw, pitch) {
  const offset = home.map((value, axis) => value - focus[axis]);
  const radius = Math.hypot(...offset);
  const theta = Math.atan2(offset[0], offset[2]) + yaw;
  const phi = Math.acos(offset[1] / radius) + Math.max(ROOM_PITCH_LIMITS.min, Math.min(ROOM_PITCH_LIMITS.max, pitch));
  return [
    focus[0] + radius * Math.sin(phi) * Math.sin(theta),
    focus[1] + radius * Math.cos(phi),
    focus[2] + radius * Math.sin(phi) * Math.cos(theta),
  ];
}

// Preserve the opening composition as far as possible after moving indoors.
export function roomFieldOfView(baseFov, desired, actual, focus) {
  const distance = point => Math.hypot(...point.map((value, axis) => value - focus[axis]));
  const fitted = 2 * Math.atan(Math.tan(baseFov * Math.PI / 360) * distance(desired) / distance(actual)) * 180 / Math.PI;
  return Math.min(baseFov >= 50 ? 78 : 72, fitted);
}
