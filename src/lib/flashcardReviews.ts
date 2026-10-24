import { supabase, supabaseConfigured } from './supabase.ts';

export type CardRating = 'known' | 'needs-revision' | 'unrated';

export interface FlashcardReview {
  cardId: string;
  rating: CardRating;
  reviewedAt: number;
}

// ── localStorage fallback (used by tests and when Supabase is not configured) ──

const STORAGE_KEY = 'mwalimu:flashcard-reviews';
const STORAGE_VERSION = 1;

interface ReviewStore {
  version: number;
  reviews: Record<string, FlashcardReview>;
}

interface LocalReview {
  cardId: string;
  rating: CardRating;
  reviewedAt: number;
}

function loadReviewsLocal(): Record<string, FlashcardReview> {
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

function saveReviewLocal(cardId: string, rating: CardRating): Record<string, FlashcardReview> {
  const reviews = loadReviewsLocal();
  reviews[cardId] = { cardId, rating, reviewedAt: Date.now() };
  const store: ReviewStore = { version: STORAGE_VERSION, reviews };
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(store));
  } catch {
    return reviews;
  }
  return reviews;
}

function clearReviewsLocal(): void {
  if (typeof window === 'undefined') return;
  try {
    window.localStorage.removeItem(STORAGE_KEY);
  } catch {
    // no-op
  }
}

// ── Supabase-backed functions ─────────────────────────────────────────────

interface DbReview {
  card_id: string;
  rating: string;
  reviewed_at: string;
}

export async function loadReviews(): Promise<Record<string, FlashcardReview>> {
  if (!supabaseConfigured) return loadReviewsLocal();

  const { data, error } = await supabase
    .from('flashcard_reviews')
    .select('card_id, rating, reviewed_at');

  if (error) {
    console.warn('Failed to load reviews from Supabase, falling back to localStorage:', error.message);
    return loadReviewsLocal();
  }

  const reviews: Record<string, FlashcardReview> = {};
  for (const row of data ?? []) {
    const r = row as DbReview;
    reviews[r.card_id] = {
      cardId: r.card_id,
      rating: r.rating as CardRating,
      reviewedAt: new Date(r.reviewed_at).getTime(),
    };
  }
  return reviews;
}

export async function saveReview(cardId: string, rating: CardRating): Promise<Record<string, FlashcardReview>> {
  if (!supabaseConfigured) return saveReviewLocal(cardId, rating);

  const { error } = await supabase
    .from('flashcard_reviews')
    .upsert({ card_id: cardId, rating }, { onConflict: 'user_id,card_id' });

  if (error) {
    console.warn('Failed to save review to Supabase, falling back to localStorage:', error.message);
    return saveReviewLocal(cardId, rating);
  }

  return loadReviews();
}

export async function clearReviews(): Promise<void> {
  if (!supabaseConfigured) {
    clearReviewsLocal();
    return;
  }

  const { error } = await supabase
    .from('flashcard_reviews')
    .delete()
    .neq('id', '00000000-0000-0000-0000-000000000000');

  if (error) {
    console.warn('Failed to clear reviews in Supabase:', error.message);
    clearReviewsLocal();
  }
}

export function getReview(reviews: Record<string, FlashcardReview>, cardId: string): CardRating {
  return reviews[cardId]?.rating ?? 'unrated';
}

// Keep a LocalReview alias for test compatibility
export type { LocalReview };
