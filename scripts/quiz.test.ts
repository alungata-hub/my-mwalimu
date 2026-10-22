import { QUESTIONS, validateQuestions, getQuestion } from '../src/lib/questions.ts';
import { scoreQuiz, buildRecord, isCorrectAnswer, PASS_THRESHOLD_PERCENT } from '../src/lib/scoring.ts';

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

section('Question bank integrity');
const issues = validateQuestions(QUESTIONS);
check('All 15 questions validate with no issues', issues.length === 0, JSON.stringify(issues));
check('Exactly 15 questions in the bank', QUESTIONS.length === 15);

const perDomain: Record<string, number> = {};
for (const q of QUESTIONS) perDomain[q.domain] = (perDomain[q.domain] ?? 0) + 1;
check('5 questions from cloud-concepts', perDomain['cloud-concepts'] === 5, `${perDomain['cloud-concepts']}`);
check('5 questions from azure-fundamentals', perDomain['azure-fundamentals'] === 5, `${perDomain['azure-fundamentals']}`);
check('5 questions from azure-management', perDomain['azure-management'] === 5, `${perDomain['azure-management']}`);

for (const q of QUESTIONS) {
  check(`${q.id} has 4 options`, q.options.length === 4);
  check(`${q.id} answer is a valid option id`, q.options.some((o) => o.id === q.answer));
  check(`${q.id} every option has text + explanation`, q.options.every((o) => o.text && o.explanation));
}

section('isCorrectAnswer');
const sample = QUESTIONS[0];
check('Correct index returns true', isCorrectAnswer(sample, sample.answer) === true);
check('Wrong index returns false', isCorrectAnswer(sample, (sample.answer + 1) % 4) === false);
check('Out-of-range index returns false', isCorrectAnswer(sample, 99) === false);

section('Scoring — all correct');
{
  const records = QUESTIONS.map((q) => buildRecord(q, q.answer));
  const result = scoreQuiz(QUESTIONS, records);
  check('Correct count is 15', result.correct === 15, `${result.correct}`);
  check('Score is 100%', result.scorePercent === 100, `${result.scorePercent}%`);
  check('Passed is true', result.passed === true);
  check('No missed questions', result.missed.length === 0, `${result.missed.length}`);
}

section('Scoring — all wrong');
{
  const records = QUESTIONS.map((q) => buildRecord(q, (q.answer + 1) % 4));
  const result = scoreQuiz(QUESTIONS, records);
  check('Correct count is 0', result.correct === 0, `${result.correct}`);
  check('Score is 0%', result.scorePercent === 0, `${result.scorePercent}%`);
  check('Passed is false', result.passed === false);
  check('All 15 are missed', result.missed.length === 15, `${result.missed.length}`);
}

section('Scoring — mixed (10 correct, 5 wrong)');
{
  const records = QUESTIONS.map((q, i) => buildRecord(q, i < 10 ? q.answer : (q.answer + 1) % 4));
  const result = scoreQuiz(QUESTIONS, records);
  check('Correct count is 10', result.correct === 10, `${result.correct}`);
  check('Score is 67%', result.scorePercent === 67, `${result.scorePercent}%`);
  check('Below 70% threshold => not passed', result.passed === false);
  check('5 missed questions', result.missed.length === 5, `${result.missed.length}`);
}

section('Scoring — exactly at pass threshold (70%)');
{
  const records = QUESTIONS.map((q, i) => buildRecord(q, i < 11 ? q.answer : (q.answer + 1) % 4));
  const result = scoreQuiz(QUESTIONS, records);
  check('Correct count is 11', result.correct === 11, `${result.correct}`);
  check('Score is 73%', result.scorePercent === 73, `${result.scorePercent}%`);
  check('At/above 70% => passed', result.passed === true);
}

section('Duplicate scoring prevention');
{
  const q = QUESTIONS[0];
  const dup = [buildRecord(q, q.answer), buildRecord(q, q.answer)];
  let threw = false;
  let msg = '';
  try {
    scoreQuiz(QUESTIONS, dup);
  } catch (e) {
    threw = true;
    msg = (e as Error).message;
  }
  check('Duplicate records throw an error', threw);
  check('Error mentions the question id', msg.includes(q.id), msg);
}

section('Partial quiz scoring');
{
  const records = [buildRecord(QUESTIONS[0], QUESTIONS[0].answer)];
  const result = scoreQuiz(QUESTIONS, records);
  check('Answered count is 1', result.answered === 1, `${result.answered}`);
  check('Total stays 15', result.total === 15, `${result.total}`);
  check('Correct count is 1', result.correct === 1, `${result.correct}`);
}

section('buildRecord correctness');
{
  const q = getQuestion('az-3')!;
  const rec = buildRecord(q, 2);
  check('Record stores the question id', rec.questionId === 'az-3');
  check('Record stores the selected index', rec.selectedIndex === 2);
  check('Record correct flag is true for right answer', rec.correct === true);
  const wrong = buildRecord(q, 0);
  check('Record correct flag is false for wrong answer', wrong.correct === false);
}

console.log(`\n----------------------------------------`);
console.log(`Ran ${assertions} assertions, ${failures} failure(s).`);
console.log(`Pass threshold constant = ${PASS_THRESHOLD_PERCENT}%`);

if (failures > 0) {
  process.exit(1);
} else {
  console.log('All quiz scoring tests passed.');
}
