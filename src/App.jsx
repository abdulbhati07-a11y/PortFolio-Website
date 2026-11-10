import React, { lazy, Suspense, useEffect, useRef, useState } from 'react';
import { LazyMotion, domAnimation } from 'framer-motion';
import SEO from './components/SEO';
import LabHero from './components/lab/LabHero';
import Bookshelf from './components/lab/Bookshelf';
import SocialActivity from './components/lab/SocialActivity';
import LabJournal from './components/lab/LabJournal';
import LabContact from './components/lab/LabContact';
import Doorway from './components/lab/Doorway';
import Credentials from './components/lab/Credentials';
import LabCursor from './components/lab/LabCursor';
import Brand from './components/lab/Brand';
import ProcessSequence from './components/lab/ProcessSequence';
import useLabMotion from './hooks/useLabMotion';
import useMagneticMotion from './hooks/useMagneticMotion';
import './styles/lab.css';
import './styles/experience.css';
import './styles/bookshelf.css';
import './styles/refresh.css';
import './styles/chapters.css';
import './styles/premium.css';
import './styles/social.css';
const RegressionLab = lazy(() => import('./components/lab/RegressionLab'));
const ChatAssistant = lazy(() => import('./components/ChatAssistant'));
export default function App() {
  const root=useRef(null);
  useLabMotion(root);
  useMagneticMotion(root);
  const [menu, setMenu] = useState(false);
  useEffect(()=>{if(!menu)return;const previous=document.body.style.overflow;document.body.style.overflow='hidden';const close=e=>{if(e.key==='Escape')setMenu(false);};document.addEventListener('keydown',close);return()=>{document.body.style.overflow=previous;document.removeEventListener('keydown',close);};},[menu]);
  const [boot, setBoot] = useState(() => { try { return !sessionStorage.getItem('lab-ready') && !matchMedia('(prefers-reduced-motion: reduce)').matches; } catch { return false; } });
  useEffect(() => {
    const timer = setTimeout(() => { setBoot(false); try { sessionStorage.setItem('lab-ready', '1'); } catch { /* Storage is optional. */ } }, 700);
    return () => clearTimeout(timer);
  }, []);
  useEffect(() => {
    if (matchMedia('(prefers-reduced-motion: reduce)').matches || !('IntersectionObserver' in window)) return;
    const observer = new IntersectionObserver(entries => entries.forEach(entry => { if (entry.isIntersecting) { entry.target.classList.add('lab-in-view'); observer.unobserve(entry.target); } }), { threshold: .08 });
    document.querySelectorAll('.section-title,.identity-body,.notes-heading,.project-heading').forEach(node => { node.classList.add('lab-reveal'); observer.observe(node); });
    return () => { observer.disconnect(); document.querySelectorAll('.lab-reveal').forEach(node=>node.classList.remove('lab-reveal')); };
  }, []);
  const scrollTo = target => document.querySelector(target)?.scrollIntoView({ block: 'start' });
  return <LazyMotion features={domAnimation}><SEO />
    {boot && <div className="lab-boot" role="status"><Brand /><p>ABDULLAH.OS / INITIALIZING NEURAL INTERFACE</p><div className="boot-track"><i /></div><span className="micro">CONNECTING PROJECT GRAPH → SYSTEM READY</span></div>}
    <LabCursor /><div className="lab-site" ref={root}><div className="reading-progress" aria-hidden="true"><i/></div><a className="lab-skip" href="#main-content">Skip to content</a>
      <header className="lab-header"><Brand href="#home" /><button className="menu-toggle" onClick={() => setMenu(!menu)} aria-expanded={menu} aria-controls="lab-nav">{menu ? 'CLOSE −' : 'MENU +'}</button><nav id="lab-nav" className={menu ? 'is-open' : ''} aria-label="Main navigation">{[['home','Home'],['projects','Projects'],['about','About'],['credentials','Credentials'],['contact','Contact ↗']].map(([id,label]) => <a key={id} href={`#${id}`} onClick={() => setMenu(false)} data-magnetic={id === 'contact' ? 'button' : undefined}>{label}</a>)}</nav></header>
      <main id="main-content"><LabHero />
        <Doorway number="01" eyebrow="THE FIRST CHAPTER" title="ENTER THE LIBRARY" target="projects" action="Explore the projects" />
        <Bookshelf />
        <SocialActivity />
        <Doorway number="02" eyebrow="BEHIND THE WORK" title="MEET THE MAKER" target="identity" action="Turn the page" />
        <section className="lab-identity lab-section" id="identity"><div className="section-kicker"><span className="micro">01 / THE HUMAN BEHIND THE SYSTEM</span><span className="micro">CS × AI × ENGINEERING</span></div><div className="identity-body"><span className="micro accent">A LITTLE CONTEXT ↘</span><h2>Curiosity in.<br /><span>Intelligence out.</span></h2><p>I’m Muhammad Abdullah Bhatti, a computer science student exploring machine learning and building software that turns complex ideas into useful, interactive systems.</p></div><div className="identity-areas">{['Machine learning','Intelligent systems','Software engineering'].map((item,i) => <a href={i === 0 ? '#playground' : '#projects'} key={item}><span className="micro">0{i+1}</span>{item}<span>↗</span></a>)}</div></section>
        <ProcessSequence /><Suspense fallback={<div className="lab-section">Loading interactive experiment…</div>}><RegressionLab /></Suspense><LabJournal />
        <Doorway number="03" eyebrow="THE CREDENTIALS" title="OPEN THE RECORD" target="credentials" action="See resumes & certificates" />
        <Credentials />
        <Doorway number="04" eyebrow="THE NEXT CHAPTER" title="LET’S TALK" target="contact" action="Start a conversation" />
        <LabContact />
      </main><footer className="lab-footer"><Brand href="#home" /><span className="micro">DESIGNED & ENGINEERED BY MUHAMMAD ABDULLAH BHATTI</span><span className="micro">© {new Date().getFullYear()} THE ABDULLAH LAB</span><a href="#home" className="micro">BACK TO TOP ↑</a></footer>
    </div><div className="lab-assistant"><Suspense fallback={null}><ChatAssistant scrollTo={scrollTo} /></Suspense></div>
  </LazyMotion>;
}
