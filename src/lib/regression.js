export function fitLine(points) {
  if (points.length < 2) return null;
  const n = points.length;
  const mx = points.reduce((s,p)=>s+p.x,0)/n;
  const my = points.reduce((s,p)=>s+p.y,0)/n;
  const xx = points.reduce((s,p)=>s+(p.x-mx)**2,0);
  if (xx < 1e-10) return null;
  const slope = points.reduce((s,p)=>s+(p.x-mx)*(p.y-my),0)/xx;
  const intercept = my-slope*mx;
  const sse = points.reduce((s,p)=>s+(p.y-(slope*p.x+intercept))**2,0);
  const sst = points.reduce((s,p)=>s+(p.y-my)**2,0);
  return { slope, intercept, mse:sse/n, r2:sst < 1e-10 ? null : 1-sse/sst };
}
