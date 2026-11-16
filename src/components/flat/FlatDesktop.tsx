'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { certificates, journey, profile, projectCategories, projects, resumes } from '@/content/portfolio';
import PortfolioChat from '@/components/shared/PortfolioChat';
import ContactForm from '@/components/shared/ContactForm';

export default function FlatDesktop() {
  const [category, setCategory] = useState<(typeof projectCategories)[number]>('All');
  const [page, setPage] = useState(0);
  const filtered = category === 'All' ? projects : projects.filter((project) => project.category === category);
  const pages = Math.ceil(filtered.length / 6);
  const visible = filtered.slice(page * 6, page * 6 + 6);

  return <div className="flat-shell" id="top">
    <a className="skip-link" href="#main">Skip to content</a>
    <header className="flat-header"><Link className="wordmark" href="/flat">ABDULLAH<span> / LAB</span></Link><nav aria-label="Primary"><a href="#projects">Projects</a><a href="#journey">Journey</a><a href="#about">About</a><a href="#contact">Contact</a><Link href="/">3D room ↗</Link></nav></header>
    <main id="main">
      <section className="flat-hero">
        <div className="flat-hero-copy"><p className="eyebrow">PORTFOLIO / 2026 · OPEN FOR OPPORTUNITIES</p><h1>Building useful things at the edge of <em>code & curiosity.</em></h1><p>{profile.bio}</p><div className="hero-actions"><a href="#projects">Explore the work ↗</a><a href="#contact">Get in touch</a></div></div>
        <div className="flat-portrait"><Image src={profile.portrait} alt="Muhammad Abdullah Bhatti" width={500} height={600} priority /><span className="portrait-caption">Muhammad Abdullah Bhatti<br />Developer / data science</span></div>
      </section>
      <section className="flat-section" id="projects"><div className="section-heading"><p className="eyebrow">01 / SELECTED WORK</p><h2>Projects with a point of view.</h2><p>Web products, AI experiments, data analysis, and practical Python tools.</p></div>
        <div className="filter-row" role="group" aria-label="Filter projects">{projectCategories.map((item) => <button key={item} aria-pressed={category === item} onClick={() => { setCategory(item); setPage(0); }}>{item}</button>)}</div>
        <div className="flat-projects">{visible.map((project, index) => <article className="flat-project" key={project.slug}><div className="project-media">{project.image ? <Image src={project.image} alt="" width={800} height={500} /> : <div className="project-initial">{project.title.slice(0, 2).toUpperCase()}</div>}</div><div className="project-meta"><span>{String(page * 6 + index + 1).padStart(2, '0')} / {project.category}</span><h3>{project.title}</h3><p>{project.summary}</p><div className="project-links"><Link href={'/projects/' + project.slug}>Read case study ↗</Link>{project.live && <a href={project.live} target="_blank" rel="noreferrer">Live ↗</a>}{project.source && <a href={project.source} target="_blank" rel="noreferrer">Source ↗</a>}</div></div></article>)}</div>
        {pages > 1 && <div className="pagination"><button disabled={page === 0} onClick={() => setPage(page - 1)}>← Previous</button><span>Page {page + 1} of {pages}</span><button disabled={page + 1 >= pages} onClick={() => setPage(page + 1)}>Next →</button></div>}
      </section>
      <section className="flat-section journey-section" id="journey"><div className="section-heading"><p className="eyebrow">02 / THE PATH</p><h2>Learning by building.</h2><p>A journey through the work, without invented job titles or dates.</p></div><div className="journey-list">{journey.map((entry, index) => <article key={entry.title}><span>0{index + 1}</span><h3>{entry.title}</h3><p>{entry.detail}</p></article>)}</div></section>
      <section className="flat-section about-section" id="about"><div className="section-heading"><p className="eyebrow">03 / THE PERSON</p><h2>Curiosity, made practical.</h2></div><div className="about-layout"><div><p className="about-lead">{profile.bio}</p><p>I work across web interfaces, Python tools, data projects, and AI experiments. This portfolio shows the work, the decisions behind it, and the places I am still learning.</p><div className="social-row"><a href={profile.github} target="_blank" rel="noreferrer">GitHub ↗</a><a href={profile.linkedin} target="_blank" rel="noreferrer">LinkedIn ↗</a></div></div><div><h3>Resumés</h3>{resumes.map((item) => <div className="document-row" key={item.title}><strong>{item.title}</strong><a href={item.pdf} target="_blank" rel="noreferrer">PDF ↗</a><a href={item.docx} download>Word ↓</a></div>)}<h3>Certificates</h3>{certificates.map((item) => <a className="certificate-row" key={item.title} href={encodeURI(item.file)} target="_blank" rel="noreferrer"><Image src={item.image} alt="" width={140} height={92} /><span>{item.title}<small>View certificate ↗</small></span></a>)}</div></div></section>
      <section className="flat-section contact-section" id="contact"><div className="section-heading"><p className="eyebrow">04 / NEXT CONNECTION</p><h2>Have an idea worth building?</h2><p>Send a note, or connect through the links below.</p></div><div className="contact-layout"><ContactForm /><div className="contact-links"><a href={'mailto:' + profile.email}>{profile.email} ↗</a><a href={profile.github} target="_blank" rel="noreferrer">GitHub ↗</a><a href={profile.linkedin} target="_blank" rel="noreferrer">LinkedIn ↗</a></div></div></section>
    </main>
    <footer className="flat-footer"><span>© {new Date().getFullYear()} Muhammad Abdullah Bhatti</span><a href="#top">Back to top ↑</a><Link href="/">Enter the room ↗</Link></footer>
    <PortfolioChat />
  </div>;
}
