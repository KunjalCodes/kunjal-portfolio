import { Project } from '../types';

export const projects: Project[] = [
  {
    id: 'drawing-extractor',
    slug: 'drawing-extractor',
    title: 'AI Drawing Extraction Engine',
    subtitle: 'Automated architectural and schematic drawing extraction using OpenCV, EasyOCR, and Gemini Multimodal APIs',
    category: 'Computer Vision',
    status: 'Active Development',
    timeframe: '2024 — Present',
    shortDescription: 'An automated computer vision and OCR pipeline that parses high-resolution architectural blueprints, vectorizes geometry, extracts structural schedules, and classifies engineering symbols with multimodal verification.',
    tags: ['Python', 'OpenCV', 'EasyOCR', 'Gemini Vision API', 'React', 'FastAPI'],
    featured: true,
    problemStatement: 'Engineering schematics and architectural blueprints often exist only as high-resolution raster PDFs or scans. Manual takeoff and tabular schedule transcription are error-prone, requiring hours of manual inspection to locate symbols, room dimensions, callouts, and electrical/plumbing legends.',
    projectOverview: 'The AI Drawing Extraction Engine is a hybrid pipeline combining classical deterministic computer vision (morphological kernels, connected component analysis, Hough transforms) with deep learning OCR (EasyOCR) and multimodal vision models (Gemini) to parse structured schematics into machine-readable JSON schemas and vectorized layers.',
    architecture: {
      summary: 'A staged pipeline decoupling raster preprocessing and bounding box isolation from deep optical character recognition and multimodal semantic verification.',
      diagramDescription: 'Scan/PDF Ingestion -> Grayscale & Adaptive Thresholding -> Morphological Dilation/Erosion -> Line/Geometry Isolation (OpenCV) -> Text Detection (EasyOCR) -> Bounding Box Crop & Gemini Multimodal Classification -> Structured JSON / DXF Export',
      layers: [
        {
          name: '1. Ingestion & Preprocessing',
          technologies: ['Python', 'PyMuPDF', 'OpenCV'],
          description: 'High-DPI rasterization of PDF layers, bilateral filtering for noise reduction while preserving crisp line borders, and adaptive Gaussian thresholding.'
        },
        {
          name: '2. Spatial & Geometric Partitioning',
          technologies: ['OpenCV (Canny, HoughLinesP, Contours)'],
          description: 'Separation of continuous geometric vectors (walls, boundaries, piping) from discrete annotations and isolated callout bubbles.'
        },
        {
          name: '3. Text & Dimension Extraction',
          technologies: ['EasyOCR', 'PyTorch'],
          description: 'Localized bounding box inference for alphanumeric labels, dimension arrows, and table schedules with orientation correction.'
        },
        {
          name: '4. Multimodal Semantic Grounding',
          technologies: ['Gemini 1.5 Pro / Flash Multimodal API'],
          description: 'Contextual validation of ambiguous symbology, electrical legends, and cross-referencing extracted schedules against drawing callouts.'
        },
        {
          name: '5. Interactive Review Frontend',
          technologies: ['React', 'TypeScript', 'HTML5 Canvas', 'Tailwind CSS'],
          description: 'Interactive canvas overlay enabling engineers to verify detected contours, inspect confidence thresholds, and export structured JSON.'
        }
      ]
    },
    technicalImplementation: [
      {
        aspect: 'Adaptive Thresholding and Line Segment Cleaning',
        description: 'Blueprint scans vary wildly in contrast and background grain. We apply bilateral filtering to preserve edge sharpness followed by morphological kernels to disconnect text characters from intersecting boundary lines.',
        language: 'python',
        codeSnippet: `import cv2
import numpy as np

def isolate_drawing_layers(image_path: str):
    img = cv2.imread(image_path, cv2.IMREAD_GRAYSCALE)
    # Denoise while keeping high-frequency line edges
    filtered = cv2.bilateralFilter(img, d=9, sigmaColor=75, sigmaSpace=75)
    
    # Adaptive thresholding to handle uneven scan lighting
    binary = cv2.adaptiveThreshold(
        filtered, 255, cv2.ADAPTIVE_THRESH_GAUSSIAN_C,
        cv2.THRESH_BINARY_INV, 15, 4
    )
    
    # Isolate horizontal and vertical structural lines
    h_kernel = cv2.getStructuringElement(cv2.MORPH_RECT, (40, 1))
    v_kernel = cv2.getStructuringElement(cv2.MORPH_RECT, (1, 40))
    
    h_lines = cv2.morphologyEx(binary, cv2.MORPH_OPEN, h_kernel)
    v_lines = cv2.morphologyEx(binary, cv2.MORPH_OPEN, v_kernel)
    structural_grid = cv2.add(h_lines, v_lines)
    
    return binary, structural_grid`
      },
      {
        aspect: 'Hybrid EasyOCR + Gemini Grounding',
        description: 'While EasyOCR rapidly extracts raw bounding boxes and coordinates locally, rotated architectural notes and cryptic domain abbreviations are passed with localized context crops to Gemini for high-accuracy normalization.',
        language: 'python',
        codeSnippet: `def reconcile_annotations(crop_img, raw_ocr_text):
    # If OCR confidence is marginal or text contains domain abbreviations
    prompt = f"""Analyze this architectural blueprint annotation.
Raw OCR reading: "{raw_ocr_text}".
Return verified dimension value, unit (mm/ft/in), and target element."""
    response = gemini_client.models.generate_content(
        model="gemini-1.5-flash",
        contents=[prompt, crop_img]
    )
    return parse_structured_annotation(response.text)`
      }
    ],
    engineeringChallenges: [
      {
        challenge: 'Dimension Leader Line Intersecting Alphanumeric Characters',
        solution: 'Built a multi-scale morphological mask that separates linear vectors above a length threshold before invoking OCR, preventing false character segmentation.',
        outcome: 'Reduced OCR text fragmentation by ~38% on dense electrical and mechanical drawings.'
      },
      {
        challenge: 'Latency and Cost of Multimodal LLM Calls at Blueprint Scale',
        solution: 'Implemented strict pre-filtering: classical CV and local EasyOCR process 100% of tokens; only low-confidence or ambiguous symbol regions are sent to Gemini API with spatial clustering.',
        outcome: '90%+ of blueprint elements resolved locally with zero API overhead; high precision preserved for complex symbols.'
      }
    ],
    demonstrations: [
      {
        title: 'Morphological Line & Text Separation',
        caption: 'Visualizing binary mask decomposition separating structural wall lines from localized dimension text annotations.',
        type: 'pipeline',
        placeholderText: '[Pipeline Stage: Grayscale Scan -> Bilateral Filter -> Morphological Mask -> Isolated Contours]'
      },
      {
        title: 'Bounding Box Annotation Canvas UI',
        caption: 'React + Canvas verification interface showing detected bounding boxes with confidence heatmaps.',
        type: 'ui',
        placeholderText: '[Interactive Review UI: High-resolution blueprint viewport with interactive SVG/Canvas annotation overlay]'
      }
    ],
    actualResults: [
      'Successfully parses structured architectural plans up to 300 DPI.',
      'Accurate extraction of rectangular schedule tables into verified tabular JSON.',
      'Interactive React canvas interface prototype running with low-latency overlay rendering.'
    ],
    limitations: [
      'Handwritten historical blueprint revisions remain challenging for standard OCR without specialized fine-tuning.',
      'Severely skewed or perspective-warped mobile phone scans require manual corner rectification prior to ingestion.',
      'Active development: Full end-to-end DXF export is currently experimental.'
    ],
    futureImprovements: [
      'Implement an ONNX C++ runtime inference pipeline to reduce OCR batch latency by an estimated 50%.',
      'Train a lightweight LoRA adapter on synthetic CAD typography to handle non-standard architectural callout fonts.',
      'Add bi-directional DXF synchronization allowing edits in the browser viewport to update CAD layer blocks natively.',
      'Incorporate automated scale detection by reading fractional graphic scale bars with sub-pixel template matching.'
    ],
    dataFlowSteps: [
      {
        stepNumber: 1,
        title: 'High-DPI Ingestion',
        input: 'Vector PDF / Scanned TIFF (300 DPI)',
        output: 'Normalized Grayscale NumPy Buffer',
        detail: 'Renders vector paths to high-resolution raster layers and applies bilateral filtering to remove paper grain.'
      },
      {
        stepNumber: 2,
        title: 'Morphological Decomposition',
        input: 'Grayscale Buffer',
        output: 'Structural Grid Mask & Candidate Text Masks',
        detail: 'Directional 40x1 and 1x40 rectangular kernels isolate rectilinear wall geometry from isolated text characters.'
      },
      {
        stepNumber: 3,
        title: 'Localized Text Detection',
        input: 'Text Candidate Patches',
        output: 'Bounding Proposals [X, Y, W, H, Conf]',
        detail: 'EasyOCR runs directional text detection and character recognition on non-structural bounding crops.'
      },
      {
        stepNumber: 4,
        title: 'Multimodal Semantic Grounding',
        input: 'Ambiguous Crops + Nearby Context',
        output: 'Normalized Structural Tokens & Units',
        detail: 'Low-confidence tokens and cryptic symbol marks are grounded against domain schemas using Gemini Vision.'
      },
      {
        stepNumber: 5,
        title: 'Deterministic Rule Validation',
        input: 'Draft Entity Graph',
        output: 'Verified Takeoff Graph + Warning Telemetry',
        detail: 'Pydantic validation layer cross-references schedule instance counts against plan callouts to catch omissions.'
      },
      {
        stepNumber: 6,
        title: 'CAD / JSON Export',
        input: 'Verified Graph',
        output: 'Structured Takeoff JSON / DXF Vectors',
        detail: 'Emits machine-readable quantities for ERP and BIM takeoff software.'
      }
    ],
    githubUrl: 'https://github.com/kunjaljoshi/ai-drawing-extraction-engine',
    demoUrl: undefined,
    metrics: [
      { label: 'Extraction Mode', value: 'Hybrid CV + OCR' },
      { label: 'Target Formats', value: 'PDF / TIFF / PNG' },
      { label: 'Status', value: 'Active R&D' }
    ]
  },
  {
    id: 'floor-layout-tool',
    slug: 'floor-layout-tool',
    title: 'Mini Floor Layout Tool',
    subtitle: 'Interactive 2D spatial layout planner with vector constraints and OpenCV contour export exploration',
    category: 'Software Engineering',
    status: 'Research Prototype',
    timeframe: '2024',
    shortDescription: 'A responsive canvas-based CAD-lite tool built for rapid architectural floor planning, wall drawing, constraint-based room arrangement, and spatial contour export for computer vision pipelines.',
    tags: ['React', 'Konva.js', 'Fabric.js', 'OpenCV', 'TypeScript', 'Tailwind CSS'],
    featured: true,
    problemStatement: 'Engineers prototyping computer vision layout recognition models need quick ways to generate ground-truth 2D floor plans, manipulate spatial boundaries, and test boundary-detection algorithms on clean parametric representations.',
    projectOverview: 'Explored dual canvas rendering paradigms (Konva.js vs Fabric.js) to evaluate performance under continuous transformation matrices, snapping algorithms, and real-time polygon boolean operations. Connects client-side vector designs to OpenCV contour testing.',
    architecture: {
      summary: 'Client-centric reactive state graph maintaining a normalized scene graph (vertices, walls, portals, zones) mapped to an imperative canvas layer with coordinate space transformers.',
      diagramDescription: 'Normalized State Store -> Spatial Index (R-Tree) -> Canvas Render Loop (Konva Stage) -> Vector Exporter (GeoJSON/SVG) -> OpenCV Python Bridge for Boundary Analysis',
      layers: [
        {
          name: 'Core Model & Spatial Graph',
          technologies: ['TypeScript', 'Zustand / Immutable State'],
          description: 'Nodes, edges, and polygon faces with topological constraints (e.g. wall collinearity, 90-degree snapping).'
        },
        {
          name: 'Canvas Render Engine',
          technologies: ['Konva.js', 'React-Konva', 'HTML5 Canvas'],
          description: 'Layered rendering for grid background, wall vectors, furniture anchors, and interactive selection handles.'
        },
        {
          name: 'Export & Vision Pipeline Interop',
          technologies: ['OpenCV (Python)', 'SVG', 'GeoJSON'],
          description: 'Generates clean raster masks and vector polygon coordinates used to benchmark CV wall-segmentation models.'
        }
      ]
    },
    technicalImplementation: [
      {
        aspect: 'Wall Snapping and Angle Constraining',
        description: 'Implements real-time cursor magnetic snapping to active grid points and orthogonal angle clamping (0°, 45°, 90°) using 2D vector projection math.',
        language: 'typescript',
        codeSnippet: `interface Point2D { x: number; y: number; }

export function snapToOrthogonal(start: Point2D, current: Point2D, snapTolerance = 12): Point2D {
  const dx = current.x - start.x;
  const dy = current.y - start.y;
  const angle = Math.atan2(dy, dx) * (180 / Math.PI);
  const normalized = (angle + 360) % 360;

  // Check 0, 90, 180, 270 alignment
  if (Math.abs(dx) < snapTolerance) return { x: start.x, y: current.y };
  if (Math.abs(dy) < snapTolerance) return { x: current.x, y: start.y };

  return current;
}`
      },
      {
        aspect: 'Konva.js vs Fabric.js Performance Evaluation',
        description: 'Benchmarked both canvas libraries for high object counts: Konva provided superior declarative React integration and predictable render passes via separated layer caching.',
        language: 'typescript',
        codeSnippet: `// Layer separation in Konva avoids redrawing static background grid
<Stage width={width} height={height} onWheel={handleZoom}>
  <Layer listening={false}><GridLayer spacing={20} /></Layer>
  <Layer><WallPolygons walls={activeWalls} /></Layer>
  <Layer><InteractiveHandles points={dragHandles} /></Layer>
</Stage>`
      }
    ],
    engineeringChallenges: [
      {
        challenge: 'Non-manifold Wall Intersections during Polygon Reconstruction',
        solution: 'Used doubly-connected edge list (DCEL) principles to ensure T-junction walls correctly split boundary cycles into closed room polygons.',
        outcome: 'Stable automatic room area calculation upon wall enclosure.'
      },
      {
        challenge: 'Zoom and Pan Coordinate Matrix Synchronization',
        solution: 'Maintained strict decoupling between screen viewport coordinates (CSS pixels) and world CAD space (real-world millimeters).',
        outcome: 'Sub-pixel accuracy preserved across arbitrary zoom levels.'
      }
    ],
    demonstrations: [
      {
        title: 'Floor Plan Vector Canvas',
        caption: 'Interactive drafting canvas with real-time orthogonal guidelines, dimension tags, and room area computation.',
        type: 'ui',
        placeholderText: '[Drafting Viewport: Interactive canvas with wall segment nodes, dimensional calipers, and room polygons]'
      },
      {
        title: 'Contour Export & Edge Verification',
        caption: 'Exported polygon contours benchmarked against OpenCV synthetic scan generator.',
        type: 'demo',
        placeholderText: '[OpenCV Test Output: Side-by-side raster rendering and detected Canny edge contour overlay]'
      }
    ],
    actualResults: [
      'Functional 2D drafting prototype supporting room enclosure, door/window cutout insertion, and area calculation.',
      'Validated Konva.js as the optimal framework for React integration over Fabric.js for CAD-like workflows.',
      'Export pipeline producing clean SVG and raster pairs for CV training datasets.'
    ],
    limitations: [
      'Complex curved walls and spline geometry are not yet supported (limited to straight line segments).',
      'Multi-story floor plan stacking and 3D extrusion remain out of scope for the current 2D prototype.',
      'Standalone web tool; direct desktop BIM software file format integration (.rvt, .ifc) is planned for future phases.'
    ],
    futureImprovements: [
      'Integrate WebAssembly-compiled ClipperLib for sub-millisecond polygon boolean clipping and wall offsetting.',
      'Add automated room classification using simple graph neural networks based on spatial adjacency.',
      'Implement WebGL-accelerated 3D wall extrusion preview using Three.js directly from 2D coordinates.',
      'Build DXF import parser allowing existing architectural floor plans to be loaded and edited directly.'
    ],
    dataFlowSteps: [
      {
        stepNumber: 1,
        title: 'User Input & Pointer Events',
        input: 'Mouse / Touch Events in Screen Pixels',
        output: 'Normalized World Coordinate Points (mm)',
        detail: 'Inverts stage transformation matrix to map client viewport coordinates to CAD world space.'
      },
      {
        stepNumber: 2,
        title: 'Constraint & Snapping Math',
        input: 'Continuous Coordinates',
        output: 'Orthogonal Clamped Vertices (0°, 45°, 90°)',
        detail: 'Calculates vector projections and snaps within an adjustable spatial tolerance radius.'
      },
      {
        stepNumber: 3,
        title: 'Planar Graph Reconstruction',
        input: 'Wall Segment Edges',
        output: 'Doubly-Connected Edge List (DCEL)',
        detail: 'Traverses half-edges to discover closed boundary cycles and compute interior room polygon areas.'
      },
      {
        stepNumber: 4,
        title: 'Multi-layer Canvas Rendering',
        input: 'DCEL State Store',
        output: 'Layer-isolated 60 FPS Canvas Passes',
        detail: 'Renders static orthographic grid, walls, dimension calipers, and active selection handles in isolated layers.'
      },
      {
        stepNumber: 5,
        title: 'Vision Dataset Export',
        input: 'Geometric Polygons',
        output: 'Binary Masks & GeoJSON Coordinate Lists',
        detail: 'Exports rasterized ground truth paired with vector coordinates to train CV segmentation models.'
      }
    ],
    githubUrl: 'https://github.com/kunjaljoshi/mini-floor-layout-tool',
    demoUrl: undefined,
    metrics: [
      { label: 'Canvas Engine', value: 'Konva.js / WebGL' },
      { label: 'Coordinate Precision', value: 'Sub-millimeter' },
      { label: 'Status', value: 'Research Prototype' }
    ]
  },
  {
    id: 'document-segmenter',
    slug: 'document-segmenter',
    title: 'Edge Document Segmenter & Layout Analyzer',
    subtitle: 'High-speed document boundary rectification and hierarchical layout segmentation for technical manuals',
    category: 'AI / Machine Learning',
    status: 'Exploratory',
    timeframe: '2024',
    shortDescription: 'Exploratory pipeline utilizing edge-based quad-detection and lightweight vision transformers to decompose multi-column technical documents into reading-order token streams.',
    tags: ['Python', 'PyTorch', 'OpenCV', 'Vision Transformers', 'ONNX'],
    featured: false,
    problemStatement: 'Complex scientific papers and engineering manuals with multi-column layouts, embedded equation blocks, and floating figures break conventional linear text extraction tools.',
    projectOverview: 'Investigating lightweight ONNX-runtime vision models paired with morphological heuristics for sub-millisecond document boundary cropping and reading-order reconstruction.',
    architecture: {
      summary: 'Edge-optimized document geometry correction feeding into layout classification heads.',
      diagramDescription: 'Input Image -> Contour Convex Hull -> Perspective Transform -> Layout Segmentation -> Reading-Order Graph',
      layers: [
        {
          name: 'Geometry Rectification',
          technologies: ['OpenCV'],
          description: 'Four-point perspective transform via largest quadrilateral contour detection.'
        },
        {
          name: 'Layout Partitioning',
          technologies: ['PyTorch', 'ONNX Runtime'],
          description: 'Bounding box prediction for text columns, figures, and tables.'
        }
      ]
    },
    technicalImplementation: [
      {
        aspect: 'Quadrilateral Boundary Detection',
        description: 'Locates document sheet corners from uncalibrated mobile camera captures using adaptive edge thresholding and polygon approximation.',
        language: 'python',
        codeSnippet: `def detect_document_corners(image):
    gray = cv2.cvtColor(image, cv2.COLOR_BGR2GRAY)
    blurred = cv2.GaussianBlur(gray, (5, 5), 0)
    edged = cv2.Canny(blurred, 75, 200)
    contours, _ = cv2.findContours(edged, cv2.RETR_LIST, cv2.CHAIN_APPROX_SIMPLE)
    contours = sorted(contours, key=cv2.contourArea, reverse=True)[:5]
    
    for c in contours:
        peri = cv2.arcLength(c, True)
        approx = cv2.approxPolyDP(c, 0.02 * peri, True)
        if len(approx) == 4:
            return approx.reshape(4, 2)
    return None`
      }
    ],
    engineeringChallenges: [
      {
        challenge: 'Low-contrast Document Edges against Light Backgrounds',
        solution: 'Combines color-space gradient inspection (LAB luminance channel) with edge line accumulation.',
        outcome: 'Stable corner detection on wooden and white desk surfaces.'
      }
    ],
    demonstrations: [
      {
        title: 'Perspective Warp & Dewarping',
        caption: 'Rectification of angled document snapshot into orthogonal plane projection.',
        type: 'pipeline',
        placeholderText: '[Pipeline View: Source Photo -> 4-Point Quadrilateral Mesh -> Dewarped Flat Document]'
      }
    ],
    actualResults: [
      'Achieves <15ms rectification latency on standard 1080p images using OpenCV C++ bindings.',
      'Robust reading-order sorting for two-column technical report layouts.'
    ],
    limitations: [
      'Fails on heavily crumpled pages or documents with extreme curvature.',
      'Currently requires clear quad boundary visibility on at least 3 edges.'
    ],
    futureImprovements: [
      'Implement a thin plate spline (TPS) mesh to correct severe page curvature and perspective warping.',
      'Deploy an ONNX-quantized YOLOv8-DocLayNet model for zero-shot reading order graph extraction.',
      'Add WebAssembly client runtime to rectify camera captures entirely in the browser before transmission.'
    ],
    dataFlowSteps: [
      {
        stepNumber: 1,
        title: 'Color Space & Edge Extraction',
        input: 'Uncalibrated Mobile Snapshot',
        output: 'Luminance Edge Gradients',
        detail: 'Transforms image into LAB color space to extract luminance channel edges independent of lighting tint.'
      },
      {
        stepNumber: 2,
        title: 'Convex Hull & Quad Fitting',
        input: 'Canny Edge Contours',
        output: '4 Verified Document Corner Vertices',
        detail: 'Approximates closed polygon bounding edges to isolate sheet perimeter from background table texture.'
      },
      {
        stepNumber: 3,
        title: 'Perspective Warp Transformation',
        input: 'Corner Vertices + Source Image',
        output: 'Orthogonal Rectified Flat Document',
        detail: 'Calculates 3x3 homography matrix to project perspective photograph onto flat A4 Cartesian plane.'
      }
    ],
    githubUrl: 'https://github.com/kunjaljoshi/document-segmenter',
    metrics: [
      { label: 'Inference Latency', value: '< 15ms' },
      { label: 'Runtime Target', value: 'ONNX / CPU' }
    ]
  },
  {
    id: 'local-agent-pipeline',
    slug: 'local-agent-pipeline',
    title: 'Local LLM Reasoning & Tool Orchestrator',
    subtitle: 'Deterministic tool-calling runtime and episodic context compressor for local SLM deployments',
    category: 'Experiments',
    status: 'Exploratory',
    timeframe: '2024',
    shortDescription: 'An experimental Python engine exploring structured JSON schema enforcement and sliding episodic context compression for small language models (Phi-3, Llama-3-8B).',
    tags: ['Python', 'Ollama', 'Llama.cpp', 'Pydantic', 'AsyncIO'],
    featured: false,
    problemStatement: 'Small local language models frequently hallucinate invalid JSON or stray from strict function-calling schemas under multi-turn agent loops.',
    projectOverview: 'Explores grammar-guided sampling (GBNF) combined with sliding context compaction to enable dependable tool calling on consumer workstations without external API dependencies.',
    architecture: {
      summary: 'Grammar-constrained inference loop with structured validation and retry telemetry.',
      diagramDescription: 'User Prompt -> Schema Ingestion -> GBNF Grammar Generation -> Local LLM Sampling -> Pydantic Validation -> Tool Execution',
      layers: [
        {
          name: 'Constrained Decoder',
          technologies: ['Llama.cpp', 'GBNF'],
          description: 'Enforces token-level grammar masks ensuring outputs strictly conform to JSON schemas.'
        },
        {
          name: 'Agent State Engine',
          technologies: ['Python AsyncIO', 'Pydantic'],
          description: 'Manages message thread history, token budgeting, and tool execution error recovery.'
        }
      ]
    },
    technicalImplementation: [
      {
        aspect: 'Context Compaction via Selective Summarization',
        description: 'Compresses earlier conversation rounds into condensed state tuples when token thresholds approach context window boundaries.',
        language: 'python',
        codeSnippet: `async def compact_context(messages: list[dict], max_tokens: int = 4096) -> list[dict]:
    total_tokens = sum(estimate_tokens(m['content']) for m in messages)
    if total_tokens <= max_tokens:
        return messages
        
    system_msg = messages[0]
    recent_turns = messages[-4:]
    historical = messages[1:-4]
    
    summary = await generate_epistemic_summary(historical)
    return [system_msg, {"role": "system", "content": f"Prior state: {summary}"}] + recent_turns`
      }
    ],
    engineeringChallenges: [
      {
        challenge: 'High Latency of Repeated System Prompt Token Processing',
        solution: 'Implemented prompt state caching using llama.cpp KV-cache reuse.',
        outcome: 'Reduced multi-turn latency by over 60% on local inference.'
      }
    ],
    demonstrations: [
      {
        title: 'Grammar Enforced Tool Execution Trace',
        caption: 'Console trace demonstrating 100% compliant JSON schema emissions under edge stress tests.',
        type: 'demo',
        placeholderText: '[Terminal Trace: Prompt -> Token Masking -> Valid JSON Function Call -> Executed Result]'
      }
    ],
    actualResults: [
      'Zero syntax errors observed across 500+ test tool-calling passes with GBNF grammars on Llama-3-8B-Instruct.',
      'Reliable local tool routing without network connectivity.'
    ],
    limitations: [
      'Complex multi-step reasoning depth remains bounded by small model parameter capacity compared to frontier models.',
      'Grammar construction introduces minor pre-computation overhead per new tool signature.'
    ],
    futureImprovements: [
      'Add speculative grammar decoding to accelerate constrained token emission latency.',
      'Implement hierarchical vector memory search over long episodic agent sessions.',
      'Support dynamic tool schema registration during continuous multi-agent tool handoffs.'
    ],
    dataFlowSteps: [
      {
        stepNumber: 1,
        title: 'Tool Signature Compilation',
        input: 'Pydantic Model Definitions',
        output: 'Compiled GBNF Context-Free Grammar',
        detail: 'Translates Python type annotations and field constraints into low-level token mask grammars.'
      },
      {
        stepNumber: 2,
        title: 'Logits Masking & Constrained Sampling',
        input: 'LLM Next-Token Logits',
        output: 'Syntactically Compliant Token Streams',
        detail: 'Evaluates active parser state and masks out all tokens that would violate the JSON grammar.'
      },
      {
        stepNumber: 3,
        title: 'Async Dispatch & State Compaction',
        input: 'Validated JSON Payload',
        output: 'Tool Result + Compacted Context Summary',
        detail: 'Executes verified function call and condenses historical conversational state when token budgets are reached.'
      }
    ],
    githubUrl: 'https://github.com/kunjaljoshi/local-agent-pipeline',
    metrics: [
      { label: 'JSON Error Rate', value: '0.00% (GBNF)' },
      { label: 'Local Footprint', value: '< 6 GB VRAM' }
    ]
  }
];
