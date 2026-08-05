/**
 * Screenshot-verify the new TechGraph: dark mode, light mode, and a hover
 * state (Python node → connected tech highlight + glassmorphism tooltip).
 */
import puppeteer from 'puppeteer';

const URL = process.argv[2] || 'http://localhost:4173/';

const shoot = async (theme) => {
  const browser = await puppeteer.launch({ args: ['--no-sandbox'] });
  const page = await browser.newPage();
  await page.emulateMediaFeatures([{ name: 'prefers-reduced-motion', value: 'reduce' }]);
  await page.setViewport({ width: 1280, height: 900, deviceScaleFactor: 1 });
  await page.evaluateOnNewDocument((t) => localStorage.setItem('theme', t), theme);
  await page.goto(URL, { waitUntil: 'networkidle2', timeout: 60000 });
  await new Promise((r) => setTimeout(r, 2500));

  const section = await page.$('#skills');
  await section.scrollIntoView();
  await new Promise((r) => setTimeout(r, 1000));
  await section.screenshot({ path: `scratch-techgraph-${theme}.jpg`, type: 'jpeg', quality: 85 });
  console.log(`shot scratch-techgraph-${theme}.jpg`);

  if (theme === 'dark') {
    // Hover the Python node to capture edge highlight + tooltip
    const btn = await page.$('button[aria-label^="Python"]');
    if (btn) {
      await btn.hover();
      await new Promise((r) => setTimeout(r, 900));
      await section.screenshot({ path: 'scratch-techgraph-hover.jpg', type: 'jpeg', quality: 85 });
      console.log('shot scratch-techgraph-hover.jpg');
    } else {
      console.log('WARN: Python node not found');
    }
  }
  await browser.close();
};

await shoot('dark');
await shoot('light');
