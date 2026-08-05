/**
 * Splits the hero character's raised hand + forearm into its own layer so the
 * hand can be rotated (waved) independently of the body.
 *
 * Input:  scripts/assets/greeting-developer.png (transparent, from remove-bg.mjs)
 * Output: public/assets/greeting-body.png  — character with the hand erased
 *         public/assets/greeting-hand.png  — just the hand, same canvas size
 *                                            (so the two layers self-align)
 *
 * The cut has an overlap band: the body keeps pixels below CUT_Y, while the
 * hand layer keeps pixels down to CUT_Y + FEATHER with a fade-out, so small
 * rotations around the wrist never reveal a gap at the seam.
 *
 * Usage: node scripts/split-hand.mjs
 */
import fs from 'node:fs';
import { PNG } from 'pngjs';

const SRC = 'scripts/assets/greeting-developer.png';

// Hand bounding box + wrist cut line (measured on the 1024x1024 source).
const BOX = { x0: 245, x1: 395, y0: 195 };
const CUT_Y = 336;   // body keeps everything from here down
const FEATHER = 20;  // hand layer fades out across this band below CUT_Y

const src = PNG.sync.read(fs.readFileSync(SRC));
const { width, height } = src;

const body = new PNG({ width, height });
const hand = new PNG({ width, height });
src.data.copy(body.data);

for (let y = 0; y < height; y++) {
  for (let x = 0; x < width; x++) {
    const i = (y * width + x) * 4;
    const inBox = x >= BOX.x0 && x <= BOX.x1 && y >= BOX.y0 && y <= CUT_Y + FEATHER;
    if (!inBox || src.data[i + 3] === 0) continue;

    // Hand layer: full alpha above the cut, fading to 0 across the feather band.
    const fade = y <= CUT_Y ? 1 : 1 - (y - CUT_Y) / FEATHER;
    hand.data[i] = src.data[i];
    hand.data[i + 1] = src.data[i + 1];
    hand.data[i + 2] = src.data[i + 2];
    hand.data[i + 3] = Math.round(src.data[i + 3] * fade);

    // Body: erase only above the cut line (keeps the sleeve/overlap intact).
    if (y < CUT_Y) body.data[i + 3] = 0;
  }
}

fs.writeFileSync('public/assets/greeting-body.png', PNG.sync.write(body));
fs.writeFileSync('public/assets/greeting-hand.png', PNG.sync.write(hand));

// Debug composites (transparent → dark navy) for quick visual inspection.
for (const [name, img] of [['body', body], ['hand', hand]]) {
  const dbg = new PNG({ width, height });
  for (let i = 0; i < img.data.length; i += 4) {
    const a = img.data[i + 3] / 255;
    dbg.data[i] = Math.round(img.data[i] * a + 20 * (1 - a));
    dbg.data[i + 1] = Math.round(img.data[i + 1] * a + 30 * (1 - a));
    dbg.data[i + 2] = Math.round(img.data[i + 2] * a + 55 * (1 - a));
    dbg.data[i + 3] = 255;
  }
  fs.writeFileSync(`public/assets/_debug-${name}.png`, PNG.sync.write(dbg));
}
console.log('wrote greeting-body.png, greeting-hand.png (+ debug composites)');
