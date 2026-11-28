import test from 'node:test';
import assert from 'node:assert/strict';
import { advanceRoomPitch, ROOM_PITCH_LIMITS, roomOrbitPosition, constrainRoomCamera, ROOM_BOUNDS, CAMERA_MARGIN, roomFieldOfView } from '../src/lib/roomCamera.js';

test('vertical movement slows near limits and reverses without overscroll', () => {
  let pitch = 0;
  const firstStep = advanceRoomPitch(pitch, .03) - pitch;
  for (let i = 0; i < 100; i++) pitch = advanceRoomPitch(pitch, .03);
  assert.ok(pitch <= ROOM_PITCH_LIMITS.max);
  assert.ok(advanceRoomPitch(pitch, .03) - pitch < firstStep / 10);
  assert.ok(advanceRoomPitch(pitch, -.03) < pitch);
  for (let i = 0; i < 200; i++) pitch = advanceRoomPitch(pitch, -.1);
  assert.ok(pitch >= ROOM_PITCH_LIMITS.min);
  assert.ok(advanceRoomPitch(pitch, .03) > pitch);
});

test('all horizontal angles stay inside the room without an extreme lens', () => {
  const focus = [0, 1.65, -.8];
  for (const home of [[5.15, 3.7, 6.6], [4.6, 4.2, 8.4]]) {
    for (let yaw = -Math.PI; yaw <= Math.PI; yaw += .1) {
      for (const pitch of [-100, 0, 100]) {
        const desired = roomOrbitPosition(home, focus, yaw, pitch);
        const actual = constrainRoomCamera(desired, focus);
        actual.forEach((value, axis) => {
          assert.ok(value >= ROOM_BOUNDS.min[axis] + CAMERA_MARGIN - 1e-8);
          assert.ok(value <= ROOM_BOUNDS.max[axis] - CAMERA_MARGIN + 1e-8);
        });
        assert.ok(roomFieldOfView(55, desired, actual, focus) <= 78);
        assert.ok(roomFieldOfView(43, desired, actual, focus) <= 72);
      }
    }
  }
});
