/**
 * Compresses the hero character layers for shipping: downscales from the
 * 1024px master to 800px (they render at ≤500px CSS) and palette-quantizes.
 * Both layers share one canvas size, so they are always resized together to
 * keep the wrist pivot (percentage transform-origin) aligned.
 *
 * Run AFTER split-hand.mjs. Usage: node scripts/optimize-hero.mjs
 */
import sharp from 'sharp';

const SIZE = 800;
for (const name of ['greeting-body', 'greeting-hand']) {
  const path = `public/assets/${name}.png`;
  const buf = await sharp(path)
    .resize(SIZE, SIZE)
    .png({ palette: true, quality: 90, compressionLevel: 9 })
    .toBuffer();
  await sharp(buf).toFile(path);
  console.log(name, '→', (buf.length / 1024).toFixed(0) + 'KB');
}
