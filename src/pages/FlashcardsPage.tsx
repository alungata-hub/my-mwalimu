import { useEffect, useMemo, useState } from 'react';
import { ChevronLeft, ChevronRight, RotateCcw, CircleCheck as CheckCircle2, CircleAlert as AlertCircle, Filter, Layers, Eye, EyeOff } from 'lucide-react';
import { FLASHCARDS, type Flashcard } from '@/lib/flashcards';
import { getDomainName } from '@/lib/domains';
import type { DomainId } from '@/lib/domains';
import {
  loadReviews,
  saveReview,
  clearReviews,
  getReview,
  type CardRating,
  type FlashcardReview,
} from '@/lib/flashcardReviews';
import { navigate } from '@/lib/router';
import { PageHeader } from '@/components/PageHeader';

type FilterMode = 'all' | 'needs-revision' | 'unrated';

export function FlashcardsPage() {
  const [reviews, setReviews] = useState<Record<string, FlashcardReview>>({});
  const [filter, setFilter] = useState<FilterMode>('all');
  const [index, setIndex] = useState(0);
  const [flipped, setFlipped] = useState(false);

  useEffect(() => {
    loadReviews().then(setReviews).catch(() => setReviews({}));
  }, []);

  const allCards = useMemo(() => FLASHCARDS, []);

  const visibleCards = useMemo(() => {
    if (filter === 'all') return allCards;
    return allCards.filter((c) => {
      const r = getReview(reviews, c.id);
      if (filter === 'needs-revision') return r === 'needs-revision';
      if (filter === 'unrated') return r === 'unrated';
      return true;
    });
  }, [allCards, reviews, filter]);

  const ratedCount = allCards.filter((c) => getReview(reviews, c.id) !== 'unrated').length;
  const knownCount = allCards.filter((c) => getReview(reviews, c.id) === 'known').length;
  const needsCount = allCards.filter((c) => getReview(reviews, c.id) === 'needs-revision').length;

  const clampIndex = (newCards: Flashcard[], i: number) => {
    if (newCards.length === 0) return 0;
    return Math.min(i, newCards.length - 1);
  };

  const current = visibleCards[clampIndex(visibleCards, index)];
  const currentRating = current ? getReview(reviews, current.id) : 'unrated';

  const goNext = () => {
    setFlipped(false);
    setIndex((i) => Math.min(i + 1, visibleCards.length - 1));
  };

  const goPrev = () => {
    setFlipped(false);
    setIndex((i) => Math.max(i - 1, 0));
  };

  const handleRate = (cardId: string, rating: CardRating) => {
    setReviews((prev) => ({ ...prev, [cardId]: { cardId, rating, reviewedAt: Date.now() } }));
    saveReview(cardId, rating).then(setReviews).catch(() => {});
  };

  const changeFilter = (mode: FilterMode) => {
    setFilter(mode);
    setIndex(0);
    setFlipped(false);
  };

  const handleReset = () => {
    clearReviews().catch(() => {});
    setReviews({});
    setFilter('all');
    setIndex(0);
    setFlipped(false);
  };

  if (allCards.length === 0) {
    return <p className="text-ink-500">No flashcards available.</p>;
  }

  return (
    <>
      <PageHeader
        eyebrow="Flashcards"
        title="Review key AZ-900 concepts"
        subtitle="Flip each card to reveal the answer, then mark whether you know it or need to revisit. Your ratings are saved on this device."
        actions={
          ratedCount > 0 ? (
            <button onClick={handleReset} className="btn-secondary">
              <RotateCcw className="w-4 h-4" /> Reset ratings
            </button>
          ) : undefined
        }
      />

      {/* Summary stats */}
      <div className="grid grid-cols-3 gap-3 mb-6 max-w-md">
        <SummaryStat label="Known" value={knownCount} tone="primary" />
        <SummaryStat label="Needs revision" value={needsCount} tone="error" />
        <SummaryStat label="Unrated" value={allCards.length - ratedCount} tone="neutral" />
      </div>

      {/* Filter tabs */}
      <div className="flex flex-wrap items-center gap-2 mb-6">
        <span className="flex items-center gap-1.5 text-sm font-medium text-ink-500 mr-1">
          <Filter className="w-4 h-4" /> Show:
        </span>
        {([
          { mode: 'all', label: `All (${allCards.length})` },
          { mode: 'needs-revision', label: `Needs revision (${needsCount})` },
          { mode: 'unrated', label: `Unrated (${allCards.length - ratedCount})` },
        ] as { mode: FilterMode; label: string }[]).map((tab) => (
          <button
            key={tab.mode}
            onClick={() => changeFilter(tab.mode)}
            className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
              filter === tab.mode
                ? 'bg-primary-600 text-white'
                : 'bg-white border border-ink-200 text-ink-600 hover:bg-ink-50'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {visibleCards.length === 0 ? (
        <div className="card p-10 text-center">
          <span className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-ink-100 text-ink-400 mb-3">
            <Layers className="w-6 h-6" />
          </span>
          <p className="text-sm font-medium text-ink-600">No cards in this filter</p>
          <p className="text-xs text-ink-400 mt-1">
            {filter === 'needs-revision' && 'Mark cards as "Needs revision" to see them here.'}
            {filter === 'unrated' && 'You have rated every card — switch to "All" to review them.'}
          </p>
          <button onClick={() => changeFilter('all')} className="btn-secondary mt-4">
            Show all cards
          </button>
        </div>
      ) : (
        <>
          {/* Card counter */}
          <div className="flex items-center justify-between mb-4">
            <span className="text-sm font-medium text-ink-500">
              Card {index + 1} of {visibleCards.length}
            </span>
            <span className="text-xs text-ink-400">
              {getDomainName(current.domain as DomainId)}
            </span>
          </div>

          {/* Progress dots */}
          <div className="flex items-center gap-1.5 mb-6">
            {visibleCards.map((c, i) => (
              <span
                key={c.id}
                className={`h-1.5 rounded-full transition-all ${
                  i === index ? 'w-6 bg-primary-600' : 'w-1.5 bg-ink-200'
                }`}
              />
            ))}
          </div>

          {/* Flashcard */}
          <div className="mb-6">
            <button
              onClick={() => setFlipped((f) => !f)}
              className="w-full text-left"
              aria-label={flipped ? 'Show question' : 'Show answer'}
            >
              <div
                className={`relative card p-8 min-h-[280px] flex flex-col justify-center transition-shadow hover:shadow-card-hover ${
                  currentRating === 'known' ? 'ring-2 ring-primary-300'
                  : currentRating === 'needs-revision' ? 'ring-2 ring-error-300'
                  : ''
                }`}
              >
                {!flipped ? (
                  <>
                    <span className="chip bg-accent-50 text-accent-700 mb-4 self-start">
                      {current.topic}
                    </span>
                    <p className="text-lg font-bold text-ink-900 leading-snug">{current.front}</p>
                    <span className="mt-6 flex items-center gap-1.5 text-xs font-medium text-ink-400">
                      <Eye className="w-3.5 h-3.5" /> Tap to reveal answer
                    </span>
                  </>
                ) : (
                  <>
                    <span className="chip bg-primary-50 text-primary-700 mb-4 self-start">
                      Answer
                    </span>
                    <p className="text-base text-ink-700 leading-relaxed">{current.back}</p>
                    <span className="mt-6 flex items-center gap-1.5 text-xs font-medium text-ink-400">
                      <EyeOff className="w-3.5 h-3.5" /> Tap to hide answer
                    </span>
                  </>
                )}
              </div>
            </button>
          </div>

          {/* Prev / Next */}
          <div className="flex items-center justify-between mb-6">
            <button onClick={goPrev} disabled={index === 0} className="btn-secondary">
              <ChevronLeft className="w-4 h-4" /> Previous
            </button>
            <button onClick={goNext} disabled={index >= visibleCards.length - 1} className="btn-primary">
              Next <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          {/* Rating controls */}
          <div className="card p-5">
            <p className="text-sm font-semibold text-ink-700 mb-3 text-center">
              How well do you know this?
            </p>
            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={() => handleRate(current.id, 'known')}
                className={`btn px-4 py-3 text-sm font-semibold rounded-xl border-2 transition-colors ${
                  currentRating === 'known'
                    ? 'bg-primary-600 text-white border-primary-600'
                    : 'bg-white text-primary-700 border-primary-200 hover:bg-primary-50'
                }`}
              >
                <CheckCircle2 className="w-5 h-5" /> Known
              </button>
              <button
                onClick={() => handleRate(current.id, 'needs-revision')}
                className={`btn px-4 py-3 text-sm font-semibold rounded-xl border-2 transition-colors ${
                  currentRating === 'needs-revision'
                    ? 'bg-error-600 text-white border-error-600'
                    : 'bg-white text-error-600 border-error-200 hover:bg-error-50'
                }`}
              >
                <AlertCircle className="w-5 h-5" /> Needs Revision
              </button>
            </div>
            {currentRating !== 'unrated' && (
              <p className="mt-3 text-center text-xs text-ink-400">
                Rated as "{currentRating === 'known' ? 'Known' : 'Needs revision'}" — saved.
              </p>
            )}
          </div>
        </>
      )}

      {/* Footer hint */}
      <div className="mt-8 card p-5 flex items-center gap-4 bg-accent-50 border-accent-100">
        <Layers className="w-8 h-8 text-accent-600 shrink-0" />
        <p className="text-sm text-accent-800">
          {ratedCount === allCards.length
            ? 'You have rated every card. Filter by "Needs revision" to focus on weak spots.'
            : 'Rate each card after flipping. Use the "Needs revision" filter before your exam to focus on what you still need to learn.'}
        </p>
      </div>

      <div className="mt-4 text-center">
        <button onClick={() => navigate('#/dashboard')} className="btn-ghost">
          Back to dashboard
        </button>
      </div>
    </>
  );
}

function SummaryStat({ label, value, tone }: { label: string; value: number; tone: 'primary' | 'error' | 'neutral' }) {
  const tones = {
    primary: 'bg-primary-50 text-primary-700',
    error: 'bg-error-50 text-error-700',
    neutral: 'bg-ink-100 text-ink-600',
  };
  return (
    <div className={`rounded-xl p-3 ${tones[tone]}`}>
      <p className="text-xl font-bold">{value}</p>
      <p className="text-xs font-medium">{label}</p>
    </div>
  );
}
