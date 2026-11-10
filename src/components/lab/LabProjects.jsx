import React, { useState } from 'react';
import { projects } from '../../data/lab';
import { VisionScene, FutureScene, SummaryScene } from './ProjectScenes';
import CaseStudyDialog from './CaseStudyDialog';

export function Pipeline({ steps }) { return <ol className="lab-pipeline">{steps.map((step,i) => <li key={step}><span className="micro">{String(i+1).padStart(2,'0')}</span>{step}{i < steps.length-1 && <b aria-hidden="true">→</b>}</li>)}</ol>; }
export function ProjectLinks({ project }) { return <div className="project-links">{project.github && <a href={project.github} target="_blank" rel="noreferrer">Repository ↗</a>}{project.live && <a href={project.live} target="_blank" rel="noreferrer">Live experience ↗</a>}</div>; }

const scenes=[VisionScene,FutureScene,SummaryScene];
const words=['PERCEPTION','POSSIBILITY','UNDERSTANDING'];
export default function LabProjects() {
  const [opened,setOpened]=useState(null);
  const open=(project,index,event)=>{const rect=event.currentTarget.closest('.showcase-chapter').querySelector('.showcase-art').getBoundingClientRect();setOpened({project,index,origin:{x:rect.x,y:rect.y,width:rect.width,height:rect.height}});};
  return <section id="projects" className="lab-section projects-section projects-v2">
    <div className="section-kicker"><span className="micro">02 / SELECTED EXPERIMENTS</span><span className="micro">AN EXPLORATION OF WHAT COMES NEXT</span></div>
    <div className="section-title work-title"><h2>Not just built.<br/><span><em>Thought through.</em></span></h2><div><span className="selected-count">03<span> / SELECTED WORKS</span></span><p>Models, interfaces and the systems in between.<br/>A few things I’ve put my curiosity into.</p></div></div>
    <div className="work-index micro">{projects.slice(0,3).map((p,i)=><a href={`#${p.id}`} key={p.id}><span>0{i+1}</span>{p.title}<span>↘</span></a>)}</div>
    {projects.slice(0,3).map((project,index)=>{const Scene=scenes[index];return <article className={`showcase-chapter chapter-${index}`} key={project.id} id={project.id}>
      <aside className="chapter-rail"><span className="chapter-number">0{index+1}<span> / 03</span></span><div className="chapter-progress"><i/></div><span className="micro chapter-word">{words[index]}</span><span className="micro chapter-status">EXPERIMENT<br/>00{index+1}</span></aside>
      <div className="chapter-main"><div className="showcase-art" data-cursor="EXPLORE"><Scene/><button className="scene-open" onClick={event=>open(project,index,event)} data-cursor="OPEN" aria-label={`Open ${project.title} case study`}><span>EXPLORE<br/>CASE STUDY</span><i>↗</i></button></div>
      <div className="showcase-info"><div><span className="micro">{project.category} / EXPERIMENT 00{index+1}</span><h3><button onClick={event=>open(project,index,event)} data-cursor="VIEW CASE">{project.title}<span>↗</span></button></h3><p className="project-subtitle">{project.subtitle}</p></div><div><p>{project.description}</p><div className="project-tags">{project.technologies.slice(0,4).map(t=><span key={t}>{t}</span>)}</div><ProjectLinks project={project}/></div></div>
      <button className="chapter-read" onClick={event=>open(project,index,event)}><span className="micro">THE PROBLEM. THE PROCESS. THE THINKING.</span><span>Inside the experiment <i>＋</i></span></button></div>
    </article>;})}
    {opened&&<CaseStudyDialog {...opened} onClose={()=>setOpened(null)}/>}
  </section>;
}
