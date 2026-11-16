'use client';

import { useEffect, useRef, useState } from 'react';

export default function BootSequence({ onEnter, onSkip }: { onEnter: (sound: boolean) => void; onSkip: () => void }) {
  const [progress, setProgress] = useState(0);
  const onEnterRef = useRef(onEnter);
  useEffect(() => { onEnterRef.current = onEnter; }, [onEnter]);
  useEffect(() => {
    const started = performance.now();
    const timer = window.setInterval(() => setProgress(Math.min(100, Math.round((performance.now() - started) / 34))), 40);
    const auto = window.setTimeout(() => onEnterRef.current(false), 3900);
    return () => { window.clearInterval(timer); window.clearTimeout(auto); };
  }, []);
  return <div className="boot-screen" role="dialog" aria-modal="true" aria-label="Starting the portfolio">
    <div className="boot-inner">
      <div className="boot-top"><span>ABDULLAH.OS</span><span>INITIALIZING / WORKBENCH</span></div>
      <p className="boot-command"><span>abdullah@lab:~$</span> ./open-room --projects --journey --about --contact</p>
      <svg className="boot-graph" viewBox="0 0 700 180" role="img" aria-label="Boot waveform">
        <path className="boot-graph-line" d="M0 145 C75 145 100 124 165 122 S260 85 330 91 S440 52 525 55 S640 34 700 20" fill="none" stroke="#b2f1d6" strokeWidth="2" pathLength={100} strokeDasharray={100} strokeDashoffset={100 - progress} />
      </svg>
      <div className="boot-log" aria-live="off">
        {progress >= 16 && <p><span>[ OK ]</span> preparing Abdullah’s workbench</p>}
        {progress >= 38 && <p><span>[ OK ]</span> indexing 11 projects and case studies</p>}
        {progress >= 62 && <p><span>[ OK ]</span> connecting the room’s four destinations</p>}
        {progress >= 84 && <p><span>[ OK ]</span> complete Flat portfolio available</p>}
      </div>
      <div className="boot-progress-label"><span>{progress < 100 ? 'BOOTING' : 'READY'}</span><span>{progress}%</span></div>
      <div className="boot-progress" aria-label={'Loading ' + progress + ' percent'}><span style={{ width: progress + '%' }} /></div>
      <div className="boot-actions"><button onClick={() => onEnter(false)}>Enter without sound ↗</button><button onClick={() => onEnter(true)}>Enter with sound ♪</button><button onClick={onSkip}>Skip intro ↗</button></div>
      <a href="/flat">Explore the complete Flat portfolio →</a>
    </div>
  </div>;
}
