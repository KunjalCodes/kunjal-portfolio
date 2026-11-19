import { EducationItem, ExperienceItem, SkillCategory, CertificationItem } from '../types';

export const profile = {
  name: 'Kunjal Joshi',
  initials: 'KJ',
  brandName: 'KUNJAL.J',
  title: 'AI Engineer',
  shortIntro: 'AI Engineer · Agents · Memory · Retrieval',
  headline: 'Building things that think.',
  /** One-line positioning used in the hero and meta */
  oneLiner:
    'I build the parts that make language models useful in practice: memory that lasts, retrieval that can be trusted, and agents that use tools and cite their sources.',
  bio: [
    'I am an AI engineer. Most of my work sits between a language model and the real world: giving it memory that survives a conversation, retrieval it can trust, and tools it can call safely. The model is usually the easy part; the system around it is where things break.',
    'Right now that means AI Second Brain, a memory engine for agents built on a temporal knowledge graph and hybrid retrieval, where every answer has to cite the memory it came from. At Igniters Hub I am building a pipeline that reads furniture drawings with OCR, computer vision and an LLM, and turns them into cut lists for manufacturing.',
    'I like measuring things. My favourite result so far is a 68× retrieval speedup that came from a missing database index rather than a clever algorithm, which is a good reminder to benchmark before optimizing.',
  ],
  status: 'Open to AI engineering roles',
  location: 'Uttarakhand, India · Open to remote',

  socialLinks: {
    github: 'https://github.com/KunjalCodes',
    linkedin: 'https://www.linkedin.com/in/kunjal-joshi',
    leetcode: 'https://leetcode.com/u/KunjalCodes/',
    email: 'kunjal.joshi6412@gmail.com',
    resumeUrl: '/resume-kunjal-joshi.pdf'
  },

  skills: [
    {
      category: 'Agents and tool use',
      skills: [
        { name: 'Model Context Protocol', note: 'MCP servers and clients (FastMCP), Swiggy MCP, an MCP adapter for Second Brain' },
        { name: 'Tool-calling loops', note: 'Custom agent loops with citation checks and bounded tool rounds' },
        { name: 'Multi-agent pipelines', note: 'Planner, architect, coder and enhancer roles' },
        { name: 'LLM APIs', note: 'Gemini, Groq, local models with Ollama' },
      ],
    },
    {
      category: 'Memory and retrieval',
      skills: [
        { name: 'RAG', note: 'Chunking, embeddings, grounded prompting' },
        { name: 'Hybrid retrieval', note: 'Graph + vector + keyword, multi-hop traversal' },
        { name: 'Knowledge graphs', note: 'Neo4j, temporal validity windows, entity resolution' },
        { name: 'Vector search', note: 'pgvector, ChromaDB, Sentence Transformers' },
      ],
    },
    {
      category: 'Models and ML',
      skills: [
        { name: 'LLMs and NLP', note: 'Summarization and sentiment models, fine-tuning' },
        { name: 'Hugging Face Transformers' },
        { name: 'LangChain' },
        { name: 'scikit-learn and TensorFlow' },
        { name: 'OCR and computer vision', note: 'OpenCV, drawing extraction at Igniters Hub' },
      ],
    },
    {
      category: 'Engineering',
      skills: [
        { name: 'Python', note: 'FastAPI, asyncio, Pydantic' },
        { name: 'TypeScript and JavaScript', note: 'React, Next.js, Node.js, Chrome extensions' },
        { name: 'PostgreSQL, MySQL, Neo4j' },
        { name: 'Java, C++, Swift' },
        { name: 'Git and Linux' },
      ],
    },
  ] as SkillCategory[],

  education: [
    {
      degree: 'B.Tech',
      field: 'Computer Science and Engineering',
      institution: 'Birla Institute of Applied Sciences (UTU), Bhimtal',
      period: 'Graduated June 2026',
      details: [
        'CGPA 7.0',
        'Coursework in algorithms, data structures, operating systems, networks, databases and object-oriented programming',
      ]
    }
  ] as EducationItem[],

  experience: [
    {
      period: 'Sep 2026 – present',
      role: 'Software Developer',
      organization: 'Igniters Hub',
      location: 'India',
      description: [
        'Building an AI system that reads furniture engineering drawings with OCR, computer vision and an LLM, generates the cut list and sends it to the cutting optimizer',
        'Automating dimension and component extraction for downstream furniture engineering',
        'Full-stack work across frontend, backend, APIs and system integration',
      ],
      technologies: ['Python', 'FastAPI', 'OCR', 'OpenCV', 'LLMs', 'React', 'TypeScript'],
    },
    {
      period: 'Feb 2026 – Aug 2026',
      role: 'Software Developer Intern',
      organization: 'Igniters Hub',
      location: 'India',
      description: [
        'Built web applications with JavaScript, Node.js and REST APIs',
        'Built interactive 2D and 3D visualization workflows with Three.js',
        'Worked on API integration, debugging, system design and performance',
      ],
      technologies: ['JavaScript', 'Node.js', 'Three.js', 'REST APIs'],
    },
    {
      period: 'Jul 2025 – Aug 2025',
      role: 'AI Intern',
      organization: 'ACTECAL Pvt. Ltd.',
      location: 'India',
      description: [
        'Worked with LLMs, fine-tuning and NLP using Python and Hugging Face Transformers',
        'Built text summarization and sentiment analysis applications on transformer models',
      ],
      technologies: ['Python', 'Hugging Face', 'Transformers', 'PyTorch', 'NLP'],
    },
  ] as ExperienceItem[],

  achievements: [
    'Cut graph retrieval from about 39.5 s to 0.58 s on a 10,000-node benchmark in AI Second Brain',
    'HackerRank: 5 stars in Java and Python, rank 1',
    'LeetCode: 100+ problems solved',
    'Secretary of the college technical society (300+ members): ran workshops, hackathons and coding sessions',
  ],

  certifications: [
    {
      title: 'Generative AI Certification',
      issuer: 'DeepLearning.AI / Industry Certification',
      date: ''
    },
    {
      title: 'Machine Learning Specialization',
      issuer: 'Stanford Online / DeepLearning.AI',
      date: ''
    }
  ] as CertificationItem[]
};
