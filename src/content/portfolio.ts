export const profile = {
  name: 'Muhammad Abdullah Bhatti',
  bio: 'I am a fifth-semester BS Computer Science student at the University of Management and Technology, Lahore, building web, Python and data science projects.',
  education: 'Fifth semester, BS Computer Science — University of Management and Technology, Lahore',
  email: 'abdulbha77@gmail.com',
  github: 'https://github.com/abdulbhati07-a11y',
  linkedin: 'https://www.linkedin.com/in/muhammad-abdullah-bhatti-5bab33396/',
  portrait: '/assets/abdullah-portrait.png',
} as const;

export type Project = {
  slug: string;
  title: string;
  category: 'AI' | 'Data science' | 'Web' | 'Python';
  summary: string;
  challenge: string;
  build: string;
  stack: string[];
  note?: string;
  image?: string;
  live?: string;
  source?: string;
};

export const resumes = [
  { title: 'Data Science résumé', pdf: '/assets/resumes/abdullah-data-science-resume.pdf', docx: '/assets/resumes/abdullah-data-science-resume.docx' },
  { title: 'Web Developer résumé', pdf: '/assets/resumes/abdullah-web-developer-resume.pdf', docx: '/assets/resumes/abdullah-web-developer-resume.docx' },
] as const;

export const certificates = [
  { title: 'The Ultimate Job-Ready Data Science Course', file: '/The_Ultimate_Job_Ready_Data_Science_Course_Certificate.pdf', image: '/assets/certificates/cert-data-science.jpg' },
  { title: 'Complete 2025 Python Bootcamp: Learn Python from Scratch', file: '/[English]_Complete_2025_Python_Bootcamp__Learn_Python_from_Scratch_Certificate.pdf', image: '/assets/certificates/cert-python.jpg' },
] as const;

export const journey = [
  { title: 'Computer science', detail: 'Fifth-semester BS Computer Science student at the University of Management and Technology, Lahore.' },
  { title: 'Web development', detail: 'Designing and shipping interactive sites and product interfaces.' },
  { title: 'Python practice', detail: 'Creating useful tools including a QR generator and a desktop water reminder.' },
  { title: 'Data science and AI', detail: 'Exploring data analysis, computer vision, and AI-assisted products through projects.' },
] as const;

