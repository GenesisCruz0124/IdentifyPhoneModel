import type { IdentificationResult } from '@/src/types';

const ANTHROPIC_API_URL = 'https://api.anthropic.com/v1/messages';
const ANTHROPIC_VERSION = '2023-06-01';
const MODEL = 'claude-sonnet-4-6';
const MAX_TOKENS = 1024;

export type IdentificationErrorCode = 'no_api_key' | 'network' | 'api_error' | 'parse_error';

export class IdentificationError extends Error {
  code: IdentificationErrorCode;

  constructor(code: IdentificationErrorCode, message: string) {
    super(message);
    this.code = code;
    this.name = 'IdentificationError';
  }
}

const SYSTEM_PROMPT = `You are an expert mobile phone hardware identification assistant helping a cellphone repair technician in the Philippines identify the exact device in a photo.

Follow this process strictly, in order:
1. FIRST, look for and read any printed or engraved text in the image: regulatory/compliance labels, model number lines (e.g. "Model: SM-A145F"), battery part codes, IMEI/serial stickers, board silkscreen text, and chip/IC markings. This printed text is the most reliable signal and should be prioritized over everything else.
2. If printed text is missing, partial, or unreadable, THEN use visual design cues (camera module layout, button placement, port positions, overall shape, color, logos) to make your best estimate.
3. Pay attention to details relevant to the Philippine market, including brands such as Samsung, Oppo, Vivo, Realme, Infinix, Itel, Tecno, Poco/Xiaomi, and Honor, and their regional model code conventions (e.g. "SM-xxxxF", "CPHxxxx", "Vxxxx", "RMXxxxx", "Xxxxx").
4. Set "confidence" based on how directly the identification is supported by readable text: "high" if a model code or battery code was read directly, "medium" if inferred from partial text plus visuals, "low" if based on visual guesswork only.
5. In "evidence", briefly state exactly what text or feature led to your answer (e.g. "Read 'Model: SM-A145F' on the back panel fine print").
6. If specs are not knowable from the image, use your general knowledge of that model's typical specs. If truly unknown, use an empty string for that field.
7. If you cannot identify the device at all, set "brand" and "model" to "Unknown" and explain why in "evidence".

Respond with ONLY the following JSON object and nothing else — no markdown formatting, no code fences, no headings, and no explanatory prose before or after it:
{
  "brand": "",
  "model": "",
  "modelCode": "",
  "confidence": "high|medium|low",
  "evidence": "",
  "specs": { "display": "", "battery_mah": "", "year": "" }
}`;

/** Removes ```json / ``` code fences that models sometimes wrap JSON responses in. */
function stripCodeFences(text: string): string {
  const trimmed = text.trim();
  const fenced = trimmed.match(/^```(?:json)?\s*([\s\S]*?)\s*```$/i);
  return fenced ? fenced[1].trim() : trimmed;
}

function isConfidence(value: unknown): value is IdentificationResult['confidence'] {
  return value === 'high' || value === 'medium' || value === 'low';
}

function parseIdentificationResult(raw: string): IdentificationResult {
  let parsed: unknown;
  try {
    parsed = JSON.parse(stripCodeFences(raw));
  } catch {
    throw new IdentificationError('parse_error', 'The identification response was not valid JSON.');
  }

  if (typeof parsed !== 'object' || parsed === null) {
    throw new IdentificationError('parse_error', 'The identification response was not a JSON object.');
  }

  const obj = parsed as Record<string, unknown>;
  const specs = (typeof obj.specs === 'object' && obj.specs !== null ? obj.specs : {}) as Record<string, unknown>;

  return {
    brand: typeof obj.brand === 'string' ? obj.brand : '',
    model: typeof obj.model === 'string' ? obj.model : '',
    modelCode: typeof obj.modelCode === 'string' ? obj.modelCode : '',
    confidence: isConfidence(obj.confidence) ? obj.confidence : 'low',
    evidence: typeof obj.evidence === 'string' ? obj.evidence : '',
    specs: {
      display: typeof specs.display === 'string' ? specs.display : '',
      battery_mah: typeof specs.battery_mah === 'string' ? specs.battery_mah : '',
      year: typeof specs.year === 'string' ? specs.year : '',
    },
  };
}

/**
 * Sends a base64-encoded photo to the Anthropic Messages API and returns a
 * structured phone identification result.
 */
export async function identifyPhone(
  base64: string,
  mimeType: string,
  apiKey: string
): Promise<IdentificationResult> {
  if (!apiKey) {
    throw new IdentificationError('no_api_key', 'No Anthropic API key is set. Add one in Settings.');
  }

  let response: Response;
  try {
    response = await fetch(ANTHROPIC_API_URL, {
      method: 'POST',
      headers: {
        'content-type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': ANTHROPIC_VERSION,
      },
      body: JSON.stringify({
        model: MODEL,
        max_tokens: MAX_TOKENS,
        system: SYSTEM_PROMPT,
        messages: [
          {
            role: 'user',
            content: [
              {
                type: 'image',
                source: {
                  type: 'base64',
                  media_type: mimeType,
                  data: base64,
                },
              },
              {
                type: 'text',
                text: 'Identify this phone following the system instructions.',
              },
            ],
          },
        ],
      }),
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown network error';
    throw new IdentificationError('network', `Could not reach the Anthropic API: ${message}`);
  }

  if (!response.ok) {
    let detail = '';
    try {
      const errorBody = (await response.json()) as { error?: { message?: string } };
      detail = errorBody.error?.message ?? '';
    } catch {
      // ignore body parse failures, fall back to status text
    }
    if (response.status === 401) {
      throw new IdentificationError('api_error', 'The Anthropic API key was rejected. Check it in Settings.');
    }
    throw new IdentificationError(
      'api_error',
      `Anthropic API error (${response.status}): ${detail || response.statusText}`
    );
  }

  let data: { content?: Array<{ type: string; text?: string }> };
  try {
    data = await response.json();
  } catch {
    throw new IdentificationError('parse_error', 'The Anthropic API returned an unreadable response.');
  }

  const textBlock = data.content?.find((block) => block.type === 'text');
  if (!textBlock?.text) {
    throw new IdentificationError('parse_error', 'The Anthropic API response did not contain any text.');
  }

  return parseIdentificationResult(textBlock.text);
}
