import fs from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import sharp from 'sharp';

const root = new URL('../', import.meta.url);
const svg = await fs.readFile(new URL('public/robot-logo.svg', root));
const sizes = [16, 32, 48, 64, 96, 180, 512];
const frames = await Promise.all(sizes.map(async size => [size, await sharp(svg, { density: 384 }).resize(size, size).png().toBuffer()]));
const images = new Map(frames);
const icoSizes = sizes.filter(size => size <= 96);
const header = Buffer.alloc(6 + icoSizes.length * 16);
header.writeUInt16LE(1, 2); header.writeUInt16LE(icoSizes.length, 4);
let offset = header.length;
icoSizes.forEach((size, index) => {
  const entry = 6 + index * 16, png = images.get(size);
  header[entry] = header[entry + 1] = size;
  header.writeUInt16LE(1, entry + 4); header.writeUInt16LE(32, entry + 6);
  header.writeUInt32LE(png.length, entry + 8); header.writeUInt32LE(offset, entry + 12);
  offset += png.length;
});
await Promise.all([
  fs.writeFile(new URL('src/app/favicon.ico', root), Buffer.concat([header, ...icoSizes.map(size => images.get(size))])),
  fs.writeFile(new URL('src/app/icon.png', root), images.get(512)),
  fs.writeFile(new URL('src/app/apple-icon.png', root), images.get(180)),
]);
console.log(`Generated robot favicons in ${fileURLToPath(new URL('src/app/', root))}`);
