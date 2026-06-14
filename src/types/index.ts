export type CaptureMode = 'back' | 'board' | 'battery';

export type Confidence = 'high' | 'medium' | 'low';

export interface IdentificationSpecs {
  display: string;
  battery_mah: string;
  year: string;
}

/** Shape returned by the Gemini API for a phone identification request. */
export interface IdentificationResult {
  brand: string;
  model: string;
  modelCode: string;
  confidence: Confidence;
  evidence: string;
  specs: IdentificationSpecs;
}

export interface CapturedImage {
  /** Raw base64-encoded image data, no data: URI prefix. */
  base64: string;
  /** e.g. "image/jpeg" */
  mimeType: string;
  /** Local file uri, used for preview only. */
  uri: string;
  mode: CaptureMode;
}

/** Entry in assets/models.json — LCD/display part lookup. */
export interface ModelPartEntry {
  brand: string;
  model: string;
  modelCode: string;
  /** Other model codes / marketing names this entry should also match. */
  aliases?: string[];
  lcdPartNumber: string;
}

/** Entry in assets/batteries.json — battery part lookup. */
export interface BatteryPartEntry {
  brand: string;
  model: string;
  modelCode: string;
  aliases?: string[];
  batteryModel: string;
  batteryPartNumber: string;
}
