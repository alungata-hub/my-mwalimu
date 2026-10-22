export type CardRating = 'known' | 'needs-revision' | 'unrated';

export interface FlashcardReview {
  cardId: string;
  rating: CardRating;
  reviewedAt: number;
}

interface ReviewStore {
  version: number;
  reviews: Record<string, FlashcardReview>;
}

const STORAGE_KEY = 'mwalimu:flashcard-reviews';
const STORAGE_VERSION = 1;

export function loadReviews(): Record<string, FlashcardReview> {
  if (typeof window === 'undefined') return {};
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return {};
    const parsed = JSON.parse(raw) as ReviewStore;
    if (!parsed || typeof parsed !== 'object') return {};
    if (parsed.version !== STORAGE_VERSION) return {};
    if (!parsed.reviews || typeof parsed.reviews !== 'object') return {};
    return parsed.reviews;
  } catch {
    return {};
  }
}

export function saveReview(cardId: string, rating: CardRating): Record<string, FlashcardReview> {
  const reviews = loadReviews();
  reviews[cardId] = { cardId, rating, reviewedAt: Date.now() };
  const store: ReviewStore = { version: STORAGE_VERSION, reviews };
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(store));
  } catch {
    return reviews;
  }
  return reviews;
}

export function clearReviews(): void {
  if (typeof window === 'undefined') return;
  try {
    window.localStorage.removeItem(STORAGE_KEY);
  } catch {
    // no-op
  }
}

export function getReview(reviews: Record<string, FlashcardReview>, cardId: string): CardRating {
  return reviews[cardId]?.rating ?? 'unrated';
}
