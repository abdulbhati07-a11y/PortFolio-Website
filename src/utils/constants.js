export const DEVELOPER_INFO = {
  name: "Muhammad Abdullah Bhatti",
  nickname: "Abdullah",
  role: "AI/ML-Driven Developer",
  roles: [
    "AI/ML Developer",
    "Full Stack Engineer",
    "Data Science Enthusiast",
    "Python Developer",
    "Problem Solver"
  ],
  tagline: "Building intelligent solutions with Python, AI/ML, and full-stack expertise.",
  bio: "I am a 4th Semester CS Student pursuing Data Science and AI/ML specialization. With over 1.5 years of experience in the Computer Science field, I am passionate about solving complex problems and creating premium digital experiences.",
  email: "abdulbha77@gmail.com",
  github: "https://github.com/abdulbhati07-a11y",
  linkedin: "https://www.linkedin.com/in/muhammad-abdullah-bhatti-5bab33396/",
  resume: "/Muhammad_Abdullah_Bhatti_Professional_Resume.docx",
  certificates: "/The_Ultimate_Job_Ready_Data_Science_Course_Certificate.pdf",
  available: true,
  currentlyBuilding: "AI-powered web apps"
};

// Single source of truth for accent colors used in JS (Three.js scenes,
// inline styles). Keep in sync with tailwind.config.js `accent` tokens.
export const ACCENT = {
  cyan: "#00d4ff",
  blue: "#00b4d8",
  amber: "#FFC107",
  green: "#4ade80",
  navy: "#0a1628"
};

// Real certificate PDFs living in /public. `file` is passed through encodeURI
// at render time so filenames with spaces/brackets resolve correctly.
export const CERTIFICATES = [
  {
    id: 1,
    title: "The Ultimate Job-Ready Data Science Course",
    issuer: "CodeWithHarry",
    date: "Jan 2026",
    icon: "📊",
    gradient: "bg-accent-cyan/15",
    skills: ["Data Science", "Python", "Machine Learning", "Statistics"],
    file: "/The_Ultimate_Job_Ready_Data_Science_Course_Certificate.pdf",
    thumbnail: "/assets/certificates/cert-data-science.jpg",
  },
  {
    id: 2,
    title: "Complete 2025 Python Bootcamp: Learn Python from Scratch",
    issuer: "CodeWithHarry",
    date: "Sep 2025",
    icon: "🐍",
    gradient: "bg-accent-cyan/15",
    skills: ["Python", "OOP", "Automation", "Problem Solving"],
    file: "/[English]_Complete_2025_Python_Bootcamp__Learn_Python_from_Scratch_Certificate.pdf",
    thumbnail: "/assets/certificates/cert-python.jpg",
  },
];

export const PRINCIPLES = [
  {
    icon: "🧠",
    title: "Understand before building",
    text: "Every project starts with the problem, not the framework. I break systems down to first principles — data in, decisions out — before writing a line of code.",
  },
  {
    icon: "✨",
    title: "Clean code is a feature",
    text: "Readable, modular code isn't polish — it's what lets projects grow. I refactor as I go and treat naming, structure, and tests as part of the product.",
  },
  {
    icon: "📈",
    title: "Learn in public, ship early",
    text: "From C++ visualizers to AI summarizers, I learn by building real things and iterating on feedback rather than waiting for perfect knowledge.",
  },
  {
    icon: "🎯",
    title: "Intelligence with purpose",
    text: "AI/ML is a tool for solving human problems. I focus on practical, measurable applications — automation, insight, and better decisions.",
  },
];

export const STATS = [
  { label: "Years Experience", value: 1.5, suffix: "+", decimals: 1 },
  { label: "Projects Built", value: 10, suffix: "+", decimals: 0 },
  { label: "Technologies", value: 15, suffix: "+", decimals: 0 },
  { label: "GitHub Repos", value: 8, suffix: "+", decimals: 0 }
];

export const COMPETENCY_DETAILS = {
  "Python": "Extensive experience building AI/ML models, automating tasks, and developing backend logic with Flask. Proficient in data analysis using NumPy and Pandas.",
  "C++": "Strong foundation in object-oriented programming, data structures, and algorithms. Built interactive visualizations using OpenGL.",
  "Data Science": "Passionate about extracting insights from data. Skilled in statistical analysis, data cleaning, and creating predictive models.",
  "AI/ML": "Focused on building intelligent solutions. Experienced with integrating AI APIs and training models for practical applications.",
  "Full Stack": "Capable of architecting complete web applications from the frontend (React, HTML/CSS/JS) to the backend.",
  "Web Projects": "Expertise in creating responsive, interactive, and beautifully animated frontend web applications using HTML, CSS, JavaScript, and modern design principles.",
  "SQL": "Proficient in database design, complex queries, and data management for robust applications."
};

