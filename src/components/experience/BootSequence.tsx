'use client';

import { useEffect, useState } from 'react';

export default function BootSequence({ onEnter }: { onEnter: (sound: boolean) => void }) {
  const [progress, setProgress] = useState(0);
  useEffect(() => {
    const started = performance.now();
    const timer = window.setInterval(() => setProgress(Math.min(100, Math.round((performance.now() - started) / 18))), 30);
    return () => window.clearInterval(timer);
  }, []);
  return <div className="boot-screen" role="dialog" aria-modal="true" aria-label="Enter the portfolio">
    <div className="boot-inner">
      <div className="boot-top"><span>ABDULLAH.OS</span><span>WORKBENCH / 2026</span></div>
      <p className="boot-command"><span>abdullah@lab:~$</span> open --projects --journey --about --contact</p>
      <svg className="boot-graph" viewBox="0 0 700 180" role="img" aria-label="Boot waveform">
        <path d="M0 150 C55 150 70 36 105 80 S160 146 200 125 S260 53 305 102 S370 138 410 100 S460 119 500 90 S550 112 590 74 S650 100 700 43" fill="none" stroke="#b2f1d6" strokeWidth="3" />
        <path d="M0 150 C55 150 70 36 105 80 S160 146 200 125 S260 53 305 102 S370 138 410 100 S460 119 500 90 S550 112 590 74 S650 100 700 43" fill="none" stroke="#b2f1d6" strokeWidth="12" opacity=".12" />
      </svg>
      <div className="boot-log" aria-live="off">
        <p><span>[ OK ]</span> Loading original 3D desk scene</p>
        <p><span>[ OK ]</span> Indexing {11} projects and case studies</p>
        <p><span>[ OK ]</span> Linking resumes and certificates</p>
        <p><span>[ OK ]</span> Flat portfolio available at /flat</p>
      </div>
      <div className="boot-progress-label"><span>{progress < 100 ? 'INITIALIZING THE ROOM' : 'ROOM READY'}</span><span>{progress}%</span></div>
      <div className="boot-progress" aria-label={'Loading ' + progress + ' percent'}><span style={{ width: progress + '%' }} /></div>
      <div className="boot-actions"><button onClick={() => onEnter(false)}>Enter without sound ↗</button><button onClick={() => onEnter(true)}>Enter with sound ♪</button></div>
      <a href="/flat">Explore the complete Flat portfolio →</a>
    </div>
  </div>;
}
