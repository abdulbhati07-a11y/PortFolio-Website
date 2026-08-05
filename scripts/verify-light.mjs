/**
 * Capture full page + hero in LIGHT mode to verify no invisible/low-contrast
 * text remains. Sets localStorage theme=light before the app boots.
 */
import puppeteer from 'puppeteer';

const URL = process.argv[2] || 'http://localhost:4173/';
const browser = await puppeteer.launch({ args: ['--no-sandbox'] });
const page = await browser.newPage();
await page.emulateMediaFeatures([{ name: 'prefers-reduced-motion', value: 'reduce' }]);
await page.setViewport({ width: 1280, height: 900, deviceScaleFactor: 1 });
await page.evaluateOnNewDocument(() => localStorage.setItem('theme', 'light'));
await page.goto(URL, { waitUntil: 'networkidle2', timeout: 60000 });
await new Promise((r) => setTimeout(r, 2800));

await page.screenshot({ path: 'scratch-light-hero.jpg', type: 'jpeg', quality: 82 });
await page.screenshot({ path: 'scratch-light-full.jpg', type: 'jpeg', quality: 78, fullPage: true });
console.log('shot scratch-light-hero.jpg + scratch-light-full.jpg');
await browser.close();
