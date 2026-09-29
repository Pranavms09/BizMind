import fs from 'fs';
import path from 'path';
import {
  BusinessDecision,
  BusinessOutcome,
  BusinessSituation,
  DatasetKPIs,
  SalesRecord,
} from '@/types/business';

interface AppDatabase {
  datasets: Record<
    string,
    {
      label: string;
      records: SalesRecord[];
      kpis: DatasetKPIs;
      situations: BusinessSituation[];
      uploadedAt: string;
    }
  >;
  decisions: BusinessDecision[];
  outcomes: BusinessOutcome[];
}

const DATA_DIR = path.join(process.cwd(), '.data');
const DB_FILE = path.join(DATA_DIR, 'business_state.json');

function ensureDbFile(): AppDatabase {
  try {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
    if (!fs.existsSync(DB_FILE)) {
      const initial: AppDatabase = {
        datasets: {},
        decisions: [],
        outcomes: [],
      };
      fs.writeFileSync(DB_FILE, JSON.stringify(initial, null, 2), 'utf-8');
      return initial;
    }
    const content = fs.readFileSync(DB_FILE, 'utf-8');
    return JSON.parse(content);
  } catch (err) {
    console.error('[DB] Error loading DB file, fallback to memory:', err);
    return { datasets: {}, decisions: [], outcomes: [] };
  }
}

function writeDbFile(db: AppDatabase): void {
  try {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
    fs.writeFileSync(DB_FILE, JSON.stringify(db, null, 2), 'utf-8');
  } catch (err) {
    console.error('[DB] Failed to write DB file:', err);
  }
}

export function getStoredDecisions(): BusinessDecision[] {
  const db = ensureDbFile();
  return db.decisions || [];
}

export function saveDecision(decision: BusinessDecision): BusinessDecision {
  const db = ensureDbFile();
  const existingIndex = db.decisions.findIndex((d) => d.id === decision.id);
  if (existingIndex >= 0) {
    db.decisions[existingIndex] = decision;
  } else {
    db.decisions.unshift(decision);
  }
  writeDbFile(db);
  return decision;
}

export function getStoredOutcomes(): BusinessOutcome[] {
  const db = ensureDbFile();
  return db.outcomes || [];
}

export function saveOutcome(outcome: BusinessOutcome): BusinessOutcome {
  const db = ensureDbFile();
  const existingIndex = db.outcomes.findIndex((o) => o.id === outcome.id);
  if (existingIndex >= 0) {
    db.outcomes[existingIndex] = outcome;
  } else {
    db.outcomes.unshift(outcome);
  }

  // Update corresponding decision status
  const decisionIndex = db.decisions.findIndex((d) => d.id === outcome.decisionId);
  if (decisionIndex >= 0) {
    db.decisions[decisionIndex].status = 'evaluated';
  }

  writeDbFile(db);
  return outcome;
}

export function saveDataset(
  label: string,
  records: SalesRecord[],
  kpis: DatasetKPIs,
  situations: BusinessSituation[]
) {
  const db = ensureDbFile();
  db.datasets[label] = {
    label,
    records,
    kpis,
    situations,
    uploadedAt: new Date().toISOString(),
  };
  writeDbFile(db);
}

export function getDataset(label: string) {
  const db = ensureDbFile();
  return db.datasets[label] || null;
}

export function getAllDatasets() {
  const db = ensureDbFile();
  return db.datasets || {};
}

export function resetDatabase() {
  const empty: AppDatabase = { datasets: {}, decisions: [], outcomes: [] };
  writeDbFile(empty);
  return empty;
}