export const PROJECT_CATEGORIES = ["All", "AI/ML", "Full Stack", "Web Projects", "Python", "C++"];

export const PROJECTS = [
  {
    id: 8,
    title: "Protein Folding Explorer",
    description: "An ML-powered web platform that predicts 3D protein structures from amino acid sequences and renders them in an interactive WebGL viewer with confidence-based coloring.",
    longDescription: "Full-stack bioinformatics application: React + Three.js 3D viewer, Express prediction API, and Supabase auth with saved prediction history.",
    tech: ["React", "Three.js", "AI/ML", "Supabase", "Express", "Full Stack"],
    category: "AI/ML",
    featured: true,
    links: {
      github: "https://github.com/abdulbhati07-a11y/Protein-3d-Folding-Structure",
      demo: "https://protein-3d-folding-structure.vercel.app/"
    },
    gradient: "bg-accent-cyan/15",
    icon: "🧬",
    logo: "/assets/logos/ai-summarizer.svg",
    screenshot: "/assets/screenshots/protein-folding.jpg",
    caseStudy: {
      challenge: "Determining a protein's 3D shape from its amino acid sequence is one of biology's hardest problems, and the tools that solve it are typically command-line pipelines out of reach for students and researchers without a computational background.",
      solution: "Built a full-stack platform that takes a raw sequence or FASTA upload, runs structure prediction through an Express API, and renders the result in a React Three Fiber viewer — three render modes (space-filling spheres, sticks, cartoon ribbon), coloring by pLDDT confidence, secondary structure, or element, twelve UI themes, and Supabase auth that persists each user's prediction history.",
      impact: "Turns a specialist bioinformatics workflow into something anyone can run in a browser — combining WebGL molecular rendering, API design, and authenticated full-stack architecture in one deployed product, shipped with CI/CD and Kubernetes manifests.",
    }
  },
  {
    id: 1,
    title: "Pet Sitting Web",
    description: "A beautifully crafted frontend for a premium pet sitting service, featuring responsive layouts, interactive components, and a polished user experience that builds trust with pet owners.",
    longDescription: "Designed and built a complete frontend for a pet sitting service platform with a focus on user trust and conversion.",
    tech: ["HTML", "CSS", "JavaScript", "Responsive Design", "Web Projects"],
    category: "Web Projects",
    featured: false,
    links: {
      github: "https://github.com/abdulbhati07-a11y/Pawfect-Petsitting.git",
      demo: "https://pawfect-petsitting.vercel.app/"
    },
    gradient: "bg-accent-cyan/15",
    icon: "🐾",
    logo: "/assets/logos/pet-sitting.svg",
    screenshot: "/assets/screenshots/pet-sitting.jpg",
    caseStudy: {
      challenge: "Pet owners need to trust a stranger with their animals — the site had to feel warm, professional, and credible from the first scroll.",
      solution: "Built a fully responsive frontend with interactive components, clear service tiers, and trust-building visual hierarchy using semantic HTML, CSS, and vanilla JavaScript.",
      impact: "A polished, conversion-focused frontend that demonstrates responsive design and UI craftsmanship without a framework.",
    }
  },
  {
    id: 2,
    title: "Laundry Service Web",
    description: "A complete frontend architecture for a laundry service platform, built with Bootstrap for rapid responsive development and a clean, professional aesthetic.",
    longDescription: "Built a complete frontend for a laundry service with service listings, scheduling UI, and responsive design.",
    tech: ["HTML", "CSS", "JavaScript", "Bootstrap", "Web Projects"],
    category: "Web Projects",
    featured: false,
    links: { github: "https://github.com/abdulbhati07-a11y/LunaWashweb.git", demo: "https://luna-washweb.vercel.app/" },
    gradient: "bg-accent-cyan/15",
    icon: "👕",
    logo: "/assets/logos/laundry.svg",
    screenshot: "/assets/screenshots/laundry.jpg",
    caseStudy: {
      challenge: "A laundry service needed a clean digital storefront with service listings and a scheduling UI that works on any device.",
      solution: "Used Bootstrap's grid system for rapid responsive development, layered with custom styling for a professional aesthetic; deployed live on Vercel.",
      impact: "Live production site with a complete booking flow UI — one of my first end-to-end deployed frontends.",
    }
  },
  {
    id: 3,
    title: "AI YouTube Video Summarizer",
    description: "A full-stack AI application that ingests YouTube video transcripts and generates concise, intelligent summaries using advanced language models via API integration.",
    longDescription: "End-to-end Flask application with YouTube transcript API integration and AI summarization capabilities.",
    tech: ["Python", "Flask", "AI/ML", "API Integration", "Full Stack"],
    category: "AI/ML",
    featured: true,
    links: {
      github: "https://github.com/abdulbhati07-a11y/AI-Text-Summarizer.git",
      demo: "https://ai-text-summarizer-z6yn.onrender.com/"
    },
    gradient: "bg-accent-cyan/15",
    icon: "🤖",
    logo: "/assets/logos/ai-summarizer.svg",
    screenshot: "/assets/screenshots/ai-summarizer.jpg",
    caseStudy: {
      challenge: "Long-form video is slow to consume. The goal: turn any YouTube video into a concise, accurate summary in seconds.",
      solution: "Built a Flask backend that ingests YouTube transcripts via API, chunks them for context limits, and generates summaries through an LLM API — served through a clean web UI.",
      impact: "A working end-to-end AI product: transcript ingestion, prompt engineering, API orchestration, and full-stack delivery in one project.",
    }
  },
  {
    id: 4,
    title: "Algorithm Visualizer",
    description: "An interactive real-time visualization tool for sorting and search algorithms, built with C++ and OpenGL, enabling deep algorithmic understanding through animation.",
    longDescription: "Real-time algorithm visualization using OpenGL rendering with step-by-step animation controls.",
    tech: ["C++", "OpenGL", "Visualization", "Data Structures"],
    category: "C++",
    featured: true,
    links: { github: "https://github.com/abdulbhati07-a11y/Algorithm-Visualizer.git", demo: "#" },
    gradient: "bg-accent-cyan/15",
    icon: "📊",
    logo: "/assets/logos/algorithm.svg",
    caseStudy: {
      challenge: "Sorting and search algorithms are abstract on paper — students grasp them faster when they can watch every comparison and swap.",
      solution: "Implemented real-time OpenGL rendering in C++ with step-by-step animation controls, visualizing each algorithm's state as it executes.",
      impact: "Demonstrates low-level graphics programming, data-structure mastery, and the ability to teach through software.",
    }
  },
  {
    id: 5,
    title: "Birthday Wishing Web",
    description: "A delightful, interactive animated web experience for birthday wishes, featuring particle effects, smooth CSS transitions, and a heartfelt multi-scene presentation.",
    longDescription: "Multi-scene animated birthday experience with confetti, music controls, and personalized messages.",
    tech: ["HTML", "CSS", "JavaScript", "Animations", "Web Projects"],
    category: "Web Projects",
    featured: false,
    links: { github: "https://github.com/abdulbhati07-a11y/Happy-Birthday-Interactive-web.git", demo: "#" },
    gradient: "bg-accent-cyan/15",
    icon: "🎂",
    logo: "/assets/logos/birthday.svg",
    caseStudy: {
      challenge: "Make a personal web greeting feel like an experience, not a static page.",
      solution: "Choreographed a multi-scene presentation with particle effects, confetti, music controls, and smooth CSS transitions — all in vanilla JavaScript.",
      impact: "A playful showcase of animation timing, scene management, and attention to delight in the details.",
    }
  },
  {
    id: 6,
    title: "Drink Water Reminder",
    description: "A smart Python desktop application that intelligently schedules and delivers hydration reminders throughout the day, built with a clean GUI and system notification support.",
    longDescription: "Python GUI app with configurable intervals, system tray integration, and daily hydration tracking.",
    tech: ["Python", "GUI", "Notifications", "Automation"],
    category: "Python",
    featured: false,
    links: { github: "https://github.com/abdulbhati07-a11y/Drink-water-Reminder.git" },
    gradient: "bg-accent-cyan/15",
    icon: "💧",
    logo: "/assets/logos/drink-water.svg",
    caseStudy: {
      challenge: "Hydration reminders only work if they're timely but not annoying.",
      solution: "Built a Python GUI app with configurable intervals, system tray integration, and native notifications that respect the user's schedule.",
      impact: "A daily-use desktop utility demonstrating Python GUI development and OS-level integration.",
    }
  },
  {
    id: 7,
    title: "QR Code Generator",
    description: "A versatile Python tool to seamlessly generate, customize, and export QR codes for URLs, text, and contact information with configurable styling options.",
    longDescription: "Feature-rich QR code generator with color customization, error correction levels, and batch export.",
    tech: ["Python", "PyQR", "File I/O", "Automation"],
    category: "Python",
    featured: false,
    links: { github: "https://github.com/abdulbhati07-a11y/QR-Code-Generator.git" },
    gradient: "bg-accent-cyan/15",
    icon: "📱",
    logo: "/assets/logos/qr-generator.svg",
    caseStudy: {
      challenge: "QR generation tools are everywhere — the goal was one that's scriptable, customizable, and batch-friendly.",
      solution: "Built a Python tool supporting color customization, error-correction levels, and batch export for URLs, text, and contact info.",
      impact: "Clean, reusable CLI/utility code showing file I/O, library integration, and automation instincts.",
    }
  }
];

