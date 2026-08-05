import puppeteer from 'puppeteer';
const b = await puppeteer.launch({ args: ['--no-sandbox'] });
const p = await b.newPage();
await p.emulateMediaFeatures([{ name: 'prefers-reduced-motion', value: 'reduce' }]);
await p.setViewport({ width: 1280, height: 800, deviceScaleFactor: 1 });
await p.goto(process.argv[2], { waitUntil: 'networkidle2' });
await new Promise((r) => setTimeout(r, 2500));
const m = await p.evaluate(() => {
  const cards = document.querySelector('#hero .sm\\:grid-cols-3');
  const grids = document.querySelectorAll('#hero .grid');
  const stats = grids[grids.length - 1];
  const cr = cards?.getBoundingClientRect();
  const sr = stats?.getBoundingClientRect();
  return {
    vh: window.innerHeight,
    cardsTop: cr ? Math.round(cr.top) : null,
    cardsBottom: cr ? Math.round(cr.bottom) : null,
    statsTop: sr ? Math.round(sr.top) : null,
    statsBottom: sr ? Math.round(sr.bottom) : null,
  };
});
console.log(JSON.stringify(m, null, 2));
await b.close();
