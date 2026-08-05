/**
 * Removes the baked-in navy background from the hero character PNG.
 *
 * Flood-fills from the image borders (never from inside the silhouette, so
 * dark hair that's tonally close to the navy is untouched), then feathers
 * the boundary ring for a smooth cutout. Keeps a one-time .orig backup.
 *
 * Usage: node scripts/remove-bg.mjs
 */
import fs from 'node:fs';
import { PNG } from 'pngjs';
import jpeg from 'jpeg-js';

const SRC = 'scripts/assets/greeting-developer.png';
const BACKUP = 'scripts/assets/greeting-developer.orig.png';
const TOLERANCE = 55; // Euclidean RGB distance treated as "background"

if (!fs.existsSync(BACKUP)) fs.copyFileSync(SRC, BACKUP);

// The source may actually be a JPEG with a .png extension — sniff the magic
// bytes and decode accordingly. Output is always a real PNG with alpha.
let buf = fs.readFileSync(BACKUP);
let png;
if (buf[0] === 0xff && buf[1] === 0xd8) {
  const decoded = jpeg.decode(buf, { useTArray: true, maxMemoryUsageInMB: 1024 });
  png = new PNG({ width: decoded.width, height: decoded.height });
  decoded.data.forEach((v, i) => (png.data[i] = v));
} else {
  // Some exporters append junk after IEND, which pngjs rejects — truncate.
  const iend = buf.indexOf(Buffer.from('IEND'));
  if (iend !== -1) buf = buf.subarray(0, iend + 8);
  png = PNG.sync.read(buf);
}
const { width, height, data } = png;

// Sample the background color from the four corners.
const corner = (x, y) => {
  const i = (y * width + x) * 4;
  return [data[i], data[i + 1], data[i + 2]];
};
const corners = [corner(2, 2), corner(width - 3, 2), corner(2, height - 3), corner(width - 3, height - 3)];
const bg = [0, 1, 2].map((c) => Math.round(corners.reduce((s, k) => s + k[c], 0) / 4));

const dist = (i) => {
  const dr = data[i] - bg[0];
  const dg = data[i + 1] - bg[1];
  const db = data[i + 2] - bg[2];
  return Math.sqrt(dr * dr + dg * dg + db * db);
};

// BFS flood fill from every border pixel.
const isBg = new Uint8Array(width * height);
const queue = [];
for (let x = 0; x < width; x++) queue.push(x, x + (height - 1) * width);
for (let y = 0; y < height; y++) queue.push(y * width, y * width + width - 1);

while (queue.length) {
  const p = queue.pop();
  if (isBg[p]) continue;
  if (dist(p * 4) > TOLERANCE) continue;
  isBg[p] = 1;
  const x = p % width;
  if (x > 0) queue.push(p - 1);
  if (x < width - 1) queue.push(p + 1);
  if (p >= width) queue.push(p - width);
  if (p < width * (height - 1)) queue.push(p + width);
}

// Apply transparency; feather the 1px ring of foreground touching background.
let cleared = 0;
for (let p = 0; p < width * height; p++) {
  const i = p * 4;
  if (isBg[p]) {
    data[i + 3] = 0;
    cleared++;
    continue;
  }
  const x = p % width;
  const y = (p / width) | 0;
  const touchesBg =
    (x > 0 && isBg[p - 1]) || (x < width - 1 && isBg[p + 1]) ||
    (y > 0 && isBg[p - width]) || (y < height - 1 && isBg[p + width]);
  if (touchesBg) {
    // Alpha proportional to how far the pixel is from the bg color: pixels
    // that are half-blended with the navy become semi-transparent.
    const a = Math.min(1, dist(i) / (TOLERANCE * 2.2));
    data[i + 3] = Math.round(a * 255);
  }
}

fs.writeFileSync(SRC, PNG.sync.write(png));
console.log(`bg=[${bg}] cleared ${cleared}/${width * height} px (${((cleared / (width * height)) * 100).toFixed(1)}%)`);
