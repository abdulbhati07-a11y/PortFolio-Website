/**
 * Capture the hero above-the-fold at desktop + mobile to verify the feature
 * cards and stats land in the first view with no top blank space.
 */
import puppeteer from 'puppeteer';

const URL = process.argv[2] || 'http://localhost:4175/';
const browser = await puppeteer.launch({ args: ['--no-sandbox'] });

const shoot = async (w, h, name) => {
  const page = await browser.newPage();
  await page.emulateMediaFeatures([{ name: 'prefers-reduced-motion', value: 'reduce' }]);
  await page.setViewport({ width: w, height: h, deviceScaleFactor: 1 });
  await page.goto(URL, { waitUntil: 'networkidle2', timeout: 60000 });
  await new Promise((r) => setTimeout(r, 2500));
  // Only the viewport (fullPage:false) — this is exactly what loads without scrolling.
  await page.screenshot({ path: `scratch-hero-${name}.jpg`, type: 'jpeg', quality: 82 });
  await page.close();
  console.log(`shot scratch-hero-${name}.jpg (${w}x${h})`);
};

await shoot(1280, 800, 'desktop');
await shoot(390, 844, 'mobile');
await browser.close();
