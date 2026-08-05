// One-off: downscale heavy PNGs to web-friendly JPEGs via headless Chromium.
// Usage: node scripts/shrink-images.mjs
import { chromium } from 'playwright';
import { readFileSync, writeFileSync } from 'node:fs';

const JOBS = [
  { src: 'public/assets/certificates/cert-data-science.png', out: 'public/assets/certificates/cert-data-science.jpg', width: 800 },
  { src: 'public/assets/certificates/cert-python.png', out: 'public/assets/certificates/cert-python.jpg', width: 800 },
  { src: 'public/assets/screenshots/laundry.png', out: 'public/assets/screenshots/laundry.jpg', width: 960 },
];

const browser = await chromium.launch();
const page = await browser.newPage();

for (const { src, out, width } of JOBS) {
  const base64 = readFileSync(src).toString('base64');
  const dataUrl = await page.evaluate(
    async ({ b64, targetWidth }) => {
      const img = new Image();
      img.src = `data:image/png;base64,${b64}`;
      await img.decode();
      const scale = targetWidth / img.width;
      const canvas = document.createElement('canvas');
      canvas.width = targetWidth;
      canvas.height = Math.round(img.height * scale);
      canvas.getContext('2d').drawImage(img, 0, 0, canvas.width, canvas.height);
      return canvas.toDataURL('image/jpeg', 0.82);
    },
    { b64: base64, targetWidth: width }
  );
  writeFileSync(out, Buffer.from(dataUrl.split(',')[1], 'base64'));
  console.log('wrote', out);
}

await browser.close();
