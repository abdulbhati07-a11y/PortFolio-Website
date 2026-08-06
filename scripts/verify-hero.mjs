/**
 * Capture the hero above-the-fold at desktop + mobile, in both themes, and
 * audit that every hero component survived the redesign.
 */
import puppeteer from 'puppeteer';

const URL = process.argv[2] || 'http://localhost:4173/';
const browser = await puppeteer.launch({ args: ['--no-sandbox'] });

const audit = (page) =>
  page.evaluate(() => {
    const inHero = (sel) => Array.from(document.querySelectorAll(`#hero ${sel}`));
    const hasText = (sel, re) => !!inHero(sel).find((e) => re.test(e.textContent));
    return {
      availabilityPill: hasText('span', /Available for work/i),
      kicker: hasText('p', /Designer & Developer/i),
      sectionIndex: hasText('span', /01 — Introduction/i),
      h1: document.querySelector('#hero h1')?.textContent?.trim(),
      tagline: hasText('p', /Building intelligent solutions/i),
      typewriterSR: hasText('.sr-only', /AI\/ML Developer/i),
      contactBtn: hasText('button', /Contact Me/i),
      resumeLink: !!document.querySelector('#hero a[download]'),
      aboutLink: hasText('button', /About Me/i),
      socialLinks: inHero('a[target="_blank"]').length,
      charBody: !!document.querySelector('#hero img[alt*="Developer character"]'),
      charHand: !!document.querySelector('#hero img[src*="greeting-hand"]'),
      speechBubble: hasText('span', /Hi, I am/i),
      featureTiles: inHero('button').filter((e) =>
        /How I work|See projects|My skills/.test(e.textContent)
      ).length,
      statLabels: inHero('span').filter((e) =>
        /Years Experience|Projects Built|Technologies|GitHub Repos/i.test(e.textContent)
      ).length,
      glassTiles: inHero('.glass-card').length,
      horizontalOverflow:
        document.documentElement.scrollWidth > document.documentElement.clientWidth + 1,
    };
  });

const shoot = async (w, h, name, theme) => {
  const page = await browser.newPage();
  await page.evaluateOnNewDocument((t) => localStorage.setItem('theme', t), theme);
  await page.emulateMediaFeatures([{ name: 'prefers-reduced-motion', value: 'reduce' }]);
  await page.setViewport({ width: w, height: h, deviceScaleFactor: 1 });
  await page.goto(URL, { waitUntil: 'networkidle2', timeout: 60000 });
  await page.waitForSelector('#hero img[alt*="Developer character"]', { timeout: 30000 });
  await new Promise((r) => setTimeout(r, 2000));
  await page.screenshot({ path: `scratch-hero-${name}.jpg`, type: 'jpeg', quality: 82 });
  const result = await audit(page);
  console.log(`\n=== ${name} (${w}x${h}) ===`);
  console.log(JSON.stringify(result, null, 2));
  await page.close();
};

await shoot(1440, 950, 'dark-desktop', 'dark');
await shoot(1440, 950, 'light-desktop', 'light');
await shoot(390, 844, 'dark-mobile', 'dark');
await browser.close();
