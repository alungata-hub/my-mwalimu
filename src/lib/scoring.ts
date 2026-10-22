import type { Question } from './questions';

export interface AnswerRecord {
  questionId: string;
  selectedIndex: number;
  correct: boolean;
}

export interface QuizResult {
  total: number;
  answered: number;
  correct: number;
  scorePercent: number;
  passed: boolean;
  records: AnswerRecord[];
  missed: AnswerRecord[];
}

export const PASS_THRESHOLD_PERCENT = 70;

export function isCorrectAnswer(question: Question, selectedIndex: number): boolean {
  return selectedIndex === question.answer;
}

export function scoreQuiz(
  questions: Question[],
  records: AnswerRecord[],
): QuizResult {
  const recordsById = new Map<string, AnswerRecord>();
  for (const r of records) {
    if (recordsById.has(r.questionId)) {
      throw new Error(
        `Duplicate answer for question "${r.questionId}" — each question may only be scored once.`,
      );
    }
    recordsById.set(r.questionId, r);
  }

  let correct = 0;
  const validated: AnswerRecord[] = [];
  const missed: AnswerRecord[] = [];

  for (const q of questions) {
    const rec = recordsById.get(q.id);
    if (!rec) continue;

    const recompute = isCorrectAnswer(q, rec.selectedIndex);
    const record: AnswerRecord = {
      questionId: q.id,
      selectedIndex: rec.selectedIndex,
      correct: recompute,
    };
    validated.push(record);
    if (recompute) correct++;
    else missed.push(record);
  }

  const total = questions.length;
  const scorePercent = total === 0 ? 0 : Math.round((correct / total) * 100);

  return {
    total,
    answered: validated.length,
    correct,
    scorePercent,
    passed: scorePercent >= PASS_THRESHOLD_PERCENT,
    records: validated,
    missed,
  };
}

export function buildRecord(question: Question, selectedIndex: number): AnswerRecord {
  return {
    questionId: question.id,
    selectedIndex,
    correct: isCorrectAnswer(question, selectedIndex),
  };
}
