import type { AnswerRecord } from './scoring.ts';
import type { DomainId } from './domains.ts';
import { isDomainId } from './domains.ts';

export interface AttemptRecord {
  id: string;
  completedAt: number;
  scorePercent: number;
  correct: number;
  total: number;
  passed: boolean;
  answers: AnswerRecord[];
}

const STORAGE_KEY = 'mwalimu:quiz-history';
const STORAGE_VERSION = 1;

interface StoredEnvelope {
  version: number;
  attempts: AttemptRecord[];
}

export function loadAttempts(): AttemptRecord[] {
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

export function saveAttempt(attempt: AttemptRecord): AttemptRecord[] {
  if (typeof window === 'undefined') return [];
  const existing = loadAttempts();
  const next = [...existing, attempt];
  const envelope: StoredEnvelope = { version: STORAGE_VERSION, attempts: next };
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(envelope));
  } catch {
    return existing;
  }
  return next;
}

export function clearAttempts(): void {
  if (typeof window === 'undefined') return;
  try {
    window.localStorage.removeItem(STORAGE_KEY);
  } catch {
    // no-op
  }
}

export function createAttempt(
  scorePercent: number,
  correct: number,
  total: number,
  passed: boolean,
  answers: AnswerRecord[],
): AttemptRecord {
  return {
    id: `att-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    completedAt: Date.now(),
    scorePercent,
    correct,
    total,
    passed,
    answers,
  };
}

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
