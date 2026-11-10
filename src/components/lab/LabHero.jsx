import React, { useRef } from 'react';

export default function LabHero() {
  const art=useRef(null);
  const move=e=>{
    if(e.pointerType!=='mouse'||matchMedia('(prefers-reduced-motion: reduce)').matches)return;
    const rect=e.currentTarget.getBoundingClientRect();
    if(art.current){
      art.current.style.setProperty('--mx',`${(e.clientX-rect.left-rect.width/2)/140}deg`);
      art.current.style.setProperty('--my',`${-(e.clientY-rect.top-rect.height/2)/160}deg`);
    }
    e.currentTarget.style.setProperty('--spot-x',`${e.clientX-rect.left}px`);
    e.currentTarget.style.setProperty('--spot-y',`${e.clientY-rect.top}px`);
  };
  const reset=()=>{if(art.current){art.current.style.setProperty('--mx','0deg');art.current.style.setProperty('--my','0deg');}};
  return <section id="home" className="lab-hero hero-v2" onPointerMove={move} onPointerLeave={reset}>
    <div className="hero-topline micro"><span><i className="status-dot"/> OPEN TO INTERNSHIPS & COLLABORATIONS</span><span>BASED IN PAKISTAN · BUILDING EVERYWHERE</span></div>
    <div className="hero-v2-intro"><span className="micro">MUHAMMAD ABDULLAH BHATTI</span><span className="micro">COMPUTER SCIENCE STUDENT<br/>FIFTH SEMESTER</span></div>
    <div className="hero-title-wrap"><h1 className="hero-v2-title"><span>INTELLIGENCE.</span><span className="outline-word">WITH <em>INTENTION.</em></span></h1></div>
    <div className="hero-role"><span className="micro">DATA SCIENCE × WEB DEVELOPMENT</span><p>I build intelligent systems and thoughtful web experiences.</p><div className="hero-actions"><a href="#projects" data-magnetic="button">Explore projects <span aria-hidden="true">↗</span></a><a href="#about" data-magnetic="button">About me <span aria-hidden="true">↗</span></a></div></div>
    <div className="sculpture-stage portrait-stage"><div className="sculpture-parallax"><div ref={art} className="sculpture-tilt portrait-tilt"><div className="portrait-glow"/><div className="portrait-backdrop"/><div className="portrait-shell"><img src="/assets/abdullah-portrait.png" alt="Muhammad Abdullah Bhatti" fetchPriority="high" width="385" height="397" /></div><span className="portrait-orbit portrait-orbit-one"/><span className="portrait-orbit portrait-orbit-two"/></div></div><span className="sculpture-tag micro">FIG. 001<br/>THE HUMAN IN THE LOOP</span></div>
    <div className="hero-v2-bottom"><span className="hero-scroll-cue micro"><span aria-hidden="true">↓</span> SCROLL TO OPEN THE LIBRARY</span><span className="hero-bottom-note micro">SELECTED WORK / 2026</span></div>
    <div className="hero-runner" aria-hidden="true"><div>{Array.from({length:4},(_,i)=><span key={i}>IDEAS INTO INTELLIGENCE <i>✳</i> MODELS INTO MEANING <i>✳</i> </span>)}</div></div>
  </section>;
}
