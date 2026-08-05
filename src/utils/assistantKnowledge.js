/**
 * Knowledge engine for the portfolio chat assistant.
 *
 * No API, no backend — answers are derived from the same single source of
 * truth the rest of the site renders from (`constants.js`), plus a set of
 * curated intents. Each intent has trigger keywords and a builder that returns
 * a rich answer (text + optional action buttons). The matcher scores every
 * intent against the user's message and returns the best hit, so questions
 * from "who are you" to "what's your protein folding stack" all resolve
 * without ever hallucinating a fact that isn't in the data.
 */
import {
  DEVELOPER_INFO,
  PROJECTS,
  SKILLS,
  CERTIFICATES,
  TIMELINE,
  STATS,
} from './constants';

const { nickname, name, email, github, linkedin, resume, bio, tagline } = DEVELOPER_INFO;

const featured = PROJECTS.filter((p) => p.featured);
const allSkills = [
  ...SKILLS.programming,
  ...SKILLS.frameworks,
  ...SKILLS.tools,
];
const liveProjects = PROJECTS.filter(
  (p) => p.links?.demo && p.links.demo !== '#'
);

/* An action renders as a chip/button below an answer. type drives behavior:
   'scroll' → smooth-scroll to a section id, 'link' → open external URL. */
const scroll = (label, target) => ({ type: 'scroll', label, target });
const link = (label, href) => ({ type: 'link', label, href });

/* ─── Intents ─────────────────────────────────────────────────────────────
   Ordered loosely by specificity. Each `keywords` entry is matched as a
   whole-word-ish substring; `weight` lets strong signals win ties. */
