import puppeteer from 'puppeteer';
const b = await puppeteer.launch({ args:['--no-sandbox'] });
for (const h of [800, 860, 900]) {
  const p = await b.newPage();
  await p.emulateMediaFeatures([{name:'prefers-reduced-motion',value:'reduce'}]);
  await p.setViewport({width:1440,height:h,deviceScaleFactor:1});
  await p.goto(process.argv[2],{waitUntil:'networkidle2'});
  await new Promise(r=>setTimeout(r,2000));
  const m = await p.evaluate(()=>{
    const grids=document.querySelectorAll('#hero .grid');
    const stats=grids[grids.length-1];
    const sr=stats?.getBoundingClientRect();
    return { statsBottom: sr?Math.round(sr.bottom):null };
  });
  console.log(`vh=${h} statsBottom=${m.statsBottom} visible=${m.statsBottom<=h}`);
  await p.close();
}
await b.close();
