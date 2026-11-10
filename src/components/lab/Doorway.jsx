import React from 'react';

const previews = {
  projects: { label:'THE PROJECT LIBRARY', title:'Eight stories. One shelf.', detail:'Pull a book to see the work and the thinking behind it.', samples:['FuturePath AI','VisionGuard','PawFect'] },
  identity: { label:'THE HUMAN BEHIND THE SYSTEM', title:'Meet the maker.', detail:'Curiosity, experiments, and the person connecting them.', samples:['Computer science','Data science','Web development'] },
  credentials: { label:'THE READING ROOM', title:'The work, on paper.', detail:'Resumes, certificates, and the learning behind each build.', samples:['Data science resume','Web development resume','Certificates'] },
  contact: { label:'A NEW CONNECTION', title:'Start something new.', detail:'Tell me what you are building. The conversation starts here.', samples:['A project','An internship','A collaboration'] }
};

export default function Doorway({ number, eyebrow, title, target, action }) {
  const preview=previews[target];
  return <a className={`chapter-door chapter-gateway chapter-door--${target}`} href={`#${target}`} aria-label={`${action}: ${title}`} data-chapter={number} data-cursor="ENTER">
    <span className="door-viewport">
      <span className="micro door-kicker">{number} / {eyebrow}</span>
      <span className="door-frame">
        <span className="door-light" />
        <span className="door-art" aria-hidden="true"><i/><i/><i/></span>
        <span className="door-reveal" aria-hidden="true"><span className="micro">{preview.label}</span><strong>{preview.title}</strong><small>{preview.detail}</small><span className="door-samples">{preview.samples.map((item,index)=><span key={item}><i>0{index+1}</i>{item}</span>)}</span></span>
        <span className="door-leaf door-left" /><span className="door-leaf door-right" />
        <span className="door-title">{title}</span>
      </span>
      <span className="micro door-action">{action} <span>↗</span></span>
      <span className="micro door-scroll-note">SCROLL TO OPEN ↓</span>
    </span>
  </a>;
}