const INTENTS = [
  {
    id: 'greeting',
    keywords: ['hi', 'hey', 'hello', 'yo', 'sup', 'greetings', 'howdy'],
    exactShort: true, // only match when the message is basically just a greeting
    answer: () => ({
      text: `Hey! I'm ${nickname}'s assistant. Ask me anything about his work, skills, projects, or how to get in touch.`,
      suggestions: ['Who is Abdullah?', 'Show me the best projects', 'What are his skills?'],
    }),
  },
  {
    id: 'identity',
    keywords: ['who are you', 'who is', 'about him', 'about you', 'about abdullah', 'yourself', 'tell me about', 'introduce'],
    answer: () => ({
      text: `${name} — goes by ${nickname}. ${bio}`,
      actions: [scroll('Read the full story', '#about'), link('Resume', resume)],
      suggestions: ['What can he build?', 'Is he available for work?'],
    }),
  },
  {
    id: 'role',
    keywords: ['what do you do', 'what does he do', 'your role', 'his role', 'job title', 'what is he', 'profession'],
    answer: () => ({
      text: `${nickname} is an ${DEVELOPER_INFO.role}. ${tagline}`,
      suggestions: ['What are his skills?', 'Show me projects'],
    }),
  },
  {
    id: 'skills',
    keywords: ['skill', 'tech stack', 'technologies', 'languages', 'tools', 'framework', 'what can he do', 'what can you do', 'expertise', 'proficient', 'know how to'],
    answer: () => ({
      text:
        `${nickname}'s core stack:\n\n` +
        `• Languages: ${SKILLS.programming.map((s) => s.name).join(', ')}\n` +
        `• Frameworks & libs: ${SKILLS.frameworks.map((s) => s.name).join(', ')}\n` +
        `• Tools: ${SKILLS.tools.map((s) => s.name).join(', ')}\n\n` +
        `Strongest areas are Python, AI/ML, and full-stack web development.`,
      actions: [scroll('Explore skills', '#skills')],
      suggestions: ['How good is he at Python?', 'Show AI/ML projects'],
    }),
  },
  {
    id: 'projects',
    keywords: ['project', 'work', 'portfolio', 'built', 'made', 'created', 'show me', 'best work', 'case study'],
    answer: () => ({
      text:
        `${nickname} has built ${PROJECTS.length}+ projects. The standouts:\n\n` +
        featured
          .map((p) => `${p.icon} ${p.title} — ${p.category}`)
          .join('\n') +
        `\n\nClick any project card for a full case study.`,
      actions: [scroll('See all projects', '#projects')],
      suggestions: ['Tell me about the Protein Folding project', 'Which projects are live?'],
    }),
  },
  {
    id: 'live-projects',
    keywords: ['live', 'demo', 'deployed', 'try it', 'link', 'url', 'website', 'online'],
    answer: () => ({
      text: `These projects are live and clickable right now:`,
      actions: liveProjects.map((p) => link(`${p.icon} ${p.title}`, p.links.demo)),
      suggestions: ['Show the source code', 'What tech does he use?'],
    }),
  },
  {
    id: 'ai-ml',
    keywords: ['ai', 'ml', 'machine learning', 'artificial intelligence', 'model', 'data science', 'neural', 'llm'],
    answer: () => {
      const aiProjects = PROJECTS.filter((p) => p.category === 'AI/ML');
      return {
        text:
          `AI/ML is ${nickname}'s specialization — he's on a Data Science & AI/ML track. Relevant projects:\n\n` +
          aiProjects.map((p) => `${p.icon} ${p.title} — ${p.description}`).join('\n\n'),
        actions: [scroll('Filter AI/ML work', '#projects')],
        suggestions: ['What ML frameworks?', 'Tell me about the summarizer'],
      };
    },
  },
  {
    id: 'contact',
    keywords: ['contact', 'email', 'reach', 'hire', 'get in touch', 'message', 'talk', 'connect', 'available', 'availability', 'freelance', 'work with'],
    answer: () => ({
      text: DEVELOPER_INFO.available
        ? `${nickname} is currently available for work — building ${DEVELOPER_INFO.currentlyBuilding}. Best way to reach him:`
        : `You can reach ${nickname} here:`,
      actions: [
        link('Email', `mailto:${email}`),
        link('LinkedIn', linkedin),
        scroll('Contact form', '#contact'),
      ],
      suggestions: ['What is he building right now?', 'See his resume'],
    }),
  },
  {
    id: 'resume',
    keywords: ['resume', 'cv', 'download', 'experience', 'background', 'qualification'],
    answer: () => ({
      text: `You can download ${nickname}'s full resume, or I can summarize his ${STATS[0].value}+ years of experience across ${STATS[1].value}+ projects.`,
      actions: [link('Download resume', resume), scroll('View timeline', '#journey')],
      suggestions: ['Walk me through his journey', 'What are his certifications?'],
    }),
  },
  {
    id: 'certifications',
    keywords: ['certificate', 'certification', 'course', 'credential', 'qualified', 'studied'],
    answer: () => ({
      text:
        `${nickname} holds verified certificates:\n\n` +
        CERTIFICATES.map((c) => `${c.icon} ${c.title} — ${c.issuer} (${c.date})`).join('\n'),
      actions: [scroll('View certificates', '#certifications')],
      suggestions: ['What did he learn?', 'Show his skills'],
    }),
  },
  {
    id: 'timeline',
    keywords: ['journey', 'timeline', 'history', 'career', 'path', 'when did', 'start', 'story', 'how long'],
    answer: () => ({
      text:
        `${nickname}'s journey so far:\n\n` +
        TIMELINE.map((t) => `${t.year} — ${t.title} (${t.subtitle})`).join('\n'),
      actions: [scroll('See full timeline', '#journey')],
      suggestions: ['What is he working on now?', 'How much experience?'],
    }),
  },
  {
    id: 'education',
    keywords: ['student', 'university', 'degree', 'study', 'college', 'semester', 'education'],
    answer: () => ({
      text: `${nickname} is a 4th-semester Computer Science student specializing in Data Science and AI/ML, with 1.5+ years of hands-on experience building real projects alongside his degree.`,
      suggestions: ['What has he built?', 'What are his certifications?'],
    }),
  },
  {
    id: 'building-now',
    keywords: ['right now', 'currently', 'these days', 'latest', 'working on', 'nowadays', 'building now'],
    answer: () => ({
      text: `Right now ${nickname} is building ${DEVELOPER_INFO.currentlyBuilding}, and he's ${DEVELOPER_INFO.available ? 'open to new opportunities' : 'heads-down on current work'}.`,
      actions: [scroll('Latest projects', '#projects'), link('Email him', `mailto:${email}`)],
    }),
  },
];

