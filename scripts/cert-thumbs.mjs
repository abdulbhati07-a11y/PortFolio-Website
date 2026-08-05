// One-off: render page 1 of each certificate PDF to a PNG thumbnail.
// Usage: node scripts/cert-thumbs.mjs
import { chromium } from 'playwright';
import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import { resolve, basename } from 'node:path';

const PDFS = [
  'public/The_Ultimate_Job_Ready_Data_Science_Course_Certificate.pdf',
  'public/[English]_Complete_2025_Python_Bootcamp__Learn_Python_from_Scratch_Certificate.pdf',
];
const OUT = {
  'The_Ultimate_Job_Ready_Data_Science_Course_Certificate.pdf': 'cert-data-science.png',
  '[English]_Complete_2025_Python_Bootcamp__Learn_Python_from_Scratch_Certificate.pdf': 'cert-python.png',
};

const HTML = `<!DOCTYPE html><html><body>
<canvas id="c"></canvas>
<script src="https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.min.js"></script>
<script>
  pdfjsLib.GlobalWorkerOptions.workerSrc =
    'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js';
  window.renderPdf = async (base64) => {
    const bytes = Uint8Array.from(atob(base64), (ch) => ch.charCodeAt(0));
    const pdf = await pdfjsLib.getDocument({ data: bytes }).promise;
    const page = await pdf.getPage(1);
    const viewport = page.getViewport({ scale: 1.5 });
    const canvas = document.getElementById('c');
    canvas.width = viewport.width;
    canvas.height = viewport.height;
    await page.render({ canvasContext: canvas.getContext('2d'), viewport }).promise;
    return canvas.toDataURL('image/png');
  };
</script></body></html>`;

mkdirSync('public/assets/certificates', { recursive: true });
const browser = await chromium.launch();
const page = await browser.newPage();
await page.setContent(HTML, { waitUntil: 'networkidle' });

for (const pdfPath of PDFS) {
  const base64 = readFileSync(resolve(pdfPath)).toString('base64');
  const dataUrl = await page.evaluate((b64) => window.renderPdf(b64), base64);
  const out = `public/assets/certificates/${OUT[basename(pdfPath)]}`;
  writeFileSync(out, Buffer.from(dataUrl.split(',')[1], 'base64'));
  console.log('wrote', out);
}

await browser.close();
