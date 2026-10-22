import { useMemo, useState } from 'react';
import { ChevronLeft, ChevronRight, Lightbulb, BookOpen, GraduationCap, CircleCheck as CheckCircle2, Eye, EyeOff, Compass } from 'lucide-react';
import { STUDY_CARDS, type StudyCard } from '@/lib/studyCards';
import { DOMAIN_META, getDomainName } from '@/lib/domains';
import type { DomainId } from '@/lib/domains';
import { navigate } from '@/lib/router';
import { PageHeader } from '@/components/PageHeader';

export function StudyBuddyPage() {
  const [selectedDomain, setSelectedDomain] = useState<DomainId | 'all'>('all');
  const [index, setIndex] = useState(0);
  const [showAnswer, setShowAnswer] = useState(false);

  const cards = useMemo(() => {
    const pool = selectedDomain === 'all'
      ? STUDY_CARDS
      : STUDY_CARDS.filter((c) => c.domain === selectedDomain);
    return pool;
  }, [selectedDomain]);

  const clamp = (i: number) => (cards.length === 0 ? 0 : Math.min(i, cards.length - 1));
  const card = cards[clamp(index)];

  const goNext = () => {
    setShowAnswer(false);
    setIndex((i) => Math.min(i + 1, cards.length - 1));
  };

  const goPrev = () => {
    setShowAnswer(false);
    setIndex((i) => Math.max(i - 1, 0));
  };

  const selectDomain = (d: DomainId | 'all') => {
    setSelectedDomain(d);
    setIndex(0);
    setShowAnswer(false);
  };

  return (
    <>
      <PageHeader
        eyebrow="Study Buddy"
        title="Guided concept walkthrough"
        subtitle="A curated knowledge base of core Azure concepts. Each card gives you a plain-English definition, a real-world example, exam relevance, and a question to check your understanding."
      />

      {/* Domain filter chips */}
      <div className="flex flex-wrap items-center gap-2 mb-6">
        <button
          onClick={() => selectDomain('all')}
          className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
            selectedDomain === 'all'
              ? 'bg-primary-600 text-white'
              : 'bg-white border border-ink-200 text-ink-600 hover:bg-ink-50'
          }`}
        >
          All concepts ({STUDY_CARDS.length})
        </button>
        {DOMAIN_META.map((d) => {
          const count = STUDY_CARDS.filter((c) => c.domain === d.id).length;
          return (
            <button
              key={d.id}
              onClick={() => selectDomain(d.id)}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                selectedDomain === d.id
                  ? 'bg-primary-600 text-white'
                  : 'bg-white border border-ink-200 text-ink-600 hover:bg-ink-50'
              }`}
            >
              {d.name} ({count})
            </button>
          );
        })}
      </div>

      {cards.length === 0 ? (
        <div className="card p-10 text-center">
          <span className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-ink-100 text-ink-400 mb-3">
            <Compass className="w-6 h-6" />
          </span>
          <p className="text-sm font-medium text-ink-600">No concepts in this domain yet.</p>
        </div>
      ) : (
        <>
          {/* Progress */}
          <div className="flex items-center justify-between mb-4">
            <span className="text-sm font-medium text-ink-500">
              Concept {index + 1} of {cards.length}
            </span>
            <span className="chip bg-accent-50 text-accent-700">
              {getDomainName(card.domain as DomainId)}
            </span>
          </div>
          <div className="h-1.5 rounded-full bg-ink-100 overflow-hidden mb-6">
            <div
              className="h-full rounded-full bg-primary-600 transition-all duration-300"
              style={{ width: `${((index + 1) / cards.length) * 100}%` }}
            />
          </div>

          {/* Concept card */}
          <div className="card p-6 sm:p-8 mb-6">
            <div className="flex items-center gap-3 mb-5">
              <span className="flex items-center justify-center w-10 h-10 rounded-xl bg-primary-50 text-primary-700 shrink-0">
                <GraduationCap className="w-5 h-5" />
              </span>
              <h2 className="text-xl font-bold text-ink-900">{card.concept}</h2>
            </div>

            {/* Definition */}
            <Section icon={<BookOpen className="w-4 h-4" />} title="Definition">
              <p className="text-sm text-ink-700 leading-relaxed">{card.definition}</p>
            </Section>

            {/* Example */}
            <Section icon={<Lightbulb className="w-4 h-4" />} title="Example">
              <p className="text-sm text-ink-700 leading-relaxed">{card.example}</p>
            </Section>

            {/* Exam relevance */}
            <Section icon={<CheckCircle2 className="w-4 h-4" />} title="Exam relevance">
              <p className="text-sm text-ink-700 leading-relaxed">{card.examRelevance}</p>
            </Section>

            {/* Check your understanding */}
            <div className="mt-6 p-5 rounded-xl bg-accent-50 border border-accent-100">
              <h3 className="flex items-center gap-2 text-sm font-bold text-accent-800 mb-2">
                <Compass className="w-4 h-4" /> Check your understanding
              </h3>
              <p className="text-sm text-ink-700 mb-3">{card.checkQuestion}</p>
              {!showAnswer ? (
                <button
                  onClick={() => setShowAnswer(true)}
                  className="btn px-4 py-2 text-sm font-semibold rounded-lg bg-accent-600 text-white hover:bg-accent-700"
                >
                  <Eye className="w-4 h-4" /> Reveal answer
                </button>
              ) : (
                <div className="animate-fade-in">
                  <div className="p-3 rounded-lg bg-white border border-accent-200">
                    <p className="text-sm text-ink-700">{card.checkAnswer}</p>
                  </div>
                  <button
                    onClick={() => setShowAnswer(false)}
                    className="btn-ghost mt-2 text-accent-700 hover:bg-accent-100"
                  >
                    <EyeOff className="w-4 h-4" /> Hide answer
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Navigation */}
          <div className="flex items-center justify-between mb-8">
            <button onClick={goPrev} disabled={index === 0} className="btn-secondary">
              <ChevronLeft className="w-4 h-4" /> Previous
            </button>
            <button
              onClick={goNext}
              disabled={index >= cards.length - 1}
              className="btn-primary"
            >
              Next concept <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </>
      )}

      {/* Footer */}
      <div className="card p-5 flex items-center gap-4 bg-primary-50 border-primary-100">
        <GraduationCap className="w-8 h-8 text-primary-600 shrink-0" />
        <div className="flex-1">
          <p className="text-sm text-primary-800 font-medium">
            Study Buddy is a curated reference — not an AI.
          </p>
          <p className="text-xs text-primary-700 mt-0.5">
            Every explanation is written and reviewed locally. No external service is called.
          </p>
        </div>
        <button onClick={() => navigate('#/practice')} className="btn-primary shrink-0">
          Test yourself
        </button>
      </div>
    </>
  );
}

function Section({ icon, title, children }: { icon: React.ReactNode; title: string; children: React.ReactNode }) {
  return (
    <div className="mb-5 last:mb-0">
      <h3 className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-ink-400 mb-2">
        {icon}
        {title}
      </h3>
      {children}
    </div>
  );
}
