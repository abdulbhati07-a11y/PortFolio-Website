export const DEVELOPER_INFO = {
  name: "Muhammad Abdullah Bhatti",
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
  certificates: "/certificate.pdf"
};

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
    id: 1,
    title: "Pet Sitting Web",
    description: "A beautifully crafted frontend for a premium pet sitting service, featuring responsive layouts, interactive components, and a polished user experience that builds trust with pet owners.",
    longDescription: "Designed and built a complete frontend for a pet sitting service platform with a focus on user trust and conversion.",
    tech: ["HTML", "CSS", "JavaScript", "Responsive Design", "Web Projects"],
    category: "Web Projects",
    featured: false,
    links: { github: "#", demo: "#" },
    gradient: "from-pink-500/20 to-purple-500/20",
    icon: "🐾"
  },
  {
    id: 2,
    title: "Laundry Service Web",
    description: "A complete frontend architecture for a laundry service platform, built with Bootstrap for rapid responsive development and a clean, professional aesthetic.",
    longDescription: "Built a complete frontend for a laundry service with service listings, scheduling UI, and responsive design.",
    tech: ["HTML", "CSS", "JavaScript", "Bootstrap", "Web Projects"],
    category: "Web Projects",
    featured: false,
    links: { github: "#", demo: "#" },
    gradient: "from-blue-500/20 to-cyan-500/20",
    icon: "👕"
  },
  {
    id: 3,
    title: "AI YouTube Video Summarizer",
    description: "A full-stack AI application that ingests YouTube video transcripts and generates concise, intelligent summaries using advanced language models via API integration.",
    longDescription: "End-to-end Flask application with YouTube transcript API integration and AI summarization capabilities.",
    tech: ["Python", "Flask", "AI/ML", "API Integration", "Full Stack"],
    category: "AI/ML",
    featured: true,
    links: { github: "https://github.com/abdulbhati07-a11y/AI-Text-Summarizer.git", demo: "#" },
    gradient: "from-cyan-500/20 to-blue-500/20",
    icon: "🤖"
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
    gradient: "from-orange-500/20 to-red-500/20",
    icon: "📊"
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
    gradient: "from-yellow-500/20 to-orange-500/20",
    icon: "🎂"
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
    gradient: "from-teal-500/20 to-green-500/20",
    icon: "💧"
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
    gradient: "from-indigo-500/20 to-purple-500/20",
    icon: "📱"
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
    color: "accent-cyan"
  },
  {
    year: "2023",
    title: "First Development Projects",
    subtitle: "Self-Taught",
    description: "Built my first web projects — Pet Sitting and Laundry Service platforms — diving deep into HTML, CSS, and JavaScript.",
    color: "accent-purple"
  },
  {
    year: "2024",
    title: "AI/ML Specialization",
    subtitle: "Data Science Track",
    description: "Began pursuing a Data Science and AI/ML specialization, building the YouTube Summarizer and exploring ML frameworks.",
    color: "accent-cyan"
  },
  {
    year: "2024",
    title: "C++ & Algorithm Mastery",
    subtitle: "Advanced Programming",
    description: "Developed the Algorithm Visualizer using C++ and OpenGL, demonstrating deep understanding of data structures and rendering.",
    color: "accent-purple"
  },
  {
    year: "2025",
    title: "Full Stack & Automation",
    subtitle: "Current",
    description: "Expanding into full-stack development, Python automation tools, and AI-integrated applications.",
    color: "accent-green"
  }
];