export const SKILLS = {
  programming: [
    { name: "Python", level: 90, type: "Advanced", icon: "🐍" },
    { name: "C++", level: 85, type: "Advanced", icon: "⚙️" },
    { name: "JavaScript", level: 80, type: "Advanced", icon: "⚡" },
    { name: "SQL", level: 85, type: "Advanced", icon: "🗄️" }
  ],
  frameworks: [
    { name: "Flask", level: 85, type: "Advanced", icon: "🌶️" },
    { name: "React", level: 80, type: "Advanced", icon: "⚛️" },
    { name: "NumPy & Pandas", level: 85, type: "Advanced", icon: "📊" },
    { name: "TensorFlow/PyTorch", level: 75, type: "Intermediate", icon: "🧠" }
  ],
  tools: [
    { name: "Git & GitHub", level: 90, type: "Advanced", icon: "🔧" },
    { name: "VS Code", level: 90, type: "Advanced", icon: "💻" },
    { name: "Jupyter", level: 85, type: "Advanced", icon: "📓" },
    { name: "Docker", level: 70, type: "Intermediate", icon: "🐳" }
  ]
};

export const TIMELINE = [
  {
    year: "2023",
    title: "Started Computer Science Degree",
    subtitle: "University",
    description: "Began my formal CS education with a focus on programming fundamentals, data structures, and algorithms.",
    color: "accent-cyan",
    logo: "/assets/logos/timeline-2023-1.svg"
  },
  {
    year: "2023",
    title: "First Development Projects",
    subtitle: "Self-Taught",
    description: "Built my first web projects — Pet Sitting and Laundry Service platforms — diving deep into HTML, CSS, and JavaScript.",
    color: "accent-purple",
    logo: "/assets/logos/timeline-2023-2.svg"
  },
  {
    year: "2024",
    title: "AI/ML Specialization",
    subtitle: "Data Science Track",
    description: "Began pursuing a Data Science and AI/ML specialization, building the YouTube Summarizer and exploring ML frameworks.",
    color: "accent-cyan",
    logo: "/assets/logos/timeline-2024-1.svg"
  },
  {
    year: "2024",
    title: "C++ & Algorithm Mastery",
    subtitle: "Advanced Programming",
    description: "Developed the Algorithm Visualizer using C++ and OpenGL, demonstrating deep understanding of data structures and rendering.",
    color: "accent-purple",
    logo: "/assets/logos/timeline-2024-2.svg"
  },
  {
    year: "2025",
    title: "Full Stack & Automation",
    subtitle: "Current",
    description: "Expanding into full-stack development, Python automation tools, and AI-integrated applications.",
    color: "accent-green",
    logo: "/assets/logos/timeline-2025.svg"
  }
];

