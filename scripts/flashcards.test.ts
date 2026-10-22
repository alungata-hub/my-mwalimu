import './_setup-dom.ts';

import { FLASHCARDS } from '../src/lib/flashcards.ts';
import {
  loadReviews,
  saveReview,
  clearReviews,
  getReview,
  type CardRating,
} from '../src/lib/flashcardReviews.ts';

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

// Start clean
clearReviews();

section('Flashcard data integrity');
{
  check('At least 15 flashcards', FLASHCARDS.length >= 15, `${FLASHCARDS.length}`);
  const perDomain: Record<string, number> = {};
  for (const c of FLASHCARDS) perDomain[c.domain] = (perDomain[c.domain] ?? 0) + 1;
  check('cloud-concepts has cards', (perDomain['cloud-concepts'] ?? 0) >= 3);
  check('azure-fundamentals has cards', (perDomain['azure-fundamentals'] ?? 0) >= 3);
  check('azure-management has cards', (perDomain['azure-management'] ?? 0) >= 3);
  for (const c of FLASHCARDS) {
    check(`${c.id} has front text`, c.front.length > 0);
    check(`${c.id} has back text`, c.back.length > 0);
    check(`${c.id} has topic`, c.topic.length > 0);
  }
}

section('Review storage round-trip');
{
  clearReviews();
  check('loadReviews empty after clear', Object.keys(loadReviews()).length === 0);
  const updated = saveReview(FLASHCARDS[0].id, 'known');
  check('saveReview returns object with entry', updated[FLASHCARDS[0].id] !== undefined);
  check('saved rating is "known"', updated[FLASHCARDS[0].id].rating === 'known');

  const loaded = loadReviews();
  check('loadReviews returns saved rating', loaded[FLASHCARDS[0].id]?.rating === 'known');
  check('getReview returns "known"', getReview(loaded, FLASHCARDS[0].id) === 'known');
  check('getReview returns "unrated" for unreviewed', getReview(loaded, 'nonexistent') === 'unrated');
}

section('Review storage — multiple ratings');
{
  clearReviews();
  saveReview(FLASHCARDS[0].id, 'known');
  saveReview(FLASHCARDS[1].id, 'needs-revision');
  const loaded = loadReviews();
  check('Two reviews stored', Object.keys(loaded).length === 2);
  check('Card 0 is known', getReview(loaded, FLASHCARDS[0].id) === 'known');
  check('Card 1 is needs-revision', getReview(loaded, FLASHCARDS[1].id) === 'needs-revision');
}

section('Review storage — overwrite rating');
{
  clearReviews();
  saveReview(FLASHCARDS[0].id, 'needs-revision');
  saveReview(FLASHCARDS[0].id, 'known');
  const loaded = loadReviews();
  check('Only one entry for the card', Object.keys(loaded).length === 1);
  check('Rating updated to "known"', getReview(loaded, FLASHCARDS[0].id) === 'known');
}

section('Review storage — corrupt data resilience');
{
  // @ts-expect-error — intentionally writing garbage
  window.localStorage.setItem('mwalimu:flashcard-reviews', 'not-json');
  const loaded = loadReviews();
  check('Corrupt JSON returns empty object', typeof loaded === 'object' && Object.keys(loaded).length === 0);
}

section('clearReviews wipes storage');
{
  saveReview(FLASHCARDS[0].id, 'known');
  check('has 1 review before clear', Object.keys(loadReviews()).length === 1);
  clearReviews();
  check('0 reviews after clear', Object.keys(loadReviews()).length === 0);
}

section('CardRating type values');
{
  const ratings: CardRating[] = ['known', 'needs-revision', 'unrated'];
  check('Three valid rating values', ratings.length === 3);
  check('"unrated" is the default', getReview({}, 'any') === 'unrated');
}

console.log(`\n----------------------------------------`);
console.log(`Ran ${assertions} assertions, ${failures} failure(s).`);

if (failures > 0) {
  process.exit(1);
} else {
  console.log('All flashcard tests passed.');
}
