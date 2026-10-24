import './_setup-dom.ts';

import { QUESTIONS } from '../src/lib/questions.ts';
import { buildRecord, scoreQuiz, type AnswerRecord } from '../src/lib/scoring.ts';
import { saveAttempt, loadAttempts, clearAttempts, createAttempt, type AttemptRecord } from '../src/lib/storage.ts';
import { aggregateStats } from '../src/lib/stats.ts';

let failures = 0;
let assertions = 0;

function check(label: string, condition: boolean, detail?: string): void {
  assertions++;
  if (condition) {
    console.log(`  \u2713 ${label}`);
  } else {
    failures++;
    console.error(`  \u2717 ${label}${detail ? ` — ${detail}` : ''}`);
  }
}

function section(name: string): void {
  console.log(`\n${name}`);
}

function makeAttempt(allCorrect: boolean): AttemptRecord {
  const answers: AnswerRecord[] = QUESTIONS.map((q) =>
    buildRecord(q, allCorrect ? q.answer : (q.answer + 1) % 4),
  );
  const res = scoreQuiz(QUESTIONS, answers);
  return createAttempt(res.scorePercent, res.correct, res.total, res.passed, res.records);
}

function makeMixedAttempt(correctCount: number): AttemptRecord {
  const answers: AnswerRecord[] = QUESTIONS.map((q, i) =>
    buildRecord(q, i < correctCount ? q.answer : (q.answer + 1) % 4),
  );
  const res = scoreQuiz(QUESTIONS, answers);
  return createAttempt(res.scorePercent, res.correct, res.total, res.passed, res.records);
}

// Start fresh
await clearAttempts();

section('Storage round-trip');
{
  check('loadAttempts is empty after clear', (await loadAttempts()).length === 0);
  const att = makeAttempt(true);
  const result = await saveAttempt(att);
  check('saveAttempt returns array with 1 entry', result.length === 1, `${result.length}`);
  const loaded = await loadAttempts();
  check('loadAttempts returns the saved attempt', loaded.length === 1 && loaded[0].id === att.id);
  check('Stored score matches', loaded[0].scorePercent === 100, `${loaded[0].scorePercent}`);
  check('Stored answers preserved', loaded[0].answers.length === 15, `${loaded[0].answers.length}`);
}

section('Storage survives multiple saves (append)');
{
  await clearAttempts();
  await saveAttempt(makeAttempt(true));
  await saveAttempt(makeAttempt(false));
  const loaded = await loadAttempts();
  check('Two attempts loaded', loaded.length === 2, `${loaded.length}`);
  check('First is 100%', loaded[0].scorePercent === 100);
  check('Second is 0%', loaded[1].scorePercent === 0);
}

section('Storage is robust to corrupt data');
{
  // @ts-expect-error — intentionally writing garbage
  window.localStorage.setItem('mwalimu:quiz-history', 'not-json-at-all');
  const loaded = await loadAttempts();
  check('Corrupt JSON returns empty array', Array.isArray(loaded) && loaded.length === 0);
}

section('aggregateStats — empty');
{
  await clearAttempts();
  const s = aggregateStats(await loadAttempts());
  check('attemptCount is 0', s.attemptCount === 0);
  check('overallAccuracy is 0', s.overallAccuracy === 0);
  check('weakestTopic is null', s.weakestTopic === null);
  check('hasEnoughData is false', s.hasEnoughData === false);
  check('recentAttempts empty', s.recentAttempts.length === 0);
}

section('aggregateStats — single perfect attempt');
{
  await clearAttempts();
  await saveAttempt(makeAttempt(true));
  const s = aggregateStats(await loadAttempts());
  check('attemptCount is 1', s.attemptCount === 1, `${s.attemptCount}`);
  check('questionsAttempted is 15', s.questionsAttempted === 15, `${s.questionsAttempted}`);
  check('correctTotal is 15', s.correctTotal === 15, `${s.correctTotal}`);
  check('overallAccuracy is 100%', s.overallAccuracy === 100, `${s.overallAccuracy}`);
  check('bestScore is 100%', s.bestScore === 100, `${s.bestScore}`);
  check('averageScore is 100%', s.averageScore === 100, `${s.averageScore}`);
  check('passCount is 1', s.passCount === 1, `${s.passCount}`);
  check('hasEnoughData is false (only 1 attempt)', s.hasEnoughData === false);
  check('weakestTopic is null', s.weakestTopic === null);
}

