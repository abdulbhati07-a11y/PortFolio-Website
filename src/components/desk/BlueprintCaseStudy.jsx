import React from 'react';
import { FiExternalLink, FiGithub } from 'react-icons/fi';
import { blueprints } from '../../data/blueprints';
import { deskProjects, owner } from '../../data/desk';
import '../../styles/wall-decor.css';

export default function BlueprintCaseStudy({id}) {
  const blueprint=blueprints.find(item=>item.id===id);
  const project=deskProjects.find(item=>item.id===blueprint.projectId);
  return <section className="room-surface blueprint-case" aria-labelledby="blueprint-case-title" style={{'--blueprint-accent':blueprint.accent}}>
    <div className="blueprint-case-diagram"><span className="desk-kicker">{blueprint.label} / SYSTEM STUDY</span><h2 id="blueprint-case-title">{project.name}</h2><ol className="blueprint-flow">{blueprint.steps.map(step=><li key={step}>{step}</li>)}</ol><div className="blueprint-outputs">{blueprint.outputs.map(output=><span key={output}>{output}</span>)}</div><p>{blueprint.note}</p></div>
    <article className="blueprint-case-notes"><span className="desk-kicker">THE THINKING BEHIND THE BUILD</span><h3>A closer look.</h3><div><h4>The challenge</h4><p>{project.problem}</p></div><div><h4>What I built</h4><p>{project.build}</p></div>{project.note&&<div><h4>What to know</h4><p>{project.note}</p></div>}<div className="blueprint-stack">{project.stack.map(item=><span key={item}>{item}</span>)}</div><div className="blueprint-links">{project.live&&<a href={project.live} target="_blank" rel="noreferrer">Open live project <FiExternalLink/></a>}{project.github&&<a href={`${owner.github}/${project.github}`} target="_blank" rel="noreferrer">View source <FiGithub/></a>}</div></article>
  </section>;
}