/* Per-project deep answers — generated so "tell me about <project>" works for
   every project without hand-writing an intent each. */
const projectIntents = PROJECTS.map((p) => ({
  id: `project-${p.id}`,
  keywords: [p.title.toLowerCase(), ...p.title.toLowerCase().split(' ').filter((w) => w.length > 3)],
  weight: 2, // a named project is a strong, specific signal
  answer: () => ({
    text:
      `${p.icon} ${p.title}\n\n${p.description}\n\n` +
      `Tech: ${p.tech.join(', ')}` +
      (p.caseStudy ? `\n\nOutcome: ${p.caseStudy.impact}` : ''),
    actions: [
      ...(p.links?.demo && p.links.demo !== '#' ? [link('Live demo', p.links.demo)] : []),
      ...(p.links?.github && p.links.github !== '#' ? [link('Source code', p.links.github)] : []),
      scroll('See in projects', '#projects'),
    ],
  }),
}));

/* Per-skill proficiency answers — "how good is he at python", "python level",
   "does he know react". Matched with a two-signal test (skill name + a
   proficiency word) rather than fixed phrases, so natural wording resolves. */
const PROFICIENCY_WORDS = ['good', 'level', 'know', 'knows', 'experience', 'proficient', 'skilled', 'rate', 'strong', 'expert', 'familiar', 'comfortable', 'use', 'uses'];
const skillIntents = allSkills.map((s) => {
  const skillName = s.name.toLowerCase();
  // Match the shortest distinctive token too (e.g. "numpy" from "NumPy & Pandas").
  const aliases = [skillName, ...skillName.split(/[\s&]+/).filter((w) => w.length > 2)];
  return {
    id: `skill-${s.name}`,
    weight: 3,
    test: (message) => {
      const hasSkill = aliases.some((a) => message.includes(a));
      const hasProf = PROFICIENCY_WORDS.some((w) => message.includes(` ${w}`));
      return hasSkill && hasProf ? 3 : 0;
    },
    answer: () => ({
      text: `${nickname}'s ${s.name} proficiency is ${s.type} (${s.level}%). ${s.icon}`,
      suggestions: ['Show all skills', 'Related projects'],
    }),
  };
});

const ALL_INTENTS = [...projectIntents, ...skillIntents, ...INTENTS];

const FALLBACK = {
  text: `I'm not sure about that one — I can only speak to ${nickname}'s work. Try asking about his projects, skills, experience, or how to reach him.`,
  suggestions: ['Who is Abdullah?', 'Show me projects', 'How do I contact him?'],
};

const norm = (s) => ` ${s.toLowerCase().replace(/[^\w\s]/g, ' ').replace(/\s+/g, ' ').trim()} `;

/**
 * Score every intent against the message and return the best answer.
 * Returns { text, actions?, suggestions? }.
 */
export function getAnswer(rawMessage) {
  const message = norm(rawMessage);
  const wordCount = message.trim().split(' ').length;

  let best = null;
  let bestScore = 0;

  for (const intent of ALL_INTENTS) {
    // Greeting-style intents should only fire on genuinely short messages,
    // so "hi there, what projects has he built" routes to projects instead.
    if (intent.exactShort && wordCount > 3) continue;

    let score = 0;
    if (intent.test) {
      // Custom two-signal matcher (used by skill-proficiency intents).
      score = intent.test(message);
    } else {
      for (const kw of intent.keywords) {
        if (message.includes(` ${kw} `) || message.includes(` ${kw}`) || message.includes(`${kw} `)) {
          // Longer keyword phrases are more specific → weighted higher.
          score += (kw.split(' ').length) * (intent.weight || 1);
        }
      }
    }
    if (score > bestScore) {
      bestScore = score;
      best = intent;
    }
  }

  if (!best || bestScore === 0) return FALLBACK;
  return best.answer();
}

/* Opening prompt chips shown when the chat first opens. */
export const STARTER_PROMPTS = [
  'Who is Abdullah?',
  'Show me the best projects',
  'What are his skills?',
  'Is he available for work?',
];

export const ASSISTANT_INTRO = `Hi! I'm ${nickname}'s AI assistant. Ask me anything about his projects, skills, experience, or how to get in touch. 👋`;
