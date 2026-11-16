import { chromium } from '@playwright/test';

const browser = await chromium.launch({ channel: 'msedge', headless: true });
const results = {};
for (const path of ['/flat', '/']) {
  const page = await browser.newPage({ viewport: { width: 1365, height: 768 }, deviceScaleFactor: 1 });
  await page.addInitScript(() => {
    window.__labMetrics = { lcp: 0, cls: 0 };
    try {
      new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) window.__labMetrics.lcp = entry.startTime;
      }).observe({ type: 'largest-contentful-paint', buffered: true });
      new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
          if (!entry.hadRecentInput) window.__labMetrics.cls += entry.value;
        }
      }).observe({ type: 'layout-shift', buffered: true });
    } catch { /* Unsupported observer types remain unmeasured. */ }
  });
  const started = Date.now();
  await page.goto('http://localhost:3001' + path, { waitUntil: 'domcontentloaded' });
  if (path === '/') {
    await page.getByRole('button', { name: 'Enter without sound' }).click();
    await page.locator('canvas').waitFor({ timeout: 15000 });
    await page.waitForTimeout(1000);
  } else {
    await page.waitForTimeout(1500);
  }
  const timing = await page.evaluate(() => {
    const nav = performance.getEntriesByType('navigation')[0];
    const paint = performance.getEntriesByType('paint').find((entry) => entry.name === 'first-contentful-paint');
    return { responseEndMs: Math.round(nav?.responseEnd || 0), fcpMs: Math.round(paint?.startTime || 0), lcpMs: Math.round(window.__labMetrics.lcp), cls: Number(window.__labMetrics.cls.toFixed(3)) };
  });
  const fps = path === '/' ? await page.evaluate(async () => {
    const start = performance.now();
    let frames = 0;
    while (performance.now() - start < 2000) {
      await new Promise(requestAnimationFrame);
      frames += 1;
    }
    return Math.round(frames / ((performance.now() - start) / 1000));
  }) : null;
  results[path] = { ...timing, fps, elapsedWallMs: Date.now() - started };
  await page.close();
}
await browser.close();
console.log(JSON.stringify(results, null, 2));
