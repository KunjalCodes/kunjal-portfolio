export interface BoundingBox {
  id: string;
  x: number; // percentage (0 - 100)
  y: number; // percentage (0 - 100)
  width: number;
  height: number;
  text: string;
  confidence: number;
  type: 'dimension' | 'room' | 'symbol' | 'schedule' | 'callout';
  status: 'valid' | 'warning' | 'error';
  validationMessage?: string;
}

export interface PipelineStageData {
  stageNumber: number;
  name: string;
  shortName: string;
  category: string;
  description: string;
  methodology: string;
  executionMetrics: {
    latency: string;
    throughput?: string;
    memory?: string;
    confidenceAvg?: string;
  };
  details: Record<string, string | number | boolean | string[]>;
}

export interface DrawingSample {
  id: string;
  name: string;
  drawingNumber: string;
  discipline: 'Architectural' | 'Structural' | 'Electrical' | 'Mechanical';
  dpi: number;
  dimensions: string;
  originalFileName: string;
  stages: {
    input: {
      previewDescription: string;
      rawFormat: string;
      colorDepth: string;
      fileSizeBytes: string;
    };
    preprocessing: {
      adaptiveThresholdC: number;
      blockSize: number;
      bilateralSigmaColor: number;
      bilateralSigmaSpace: number;
      hKernelSize: string;
      vKernelSize: string;
      noiseReductionRatio: string;
      linesIsolatedCount: number;
    };
    ocr: {
      engine: string;
      totalTokensDetected: number;
      averageConfidence: number;
      rotationCorrected: boolean;
      boxes: BoundingBox[];
    };
    aiInterpretation: {
      model: string;
      entitiesExtracted: number;
      symbolsDetected: number;
      schedulesParsed: number;
      normalizedUnits: string;
      extractedEntities: {
        entity: string;
        category: string;
        rawOcr: string;
        normalizedValue: string;
        confidence: number;
      }[];
    };
    validation: {
      rulesApplied: number;
      passedCount: number;
      warningCount: number;
      errorCount: number;
      issues: {
        code: string;
        severity: 'error' | 'warning';
        target: string;
        description: string;
        remediation: string;
      }[];
    };
    output: {
      schemaVersion: string;
      timestamp: string;
      jsonPayload: Record<string, any>;
    };
  };
}

