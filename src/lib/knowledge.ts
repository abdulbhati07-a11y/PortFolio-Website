import { certificates, journey, profile, projects, resumes } from '@/content/portfolio';

export function approvedKnowledge() {
  return JSON.stringify({
    person: { name: profile.name, bio: profile.bio, education: profile.education, email: profile.email, github: profile.github, linkedin: profile.linkedin },
    projects: projects.map(({ title, category, summary, challenge, build, stack, note, live, source }) => ({ title, category, summary, challenge, build, stack, note, live, source })),
    journey,
    resumes: resumes.map(({ title, pdf }) => ({ title, pdf })),
    certificates: certificates.map(({ title, file }) => ({ title, file })),
    caveats: [
      'No employment experience or dates are verified for publication.',
      'The owner confirmed fifth semester at the University of Management and Technology, Lahore.',
      'VisionGuard evaluation results are disputed in the existing portfolio and must not be stated as fact.',
      'Do not invent project metrics, capabilities, or links.',
    ],
  });
}

export function answerPortfolioQuestion(question: string) {
  const query = question.toLocaleLowerCase();
  const project = projects.find((item) => query.includes(item.title.toLocaleLowerCase()) || query.includes(item.slug.replaceAll('-', ' ')));
  if (project) return `${project.title}: ${project.summary} ${project.build}${project.note ? ` ${project.note}` : ''}`;
  if (/\b(jobs?|employment|experience|worked for|work at|company|companies)\b/.test(query)) return 'No professional employment history has been verified for this portfolio. You can explore Abdullah’s projects and learning journey here.';
  if (/\b(university|semester|degree|education|study|student|umt)\b/.test(query)) return `${profile.name}: ${profile.education}.`;
  if (/\b(certificat|course|bootcamp|credential)\b/.test(query)) return `The verified certificates shown here are ${certificates.map((item) => item.title).join(' and ')}. Both can be viewed in the About section.`;
  if (/\b(python|qr code|water reminder)\b/.test(query)) return 'Abdullah’s Python work includes a QR Code Generator and a Drink Water Reminder. Their project pages explain what was built.';
  if (/\b(data science|vision|e-commerce|ecommerce)\b/.test(query)) return 'The data science projects shown here are VisionGuard and E-Commerce Data. Their source repositories are private. VisionGuard evaluation claims are pending evidence review.';
  if (/\b(ai|artificial intelligence|futurepath|summariz)\b/.test(query)) return 'The AI project collection includes FuturePath AI, AI Text Summarizer, and Protein 3D Folding Structure. Open Projects to read the verified case studies.';
  if (/\b(web|website|frontend|front end)\b/.test(query)) return 'The web projects include PawFect, LÜNA WASH, Algorithm Visualizer, and Happy Birthday Interactive Web. Open Projects for screenshots, live links where available, and case studies.';
  if (/\b(project|portfolio|build|work)\b/.test(query)) return `This portfolio contains ${projects.length} projects across AI, data science, web development, and Python. You can filter them in Projects or explore every case study in Flat mode.`;
  if (/\b(resume|résumé|cv)\b/.test(query)) return 'Both the Data Science résumé and Web Developer résumé are available in the About section as PDF and Word files.';
  if (/\b(contact|email|reach|hire|linkedin|github)\b/.test(query)) return `You can contact Abdullah at ${profile.email}. GitHub: ${profile.github}. LinkedIn: ${profile.linkedin}.`;
  if (/\b(who|abdullah|about)\b/.test(query)) return profile.bio;
  return 'I do not have verified portfolio information to answer that. Ask about Abdullah’s projects, education, Python work, certificates, or contact details.';
}
