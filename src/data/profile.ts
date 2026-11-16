import { EducationItem, ExperienceItem, SkillCategory, CertificationItem } from '../types';

export const profile = {
  name: 'Kunjal Joshi',
  initials: 'KJ',
  brandName: 'KUNJAL.J',
  title: 'Computer Science Engineer · AI Engineering & Software Development',
  shortIntro: 'AI Engineering · Software Development',
  headline: 'Building things that think.',
  bio: [
    'I am a Computer Science Engineer specializing in AI engineering, computer vision pipelines, and high-performance software systems. My work focuses on bridging the gap between classical deterministic algorithms and contemporary deep learning models.',
    'I design systems that extract structured intelligence from unstructured physical representations—such as architectural blueprints, dense engineering schematics, and spatial layouts. I believe in clean architectures, measured performance, and interfaces that give developers and domain specialists complete clarity over complex technical workflows.',
    'Currently exploring multimodal computer vision systems, constrained LLM tool orchestration, and performant web graphics.'
  ],
  status: 'Open to AI Engineering & Systems Software Opportunities',
  location: 'India / Remote',
  
  socialLinks: {
    github: 'https://github.com/kunjaljoshi',
    linkedin: 'https://linkedin.com/in/kunjaljoshi',
    email: 'kunjaljoshi@example.com', // Professional placeholder
    resumeUrl: '/resume-kunjal-joshi.pdf'
  },

  skills: [
    {
      category: 'AI & Machine Learning',
      skills: [
        { name: 'Python', level: 'Advanced' },
        { name: 'PyTorch', level: 'Proficient' },
        { name: 'Multimodal Vision Models (Gemini, GPT-4o)', level: 'Advanced' },
        { name: 'LLM Orchestration & Prompt Optimization', level: 'Advanced' },
        { name: 'Local Inference (Ollama, llama.cpp, GBNF)', level: 'Proficient' },
        { name: 'Vector Embeddings & Semantic Search', level: 'Proficient' }
      ]
    },
    {
      category: 'Computer Vision & Document AI',
      skills: [
        { name: 'OpenCV (C++ / Python)', level: 'Advanced' },
        { name: 'EasyOCR & Tesseract', level: 'Advanced' },
        { name: 'Morphological Image Processing', level: 'Advanced' },
        { name: 'Contour Analysis & Hough Transforms', level: 'Advanced' },
        { name: 'Perspective & Affine Warping', level: 'Advanced' },
        { name: 'Document Layout Segmentation', level: 'Proficient' }
      ]
    },
    {
      category: 'Software Engineering & Systems',
      skills: [
        { name: 'TypeScript / JavaScript', level: 'Advanced' },
        { name: 'React & Modern Frontend Architecture', level: 'Advanced' },
        { name: 'HTML5 Canvas & Konva.js', level: 'Proficient' },
        { name: 'FastAPI / Python Web Services', level: 'Proficient' },
        { name: 'Git & Version Control Workflows', level: 'Advanced' },
        { name: 'REST APIs & WebSocket Systems', level: 'Proficient' }
      ]
    },
    {
      category: 'Engineering Methodologies',
      skills: [
        { name: 'Deterministic CV / Deep Learning Hybrid Design' },
        { name: 'Spatial Indexing & 2D Vector Geometry' },
        { name: 'Algorithmic Profiling & Latency Benchmarking' },
        { name: 'Technical Documentation & Case Study Writing' }
      ]
    }
  ] as SkillCategory[],

  education: [
    {
      degree: 'Bachelor of Technology (B.Tech)',
      field: 'Computer Science and Engineering',
      institution: 'Gujarat Technological University / [University Name Placeholder]',
      period: '2021 — 2025',
      details: [
        'Core coursework: Advanced Algorithms, Data Structures, Computer Vision, Deep Learning, Operating Systems, Computer Architecture, Distributed Systems.',
        'Senior Capstone Research: Automated Architectural Blueprint Takeoff using Morphological Computer Vision & Multimodal LLMs.',
        'Academic Focus: Mathematical foundations of machine vision, spatial geometric data structures, and edge model inference optimization.'
      ]
    }
  ] as EducationItem[],

  achievements: [
    'Designed & implemented a hybrid classical CV + multimodal OCR pipeline capable of parsing 300 DPI blueprint schedules into structured JSON.',
    'Authored empirical technical benchmarks evaluating morphological line filtering vs connected component labeling for technical schematics.',
    'Developed high-precision canvas-based 2D floor planning engine with sub-millimeter coordinate snapping math.'
  ],

  experience: [
    {
      period: '2024 — Present',
      role: 'AI & Computer Vision Engineer',
      organization: 'Independent Engineering / Research',
      description: [
        'Architected and implemented the AI Drawing Extraction Engine, integrating OpenCV morphological kernels and EasyOCR with Google Gemini Multimodal APIs for automated blueprint takeoff.',
        'Engineered the Mini Floor Layout Tool to evaluate high-precision 2D canvas transformation pipelines and generate parametric ground truth datasets for vision models.',
        'Authored technical deep-dives and empirical benchmarks on document boundary segmentation and GBNF grammar-constrained decoding.'
      ],
      technologies: ['Python', 'OpenCV', 'EasyOCR', 'Gemini Vision', 'React', 'TypeScript', 'Konva.js']
    },
    {
      period: '2023 — 2024',
      role: 'Software Development & ML Intern',
      organization: '[Engineering Organization / Lab]',
      description: [
        'Developed modular backend APIs and computer vision utilities for document ingestion and OCR post-processing.',
        'Collaborated on front-end reactive interfaces for visual ground-truth annotation and verification.',
        'Benchmarked algorithmic bottlenecks across image preprocessing pipelines to reduce end-to-end extraction latency.'
      ],
      technologies: ['Python', 'FastAPI', 'OpenCV', 'React', 'Tailwind CSS']
    }
  ] as ExperienceItem[],

  certifications: [
    {
      title: 'Deep Learning Specialization / Computer Vision Certificate',
      issuer: 'DeepLearning.AI / Coursera [Placeholder]',
      date: '2024',
      credentialId: 'KJ-DL-2024-CV'
    },
    {
      title: 'Machine Learning Engineering & Applied AI',
      issuer: 'Stanford Online / DeepLearning.AI [Placeholder]',
      date: '2023'
    }
  ] as CertificationItem[]
};
