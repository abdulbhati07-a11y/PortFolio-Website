/**
 * Smoke-test the chat assistant against the built site.
 * Opens the FAB, sends a few questions, and screenshots the panel so we can
 * eyeball the UI and confirm answers render with action chips.
 */
import puppeteer from 'puppeteer';

const URL = process.argv[2] || 'http://localhost:4173/';
const browser = await puppeteer.launch({ args: ['--no-sandbox'] });
const page = await browser.newPage();
// Force reduced motion so the loading curtain resolves instantly.
await page.emulateMediaFeatures([{ name: 'prefers-reduced-motion', value: 'reduce' }]);
await page.setViewport({ width: 1280, height: 860, deviceScaleFactor: 1.5 });
await page.goto(URL, { waitUntil: 'networkidle2', timeout: 60000 });
await new Promise((r) => setTimeout(r, 2500));

const log = (m) => console.log(m);

// 1. Launcher present?
const fab = await page.$('button[aria-label^="Open AI assistant"]');
log(fab ? '✓ FAB rendered' : '✗ FAB missing');
await fab.click();
await new Promise((r) => setTimeout(r, 800));

// 2. Intro + starter chips?
const introText = await page.$eval('[role="dialog"]', (el) => el.innerText.slice(0, 120));
log('intro: ' + introText.replace(/\n/g, ' '));

await page.screenshot({ path: 'scratch-assistant-open.jpg', type: 'jpeg', quality: 82 });

// 3. Ask a question via the input.
const ask = async (q, shot) => {
  await page.focus('input[aria-label="Type your question"]');
  await page.$eval('input[aria-label="Type your question"]', (el) => (el.value = ''));
  await page.type('input[aria-label="Type your question"]', q, { delay: 8 });
  await page.keyboard.press('Enter');
  await new Promise((r) => setTimeout(r, 1200));
  const last = await page.$$eval('[role="dialog"] .whitespace-pre-line', (els) =>
    els.length ? els[els.length - 1].innerText.slice(0, 160) : '(none)'
  );
  log(`Q: ${q}\nA: ${last.replace(/\n/g, ' ')}\n`);
  if (shot) await page.screenshot({ path: shot, type: 'jpeg', quality: 82 });
};

await ask('Who is Abdullah?');
await ask('Tell me about the Protein Folding project', 'scratch-assistant-project.jpg');
await ask('How do I contact him?');
await ask('What are his skills?');
await ask('how good is he at python');
await ask('what is the weather today'); // fallback path

await browser.close();
log('done');
