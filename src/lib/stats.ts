import { QUESTIONS, type Question } from './questions.ts';
import { DOMAIN_META, type DomainId } from './domains.ts';
import type { AttemptRecord } from './storage.ts';

export interface DomainStat {
  domainId: DomainId;
  domainName: string;
  weight: number;
  color: 'primary' | 'accent' | 'secondary';
  totalAnswered: number;
  correct: number;
  accuracy: number; // 0–100, rounded
  questionsInBank: number;
}

export interface TopicStat {
  topic: string;
  domainId: DomainId;
  totalAnswered: number;
  correct: number;
  accuracy: number;
}

export interface AggregatedStats {
  attemptCount: number;
  questionsAttempted: number; // total question-answers across all attempts
  correctTotal: number;
  overallAccuracy: number; // 0–100, rounded
  bestScore: number; // best single-attempt percentage
  averageScore: number; // average of attempt percentages
  passCount: number;
  domainStats: DomainStat[];
  topicStats: TopicStat[];
  recentAttempts: AttemptRecord[]; // newest first, capped
  weakestTopic: TopicStat | null;
  hasEnoughData: boolean;
}

const MIN_ATTEMPTS_FOR_RECOMMENDATION = 2;
const MIN_QUESTIONS_PER_TOPIC = 2;
const RECENT_CAP = 5;

const QUESTION_INDEX = new Map<string, Question>(
  QUESTIONS.map((q) => [q.id, q]),
);

export function getQuestionById(id: string): Question | undefined {
  return QUESTION_INDEX.get(id);
}

export function aggregateStats(attempts: AttemptRecord[]): AggregatedStats {
  const validAttempts = attempts.filter(
    (a) => a.answers.length > 0 && a.total > 0,
  );

  let questionsAttempted = 0;
  let correctTotal = 0;
  let scoreSum = 0;
  let bestScore = 0;
  let passCount = 0;

  const domainCorrect = new Map<DomainId, number>();
  const domainAnswered = new Map<DomainId, number>();

  const topicKey = (domainId: DomainId, topic: string) => `${domainId}::${topic}`;
  const topicCorrect = new Map<string, number>();
  const topicAnswered = new Map<string, number>();
  const topicMeta = new Map<string, { domainId: DomainId; topic: string }>();

  for (const att of validAttempts) {
    scoreSum += att.scorePercent;
    if (att.scorePercent > bestScore) bestScore = att.scorePercent;
    if (att.passed) passCount++;

    for (const ans of att.answers) {
      const q = QUESTION_INDEX.get(ans.questionId);
      if (!q) continue;

      questionsAttempted++;
      if (ans.correct) correctTotal++;

      domainAnswered.set(q.domain, (domainAnswered.get(q.domain) ?? 0) + 1);
      if (ans.correct) domainCorrect.set(q.domain, (domainCorrect.get(q.domain) ?? 0) + 1);

      const key = topicKey(q.domain, q.topic);
      topicAnswered.set(key, (topicAnswered.get(key) ?? 0) + 1);
      if (ans.correct) topicCorrect.set(key, (topicCorrect.get(key) ?? 0) + 1);
      if (!topicMeta.has(key)) topicMeta.set(key, { domainId: q.domain, topic: q.topic });
    }
  }

  const attemptCount = validAttempts.length;
  const overallAccuracy =
    questionsAttempted === 0 ? 0 : Math.round((correctTotal / questionsAttempted) * 100);
  const averageScore = attemptCount === 0 ? 0 : Math.round(scoreSum / attemptCount);

  const domainStats: DomainStat[] = DOMAIN_META.map((meta) => {
    const answered = domainAnswered.get(meta.id) ?? 0;
    const correct = domainCorrect.get(meta.id) ?? 0;
    const questionsInBank = QUESTIONS.filter((q) => q.domain === meta.id).length;
    return {
      domainId: meta.id,
      domainName: meta.name,
      weight: meta.weight,
      color: meta.color,
      totalAnswered: answered,
      correct,
      accuracy: answered === 0 ? 0 : Math.round((correct / answered) * 100),
      questionsInBank,
    };
  });

  const topicStats: TopicStat[] = Array.from(topicMeta.entries())
    .map(([key, meta]) => {
      const answered = topicAnswered.get(key) ?? 0;
      const correct = topicCorrect.get(key) ?? 0;
      return {
        topic: meta.topic,
        domainId: meta.domainId,
        totalAnswered: answered,
        correct,
        accuracy: answered === 0 ? 0 : Math.round((correct / answered) * 100),
      };
    })
    .sort((a, b) => a.topic.localeCompare(b.topic));

  // Weakest topic recommendation — only when enough data
  const eligibleTopics = topicStats.filter(
    (t) => t.totalAnswered >= MIN_QUESTIONS_PER_TOPIC,
  );
  const hasEnoughData = attemptCount >= MIN_ATTEMPTS_FOR_RECOMMENDATION && eligibleTopics.length > 0;
  const weakestTopic = hasEnoughData
    ? eligibleTopics.reduce((min, t) => (t.accuracy < min.accuracy ? t : min))
    : null;

  const recentAttempts = [...validAttempts]
    .reverse()
    .sort((a, b) => b.completedAt - a.completedAt)
    .slice(0, RECENT_CAP);

  return {
    attemptCount,
    questionsAttempted,
    correctTotal,
    overallAccuracy,
    bestScore,
    averageScore,
    passCount,
    domainStats,
    topicStats,
    recentAttempts,
    weakestTopic,
    hasEnoughData,
  };
}

export function formatDate(timestamp: number): string {
  const d = new Date(timestamp);
  return d.toLocaleDateString(undefined, {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

export function formatRelative(timestamp: number): string {
  const diff = Date.now() - timestamp;
  const minutes = Math.floor(diff / 60000);
  const hours = Math.floor(diff / 3600000);
  const days = Math.floor(diff / 86400000);
  if (days > 30) return formatDate(timestamp);
  if (days >= 1) return `${days} day${days === 1 ? '' : 's'} ago`;
  if (hours >= 1) return `${hours} hour${hours === 1 ? '' : 's'} ago`;
  if (minutes >= 1) return `${minutes} minute${minutes === 1 ? '' : 's'} ago`;
  return 'just now';
}
