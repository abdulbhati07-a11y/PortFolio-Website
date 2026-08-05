import puppeteer from 'puppeteer';
const b = await puppeteer.launch({ args: ['--no-sandbox'] });
const p = await b.newPage();
await p.emulateMediaFeatures([{ name: 'prefers-reduced-motion', value: 'reduce' }]);
await p.setViewport({ width: 1440, height: 900, deviceScaleFactor: 1 });
// Set light theme before app boots.
await p.evaluateOnNewDocument(() => localStorage.setItem('theme', 'light'));
await p.goto(process.argv[2], { waitUntil: 'networkidle2', timeout: 60000 });
await new Promise(r => setTimeout(r, 2500));

const shots = [
  { sel: '#hero', name: 'hero' },
  { sel: '#about', name: 'about' },
  { sel: '#skills', name: 'skills' },
  { sel: '#projects', name: 'projects' },
  { sel: '#journey', name: 'journey' },
  { sel: '#certifications', name: 'certs' },
  { sel: '#contact', name: 'contact' },
];
for (const s of shots) {
  const el = await p.$(s.sel);
  if (!el) { console.log(`skip ${s.name}`); continue; }
  await el.scrollIntoView();
  await new Promise(r => setTimeout(r, 700));
  await el.screenshot({ path: `scratch-light-${s.name}.jpg`, type: 'jpeg', quality: 82 });
  console.log(`shot scratch-light-${s.name}.jpg`);
}
// Open the chat assistant in light mode too.
const fab = await p.$('button[aria-label^="Open AI assistant"]');
if (fab) { await fab.click(); await new Promise(r => setTimeout(r, 900)); await p.screenshot({ path: 'scratch-light-chat.jpg', type: 'jpeg', quality: 82 }); console.log('shot scratch-light-chat.jpg'); }
await b.close();
