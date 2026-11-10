import React, { useEffect, useRef, useState } from 'react';
import { Pipeline, ProjectLinks } from './LabProjects';

export default function CaseStudyDialog({ project, index, origin, onClose }) {
  const dialog=useRef(null);const [closing,setClosing]=useState(false);
  useEffect(()=>{
    const node=dialog.current;const previous=document.activeElement;const previousOverflow=document.body.style.overflow;
    node.showModal();document.body.style.overflow='hidden';node.querySelector('[aria-label="Close case study"]').focus({preventScroll:true});
    if(!matchMedia('(prefers-reduced-motion: reduce)').matches){
      const x=origin?((origin.x+origin.width/2)/innerWidth*100):50;
      const y=origin?((origin.y+origin.height/2)/innerHeight*100):50;
      node.animate([{clipPath:`circle(0% at ${x}% ${y}%)`,opacity:.5},{clipPath:`circle(150% at ${x}% ${y}%)`,opacity:1}],{duration:700,easing:'cubic-bezier(.16,1,.3,1)',fill:'both'});
    }
    return()=>{document.body.style.overflow=previousOverflow;node.close();previous?.focus();};
  },[origin]);
  const close=()=>{
    if(closing)return;setClosing(true);
    if(matchMedia('(prefers-reduced-motion: reduce)').matches){onClose();return;}
    dialog.current.animate([{opacity:1,transform:'translateY(0)'},{opacity:0,transform:'translateY(35px)'}],{duration:250,easing:'ease-in',fill:'forwards'}).finished.then(onClose,onClose);
  };
  return <dialog ref={dialog} className={`case-dialog case-theme-${index}`} aria-labelledby="case-dialog-title" onCancel={e=>{e.preventDefault();close();}}><div className="case-dialog-bar"><a className="lab-mark" href="#projects" onClick={e=>{e.preventDefault();close();}}>a / lab.</a><span className="micro">EXPERIMENT 00{index+1} / CASE STUDY</span><button onClick={close} autoFocus aria-label="Close case study">CLOSE <span>×</span></button></div><div className="case-dialog-hero"><span className="micro">{project.category} / {project.subtitle}</span><h2 id="case-dialog-title">{project.title}<span>↗</span></h2><p>{project.description}</p><div className="project-tags">{project.technologies.map(t=><span key={t}>{t}</span>)}</div><ProjectLinks project={project}/><span className="case-dialog-number" aria-hidden="true">0{index+1}</span></div><div className="case-dialog-body">{[['01','The problem',project.problem],['02','The idea',project.solution],['03','The results',project.results],['04','The limitations',project.limitations],['05','What I learned',project.lessons]].filter(([, ,text])=>text).map(([number,title,text])=><section key={number}><span className="micro">{number} / {title}</span><h3>{title}.</h3><p>{text}</p></section>)}<section className="dialog-pipeline"><span className="micro">THE SYSTEM / END TO END</span><h3>Follow the information.</h3><Pipeline steps={project.architecture}/></section>{project.metrics&&<section className="dialog-metrics"><h3>Measured, never assumed.</h3><div className="metrics">{Object.entries(project.metrics).map(([name,value])=><div key={name}><span className="micro">{name}</span><strong>{value??'—'}</strong><small>{value==null?'Not yet reported':'Reported evaluation'}</small></div>)}</div></section>}<div className="dialog-end"><ProjectLinks project={project}/><button onClick={close}>BACK TO THE EXPERIMENTS ↗</button></div></div></dialog>;
}
