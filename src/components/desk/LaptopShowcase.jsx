import React from 'react';
import { FiExternalLink, FiMonitor } from 'react-icons/fi';
import { deskProjects } from '../../data/desk';
import '../../styles/laptop.css';

export default function LaptopShowcase() {
  const project=deskProjects.find(item=>item.id==='futurepath');
  return <section className="room-surface futurepath-laptop" aria-labelledby="laptop-project-title">
    <div className="futurepath-laptop-shell">
      <header className="futurepath-laptop-bar"><div><FiMonitor aria-hidden="true"/><span id="laptop-project-title">FuturePath AI</span><small>FEATURED PROJECT</small></div><a href={project.live} target="_blank" rel="noreferrer">Open live app <FiExternalLink aria-hidden="true"/></a></header>
      <a className="futurepath-live-preview" href={project.live} target="_blank" rel="noreferrer" aria-label="Open the live FuturePath AI website"><img src={project.image} alt="FuturePath AI homepage: Don’t Guess Your Future. Simulate It."/><span>Explore FuturePath AI <FiExternalLink aria-hidden="true"/></span></a>
      <footer className="futurepath-laptop-details"><div><span className="desk-kicker">AI-POWERED DECISION INTELLIGENCE</span><h2>One decision. Three possible paths.</h2><p>{project.description}</p></div><div className="futurepath-laptop-stack">{project.stack.map(item=><span key={item}>{item}</span>)}</div></footer>
    </div><div className="futurepath-laptop-base" aria-hidden="true"><i/></div>
  </section>;
}
