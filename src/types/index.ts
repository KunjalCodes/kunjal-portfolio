export type ProjectCategory =
  | 'Agents & MCP'
  | 'Memory & Retrieval'
  | 'Applied AI';

export type ProjectStatus =
  | 'In progress'
  | 'Complete'
  | 'Prototype';

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
  /** Path under /public to a real screenshot from the project */
  image: string;
  /** Optional: render narrower (e.g. an extension popup) */
  narrow?: boolean;
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
  /** All categories the project belongs to (for filtering); defaults to [category] */
  categories?: ProjectCategory[];
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
  futureImprovements?: string[];
  dataFlowSteps?: {
    stepNumber: number;
    title: string;
    input: string;
    output: string;
    detail: string;
  }[];
  githubUrl?: string;
  demoUrl?: string;
  metrics?: ProjectMetric[];
  /** Set for work done for an employer; the code is not public */
  organization?: string;
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

export type CharacterPose = 
  | 'wave' 
  | 'walk' 
  | 'think' 
  | 'coding'
  | 'idle' 
  | 'working';

export type CharacterPosition = 
  | 'bottom-right' 
  | 'bottom-left' 
  | 'floating' 
  | 'docked-terminal' 
  | 'section-anchor';

export interface CharacterCompanionConfig {
  enabled: boolean;
  activePose: CharacterPose;
  position: CharacterPosition;
  currentSpeechBubble?: string;
  autoContextMessages: boolean;
  assetUrls: Partial<Record<CharacterPose, string>>;
}
