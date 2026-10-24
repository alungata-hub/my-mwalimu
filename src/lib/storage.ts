import { supabase, supabaseConfigured } from './supabase.ts';
import type { AnswerRecord } from './scoring.ts';

export interface AttemptRecord {
  id: string;
  completedAt: number;
  scorePercent: number;
  correct: number;
  total: number;
  passed: boolean;
  timed: boolean;
  answers: AnswerRecord[];
}

// ── localStorage fallback (used by tests and when Supabase is not configured) ──

const STORAGE_KEY = 'mwalimu:quiz-history';
const STORAGE_VERSION = 1;

interface StoredEnvelope {
  version: number;
  attempts: AttemptRecord[];
}

function loadAttemptsLocal(): AttemptRecord[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as StoredEnvelope;
    if (!parsed || typeof parsed !== 'object') return [];
    if (parsed.version !== STORAGE_VERSION) return migrateEnvelope(parsed);
    if (!Array.isArray(parsed.attempts)) return [];
    return parsed.attempts.filter(isValidAttempt);
  } catch {
    return [];
  }
}

function saveAttemptLocal(attempt: AttemptRecord): AttemptRecord[] {
  if (typeof window === 'undefined') return [];
  const existing = loadAttemptsLocal();
  const next = [...existing, attempt];
  const envelope: StoredEnvelope = { version: STORAGE_VERSION, attempts: next };
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(envelope));
  } catch {
    return existing;
  }
  return next;
}

function clearAttemptsLocal(): void {
  if (typeof window === 'undefined') return;
  try {
    window.localStorage.removeItem(STORAGE_KEY);
  } catch {
    // no-op
  }
}

// ── Supabase-backed functions ─────────────────────────────────────────────

interface DbAttempt {
  id: string;
  score_percent: number;
  correct: number;
  total: number;
  passed: boolean;
  timed: boolean;
  answers: AnswerRecord[];
  completed_at: string;
}

function dbToAttempt(row: DbAttempt): AttemptRecord {
  return {
    id: row.id,
    completedAt: new Date(row.completed_at).getTime(),
    scorePercent: row.score_percent,
    correct: row.correct,
    total: row.total,
    passed: row.passed,
    timed: row.timed ?? false,
    answers: Array.isArray(row.answers) ? row.answers : [],
  };
}

export async function loadAttempts(): Promise<AttemptRecord[]> {
  if (!supabaseConfigured) return loadAttemptsLocal();

  const { data, error } = await supabase
    .from('quiz_attempts')
    .select('id, score_percent, correct, total, passed, timed, answers, completed_at')
    .order('completed_at', { ascending: false });

  if (error) {
    console.warn('Failed to load attempts from Supabase, falling back to localStorage:', error.message);
    return loadAttemptsLocal();
  }

  return (data ?? []).map(dbToAttempt);
}

export async function saveAttempt(attempt: AttemptRecord): Promise<AttemptRecord[]> {
  if (!supabaseConfigured) return saveAttemptLocal(attempt);

  const { error } = await supabase.from('quiz_attempts').insert({
    score_percent: attempt.scorePercent,
    correct: attempt.correct,
    total: attempt.total,
    passed: attempt.passed,
    timed: attempt.timed ?? false,
    answers: attempt.answers,
  });

  if (error) {
    console.warn('Failed to save attempt to Supabase, falling back to localStorage:', error.message);
    return saveAttemptLocal(attempt);
  }

  return loadAttempts();
}

export async function clearAttempts(): Promise<void> {
  if (!supabaseConfigured) {
    clearAttemptsLocal();
    return;
  }

  const { error } = await supabase.from('quiz_attempts').delete().neq('id', '00000000-0000-0000-0000-000000000000');

  if (error) {
    console.warn('Failed to clear attempts in Supabase:', error.message);
    clearAttemptsLocal();
  }
}

export function createAttempt(
  scorePercent: number,
  correct: number,
  total: number,
  passed: boolean,
  answers: AnswerRecord[],
  timed: boolean = false,
): AttemptRecord {
  return {
    id: `att-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    completedAt: Date.now(),
    scorePercent,
    correct,
    total,
    passed,
    timed,
    answers,
  };
}

// ── validation helpers ────────────────────────────────────────────────────

function migrateEnvelope(parsed: unknown): AttemptRecord[] {
  if (parsed && typeof parsed === 'object') {
    const p = parsed as { attempts?: unknown };
    if (Array.isArray(p.attempts)) return p.attempts.filter(isValidAttempt);
  }
  return [];
}

function isValidAttempt(a: unknown): a is AttemptRecord {
  if (!a || typeof a !== 'object') return false;
  const rec = a as Partial<AttemptRecord>;
  return (
    typeof rec.id === 'string' &&
    typeof rec.completedAt === 'number' &&
    typeof rec.scorePercent === 'number' &&
    typeof rec.correct === 'number' &&
    typeof rec.total === 'number' &&
    typeof rec.passed === 'boolean' &&
    Array.isArray(rec.answers) &&
    rec.answers.every(isValidAnswerRecord)
  );
}

function isValidAnswerRecord(a: unknown): a is AnswerRecord {
  if (!a || typeof a !== 'object') return false;
  const rec = a as Partial<AnswerRecord>;
  return (
    typeof rec.questionId === 'string' &&
    typeof rec.selectedIndex === 'number' &&
    typeof rec.correct === 'boolean'
  );
}