export const ARTICLES = [
  {
    id: 1,
    title: "Understanding Attention Mechanisms in Transformers",
    excerpt: "A deep dive into how self-attention works and why it revolutionized natural language processing, transforming the landscape of AI models.",
    date: "July 12, 2026",
    readTime: "8 min read",
    tags: ["AI/ML", "Transformers", "NLP"],
    link: "#",
    gradient: "bg-accent-cyan/15",
    icon: "🧠"
  },
  {
    id: 2,
    title: "Building Scalable Backend APIs with Flask",
    excerpt: "Best practices for architecting robust, scalable, and maintainable RESTful APIs using Python and Flask for data-intensive applications.",
    date: "June 28, 2026",
    readTime: "6 min read",
    tags: ["Python", "Flask", "Backend"],
    link: "#",
    gradient: "bg-accent-cyan/15",
    icon: "⚙️"
  },
  {
    id: 3,
    title: "Data Preprocessing: The Unsung Hero of Machine Learning",
    excerpt: "Why spending 80% of your time on data cleaning and preprocessing is crucial for building accurate and reliable predictive models.",
    date: "May 15, 2026",
    readTime: "10 min read",
    tags: ["Data Science", "Machine Learning", "Python"],
    link: "#",
    gradient: "bg-accent-cyan/10",
    icon: "📊"
  }
];

