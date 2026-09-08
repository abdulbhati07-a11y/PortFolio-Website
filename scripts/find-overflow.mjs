import puppeteer from 'puppeteer';

const URL = process.argv[2] || 'http://localhost:4173/';
const width = Number(process.argv[3] || 390);
const height = Number(process.argv[4] || 844);

const browser = await puppeteer.launch({ headless: 'new', args: ['--no-sandbox'] });
const page = await browser.newPage();
await page.setViewport({ width, height, deviceScaleFactor: 1 });
await page.goto(URL, { waitUntil: 'networkidle0' });
await new Promise((r) => setTimeout(r, 1800));

const data = await page.evaluate(() => {
  const de = document.documentElement;
  const vw = window.innerWidth;
  const rows = [];
  document.querySelectorAll('*').forEach((el) => {
    const r = el.getBoundingClientRect();
    if (r.width === 0 && r.height === 0) return;
    // Ignore SVG internals — they're clipped by their svg viewport.
    if (['rect', 'path', 'circle', 'g', 'svg', 'pattern', 'filter', 'stop', 'lineargradient', 'fegaussianblur', 'femerge', 'femergenode'].includes(el.tagName.toLowerCase())) return;
    // Real leak candidates: right edge just past the viewport.
    if (r.right > vw + 0.5 && r.right < vw + 200) {
      rows.push({
        right: Math.round(r.right),
        left: Math.round(r.left),
        w: Math.round(r.width),
        tag: el.tagName.toLowerCase(),
        id: el.id || '',
        cls: (typeof el.className === 'string' ? el.className : el.className.baseVal || '').slice(0, 70),
      });
    }
  });
  rows.sort((a, b) => b.right - a.right);
  return { vw, scrollWidth: de.scrollWidth, count: rows.length, items: rows.slice(0, 20) };
});

console.log(`vw=${data.vw} scrollWidth=${data.scrollWidth} leakCandidates=${data.count}`);
for (const o of data.items) {
  console.log(`  R=${o.right} L=${o.left} W=${o.w}  <${o.tag}${o.id ? '#' + o.id : ''}> .${o.cls}`);
}
await browser.close();
