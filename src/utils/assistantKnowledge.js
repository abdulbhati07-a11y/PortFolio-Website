// Local portfolio guide. Answers use the same project metadata as the page.
import { projects, profile, stack, current, certificates } from '../data/lab';
const scroll=(label,target)=>({type:'scroll',label,target});
const link=(label,href)=>({type:'link',label,href});
export const STARTER_PROMPTS=['Who is Abdullah?','Show me projects','Explore the ML lab','How can I contact him?'];
export const ASSISTANT_INTRO='Welcome to the lab. I’m a local portfolio guide, using the project information on this site. Ask about experiments, the stack, learning or contact details.';
export function getAnswer(raw) {
  const text=raw.toLowerCase();
  const project=projects.find(p=>text.includes(p.title.toLowerCase()) || text.includes(p.id.replaceAll('-',' ')) || (p.id==='summarizer' && text.includes('summari')));
  if(project)return {text:`${project.title}\n\n${project.description}\n\nStack: ${project.technologies.join(', ')}${project.limitations ? '\n\n'+project.limitations : ''}`,actions:[scroll('Explore project',`#${project.id}`),...(project.github?[link('Repository',project.github)]:[]),...(project.live?[link('Live experience',project.live)]:[])]};
  if(/github|repositor|commit|activity|open source/.test(text))return {text:'The Activity & Links section shows recently pushed public repositories from GitHub. You can open the repositories or visit Abdullah’s full profile.',actions:[scroll('See public activity','#activity'),link('GitHub profile',profile.github)]};
  if(/linkedin|professional profile|connect/.test(text))return {text:'Abdullah’s LinkedIn profile is linked in the Activity & Links section.',actions:[scroll('Activity & Links','#activity'),link('LinkedIn profile',profile.linkedin)]};
  if(/contact|email|hire|available|reach|work with/.test(text))return {text:'Abdullah is open to ML internships, AI collaborations and interesting engineering projects.',actions:[link('Email',`mailto:${profile.email}`),link('LinkedIn',profile.linkedin),scroll('Contact','#contact')]};
  if(/resume|cv|experience/.test(text))return {text:'Abdullah is a computer science student building AI/ML and full-stack projects. His resume contains the detailed background.',actions:[link('Download resume',profile.resume)]};
  if(/skill|stack|python|framework|technolog/.test(text))return {text:stack.map(([name,items])=>`${name}: ${items}`).join('\n\n'),actions:[scroll('Engineering stack','#skills')]};
  if(/playground|regression|ml lab/.test(text))return {text:'The ML lab fits a real least-squares regression line to points you can add, drag or move with the keyboard. R², MSE and predictions update in the browser.',actions:[scroll('Try the experiment','#playground')]};
  if(/learning|current|now|studying/.test(text))return {text:current.map(([label,value])=>`${label}: ${value}`).join('\n'),actions:[scroll('About Abdullah','#about')]};
  if(/certificate|qualification/.test(text))return {text:'Learning credentials available in the portfolio:',actions:certificates.map(c=>link(c.title,encodeURI(c.file)))};
  if(/project|built|work|experiment/.test(text))return {text:projects.slice(0,3).map(p=>`${p.title} — ${p.subtitle}`).join('\n\n'),actions:[scroll('Selected experiments','#projects'),scroll('Build log','#archive'),link('GitHub',profile.github)]};
  if(/who|about|hello|hi\b|background/.test(text))return {text:'Muhammad Abdullah Bhatti is a computer science student focused on machine learning, intelligent systems and software engineering. He learns by turning complex ideas into useful, interactive software.',actions:[scroll('The human behind the system','#about')]};
  return {text:'I can help with the projects and information in this portfolio. Try an experiment name, the ML lab, skills or contact details.',suggestions:STARTER_PROMPTS};
}
