'use client';

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { certificates, journey, profile, projectCategories, projects, resumes } from '@/content/portfolio';
import type { Destination } from './DeskScene';
import ContactForm from '@/components/shared/ContactForm';

export default function WindowManager({ destination, onClose }: { destination: Destination; onClose: () => void }) {
  const [category, setCategory] = useState<(typeof projectCategories)[number]>('All');
  const [page, setPage] = useState(0);
  const [selected, setSelected] = useState<string | null>(null);
  const bodyRef = useRef<HTMLDivElement>(null);
  useEffect(() => { bodyRef.current?.scrollTo({ top: 0 }); }, [selected, destination, category, page]);
  if (destination === 'room') return null;
  const filtered = category === 'All' ? projects : projects.filter((project) => project.category === category);
  const pages = Math.ceil(filtered.length / 6);
  const chosen = projects.find((item) => item.slug === selected);
  return <div className="scene-window-layer"><section className="scene-window" role="dialog" aria-modal="false" aria-label={destination + ' window'}>
    <header className="window-bar"><div className="window-dots"><i /><i /><i /></div><span>ABDULLAH.OS / {destination.toUpperCase()}</span><button onClick={() => { setSelected(null); onClose(); }} aria-label="Close window and return to room">×</button></header>
    <div className="window-body" ref={bodyRef}>
      {destination === 'projects' && <><div className="window-intro"><span>01 / SELECTED WORK</span><h2>Projects</h2><p>Choose a build to open its story.</p></div><div className="window-filters" role="group" aria-label="Filter projects">{projectCategories.map((item) => <button key={item} aria-pressed={category === item} onClick={() => { setCategory(item); setPage(0); setSelected(null); }}>{item}</button>)}</div>{chosen ? <div className="window-study"><button onClick={() => setSelected(null)}>← All projects</button><div className="study-grid"><div>{chosen.image ? <Image src={chosen.image} alt={chosen.title + ' preview'} width={800} height={500} /> : <div className="study-placeholder">{chosen.title}</div>}<div className="study-links">{chosen.live && <a href={chosen.live} target="_blank" rel="noreferrer">Live ↗</a>}{chosen.source && <a href={chosen.source} target="_blank" rel="noreferrer">Source ↗</a>}<Link href={'/projects/' + chosen.slug}>Full case study ↗</Link></div></div><div><span>{chosen.category}</span><h3>{chosen.title}</h3><p>{chosen.summary}</p><h4>The challenge</h4><p>{chosen.challenge}</p><h4>The build</h4><p>{chosen.build}</p>{chosen.note && <p className="study-note">{chosen.note}</p>}<div className="stack-list">{chosen.stack.map((item) => <span key={item}>{item}</span>)}</div></div></div></div> : <><div className="window-project-grid">{filtered.slice(page * 6, page * 6 + 6).map((project) => <button key={project.slug} onClick={() => setSelected(project.slug)}><div>{project.image ? <Image src={project.image} alt="" width={800} height={500} /> : <span className="tile-initial">{project.title.slice(0, 2)}</span>}</div><strong>{project.title}</strong><small>{project.category} ↗</small></button>)}</div>{pages > 1 && <div className="pagination"><button disabled={page === 0} onClick={() => setPage(page - 1)}>←</button><span>{page + 1} / {pages}</span><button disabled={page + 1 >= pages} onClick={() => setPage(page + 1)}>→</button></div>}</>}</>}
      {destination === 'journey' && <><div className="window-intro"><span>02 / THE PATH</span><h2>Journey</h2><p>Learning by building across systems, interfaces, Python and data.</p></div><div className="window-journey">{journey.map((item, index) => <article key={item.title}><span>0{index + 1}</span><div><h3>{item.title}</h3><p>{item.detail}</p></div></article>)}</div><p className="fact-note">Professional employment is not listed because no history was supplied for publication.</p></>}
      {destination === 'about' && <><div className="window-intro"><span>03 / THE PERSON</span><h2>About Abdullah</h2></div><div className="window-about"><Image src={profile.portrait} alt={profile.name} width={500} height={600} /><div><p className="about-lead">{profile.bio}</p><p>The best projects make a complex idea easier to use and easier to understand. This workbench collects experiments in web development, data science and Python.</p><div className="social-row"><a href={profile.github} target="_blank" rel="noreferrer">GitHub ↗</a><a href={profile.linkedin} target="_blank" rel="noreferrer">LinkedIn ↗</a></div><h3>Resumés</h3>{resumes.map((item) => <div className="document-row" key={item.title}><strong>{item.title}</strong><a href={item.pdf} target="_blank" rel="noreferrer">PDF ↗</a><a href={item.docx} download>Word ↓</a></div>)}<h3>Certificates</h3>{certificates.map((item) => <a className="document-row" key={item.title} href={encodeURI(item.file)} target="_blank" rel="noreferrer">{item.title} ↗</a>)}</div></div></>}
      {destination === 'contact' && <><div className="window-intro"><span>04 / YOUR TURN</span><h2>Contact</h2><p>Have an idea, role, or question? Start a conversation.</p></div><div className="window-contact"><ContactForm /><div className="contact-links"><a href={'mailto:' + profile.email}>{profile.email} ↗</a><a href={profile.github} target="_blank" rel="noreferrer">GitHub ↗</a><a href={profile.linkedin} target="_blank" rel="noreferrer">LinkedIn ↗</a><a href={resumes[0].pdf} target="_blank" rel="noreferrer">Download résumé ↗</a></div></div></>}
    </div>
  </section></div>;
}
