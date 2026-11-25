import { profile, certificates, projects, resumes, journey } from '../content/portfolio';

export const owner = { ...profile, resume: resumes[0].pdf };
export const credentials = certificates.map((item, index) => ({
  ...item, id: `certificate-${index}`, thumbnail: item.image,
  issuer: 'Course certificate', date: 'Completed',
}));
const ids = { 'futurepath-ai': 'futurepath', 'ai-summarizer': 'summarizer', 'ecommerce-data': 'ecommerce' };
export const deskProjects = projects.map(project => ({
  id: ids[project.slug] || project.slug, name: project.title,
  category: project.slug === 'vision-guard' ? 'Computer vision' :
    ({ AI: 'AI application', Web: 'Web application', Python: 'Python utility', 'Data science': 'Data science' })[project.category],
  description: project.summary, problem: project.challenge, build: project.build,
  stack: project.stack, note: project.note, live: project.live,
  image: project.slug === 'futurepath-ai' ? '/assets/screenshots/futurepath-live.webp' : project.image,
  github: project.source?.startsWith(profile.github + '/') ? project.source.slice(profile.github.length + 1) : undefined,
}));
export const learning = journey.map((item, index) => ({
  title: item.title, text: item.detail, role: index === 0 ? profile.education : 'Independent learning and projects',
  date: index === 0 ? 'Currently studying' : 'Learning by building',
  color: ['pink', 'blue', 'yellow', 'mint'][index],
}));