export const projects: Project[] = [
  {
    slug: 'futurepath-ai', title: 'FuturePath AI', category: 'AI',
    summary: 'A guided decision exploration product.',
    challenge: 'Large decisions are hard to compare when tradeoffs stay abstract.',
    build: 'A guided interview organizes a decision into best, likely, and worst-case scenarios with visible assumptions.',
    note: 'Generated scenarios are possibilities, not forecasts.',
    stack: ['React', 'TypeScript', 'Groq', 'PostgreSQL'],
    image: '/assets/screenshots/futurepathai.gif', live: 'https://www.futurepathai.org/',
  },
  {
    slug: 'pawfect', title: 'PawFect', category: 'Web',
    summary: 'A pet sitting service interface.',
    challenge: 'Make services and booking approachable for pet owners.',
    build: 'Responsive service pages, a gallery, booking interface, and account and contact flows.',
    note: 'The source repository is private.',
    stack: ['React', 'Vite', 'Supabase', 'CSS'],
    image: '/assets/screenshots/pet-sitting.jpg', live: 'https://pawfect-petsitting.vercel.app/',
  },
  {
    slug: 'luna-wash', title: 'LÜNA WASH', category: 'Web',
    summary: 'A service storefront and booking experience.',
    challenge: 'Make laundry pickup options easy to browse and request.',
    build: 'A responsive storefront with plans, service catalog, booking interface and supporting routes.',
    stack: ['React', 'Express', 'Supabase', 'Three.js'],
    image: '/assets/screenshots/laundry.jpg', live: 'https://luna-washweb.vercel.app/',
    source: 'https://github.com/abdulbhati07-a11y/LunaWashweb',
  },
  {
    slug: 'ai-summarizer', title: 'AI Text Summarizer', category: 'AI',
    summary: 'A web interface for summarizing long video transcripts.',
    challenge: 'Find the central ideas in long videos without losing the source.',
    build: 'A Flask app accepts a YouTube URL, retrieves a transcript when available, and presents a structured AI summary.',
    note: 'Generated summaries should be checked against the source video. The source repository is private.',
    stack: ['Python', 'Flask', 'HTML', 'JavaScript'],
    image: '/assets/screenshots/ai-summarizer.jpg', live: 'https://ai-text-summarizer-z6yn.onrender.com/',
  },
  {
    slug: 'vision-guard', title: 'VisionGuard', category: 'Data science',
    summary: 'A computer vision research prototype for PPE safety signals.',
    challenge: 'A detected object does not automatically make a reliable safety decision.',
    build: 'A YOLO-based image pipeline explores people, protective equipment, and safe, violation or uncertain states.',
    note: 'Evaluation and deployment claims are pending evidence review. The source repository is private.',
    stack: ['Python', 'YOLO', 'Computer vision'],
  },
  {
    slug: 'ecommerce-data', title: 'E-Commerce Data', category: 'Data science',
    summary: 'Exploration of customer behavior and satisfaction.',
    challenge: 'Understand patterns in customer data and compare predictive approaches.',
    build: 'Data cleaning, exploratory analysis, feature engineering, and model comparisons.',
    note: 'Dataset provenance and evaluation figures require verification before outcome claims. The source repository is private.',
    stack: ['Python', 'pandas', 'scikit-learn'],
  },
  {
    slug: 'qr-generator', title: 'QR Code Generator', category: 'Python',
    summary: 'A small Python utility for creating QR images.',
    challenge: 'Create a QR image quickly from a website URL.',
    build: 'A command-line script accepts a URL and filename and saves a PNG.',
    stack: ['Python', 'qrcode'],
    source: 'https://github.com/abdulbhati07-a11y/QR-Code-Generator',
  },
  {
    slug: 'water-reminder', title: 'Drink Water Reminder', category: 'Python',
    summary: 'A desktop hydration reminder.',
    challenge: 'Make a simple habit reminder available while working.',
    build: 'A Python script sends periodic desktop notifications with an adjustable interval.',
    stack: ['Python', 'plyer'],
    source: 'https://github.com/abdulbhati07-a11y/Drink-water-Reminder',
  },
  {
    slug: 'protein-folding', title: 'Protein Folding Explorer', category: 'AI',
    summary: 'A browser interface for exploring protein structures.',
    challenge: 'Make a specialist bioinformatics workflow more approachable.',
    build: 'A sequence input and structure visualization workflow with a 3D molecular viewer.',
    stack: ['React', 'Three.js', 'Express'],
    image: '/assets/screenshots/protein-folding.jpg', live: 'https://protein-3d-folding-structure.vercel.app/',
    source: 'https://github.com/abdulbhati07-a11y/Protein-3d-Folding-Structure',
  },
  {
    slug: 'birthday-web', title: 'Birthday Wishing Web', category: 'Web',
    summary: 'An interactive, animated greeting experience.',
    challenge: 'Make a personal web greeting feel like an experience.',
    build: 'A multi-scene greeting interface with motion, confetti and music controls.',
    stack: ['HTML', 'CSS', 'JavaScript'],
    image: '/assets/screenshots/birthday.jpg', live: 'https://happy-birthday-interactive-web.vercel.app/',
    source: 'https://github.com/abdulbhati07-a11y/Happy-Birthday-Interactive-web',
  },
  {
    slug: 'algorithm-visualizer', title: 'Algorithm Visualizer', category: 'Web',
    summary: 'An interactive way to explore algorithms.',
    challenge: 'Make abstract algorithm steps easier to follow.',
    build: 'A visual interface that demonstrates algorithm behavior.',
    stack: ['JavaScript'],
    note: 'The source repository is private.',
  },
];

export const projectCategories = ['All', 'AI', 'Data science', 'Web', 'Python'] as const;