export const sampleDrawings: DrawingSample[] = [
  {
    id: 'structural-foundation',
    name: 'Foundation & Column Grid Plan',
    drawingNumber: 'S-102',
    discipline: 'Structural',
    dpi: 300,
    dimensions: '4200 × 2970 px (A3 at 300 DPI)',
    originalFileName: 'S-102_FOUNDATION_REV_3.PDF',
    stages: {
      input: {
        previewDescription: 'High-resolution scan of reinforced concrete column layout with footing schedule and grid dimensions (Grid A-D, 1-4).',
        rawFormat: 'TIFF (Uncompressed raster converted from Vector PDF)',
        colorDepth: '8-bit Grayscale',
        fileSizeBytes: '14.2 MB'
      },
      preprocessing: {
        adaptiveThresholdC: 4,
        blockSize: 15,
        bilateralSigmaColor: 75,
        bilateralSigmaSpace: 75,
        hKernelSize: '40 × 1 Rectangular',
        vKernelSize: '1 × 40 Rectangular',
        noiseReductionRatio: '96.4%',
        linesIsolatedCount: 142
      },
      ocr: {
        engine: 'EasyOCR + PyTorch Backend (Directional Non-Max Suppression)',
        totalTokensDetected: 48,
        averageConfidence: 0.941,
        rotationCorrected: true,
        boxes: [
          { id: 'b1', x: 12, y: 15, width: 14, height: 6, text: 'GRID 1-A', confidence: 0.98, type: 'callout', status: 'valid' },
          { id: 'b2', x: 34, y: 15, width: 16, height: 6, text: '6,500 mm', confidence: 0.97, type: 'dimension', status: 'valid' },
          { id: 'b3', x: 58, y: 15, width: 16, height: 6, text: '6,500 mm', confidence: 0.96, type: 'dimension', status: 'valid' },
          { id: 'b4', x: 22, y: 35, width: 15, height: 8, text: 'C1 - 450x450', confidence: 0.95, type: 'symbol', status: 'valid' },
          { id: 'b5', x: 48, y: 35, width: 15, height: 8, text: 'C2 - 500x500', confidence: 0.94, type: 'symbol', status: 'valid' },
          { id: 'b6', x: 72, y: 35, width: 15, height: 8, text: 'C1 - 450x450', confidence: 0.92, type: 'symbol', status: 'valid' },
          { id: 'b7', x: 22, y: 65, width: 18, height: 7, text: 'F1: 1800x1800', confidence: 0.88, type: 'schedule', status: 'valid' },
          { id: 'b8', x: 48, y: 65, width: 18, height: 7, text: 'F2: 2100x2100', confidence: 0.89, type: 'schedule', status: 'valid' },
          { id: 'b9', x: 72, y: 65, width: 18, height: 7, text: 'F1: 1800x1800', confidence: 0.86, type: 'schedule', status: 'warning', validationMessage: 'Schedule depth callout missing on footing F1-East' }
        ]
      },
      aiInterpretation: {
        model: 'Gemini 1.5 Flash (Localized Bounding Crop Grounding)',
        entitiesExtracted: 24,
        symbolsDetected: 6,
        schedulesParsed: 2,
        normalizedUnits: 'Millimeters (mm)',
        extractedEntities: [
          { entity: 'Grid Span (1 to 2)', category: 'Dimension', rawOcr: '6,500 mm', normalizedValue: '6500.0', confidence: 0.99 },
          { entity: 'Grid Span (2 to 3)', category: 'Dimension', rawOcr: '6,500 mm', normalizedValue: '6500.0', confidence: 0.99 },
          { entity: 'Column Mark C1', category: 'Structural Column', rawOcr: 'C1 - 450x450', normalizedValue: '{"type":"C1","w":450,"d":450}', confidence: 0.96 },
          { entity: 'Column Mark C2', category: 'Structural Column', rawOcr: 'C2 - 500x500', normalizedValue: '{"type":"C2","w":500,"d":500}', confidence: 0.97 },
          { entity: 'Isolated Footing F1', category: 'Substructure', rawOcr: 'F1: 1800x1800', normalizedValue: '{"type":"F1","length":1800,"width":1800}', confidence: 0.94 },
          { entity: 'Isolated Footing F2', category: 'Substructure', rawOcr: 'F2: 2100x2100', normalizedValue: '{"type":"F2","length":2100,"width":2100}', confidence: 0.95 }
        ]
      },
      validation: {
        rulesApplied: 14,
        passedCount: 13,
        warningCount: 1,
        errorCount: 0,
        issues: [
          {
            code: 'WARN_SCHEDULE_DEPTH_OMISSION',
            severity: 'warning',
            target: 'Footing F1-East (Box ID: b9)',
            description: 'Footing schedule specifies plan dimensions (1800x1800) but thickness dimension is omitted on East section.',
            remediation: 'Referenced general structural note #4: Default footing thickness = 450 mm.'
          }
        ]
      },
      output: {
        schemaVersion: 'schema.kunjal.j/blueprint-takeoff/v1',
        timestamp: '2026-11-16T07:30:00Z',
        jsonPayload: {
          drawing_id: 'S-102',
          discipline: 'Structural',
          sheet_title: 'FOUNDATION & COLUMN GRID PLAN',
          units: 'mm',
          scale: '1:100',
          grid_system: {
            horizontal_axes: ['A', 'B', 'C'],
            vertical_axes: ['1', '2', '3'],
            intervals: [
              { from: '1', to: '2', dimension_mm: 6500 },
              { from: '2', to: '3', dimension_mm: 6500 }
            ],
            total_span_mm: 13000
          },
          components: {
            columns: [
              { mark: 'C1', count: 4, dimensions_mm: { width: 450, depth: 450 }, material: 'Concrete C30/37' },
              { mark: 'C2', count: 2, dimensions_mm: { width: 500, depth: 500 }, material: 'Concrete C30/37' }
            ],
            footings: [
              { mark: 'F1', count: 4, dimensions_mm: { length: 1800, width: 1800, thickness: 450 } },
              { mark: 'F2', count: 2, dimensions_mm: { length: 2100, width: 2100, thickness: 500 } }
            ]
          },
          validation_summary: {
            rules_passed: 13,
            warnings: 1,
            errors: 0,
            status: 'APPROVED_WITH_WARNINGS'
          }
        }
      }
    }
  },
  {
    id: 'architectural-floorplan',
    name: 'Residential Unit Partition Plan',
    drawingNumber: 'A-204',
    discipline: 'Architectural',
    dpi: 300,
    dimensions: '3508 × 2480 px (A4 at 300 DPI)',
    originalFileName: 'A-204_UNIT_LAYOUT_REV_2.PDF',
    stages: {
      input: {
        previewDescription: 'Architectural floor plan showing master bedroom, living lounge, modular kitchen, door swing arcs, and room area stamps.',
        rawFormat: 'PNG (Pre-rasterized scan)',
        colorDepth: '8-bit RGB',
        fileSizeBytes: '9.8 MB'
      },
      preprocessing: {
        adaptiveThresholdC: 5,
        blockSize: 17,
        bilateralSigmaColor: 80,
        bilateralSigmaSpace: 80,
        hKernelSize: '35 × 1 Rectangular',
        vKernelSize: '1 × 35 Rectangular',
        noiseReductionRatio: '94.8%',
        linesIsolatedCount: 218
      },
      ocr: {
        engine: 'EasyOCR + PyTorch Backend',
        totalTokensDetected: 64,
        averageConfidence: 0.918,
        rotationCorrected: false,
        boxes: [
          { id: 'ab1', x: 15, y: 20, width: 22, height: 10, text: 'LIVING ROOM\n4,200 × 5,100 mm', confidence: 0.95, type: 'room', status: 'valid' },
          { id: 'ab2', x: 55, y: 20, width: 20, height: 10, text: 'KITCHEN\n3,000 × 3,600 mm', confidence: 0.93, type: 'room', status: 'valid' },
          { id: 'ab3', x: 15, y: 55, width: 24, height: 10, text: 'MASTER BEDROOM\n3,800 × 4,500 mm', confidence: 0.96, type: 'room', status: 'valid' },
          { id: 'ab4', x: 55, y: 55, width: 18, height: 9, text: 'BATHROOM\n2,100 × 2,400 mm', confidence: 0.89, type: 'room', status: 'valid' },
          { id: 'ab5', x: 38, y: 35, width: 10, height: 5, text: 'D1: 900w', confidence: 0.87, type: 'symbol', status: 'valid' },
          { id: 'ab6', x: 75, y: 35, width: 10, height: 5, text: 'W2: 1200w', confidence: 0.84, type: 'symbol', status: 'warning', validationMessage: 'Sill height annotation not found for Window W2' },
          { id: 'ab7', x: 15, y: 85, width: 40, height: 8, text: 'TOTAL CARPET AREA: 78.4 SQ.M', confidence: 0.97, type: 'callout', status: 'valid' }
        ]
      },
      aiInterpretation: {
        model: 'Gemini 1.5 Pro (Multimodal Architectural Parser)',
        entitiesExtracted: 18,
        symbolsDetected: 8,
        schedulesParsed: 1,
        normalizedUnits: 'Millimeters & Square Meters',
        extractedEntities: [
          { entity: 'Living Room Space', category: 'Room Zone', rawOcr: '4,200 × 5,100 mm', normalizedValue: '{"area_sqm":21.42,"w":4200,"h":5100}', confidence: 0.98 },
          { entity: 'Kitchen Space', category: 'Room Zone', rawOcr: '3,000 × 3,600 mm', normalizedValue: '{"area_sqm":10.8,"w":3000,"h":3600}', confidence: 0.97 },
          { entity: 'Master Bedroom', category: 'Room Zone', rawOcr: '3,800 × 4,500 mm', normalizedValue: '{"area_sqm":17.1,"w":3800,"h":4500}', confidence: 0.99 },
          { entity: 'Bathroom', category: 'Room Zone', rawOcr: '2,100 × 2,400 mm', normalizedValue: '{"area_sqm":5.04,"w":2100,"h":2400}', confidence: 0.95 },
          { entity: 'Passage Door D1', category: 'Aperture', rawOcr: 'D1: 900w', normalizedValue: '{"type":"door","leaf_width":900}', confidence: 0.92 }
        ]
      },
      validation: {
        rulesApplied: 10,
        passedCount: 9,
        warningCount: 1,
        errorCount: 0,
        issues: [
          {
            code: 'WARN_WINDOW_SILL_UNSPECIFIED',
            severity: 'warning',
            target: 'Window W2 (Box ID: ab6)',
            description: 'Window schedule designates width (1200mm) but lacks vertical sill elevation callout.',
            remediation: 'Assigned standard default sill height: 900mm AFF.'
          }
        ]
      },
      output: {
        schemaVersion: 'schema.kunjal.j/floorplan/v1',
        timestamp: '2026-11-16T07:31:00Z',
        jsonPayload: {
          drawing_id: 'A-204',
          discipline: 'Architectural',
          level: 'Level 02 Typical Unit',
          total_carpet_area_sqm: 78.4,
          rooms: [
            { name: 'Living Room', width_mm: 4200, depth_mm: 5100, area_sqm: 21.42, flooring: 'Vitrified Tile' },
            { name: 'Kitchen', width_mm: 3000, depth_mm: 3600, area_sqm: 10.8, flooring: 'Anti-skid Ceramic' },
            { name: 'Master Bedroom', width_mm: 3800, depth_mm: 4500, area_sqm: 17.1, flooring: 'Hardwood Finish' },
            { name: 'Bathroom', width_mm: 2100, depth_mm: 2400, area_sqm: 5.04, flooring: 'Ceramic' }
          ],
          openings: [
            { id: 'D1', type: 'single_swing_door', clear_width_mm: 900, fire_rating: '20min' },
            { id: 'W2', type: 'sliding_window', clear_width_mm: 1200, sill_elevation_mm: 900 }
          ],
          validation_summary: {
            rules_passed: 9,
            warnings: 1,
            errors: 0,
            status: 'VALIDATED'
          }
        }
      }
    }
  }
];
