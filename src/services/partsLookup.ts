import modelsData from '@/assets/models.json';
import batteriesData from '@/assets/batteries.json';
import type { BatteryPartEntry, IdentificationResult, ModelPartEntry } from '@/src/types';

const models = modelsData as ModelPartEntry[];
const batteries = batteriesData as BatteryPartEntry[];

/** Lowercases and strips spaces/hyphens/underscores/slashes so codes like "SM-A145F" and "sm a145f" match. */
function normalize(value: string): string {
  return value.toLowerCase().replace(/[\s\-_/]+/g, '');
}

function buildKeys(entry: { model: string; modelCode: string; aliases?: string[] }): string[] {
  return [entry.model, entry.modelCode, ...(entry.aliases ?? [])].map(normalize).filter(Boolean);
}

function findMatch<T extends { model: string; modelCode: string; aliases?: string[] }>(
  entries: T[],
  result: IdentificationResult
): T | null {
  const candidates = [result.modelCode, result.model, `${result.brand} ${result.model}`]
    .map(normalize)
    .filter(Boolean);

  if (candidates.length === 0) return null;

  // Exact match first.
  for (const entry of entries) {
    const keys = buildKeys(entry);
    if (candidates.some((candidate) => keys.includes(candidate))) {
      return entry;
    }
  }

  // Fall back to substring match (handles e.g. "SM-A145F/DSN" vs "SM-A145F").
  for (const entry of entries) {
    const keys = buildKeys(entry);
    if (candidates.some((candidate) => keys.some((key) => key.includes(candidate) || candidate.includes(key)))) {
      return entry;
    }
  }

  return null;
}

export function findLcdPart(result: IdentificationResult): ModelPartEntry | null {
  return findMatch(models, result);
}

export function findBatteryPart(result: IdentificationResult): BatteryPartEntry | null {
  return findMatch(batteries, result);
}
