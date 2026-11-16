import { EducationItem, ExperienceItem, SkillCategory, CertificationItem } from '../types';

export const profile = {
  name: 'Kunjal Joshi',
  initials: 'KJ',
  brandName: 'KUNJAL.J',
  title: 'AI Engineer · Software Developer',
  shortIntro: 'AI Engineering · Intelligent Agents · Systems',
  headline: 'Building things that think.',
  bio: [
    'I am a Computer Science Engineer working across applied AI, intelligent agents, retrieval systems, LLM-powered applications, and software engineering. I focus on building complete AI systems that reason, remember, and take action—not simply connecting an API to a frontend.',
    'My work spans persistent agent memory architectures (temporal knowledge graphs + vector search), Model Context Protocol (MCP) tool integration, autonomous multi-agent orchestration, and computer vision pipelines for engineering drawing extraction at Igniters Hub.',
    'I bridge foundational software engineering—type safety, low-latency graph traversals, and reproducible benchmarks—with modern language model capabilities and local inference runtimes.'
  ],
  status: 'Software Developer @ Igniters Hub · Open to Applied AI & Systems Opportunities',
  location: 'Uttarakhand / India · Remote Friendly',
  
  socialLinks: {
    github: 'https://github.com/KunjalCodes',
    linkedin: 'https://www.linkedin.com/in/kunjal-joshi',
    leetcode: 'https://leetcode.com/u/KunjalCodes/',
    email: 'kunjal.joshi6412@gmail.com',
    resumeUrl: '/resume-kunjal-joshi.pdf'
  },

  skills: [
    {
      category: 'Programming Languages',
      skills: [
        { name: 'Python', level: 'Advanced', note: 'AsyncIO, FastAPI, PyTorch, LangChain' },
        { name: 'Java', level: 'Advanced', note: 'Algorithms, Data Structures, OOP' },
        { name: 'JavaScript / TypeScript', level: 'Advanced', note: 'Node.js, Next.js, Manifest V3' },
        { name: 'C++', level: 'Proficient', note: 'Competitive Programming, High-performance logic' },
        { name: 'Swift', level: 'Proficient', note: 'Native application fundamentals' }
      ]
    },
    {
      category: 'AI / Machine Learning',
      skills: [
        { name: 'LLMs & Fine-Tuning', level: 'Advanced', note: 'Hugging Face Transformers, Ollama, Groq' },
        { name: 'Retrieval-Augmented Generation (RAG)', level: 'Advanced', note: 'Chunking, HyDE, dense + sparse retrieval' },
        { name: 'Persistent AI Memory & Graphs', level: 'Advanced', note: 'Neo4j, temporal validity windows, entity resolution' },
        { name: 'Model Context Protocol (MCP)', level: 'Advanced', note: 'Tool servers, external API orchestration' },
        { name: 'Embeddings & Vector Search', level: 'Advanced', note: 'Sentence Transformers, cosine similarity' },
        { name: 'Computer Vision & OCR', level: 'Advanced', note: 'OpenCV, EasyOCR, document layout analysis' }
      ]
    },
    {
      category: 'Frameworks & Tools',
      skills: [
        { name: 'LangChain', level: 'Advanced' },
        { name: 'Hugging Face Transformers', level: 'Advanced' },
        { name: 'Sentence Transformers', level: 'Advanced' },
        { name: 'FastAPI / Node.js REST APIs', level: 'Advanced' },
        { name: 'Three.js / Canvas Graphics', level: 'Proficient' },
        { name: 'scikit-learn & TensorFlow', level: 'Proficient' },
        { name: 'Ollama (Local LLM Inference)', level: 'Advanced' },
        { name: 'Git & Linux Development', level: 'Advanced' }
      ]
    },
    {
      category: 'Databases & Retrieval',
      skills: [
        { name: 'PostgreSQL & pgvector', level: 'Advanced', note: 'Relational storage & embedded vector search' },
        { name: 'Neo4j', level: 'Advanced', note: 'Cypher queries, multi-hop relationship graphs' },
        { name: 'ChromaDB', level: 'Advanced', note: 'Embedded document vector indexing' },
        { name: 'MySQL', level: 'Proficient', note: 'Structured schemas and relational queries' }
      ]
    }
  ] as SkillCategory[],

  education: [
    {
      degree: 'Bachelor of Technology (B.Tech)',
      field: 'Computer Science and Engineering',
      institution: 'Birla Institute of Applied Sciences (UTU) — Bhimtal, Uttarakhand',
      period: 'Graduation: June 2026',
      details: [
        'Academic Performance: CGPA: 7.0',
        'Core coursework: Advanced Algorithms, Data Structures, Operating Systems, Computer Networks, Database Management Systems, Object-Oriented Programming.',
        'Extracurricular Leadership: Secretary, College Technical Society (300+ members).'
      ]
    }
  ] as EducationItem[],

  experience: [
    {
      period: 'Sep 2026 – Present',
      role: 'Software Developer',
      organization: 'Igniters Hub',
      location: 'India',
      description: [
        'Developing full-stack and AI-powered applications, working across frontend, backend, APIs, and system integration.',
        'Building an AI-driven furniture drawing extraction system using OCR, computer vision, and LLM-based processing to extract structured information from engineering drawings.',
        'Implementing automated dimension and component extraction workflows for downstream furniture engineering processes.'
      ],
      technologies: ['Python', 'FastAPI', 'OpenCV', 'OCR', 'LLMs', 'React', 'TypeScript']
    },
    {
      period: 'Feb 2026 – Aug 2026',
      role: 'Software Developer Intern',
      organization: 'Igniters Hub',
      location: 'India',
      description: [
        'Developed web applications using JavaScript, Node.js, REST APIs, and modern frontend technologies.',
        'Built interactive 2D/3D visualization workflows using Three.js and related graphics libraries.',
        'Contributed to API integration, debugging, system design, and performance optimization.'
      ],
      technologies: ['JavaScript', 'Node.js', 'Three.js', 'REST APIs', 'Frontend Architecture']
    },
    {
      period: 'Jul 2025 – Aug 2025',
      role: 'AI Intern',
      organization: 'ACTECAL Pvt. Ltd.',
      location: 'India',
      description: [
        'Worked with LLMs, fine-tuning, and NLP using Python and Hugging Face Transformers.',
        'Built text summarization and sentiment analysis applications using transformer-based models.'
      ],
      technologies: ['Python', 'Hugging Face', 'Transformers', 'NLP', 'PyTorch']
    }
  ] as ExperienceItem[],

  achievements: [
    'HackerRank: 5 stars in Java and Python; Rank 1.',
    'LeetCode: 100+ problems solved across data structures, algorithms, dynamic programming, and graphs.',
    'Secretary, College Technical Society — led technical workshops, hackathons, and coding seminars for 300+ student members.',
    'Architected AI Second Brain, achieving graph retrieval latency reduction from ~39.5s to ~0.58s on a 10,000-node dense graph benchmark.'
  ],

  certifications: [
    {
      title: 'Generative AI Certification',
      issuer: 'DeepLearning.AI / Industry Certification',
      date: 'Verified'
    },
    {
      title: 'Machine Learning Specialization',
      issuer: 'Stanford Online / DeepLearning.AI',
      date: 'Verified'
    }
  ] as CertificationItem[]
};
