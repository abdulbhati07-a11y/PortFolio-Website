'use client';

import Image from 'next/image';
import type { PreviewKey } from './DeskScene';
import { certificates, profile, projects } from '@/content/portfolio';

const details: Record<PreviewKey, { eyebrow: string; title: string; description: string; action: string }> = {
  projects: { eyebrow: 'THE MONITOR / 01', title: 'Projects', description: 'Explore web, Python, data science and AI builds with the decisions behind each one.', action: 'Open projects' },
  journey: { eyebrow: 'THE BOARD / 02', title: 'Journey', description: 'A fifth-semester computer science path shaped by building and learning.', action: 'Open journey' },
  about: { eyebrow: 'THE NOTEBOOK / 03', title: 'About Abdullah', description: 'Meet the person behind the workbench and view resumes and certificates.', action: 'Open about' },
  contact: { eyebrow: 'THE PHONE / 04', title: 'Contact', description: 'Start a conversation about a project, opportunity or question.', action: 'Open contact' },
  assistant: { eyebrow: 'THE DESK BOT / AI', title: 'Ask Abdullah’s assistant', description: 'Ask questions grounded in the verified projects, education and credentials shown here.', action: 'Open assistant' },
};

export default function RoomPreview({ preview, onClose, onOpen }: { preview: PreviewKey; onClose: () => void; onOpen: () => void }) {
  const item = details[preview];
  return <aside className="room-preview" aria-label={item.title + ' preview'}>
    <button className="room-preview-close" onClick={onClose} aria-label="Close preview">×</button>
    <div className={'room-preview-art ' + preview}>
      {preview === 'projects' && <div className="preview-project-art"><Image src={projects.find((project) => project.slug === 'pawfect')?.image || '/assets/screenshots/pet-sitting.jpg'} alt="PawFect project preview" width={900} height={560} /><span>11 BUILDS / 4 DISCIPLINES</span></div>}
      {preview === 'journey' && <div className="preview-certificate-art"><Image src={certificates[0].image} alt="Data science course certificate" width={900} height={560} /><span>COMPUTER SCIENCE · UMT LAHORE</span></div>}
      {preview === 'about' && <Image className="preview-portrait" src={profile.portrait} alt={profile.name} width={700} height={780} />}
      {preview === 'contact' && <div className="preview-phone-art" aria-hidden="true"><div className="preview-phone-screen"><span>ABDULLAH.OS</span><strong>Let’s talk.</strong><i /><i /><i /><b>MESSAGE →</b></div></div>}
      {preview === 'assistant' && <div className="preview-bot-art" aria-hidden="true"><div className="preview-bot-antenna" /><div className="preview-bot-head"><span>•　•</span><i /></div><div className="preview-bot-body">ASK ME ABOUT ABDULLAH</div></div>}
    </div>
    <div className="room-preview-copy"><span className="eyebrow">{item.eyebrow}</span><h2>{item.title}</h2><p>{item.description}</p><button onClick={onOpen}>{item.action} ↗</button></div>
  </aside>;
}
