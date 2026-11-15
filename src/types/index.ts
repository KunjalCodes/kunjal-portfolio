export type ProjectCategory = 
  | 'AI / Machine Learning' 
  | 'Computer Vision' 
  | 'Software Engineering' 
  | 'Experiments';

export type ProjectStatus = 
  | 'Production' 
  | 'Active Development' 
  | 'Research Prototype' 
  | 'Exploratory';

export interface ArchitectureLayer {
  name: string;
  technologies: string[];
  description: string;
}

export interface EngineeringChallenge {
  challenge: string;
  solution: string;
  outcome?: string;
}

export interface ProjectScreenshot {
  title: string;
  caption: string;
  type: 'ui' | 'architecture' | 'pipeline' | 'demo';
  placeholderText?: string;
}

export interface ProjectMetric {
  label: string;
  value: string;
  note?: string;
}

export interface Project {
  id: string;
  slug: string;
  title: string;
  subtitle: string;
  category: ProjectCategory;
  status: ProjectStatus;
  timeframe: string;
  shortDescription: string;
  tags: string[];
  featured: boolean;
  
  // Detailed case study fields
  problemStatement: string;
  projectOverview: string;
  architecture: {
    summary: string;
    diagramDescription?: string;
    layers: ArchitectureLayer[];
  };
  technicalImplementation: {
    aspect: string;
    description: string;
    codeSnippet?: string;
    language?: string;
  }[];
  engineeringChallenges: EngineeringChallenge[];
  demonstrations: ProjectScreenshot[];
  actualResults: string[];
  limitations: string[];
  githubUrl?: string;
  demoUrl?: string;
  metrics?: ProjectMetric[];
}

export interface LabNote {
  id: string;
  slug: string;
  title: string;
  date: string;
  category: 'Computer Vision' | 'OCR & Document AI' | 'LLM Engineering' | 'Systems & Performance';
  readTime: string;
  summary: string;
  tags: string[];
  hypothesis: string;
  findings: string[];
  codeSnippet?: {
    language: string;
    code: string;
    caption: string;
  };
  status: 'Published' | 'Ongoing Research';
}

export interface ExperienceItem {
  period: string;
  role: string;
  organization: string;
  location?: string;
  description: string[];
  technologies: string[];
}

export interface EducationItem {
  degree: string;
  field: string;
  institution: string;
  period: string;
  details?: string[];
}

export interface SkillCategory {
  category: string;
  skills: {
    name: string;
    level?: 'Advanced' | 'Proficient' | 'Exploring';
    note?: string;
  }[];
}

export interface CertificationItem {
  title: string;
  issuer: string;
  date: string;
  credentialId?: string;
  url?: string;
}
