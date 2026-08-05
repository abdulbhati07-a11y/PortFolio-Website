// One-off diagnostic for cursor lag + Skills section rendering.
import { chromium } from 'playwright';

const b = await chromium.launch();
const p = await b.newPage({ viewport: { width: 1440, height: 900 } });
const errors = [];
p.on('console', (m) => {
  if (m.type() === 'error' || m.type() === 'warning') errors.push(`${m.type()}: ${m.text().slice(0, 250)}`);
});
p.on('pageerror', (e) => errors.push(`PAGEERROR: ${e.message.slice(0, 400)}`));

await p.goto('http://localhost:4210');
await p.waitForTimeout(4000);
await p.mouse.move(700, 400);
await p.waitForTimeout(500);

const cursorInfo = await p.evaluate(() => {
  const dot = document.querySelector('[class*="z-\\[9999\\]"]');
  if (!dot) return 'dot not found';
  const chain = [];
  let el = dot;
  while (el && el !== document.documentElement) {
    const cs = getComputedStyle(el);
    const creators = [];
    if (cs.transform !== 'none') creators.push('transform:' + cs.transform.slice(0, 40));
    if (cs.willChange && cs.willChange !== 'auto') creators.push('will-change:' + cs.willChange);
    if (cs.filter !== 'none') creators.push('filter');
    if (cs.backdropFilter && cs.backdropFilter !== 'none') creators.push('backdrop-filter');
    if (cs.perspective !== 'none') creators.push('perspective');
    if (cs.contain && cs.contain !== 'none') creators.push('contain:' + cs.contain);
    if (creators.length) chain.push({ tag: el.tagName, cls: String(el.className).slice(0, 70), creators });
    el = el.parentElement;
  }
  return { position: getComputedStyle(dot).position, blockers: chain };
});
console.log('CURSOR:', JSON.stringify(cursorInfo, null, 1));

await p.evaluate(() => document.getElementById('skills')?.scrollIntoView());
await p.waitForTimeout(3500);
const skills = await p.evaluate(() => {
  const s = document.getElementById('skills');
  if (!s) return 'NO #skills';
  const canvas = s.querySelector('canvas');
  const r = s.getBoundingClientRect();
  return {
    rect: { w: Math.round(r.width), h: Math.round(r.height) },
    hasCanvas: !!canvas,
    canvasSize: canvas ? `${canvas.width}x${canvas.height}` : null,
    cardCount: s.querySelectorAll('.glass-card').length,
    textSample: s.textContent.slice(0, 120),
  };
});
console.log('SKILLS:', JSON.stringify(skills, null, 1));
await p.screenshot({ path: 'C:/Users/HP/AppData/Local/Temp/skills-check.png' });
console.log('ERRORS:', JSON.stringify(errors.slice(0, 12), null, 1));
await b.close();
