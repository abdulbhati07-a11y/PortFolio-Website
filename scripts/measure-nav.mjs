import puppeteer from 'puppeteer';
const b = await puppeteer.launch({ args:['--no-sandbox'] });
const p = await b.newPage();
await p.emulateMediaFeatures([{name:'prefers-reduced-motion',value:'reduce'}]);
await p.setViewport({width:1280,height:800,deviceScaleFactor:1});
await p.goto(process.argv[2],{waitUntil:'networkidle2'});
await new Promise(r=>setTimeout(r,2500));
const m = await p.evaluate(()=>{
  const nav=document.querySelector('nav')||document.querySelector('header');
  const r=nav?.getBoundingClientRect();
  return { navBottom: r?Math.round(r.bottom):null, navHeight: r?Math.round(r.height):null };
});
console.log(JSON.stringify(m));
await b.close();
