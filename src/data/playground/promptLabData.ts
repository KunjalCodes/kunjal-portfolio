export interface PromptScenario {
  id: string;
  title: string;
  description: string;
  domain: string;
  systemPromptA: string;
  userPromptA: string;
  systemPromptB: string;
  userPromptB: string;
  demonstrationOutputA: {
    rawText: string;
    jsonOutput?: Record<string, any>;
    analysis: {
      status: 'failure' | 'inconsistent';
      schemaCompliance: '0%' | 'Partial';
      latencyEstimate: string;
      hallucinationRisk: 'High' | 'Moderate';
      notes: string[];
    };
  };
  demonstrationOutputB: {
    rawText: string;
    jsonOutput: Record<string, any>;
    analysis: {
      status: 'success';
      schemaCompliance: '100% Validated';
      latencyEstimate: string;
      hallucinationRisk: 'Minimal (Constrained Sampling)';
      notes: string[];
    };
  };
}

export const promptScenarios: PromptScenario[] = [
  {
    id: 'structural-schedule',
    title: 'Architectural Column & Footing Schedule Parser',
    domain: 'Computer Vision & Information Extraction',
    description: 'Demonstrating how ambiguous natural language prompts produce messy unparseable text vs. schema-constrained few-shot prompting yielding 100% deterministic JSON for downstream engineering takeoffs.',
    
    // Prompt Configuration A: Naive & Unconstrained
    systemPromptA: 'You are an AI assistant that analyzes architectural drawings and extracts data.',
    userPromptA: 'Here is the foundation drawing S-102. Please extract all the column sizes and footing sizes from the schedule table and give me the info.',
    
    // Prompt Configuration B: Production Engineered & Schema Constrained
    systemPromptB: `You are a deterministic Structural Engineering Parser API.
CRITICAL CONSTRAINTS:
1. Output MUST be strictly valid JSON matching the provided schema. Do not include introductory conversational text, markdown formatting or commentary.
2. All dimensions must be normalized to millimeters (mm). Convert feet/inches if found.
3. If any schedule parameter is unannotated, return null instead of estimating or hallucinating.
4. Verify every column mark against drawing schedule cross-references.

SCHEMA:
{
  "drawing_id": string,
  "columns": [
    { "mark": string, "width_mm": number, "depth_mm": number, "material": string }
  ],
  "footings": [
    { "mark": string, "length_mm": number, "width_mm": number, "depth_mm": number | null }
  ]
}`,
    userPromptB: `INGESTION CONTEXT:
Drawing: S-102 (Foundation & Column Grid Plan)
OCR Bounding Boxes:
- Box #1: "C1 - 450x450" (Conf: 0.95)
- Box #2: "C2 - 500x500" (Conf: 0.94)
- Box #3: "F1: 1800x1800" (Conf: 0.88)
- Box #4: "F2: 2100x2100" (Conf: 0.89)
Extract structured column and footing specifications following the required schema.`,

    demonstrationOutputA: {
      rawText: `Sure! Looking at the foundation drawing S-102, here are the columns and footings I found:

- Column C1: It is 450x450, probably millimeters, which is pretty standard for reinforced concrete columns.
- Column C2: This one is 500 by 500, likely for heavier central loads.
- Footing F1: Looks like 1800x1800 square footing. I assume the depth is around 400 or 500mm based on typical drawings.
- Footing F2: Sized at 2100x2100.

Let me know if you need any other structural calculations or rebar reinforcement details!`,
      analysis: {
        status: 'inconsistent',
        schemaCompliance: '0%',
        latencyEstimate: '~1.8s (Excess conversational tokens)',
        hallucinationRisk: 'High',
        notes: [
          'Hallucinated footing depth ("I assume depth is around 400 or 500mm") without drawing callout.',
          'Zero programmatic parsing capability—cannot be ingested directly into automated takeoff software.',
          'Missing material specification and schema metadata.'
        ]
      }
    },
    demonstrationOutputB: {
      rawText: `{"drawing_id":"S-102","columns":[{"mark":"C1","width_mm":450,"depth_mm":450,"material":"Concrete C30/37"},{"mark":"C2","width_mm":500,"depth_mm":500,"material":"Concrete C30/37"}],"footings":[{"mark":"F1","length_mm":1800,"width_mm":1800,"depth_mm":null},{"mark":"F2","length_mm":2100,"width_mm":2100,"depth_mm":null}]}`,
      jsonOutput: {
        drawing_id: 'S-102',
        columns: [
          { mark: 'C1', width_mm: 450, depth_mm: 450, material: 'Concrete C30/37' },
          { mark: 'C2', width_mm: 500, depth_mm: 500, material: 'Concrete C30/37' }
        ],
        footings: [
          { mark: 'F1', length_mm: 1800, width_mm: 1800, depth_mm: null },
          { mark: 'F2', length_mm: 2100, width_mm: 2100, depth_mm: null }
        ]
      },
      analysis: {
        status: 'success',
        schemaCompliance: '100% Validated',
        latencyEstimate: '~420ms (Constrained token generation)',
        hallucinationRisk: 'Minimal (Constrained Sampling)',
        notes: [
          'Correctly emitted null for missing depth callouts without hallucinating values.',
          'Strict compliance with programmatic JSON schema; immediate ingestion into CAD/BIM database.',
          '65% fewer tokens generated, improving inference throughput.'
        ]
      }
    }
  },
  {
    id: 'cad-egress-compliance',
    title: 'Egress Clearance & Fire Safety Compliance Evaluator',
    domain: 'Rule-Guided Spatial Reasoning',
    description: 'Comparing loose qualitative advice against a formal compliance validation engine that enforces building code thresholds (clear door width >= 850mm).',
    
    systemPromptA: 'You are an architectural assistant. Check if doors and passages are safe and wide enough.',
    userPromptA: 'We have door D1 with width 900mm and emergency door D2 with width 750mm. Are these acceptable for a commercial corridor?',
    
    systemPromptB: `You are an automated Building Code Compliance Verification Engine (IBC 2024 / NBC Section 4).
EVALUATION RULES:
- Minimum clear passage width for standard commercial doors: 850 mm.
- Minimum clear egress width for designated emergency exit doors: 900 mm.
- Doors under minimum threshold must be flagged as "NON_COMPLIANT" with exact deficit delta in mm.

OUTPUT SPECIFICATION:
Return JSON:
{
  "evaluated_doors": [
    { "id": string, "width_mm": number, "required_min_mm": number, "compliant": boolean, "deficit_mm": number }
  ],
  "overall_verdict": "PASS" | "FAIL"
}`,
    userPromptB: `Evaluate door schedule:
- Door D1: width 900 mm, type standard corridor
- Door D2: width 750 mm, type emergency egress exit`,

    demonstrationOutputA: {
      rawText: `Well, 900mm is a fairly standard door width so D1 should generally be fine for most normal buildings. 750mm for an emergency door seems a bit on the narrower side though. In an emergency people might bottleneck. You might want to consider making it wider if possible, perhaps 800mm or more depending on local regulations.`,
      analysis: {
        status: 'inconsistent',
        schemaCompliance: '0%',
        latencyEstimate: '~1.4s',
        hallucinationRisk: 'Moderate',
        notes: [
          'Vague advice ("seems a bit on the narrower side") without citation or numerical rule check.',
          'Incorrect suggestion of 800mm which violates standard 900mm emergency exit codes.',
          'No machine-actionable verdict.'
        ]
      }
    },
    demonstrationOutputB: {
      rawText: `{"evaluated_doors":[{"id":"D1","width_mm":900,"required_min_mm":850,"compliant":true,"deficit_mm":0},{"id":"D2","width_mm":750,"required_min_mm":900,"compliant":false,"deficit_mm":150}],"overall_verdict":"FAIL"}`,
      jsonOutput: {
        evaluated_doors: [
          { id: 'D1', width_mm: 900, required_min_mm: 850, compliant: true, deficit_mm: 0 },
          { id: 'D2', width_mm: 750, required_min_mm: 900, compliant: false, deficit_mm: 150 }
        ],
        overall_verdict: 'FAIL'
      },
      analysis: {
        status: 'success',
        schemaCompliance: '100% Validated',
        latencyEstimate: '~380ms',
        hallucinationRisk: 'Minimal (Constrained Sampling)',
        notes: [
          'Deterministic code failure triggered on D2 with precise 150mm deficit highlighted.',
          'Direct boolean flag and structured verdict enables automated test pipelines in CI/CD.'
        ]
      }
    }
  }
];
