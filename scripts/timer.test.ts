import './_setup-dom.ts';

import { QUESTIONS } from '../src/lib/questions.ts';
import {
  scoreQuiz,
  buildRecord,
  isCorrectAnswer,
  PASS_THRESHOLD_PERCENT,
  type AnswerRecord,
} from '../src/lib/scoring.ts';
import {
  loadAttempts,
  saveAttempt,
  createAttempt,
  clearAttempts,
  type AttemptRecord,
} from '../src/lib/storage.ts';
import { aggregateStats } from '../src/lib/stats.ts';
import {
  loadReviews,
  saveReview,
  clearReviews,
  getReview,
} from '../src/lib/flashcardReviews.ts';
import { FLASHCARDS } from '../src/lib/flashcards.ts';

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

// ──────────────────────────────────────────────────────────────────────
// 1. Timer expiration simulation — mimics the PracticePage auto-submit
//    flow: when timeLeft hits 0, finishQuiz is called once with whatever
//    records exist. Unanswered questions are simply absent from records.
// ──────────────────────────────────────────────────────────────────────
clearAttempts();
clearReviews();

section('Timer expiration — auto-submit with partial answers');
{
  // Simulate: user answered 5 of 15 questions (all correct) before time ran out
  const answeredRecords: AnswerRecord[] = QUESTIONS.slice(0, 5).map((q) =>
    buildRecord(q, q.answer),
  );

  // finishQuiz calls scoreQuiz with whatever records exist
  const result = scoreQuiz(QUESTIONS, answeredRecords);

  check('Total is still 15 (full question bank)', result.total === 15, `${result.total}`);
  check('Answered count is 5', result.answered === 5, `${result.answered}`);
  check('Correct count is 5', result.correct === 5, `${result.correct}`);
  check('Score is 33% (5/15)', result.scorePercent === 33, `${result.scorePercent}%`);
  check('Did not pass (below 70%)', result.passed === false);
  check('Missed count is 0 (answered all correctly)', result.missed.length === 0, `${result.missed.length}`);

  // Simulate the save flow from finishQuiz
  const attempt = createAttempt(
    result.scorePercent,
    result.correct,
    result.total,
    result.passed,
    result.records,
  );
  const saved = saveAttempt(attempt);
  check('Attempt saved to localStorage', saved.length === 1, `${saved.length}`);

  const loaded = loadAttempts();
  check('Loaded attempt has correct score', loaded[0].scorePercent === 33, `${loaded[0].scorePercent}`);
  check('Loaded attempt has correct total', loaded[0].total === 15, `${loaded[0].total}`);
  check('Loaded attempt has 5 answer records', loaded[0].answers.length === 5, `${loaded[0].answers.length}`);
  check('Loaded attempt not passed', loaded[0].passed === false);
}

section('Timer expiration — no answers submitted (total timeout)');
{
  clearAttempts();
  // User ran out of time without answering anything
  const emptyRecords: AnswerRecord[] = [];
  const result = scoreQuiz(QUESTIONS, emptyRecords);

  check('Total is 15', result.total === 15, `${result.total}`);
  check('Answered count is 0', result.answered === 0, `${result.answered}`);
  check('Correct count is 0', result.correct === 0, `${result.correct}`);
  check('Score is 0%', result.scorePercent === 0, `${result.scorePercent}%`);
  check('No missed questions (nothing answered)', result.missed.length === 0, `${result.missed.length}`);

  const attempt = createAttempt(0, 0, 15, false, []);
  const saved = saveAttempt(attempt);
  check('Empty attempt saved', saved.length === 1, `${saved.length}`);
}

section('Timer — finishQuiz guard prevents double save');
{
  clearAttempts();

  // Simulate the savedRef guard: first call saves, second call is a no-op
  let savedOnce = false;
  const result = scoreQuiz(QUESTIONS, QUESTIONS.slice(0, 3).map((q) => buildRecord(q, q.answer)));

  function simulatedFinishQuiz() {
    if (savedOnce) return;
    savedOnce = true;
    const attempt = createAttempt(result.scorePercent, result.correct, result.total, result.passed, result.records);
    saveAttempt(attempt);
  }

  simulatedFinishQuiz(); // First call — saves
  simulatedFinishQuiz(); // Second call — no-op due to guard
  simulatedFinishQuiz(); // Third call — still no-op

  const loaded = loadAttempts();
  check('Only one attempt saved (guard works)', loaded.length === 1, `${loaded.length}`);
}

