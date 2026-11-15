import { LabNote } from '../types';

export const labNotes: LabNote[] = [
  {
    id: 'note-01',
    slug: 'blueprint-line-separation',
    title: 'Benchmarking Morphological Kernels vs. Connected Components for Blueprint Line Isolation',
    date: 'OCT 2024',
    category: 'Computer Vision',
    readTime: '6 MIN READ',
    summary: 'Evaluating classical morphological operations (dilations, structural element opens) against two-pass connected component analysis when isolating continuous wall lines from overlapping annotation text in high-DPI scans.',
    tags: ['OpenCV', 'Image Processing', 'Morphology', 'Python'],
    hypothesis: 'Rectangular structural elements with aspect ratios exceeding 40:1 will remove alphanumeric characters with less than 2% loss in wall junction continuity compared to connected component bounding filters.',
    findings: [
      'Directional morphological opening (kernel size 40x1 and 1x40) successfully eliminates >94% of standard 10pt-14pt drawing text.',
      'Wall intersections (T-junctions and cross-junctions) experience minor corner erosion which is readily reconstructed via a subsequent guided morphological dilation.',
      'Connected component filtering struggles when dimension extension lines directly touch numerical digits without whitespace gap.'
    ],
    codeSnippet: {
      language: 'python',
      code: `# Benchmark kernel execution
k_horizontal = cv2.getStructuringElement(cv2.MORPH_RECT, (45, 1))
k_vertical = cv2.getStructuringElement(cv2.MORPH_RECT, (1, 45))

isolated_h = cv2.morphologyEx(thresh_img, cv2.MORPH_OPEN, k_horizontal)
isolated_v = cv2.morphologyEx(thresh_img, cv2.MORPH_OPEN, k_vertical)
walls_only = cv2.bitwise_or(isolated_h, isolated_v)`,
      caption: 'Isolating rectilinear geometry from schematic scans.'
    },
    status: 'Published'
  },
  {
    id: 'note-02',
    slug: 'canvas-coordinate-systems',
    title: 'Matrix Transformations & Sub-pixel Accuracy in Dual Canvas CAD Viewports',
    date: 'NOV 2024',
    category: 'Systems & Performance',
    readTime: '8 MIN READ',
    summary: 'A deep dive into floating-point precision, viewport pan/zoom affine transformations, and rendering loop decoupling in browser-based 2D architectural drafting applications.',
    tags: ['Konva.js', 'Canvas API', 'TypeScript', 'CAD Architecture'],
    hypothesis: 'Decoupling the CAD scene graph coordinate space from the canvas viewport transform matrix eliminates jitter and enables infinite pan/zoom without accumulated floating point rounding artifacts.',
    findings: [
      'Storing all architectural vertices in raw millimeters (arbitrary origin) and applying a single 3x3 affine transformation during the draw pass preserves sub-millimeter precision.',
      'Splitting static background elements (orthographic grid, reference underlays) into a passive, non-interactive Canvas layer yields a 60 FPS frame rate even when actively manipulating >2,000 polygon vertices.',
      'Konva.js scene graph node hit-testing introduces minor overhead compared to manual spatial index lookup (R-tree) for complex floor plans.'
    ],
    codeSnippet: {
      language: 'typescript',
      code: `// Screen to World Space Transformation Matrix
function screenToWorld(screenX: number, screenY: number, stage: Konva.Stage): Point2D {
  const transform = stage.getAbsoluteTransform().copy().invert();
  return transform.point({ x: screenX, y: screenY });
}`,
      caption: 'Inverting stage transform to compute exact world millimeter coordinates.'
    },
    status: 'Published'
  },
  {
    id: 'note-03',
    slug: 'constrained-decoding-slm',
    title: 'Constrained Decoding: Enforcing Strict JSON Schemas with Grammar-Guided Sampling',
    date: 'DEC 2024',
    category: 'LLM Engineering',
    readTime: '5 MIN READ',
    summary: 'Observations on using GBNF (Grammar-Based Context-Free Grammar) token masks with small language models (Phi-3, Llama-3-8B) to guarantee 100% syntactically valid JSON tool arguments.',
    tags: ['Local LLMs', 'GBNF', 'Inference', 'Pydantic'],
    hypothesis: 'Applying context-free grammar constraints directly at the logits sampling phase eliminates the need for retry loops and JSON reparsing errors.',
    findings: [
      'Logits masking guarantees valid syntax with 0% parser exceptions across 1,000 test tool invocations.',
      'Constrained decoding does not degrade the semantic reasoning capability of 8B models as long as the grammar permits expressive free-form string leaves.',
      'Inference speed overhead of grammar evaluation is negligible (<1.5% token generation latency difference).'
    ],
    codeSnippet: {
      language: 'text',
      code: `root   ::= object
object ::= "{" ws "\"tool\":" ws string "," ws "\"arguments\":" ws object ws "}"
ws     ::= [ \\t\\n]*`,
      caption: 'Sample GBNF grammar snippet restricting outputs to structured tool dispatch.'
    },
    status: 'Published'
  },
  {
    id: 'note-04',
    slug: 'multimodal-vision-grounding',
    title: 'Hybrid OCR: Coupling Deterministic Bounding Boxes with Multimodal Vision Embeddings',
    date: 'JAN 2025',
    category: 'OCR & Document AI',
    readTime: '7 MIN READ',
    summary: 'Why pure end-to-end multimodal LLMs struggle with dense technical drawings, and why deterministic classical pre-segmentation remains the essential backbone of high-accuracy document AI.',
    tags: ['Multimodal AI', 'EasyOCR', 'Gemini Vision', 'Document AI'],
    hypothesis: 'Pre-cropping candidate text regions with classical spatial heuristics before sending them to multimodal vision APIs yields both higher character accuracy and a 10x reduction in token consumption.',
    findings: [
      'Direct full-image prompting of multimodal models on 4K blueprints frequently hallucinates missing dimensions in dense regions due to visual downsampling.',
      'Providing high-resolution localized bounding box crops to Gemini Flash achieves >99% transcription accuracy on cryptic architectural abbreviations while maintaining fast response times.'
    ],
    status: 'Ongoing Research'
  }
];
