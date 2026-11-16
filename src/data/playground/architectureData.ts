export type ComponentTier = 'Client Tier' | 'Ingestion & API' | 'Computer Vision Core' | 'Multimodal AI' | 'Verification & Storage';

export interface ArchitectureComponent {
  id: string;
  name: string;
  shortLabel: string;
  tier: ComponentTier;
  status: 'Implemented' | 'Conceptual Extension';
  purpose: string;
  inputs: string[];
  outputs: string[];
  technologies: string[];
  engineeringConsiderations: string[];
  failureModesAndFallbacks: {
    failure: string;
    fallback: string;
  }[];
}

export const architectureComponents: ArchitectureComponent[] = [
  {
    id: 'frontend',
    name: 'Interactive Review & CAD Viewport',
    shortLabel: 'Frontend UI',
    tier: 'Client Tier',
    status: 'Implemented',
    purpose: 'Provides human-in-the-loop inspection of detected drawing layers, confidence heatmaps, bounding box verification, and export trigger controls.',
    inputs: [
      'Raw PDF/TIFF drawing uploads from engineer',
      'Extracted bounding box and vector geometry JSON from backend',
      'Validation warning telemetry'
    ],
    outputs: [
      'Interactive canvas render passes (Konva.js / WebGL)',
      'Engineer manual bounding box corrections and confirmations',
      'DXF / GeoJSON / JSON file downloads'
    ],
    technologies: ['React 18', 'TypeScript', 'HTML5 Canvas', 'Konva.js', 'Tailwind CSS'],
    engineeringConsiderations: [
      'Separates static background grid layers from interactive vector polygons to maintain 60 FPS viewport zooming.',
      'Maintains dual coordinate space: screen CSS pixels decoupled from CAD millimeter world coordinates.'
    ],
    failureModesAndFallbacks: [
      {
        failure: 'Large 4K raster canvas crashing mobile browser memory',
        fallback: 'Client-side resolution clamping to 1080p preview with full-resolution bounding box normalization.'
      }
    ]
  },
  {
    id: 'backend-api',
    name: 'Ingestion & Asynchronous API Gateway',
    shortLabel: 'Backend / API',
    tier: 'Ingestion & API',
    status: 'Implemented',
    purpose: 'Handles multipart binary PDF/raster uploads, runs asynchronous job orchestration, and validates request payloads.',
    inputs: [
      'Multipart file upload streams (PDF, TIFF, PNG)',
      'Extraction parameter presets (DPI, noise thresholds, target disciplines)'
    ],
    outputs: [
      'Dispatched pipeline task IDs',
      'WebSocket progressive stage status updates',
      'Serialized extraction response payload'
    ],
    technologies: ['FastAPI (Python)', 'AsyncIO', 'PyMuPDF (fitz)', 'Pydantic v2'],
    engineeringConsiderations: [
      'Non-blocking async task worker pool prevents compute-heavy CV processing from stalling REST endpoints.',
      'Strict schema validation on pipeline input parameters via Pydantic.'
    ],
    failureModesAndFallbacks: [
      {
        failure: 'Corrupted or password-protected PDF upload',
        fallback: 'Immediate pre-flight validation rejection before invoking heavy GPU or memory resources.'
      }
    ]
  },
  {
    id: 'image-processing',
    name: 'Deterministic Morphological Preprocessing',
    shortLabel: 'Image Processing',
    tier: 'Computer Vision Core',
    status: 'Implemented',
    purpose: 'Decomposes raw raster scans into isolated geometric line masks, filters scanner grain, and removes interfering leader lines before OCR invocation.',
    inputs: [
      'High-DPI grayscale or RGB raster image buffer (300 DPI)'
    ],
    outputs: [
      'Bilateral-filtered de-noised image buffer',
      'Adaptive Gaussian binary threshold mask',
      'Structural grid line masks (horizontal & vertical)',
      'Candidate text region bounding boxes'
    ],
    technologies: ['OpenCV (C++ / Python)', 'NumPy', 'Bilateral Filter', 'Morphological Kernels'],
    engineeringConsiderations: [
      'Directional morphological opening (40x1 and 1x40 kernels) strips text characters from intersecting boundary vectors with <2% loss in line continuity.',
      'Adaptive Gaussian thresholding compensates for uneven physical scanner lighting gradients.'
    ],
    failureModesAndFallbacks: [
      {
        failure: 'Severe mobile photograph perspective distortion',
        fallback: 'Four-point perspective corner rectification algorithm detects outer sheet borders and flattens plane.'
      }
    ]
  },
  {
    id: 'ocr-engine',
    name: 'Localized Deep OCR & Text Extraction',
    shortLabel: 'OCR Engine',
    tier: 'Computer Vision Core',
    status: 'Implemented',
    purpose: 'Locates and transcribes alphanumeric annotations, dimension numbers, column callouts, and schedule tables.',
    inputs: [
      'Candidate text region bounding crops from preprocessing stage'
    ],
    outputs: [
      'Extracted text strings with localized coordinates [x, y, w, h]',
      'Per-character confidence scores (0.00 - 1.00)',
      'Text rotation angle classifications (0°, 90°, 270°)'
    ],
    technologies: ['EasyOCR', 'PyTorch', 'Directional NMS', 'CRAFT Text Detector'],
    engineeringConsiderations: [
      'Runs inference only on filtered candidate bounding boxes rather than full 4K frame, reducing latency by 4x.',
      'Directional non-maximum suppression prevents duplicate overlapping box proposals.'
    ],
    failureModesAndFallbacks: [
      {
        failure: 'Low confidence score (< 0.75) on rotated architectural abbreviations',
        fallback: 'Flagged for multimodal LLM visual context disambiguation in the next pipeline stage.'
      }
    ]
  },
  {
    id: 'multimodal-llm',
    name: 'Multimodal AI Semantic Disambiguation',
    shortLabel: 'Multimodal LLM',
    tier: 'Multimodal AI',
    status: 'Implemented',
    purpose: 'Grounds ambiguous symbology, electrical legends, and rotated text annotations with spatial drawing context into normalized entities.',
    inputs: [
      'High-resolution localized image crop of ambiguous region',
      'Raw OCR transcription and adjacent context tokens',
      'Strict Pydantic JSON schema constraints'
    ],
    outputs: [
      'Disambiguated entity classification (e.g. Footing F1 vs Column C1)',
      'Normalized engineering units (standardized to mm)',
      'Tabular schedule cross-reference validations'
    ],
    technologies: ['Google Gemini 1.5 Flash/Pro', 'Local SLM with GBNF (Ollama/llama.cpp)', 'Pydantic'],
    engineeringConsiderations: [
      'Strict pre-filtering: 90%+ of standard text is handled by local classical CV/OCR; Gemini is invoked selectively on ambiguous regions to control latency and token costs.',
      'Few-shot schema prompting and grammar-constrained decoding eliminate hallucinations.'
    ],
    failureModesAndFallbacks: [
      {
        failure: 'API rate limit or connectivity timeout',
        fallback: 'Fallback to deterministic rule-based heuristic parser with UI confidence warning tag.'
      }
    ]
  },
  {
    id: 'validation-layer',
    name: 'Deterministic Cross-Validation & Code Rules',
    shortLabel: 'Validation Engine',
    tier: 'Verification & Storage',
    status: 'Implemented',
    purpose: 'Applies engineering domain rules to detect missing dimensions, structural anomalies, disconnected wall graphs, and schedule mismatches.',
    inputs: [
      'Parsed geometric and alphanumeric entity graph'
    ],
    outputs: [
      'Validated component list',
      'Critical validation error list (blocking downstream CAD export)',
      'Non-critical engineering warnings'
    ],
    technologies: ['Pydantic v2', 'Python Rule Engine', 'Graph Topological Sort'],
    engineeringConsiderations: [
      'Cross-checks extracted schedule counts against physical bounding box instances on the drawing plan.',
      'Ensures closed room polygon cycles have topological manifold integrity.'
    ],
    failureModesAndFallbacks: [
      {
        failure: 'Missing elevation or depth parameter in drawing schedule',
        fallback: 'Automatic fallback to structural default standards with flagged warning code (e.g. WARN_SCHEDULE_DEPTH_OMISSION).'
      }
    ]
  },
  {
    id: 'spatial-db',
    name: 'Spatial Indexing & Persistent Store',
    shortLabel: 'Spatial Database',
    tier: 'Verification & Storage',
    status: 'Conceptual Extension',
    purpose: 'Stores vectorized blueprint entities, spatial R-tree indexes for bounding box proximity queries, and audit history across drawing revisions.',
    inputs: [
      'Validated spatial entity coordinates and revision metadata'
    ],
    outputs: [
      'Rapid spatial range queries (e.g., all fixtures inside Room 101)',
      'Cross-drawing revision diff comparisons'
    ],
    technologies: ['PostgreSQL / PostGIS', 'R-Tree Spatial Index', 'AWS S3 (Vectorized DXF Archive)'],
    engineeringConsiderations: [
      'Sub-millisecond bounding box containment queries using R-tree spatial indexing.',
      'Immutable revision storage ensuring traceability back to original high-DPI scan.'
    ],
    failureModesAndFallbacks: [
      {
        failure: 'Database connection latency spike',
        fallback: 'In-memory Redis spatial cache for active session viewport rendering.'
      }
    ]
  },
  {
    id: 'export-engine',
    name: 'Structured CAD & BIM Exporter',
    shortLabel: 'CAD Exporter',
    tier: 'Verification & Storage',
    status: 'Implemented',
    purpose: 'Serializes the validated spatial entity graph into industry-standard exchange formats (GeoJSON, DXF, IFC, and JSON Takeoff Schema).',
    inputs: [
      'Validated entity graph and coordinate transformations'
    ],
    outputs: [
      'Structured JSON takeoff dataset',
      'AutoCAD DXF vector layers (Walls, Columns, Text, Dimensions)',
      'Direct client-side clipboard payload'
    ],
    technologies: ['ezdxf (Python)', 'GeoJSON Spec', 'JSON Schema v1'],
    engineeringConsiderations: [
      'Separates CAD layers so engineers can toggle annotations, structural vectors, and furniture independently.',
      'Validates all output against a published JSON schema before serving.'
    ],
    failureModesAndFallbacks: [
      {
        failure: 'DXF entity export syntax error',
        fallback: 'Fallback to universal GeoJSON vector payload with client-side conversion.'
      }
    ]
  }
];