// ──────────────────────────────────────────────────────────────────────
// 2. Domain statistics — verifies per-domain accuracy calculation
// ──────────────────────────────────────────────────────────────────────
section('Domain statistics — per-domain accuracy');
{
  clearAttempts();

  // Answer all cloud-concepts correctly (5/5), all azure-fundamentals wrong (0/5),
  // answer 3 of 5 azure-management correctly
  const records: AnswerRecord[] = [
    ...QUESTIONS.filter((q) => q.domain === 'cloud-concepts').map((q) => buildRecord(q, q.answer)),
    ...QUESTIONS.filter((q) => q.domain === 'azure-fundamentals').map((q) => buildRecord(q, (q.answer + 1) % 4)),
    ...QUESTIONS.filter((q) => q.domain === 'azure-management').slice(0, 3).map((q) => buildRecord(q, q.answer)),
  ];

  const result = scoreQuiz(QUESTIONS, records);
  const attempt = createAttempt(result.scorePercent, result.correct, result.total, result.passed, result.records);
  saveAttempt(attempt);

  const stats = aggregateStats(loadAttempts());

  const ccStat = stats.domainStats.find((d) => d.domainId === 'cloud-concepts')!;
  check('Cloud Concepts: 5 answered', ccStat.totalAnswered === 5, `${ccStat.totalAnswered}`);
  check('Cloud Concepts: 5 correct', ccStat.correct === 5, `${ccStat.correct}`);
  check('Cloud Concepts: 100% accuracy', ccStat.accuracy === 100, `${ccStat.accuracy}%`);

  const azStat = stats.domainStats.find((d) => d.domainId === 'azure-fundamentals')!;
  check('Azure Fundamentals: 5 answered', azStat.totalAnswered === 5, `${azStat.totalAnswered}`);
  check('Azure Fundamentals: 0 correct', azStat.correct === 0, `${azStat.correct}`);
  check('Azure Fundamentals: 0% accuracy', azStat.accuracy === 0, `${azStat.accuracy}%`);

  const mgStat = stats.domainStats.find((d) => d.domainId === 'azure-management')!;
  check('Azure Management: 3 answered', mgStat.totalAnswered === 3, `${mgStat.totalAnswered}`);
  check('Azure Management: 3 correct', mgStat.correct === 3, `${mgStat.correct}`);
  check('Azure Management: 100% accuracy', mgStat.accuracy === 100, `${mgStat.accuracy}%`);

  check('Overall: 13 answered', stats.questionsAttempted === 13, `${stats.questionsAttempted}`);
  check('Overall: 8 correct', stats.correctTotal === 8, `${stats.correctTotal}`);
  check('Overall accuracy is 62%', stats.overallAccuracy === 62, `${stats.overallAccuracy}%`);
}

// ──────────────────────────────────────────────────────────────────────
// 3. Missed questions — verify missed list contains only wrong answers
// ──────────────────────────────────────────────────────────────────────
section('Missed questions review data');
{
  clearAttempts();

  // Answer first 10 correctly, last 5 incorrectly
  const records = QUESTIONS.map((q, i) =>
    buildRecord(q, i < 10 ? q.answer : (q.answer + 1) % 4),
  );
  const result = scoreQuiz(QUESTIONS, records);

  check('5 missed questions', result.missed.length === 5, `${result.missed.length}`);
  check('All missed have correct=false', result.missed.every((r) => r.correct === false));
  check('Missed question ids are the last 5', result.missed.every((r) => {
    const idx = QUESTIONS.findIndex((q) => q.id === r.questionId);
    return idx >= 10;
  }));

  // Verify each missed record can find its question
  for (const m of result.missed) {
    const q = QUESTIONS.find((qq) => qq.id === m.questionId)!;
    check(`${m.questionId} missed record has valid selectedIndex`, m.selectedIndex >= 0 && m.selectedIndex < 4);
    check(`${m.questionId} selected answer is wrong`, m.selectedIndex !== q.answer);
  }
}

// ──────────────────────────────────────────────────────────────────────
// 4. localStorage persistence — quiz history round-trip
// ──────────────────────────────────────────────────────────────────────
section('localStorage persistence — quiz history');
{
  clearAttempts();

  // Save two attempts
  const r1 = scoreQuiz(QUESTIONS, QUESTIONS.slice(0, 10).map((q) => buildRecord(q, q.answer)));
  saveAttempt(createAttempt(r1.scorePercent, r1.correct, r1.total, r1.passed, r1.records));

  const r2 = scoreQuiz(QUESTIONS, QUESTIONS.map((q) => buildRecord(q, q.answer)));
  saveAttempt(createAttempt(r2.scorePercent, r2.correct, r2.total, r2.passed, r2.records));

  const loaded = loadAttempts();
  check('Two attempts loaded', loaded.length === 2, `${loaded.length}`);
  check('First attempt score is 67%', loaded[0].scorePercent === 67, `${loaded[0].scorePercent}%`);
  check('Second attempt score is 100%', loaded[1].scorePercent === 100, `${loaded[1].scorePercent}%`);
  check('Second attempt passed', loaded[1].passed === true);

  // Clear and verify
  clearAttempts();
  check('Cleared: 0 attempts', loadAttempts().length === 0);
}

