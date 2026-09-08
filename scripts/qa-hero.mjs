import puppeteer from 'puppeteer';
import fs from 'fs';

const URL = process.argv[2] || 'http://localhost:4173/';
const OUT = 'C:/Users/HP/Desktop/Portfolio/scripts/qa-shots';
fs.mkdirSync(OUT, { recursive: true });

const VIEWPORTS = [
  { name: '1366x768', width: 1366, height: 768 },
  { name: '1440x900', width: 1440, height: 900 },
  { name: '1920x1080', width: 1920, height: 1080 },
  { name: 'tablet-820x1180', width: 820, height: 1180 },
  { name: 'mobile-390x844', width: 390, height: 844 },
];

const browser = await puppeteer.launch({ headless: 'new', args: ['--no-sandbox'] });

let allPass = true;
for (const vp of VIEWPORTS) {
  const page = await browser.newPage();
  await page.setViewport({ width: vp.width, height: vp.height, deviceScaleFactor: 1 });
  await page.goto(URL, { waitUntil: 'networkidle0' });
  await page.waitForSelector('#hero', { timeout: 10000 });
  // let entrance animations settle
  await new Promise((r) => setTimeout(r, 1400));

  const metrics = await page.evaluate(() => {
    const de = document.documentElement;
    const hero = document.getElementById('hero');
    const heroRect = hero.getBoundingClientRect();
    const grid = hero.querySelector('.grid');
    const tiles = grid ? [...grid.children] : [];
    const vw = window.innerWidth;

    // Any tile whose box escapes the viewport horizontally?
    const escaping = tiles
      .map((t, i) => {
        const r = t.getBoundingClientRect();
        return { i, left: Math.round(r.left), right: Math.round(r.right), overRight: r.right > vw + 0.5, overLeft: r.left < -0.5 };
      })
      .filter((t) => t.overRight || t.overLeft);

    return {
      innerWidth: vw,
      innerHeight: window.innerHeight,
      docScrollWidth: de.scrollWidth,
      docClientWidth: de.clientWidth,
      bodyScrollWidth: document.body.scrollWidth,
      horizontalOverflow: de.scrollWidth > de.clientWidth,
      heroTop: Math.round(heroRect.top),
      heroLeft: Math.round(heroRect.left),
      heroWidth: Math.round(heroRect.width),
      heroHeight: Math.round(heroRect.height),
      tileCount: tiles.length,
      escaping,
    };
  });

  const ok = !metrics.horizontalOverflow && metrics.escaping.length === 0;
  if (!ok) allPass = false;

  await page.screenshot({ path: `${OUT}/hero-${vp.name}.png` });

  console.log(`\n── ${vp.name} ${ok ? '✅ PASS' : '❌ FAIL'}`);
  console.log(`   viewport   : ${metrics.innerWidth}×${metrics.innerHeight}`);
  console.log(`   doc scroll : scrollW=${metrics.docScrollWidth} clientW=${metrics.docClientWidth}  hOverflow=${metrics.horizontalOverflow}`);
  console.log(`   hero box   : top=${metrics.heroTop} left=${metrics.heroLeft} ${metrics.heroWidth}×${metrics.heroHeight}  (tiles=${metrics.tileCount})`);
  if (metrics.escaping.length) {
    console.log(`   escaping   :`, JSON.stringify(metrics.escaping));
  }
  await page.close();
}

await browser.close();
console.log(`\n${allPass ? '✅ ALL BREAKPOINTS PASS — zero horizontal overflow' : '❌ SOME BREAKPOINTS FAILED'}`);
console.log(`Screenshots → ${OUT}`);
process.exit(allPass ? 0 : 1);
