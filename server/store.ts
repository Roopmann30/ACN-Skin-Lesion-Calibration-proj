import fs from 'node:fs';
import path from 'node:path';
import type { LesionSample } from '../src/types.ts';

const DATA_DIR = path.resolve(process.cwd(), 'data');
const PREDICTIONS_FILE = path.join(DATA_DIR, 'predictions.json');

function ensureDataDir() {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }
}

export function loadSavedPredictions(): LesionSample[] {
  try {
    ensureDataDir();
    if (!fs.existsSync(PREDICTIONS_FILE)) {
      return [];
    }
    const raw = fs.readFileSync(PREDICTIONS_FILE, 'utf-8');
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export function savePrediction(sample: LesionSample): LesionSample[] {
  ensureDataDir();
  const current = loadSavedPredictions();
  // Keep up to 12 most recent custom uploaded scans on disk
  const updated = [sample, ...current.filter((s) => s.id !== sample.id)].slice(0, 12);
  fs.writeFileSync(PREDICTIONS_FILE, JSON.stringify(updated, null, 2), 'utf-8');
  return updated;
}

export function deletePrediction(id: string): boolean {
  ensureDataDir();
  const current = loadSavedPredictions();
  const next = current.filter((s) => s.id !== id);
  if (next.length === current.length) return false;
  fs.writeFileSync(PREDICTIONS_FILE, JSON.stringify(next, null, 2), 'utf-8');
  return true;
}
