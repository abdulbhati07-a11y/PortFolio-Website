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
