/** Diagnose horizontal overflow: find elements wider than the viewport. */
import puppeteer from 'puppeteer';

const URL = process.argv[2] || 'http://localhost:4173/';
const browser = await puppeteer.launch({ args: ['--no-sandbox'] });
const page = await browser.newPage();
await page.emulateMediaFeatures([{ name: 'prefers-reduced-motion', value: 'reduce' }]);
await page.setViewport({ width: 1440, height: 950 });
await page.goto(URL, { waitUntil: 'networkidle2', timeout: 60000 });
await page.waitForSelector('#hero img[alt*="Developer character"]', { timeout: 30000 });
await new Promise((r) => setTimeout(r, 1500));

const info = await page.evaluate(() => {
  const vw = document.documentElement.clientWidth;
  const offenders = [];
  document.querySelectorAll('*').forEach((el) => {
    const r = el.getBoundingClientRect();
    if (r.width > 0 && (r.right > vw + 1 || r.left < -1)) {
      offenders.push({
        tag: el.tagName.toLowerCase(),
        cls: (el.className || '').toString().slice(0, 90),
        left: Math.round(r.left),
        right: Math.round(r.right),
        inHero: !!el.closest('#hero'),
      });
    }
  });
  return {
    viewportWidth: vw,
    scrollWidth: document.documentElement.scrollWidth,
    bodyScrollWidth: document.body.scrollWidth,
    offenders: offenders.slice(0, 25),
    totalOffenders: offenders.length,
  };
});

console.log(JSON.stringify(info, null, 2));
await browser.close();