section('aggregateStats — single attempt (below threshold, not enough data)');
{
  await clearAttempts();
  await saveAttempt(makeMixedAttempt(5));
  const s = aggregateStats(await loadAttempts());
  check('attemptCount is 1', s.attemptCount === 1);
  check('overallAccuracy is 33%', s.overallAccuracy === 33, `${s.overallAccuracy}`);
  check('bestScore is 33%', s.bestScore === 33, `${s.bestScore}`);
  check('passCount is 0', s.passCount === 0);
  check('hasEnoughData is false (need 2 attempts)', s.hasEnoughData === false);
  check('weakestTopic is null', s.weakestTopic === null);
}

section('aggregateStats — two attempts, enough for recommendation');
{
  await clearAttempts();
  // Attempt 1: 10/15 correct, attempt 2: 5/15 correct
  await saveAttempt(makeMixedAttempt(10));
  await saveAttempt(makeMixedAttempt(5));
  const s = aggregateStats(await loadAttempts());
  check('attemptCount is 2', s.attemptCount === 2, `${s.attemptCount}`);
  check('questionsAttempted is 30', s.questionsAttempted === 30, `${s.questionsAttempted}`);
  check('correctTotal is 15', s.correctTotal === 15, `${s.correctTotal}`);
  check('overallAccuracy is 50%', s.overallAccuracy === 50, `${s.overallAccuracy}`);
  check('bestScore is 67%', s.bestScore === 67, `${s.bestScore}`);
  check('averageScore is 50%', s.averageScore === 50, `${s.averageScore}`);
  check('passCount is 0', s.passCount === 0);
  check('hasEnoughData is true', s.hasEnoughData === true);
  check('weakestTopic is not null', s.weakestTopic !== null);
  if (s.weakestTopic) {
    check('weakestTopic accuracy <= 50%', s.weakestTopic.accuracy <= 50, `${s.weakestTopic.accuracy}`);
    check('weakestTopic has a topic string', typeof s.weakestTopic.topic === 'string' && s.weakestTopic.topic.length > 0);
    check('weakestTopic has totalAnswered >= 2', s.weakestTopic.totalAnswered >= 2, `${s.weakestTopic.totalAnswered}`);
  }
}

section('aggregateStats — domain stats computed');
{
  await clearAttempts();
  await saveAttempt(makeAttempt(true));
  const s = aggregateStats(await loadAttempts());
  check('3 domain stats', s.domainStats.length === 3, `${s.domainStats.length}`);
  const cc = s.domainStats.find((d) => d.domainId === 'cloud-concepts')!;
  check('cloud-concepts answered 5', cc.totalAnswered === 5, `${cc.totalAnswered}`);
  check('cloud-concepts correct 5', cc.correct === 5, `${cc.correct}`);
  check('cloud-concepts accuracy 100%', cc.accuracy === 100, `${cc.accuracy}`);
  const mg = s.domainStats.find((d) => d.domainId === 'azure-management')!;
  check('azure-management answered 5', mg.totalAnswered === 5, `${mg.totalAnswered}`);
}

section('aggregateStats — recent attempts newest first');
{
  await clearAttempts();
  const a1 = makeAttempt(true);
  await saveAttempt(a1);
  const a2 = makeMixedAttempt(10);
  await saveAttempt(a2);
  const s = aggregateStats(await loadAttempts());
  check('2 recent attempts', s.recentAttempts.length === 2);
  check('Newest is first (a2)', s.recentAttempts[0].id === a2.id);
  check('Older is second (a1)', s.recentAttempts[1].id === a1.id);
}

section('aggregateStats — recent attempts capped at 5');
{
  await clearAttempts();
  for (let i = 0; i < 7; i++) await saveAttempt(makeAttempt(true));
  const s = aggregateStats(await loadAttempts());
  check('7 total attempts', s.attemptCount === 7);
  check('recentAttempts capped at 5', s.recentAttempts.length === 5, `${s.recentAttempts.length}`);
}

section('clearAttempts wipes storage');
{
  await clearAttempts();
  await saveAttempt(makeAttempt(true));
  check('has 1 attempt before clear', (await loadAttempts()).length === 1);
  await clearAttempts();
  check('0 attempts after clear', (await loadAttempts()).length === 0);
}

console.log(`\n----------------------------------------`);
console.log(`Ran ${assertions} assertions, ${failures} failure(s).`);

if (failures > 0) {
  process.exit(1);
} else {
  console.log('All history & stats tests passed.');
}