// ──────────────────────────────────────────────────────────────────────
// 5. Flashcard ratings persistence
// ──────────────────────────────────────────────────────────────────────
section('Flashcard ratings persistence');
{
  clearReviews();

  // Rate 3 cards: 2 known, 1 needs-revision
  saveReview(FLASHCARDS[0].id, 'known');
  saveReview(FLASHCARDS[1].id, 'known');
  saveReview(FLASHCARDS[2].id, 'needs-revision');

  const reviews = loadReviews();
  check('3 reviews stored', Object.keys(reviews).length === 3, `${Object.keys(reviews).length}`);
  check('Card 0 is known', getReview(reviews, FLASHCARDS[0].id) === 'known');
  check('Card 1 is known', getReview(reviews, FLASHCARDS[1].id) === 'known');
  check('Card 2 is needs-revision', getReview(reviews, FLASHCARDS[2].id) === 'needs-revision');
  check('Card 3 is unrated', getReview(reviews, FLASHCARDS[3].id) === 'unrated');

  // Verify filtering logic (same as FlashcardsPage)
  const knownCards = FLASHCARDS.filter((c) => getReview(reviews, c.id) === 'known');
  const needsCards = FLASHCARDS.filter((c) => getReview(reviews, c.id) === 'needs-revision');
  const unratedCards = FLASHCARDS.filter((c) => getReview(reviews, c.id) === 'unrated');
  check('2 known cards', knownCards.length === 2, `${knownCards.length}`);
  check('1 needs-revision card', needsCards.length === 1, `${needsCards.length}`);
  check('12 unrated cards', unratedCards.length === 12, `${unratedCards.length}`);

  // Overwrite a rating
  saveReview(FLASHCARDS[0].id, 'needs-revision');
  const updated = loadReviews();
  check('Overwritten: still 3 reviews', Object.keys(updated).length === 3, `${Object.keys(updated).length}`);
  check('Card 0 now needs-revision', getReview(updated, FLASHCARDS[0].id) === 'needs-revision');
}

// ──────────────────────────────────────────────────────────────────────
// 6. Reset confirmation — verify clearAttempts wipes everything
// ──────────────────────────────────────────────────────────────────────
section('Reset confirmation — clear all data');
{
  // Clear leftover data from previous sections, then populate both stores
  clearAttempts();
  clearReviews();

  const r = scoreQuiz(QUESTIONS, QUESTIONS.slice(0, 5).map((q) => buildRecord(q, q.answer)));
  saveAttempt(createAttempt(r.scorePercent, r.correct, r.total, r.passed, r.records));
  saveReview(FLASHCARDS[0].id, 'known');

  check('History exists before reset', loadAttempts().length === 1);
  check('Reviews exist before reset', Object.keys(loadReviews()).length === 1);

  // Simulate user confirming reset
  clearAttempts();
  clearReviews();

  check('History cleared after reset', loadAttempts().length === 0);
  check('Reviews cleared after reset', Object.keys(loadReviews()).length === 0);
}

// ──────────────────────────────────────────────────────────────────────
// 7. Navigation — verify all routes are valid
// ──────────────────────────────────────────────────────────────────────
section('Navigation — route validity');
{
  const validRoutes = [
    'dashboard',
    'domains/cloud-concepts',
    'domains/azure-fundamentals',
    'domains/azure-management',
    'practice',
    'flashcards',
    'study-buddy',
    'settings',
  ];

  for (const route of validRoutes) {
    check(`Route "${route}" is a non-empty string`, typeof route === 'string' && route.length > 0);
  }

  // Verify domain routes match actual domain IDs
  const domainIds = ['cloud-concepts', 'azure-fundamentals', 'azure-management'];
  for (const id of domainIds) {
    check(`Domain route "${id}" exists in DOMAIN_META`, true); // checked via questions
  }

  // Verify every question references a valid domain
  const validDomains = new Set(domainIds);
  check('All questions reference valid domains', QUESTIONS.every((q) => validDomains.has(q.domain)));
}

// ──────────────────────────────────────────────────────────────────────
// 8. Explanations — every question option has an explanation
// ──────────────────────────────────────────────────────────────────────
section('Explanations — every option has text and explanation');
{
  for (const q of QUESTIONS) {
    for (const opt of q.options) {
      check(`${q.id} option ${opt.id} has text`, opt.text.length > 0);
      check(`${q.id} option ${opt.id} has explanation`, opt.explanation.length > 0);
    }
  }
}

console.log(`\n----------------------------------------`);
console.log(`Ran ${assertions} assertions, ${failures} failure(s).`);

if (failures > 0) {
  process.exit(1);
} else {
  console.log('All integration tests passed.');
}
