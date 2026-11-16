import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { projects } from '@/content/portfolio';

export function generateStaticParams() {
  return projects.map(({ slug }) => ({ slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const project = projects.find((item) => item.slug === slug);
  return { title: project?.title ?? 'Project', description: project?.summary };
}

export default async function ProjectPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const project = projects.find((item) => item.slug === slug);
  if (!project) notFound();
  return <main className="case-page">
    <nav className="case-nav"><Link href="/flat#projects">← All projects</Link><Link href="/">Enter the room ↗</Link></nav>
    <div className="case-kicker">{project.category} / Project study</div>
    <h1>{project.title}</h1>
    <p className="case-lead">{project.summary}</p>
    {project.image && <Image className="case-image" src={project.image} alt={project.title + ' preview'} width={1200} height={700} />}
    <div className="case-grid">
      <section><span>01 / The challenge</span><h2>What needed solving</h2><p>{project.challenge}</p></section>
      <section><span>02 / The build</span><h2>How it was approached</h2><p>{project.build}</p></section>
      {project.note && <section><span>03 / Context</span><h2>What to know</h2><p>{project.note}</p></section>}
      <section><span>Tools</span><h2>Stack</h2><p>{project.stack.join(' · ')}</p></section>
    </div>
    <div className="case-actions">{project.live && <a href={project.live} target="_blank" rel="noreferrer">Open live site ↗</a>}{project.source && <a href={project.source} target="_blank" rel="noreferrer">View source ↗</a>}</div>
  </main>;
}
