/** Capture the live Birthday Wishing Web for its project card. */
import puppeteer from 'puppeteer';

const URL = 'https://happy-birthday-interactive-web.vercel.app/';
const browser = await puppeteer.launch({ args: ['--no-sandbox'] });
const page = await browser.newPage();
await page.setViewport({ width: 1600, height: 1000, deviceScaleFactor: 1.2 });
await page.goto(URL, { waitUntil: 'networkidle2', timeout: 60000 });
await new Promise((r) => setTimeout(r, 3000));

// Open the surprise to reach the celebration scene
const clicked = await page.evaluate(() => {
  const el = Array.from(document.querySelectorAll('button, a, div, span'))
    .find((e) => /open your surprise/i.test(e.textContent) && e.textContent.length < 60);
  if (el) { el.click(); return true; }
  return false;
});
console.log('clicked surprise:', clicked);
// Let the reveal animation + confetti reach a lively frame
await new Promise((r) => setTimeout(r, 6000));
await page.screenshot({
  path: 'public/assets/screenshots/birthday.jpg',
  type: 'jpeg',
  quality: 85,
});
console.log('saved public/assets/screenshots/birthday.jpg');
console.log('title:', await page.title());
await browser.close();
