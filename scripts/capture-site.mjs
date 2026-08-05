/**
 * Captures a screenshot of a live project site for the portfolio cards.
 *
 * Usage: node scripts/capture-site.mjs <url> <output-name>
 *   e.g. node scripts/capture-site.mjs https://example.com protein-folding
 *
 * Writes public/assets/screenshots/<output-name>.jpg (1280x800, q80) and
 * prints the rendered page title + meta description for card copy.
 */
import puppeteer from 'puppeteer';

const [url, name] = process.argv.slice(2);
if (!url || !name) {
  console.error('usage: node scripts/capture-site.mjs <url> <output-name>');
  process.exit(1);
}

const browser = await puppeteer.launch();
const page = await browser.newPage();
await page.setViewport({ width: 1280, height: 800, deviceScaleFactor: 1.5 });
await page.goto(url, { waitUntil: 'networkidle2', timeout: 60000 });
// Extra settle time for WebGL/3D scenes and entrance animations.
await new Promise((r) => setTimeout(r, 6000));

const info = await page.evaluate(() => ({
  title: document.title,
  description: document.querySelector('meta[name="description"]')?.content ?? '',
  headings: [...document.querySelectorAll('h1, h2')].slice(0, 6).map((h) => h.textContent.trim()),
}));

const out = `public/assets/screenshots/${name}.jpg`;
await page.screenshot({ path: out, type: 'jpeg', quality: 80 });
await browser.close();

console.log(JSON.stringify(info, null, 2));
console.log('saved', out);
