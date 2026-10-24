import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  Brain,
  RotateCcw,
  ArrowRight,
  ArrowLeft,
  CircleCheck as CheckCircle2,
  Circle as XCircle,
  Award,
  Eye,
  ListChecks,
  CircleAlert as AlertCircle,
  Timer,
  Clock,
  Zap,
  AlertTriangle,
} from 'lucide-react';
import { QUESTIONS, type Question } from '@/lib/questions';
import { getDomainName } from '@/lib/domains';
import type { DomainId } from '@/lib/domains';
import {
  buildRecord,
  scoreQuiz,
  isCorrectAnswer,
  PASS_THRESHOLD_PERCENT,
  type AnswerRecord,
  type QuizResult,
} from '@/lib/scoring';
import { saveAttempt, createAttempt } from '@/lib/storage';
import { notifyHistoryChanged } from '@/lib/useQuizHistory';
import { navigate } from '@/lib/router';
import { PageHeader } from '@/components/PageHeader';

type Phase = 'start' | 'taking' | 'review' | 'results';

const TIMED_DURATION_SEC = 180; // 3 minutes

export function PracticePage() {
  const questions = useMemo(() => QUESTIONS, []);
  const [phase, setPhase] = useState<Phase>('start');
  const [timed, setTimed] = useState(false);
  const [timeLeft, setTimeLeft] = useState(TIMED_DURATION_SEC);
  const [current, setCurrent] = useState(0);
  const [selected, setSelected] = useState<number | null>(null);
  const [submitted, setSubmitted] = useState(false);
  const [records, setRecords] = useState<AnswerRecord[]>([]);
  const [result, setResult] = useState<QuizResult | null>(null);
  const [reviewIndex, setReviewIndex] = useState(0);
  const savedRef = useRef(false);

  const q = questions[current];
  const progressAnswered = records.length;
  const progressPct = Math.round((progressAnswered / questions.length) * 100);

  // ── Finish quiz: score, save once, go to results ───────────────────
  const finishQuiz = useCallback(
    (allRecords: AnswerRecord[]) => {
      if (savedRef.current) return;
      savedRef.current = true;
      const res = scoreQuiz(questions, allRecords);
      setResult(res);
      setPhase('results');
      const attempt = createAttempt(
        res.scorePercent,
        res.correct,
        res.total,
        res.passed,
        res.records,
        timed,
      );
      saveAttempt(attempt).then(() => notifyHistoryChanged());
    },
    [questions],
  );

  // ── Timer effect (timed mode only) ─────────────────────────────────
  // Uses a ref for the finish callback so the interval is set up once,
  // not recreated every second.
  const finishRef = useRef<(records: AnswerRecord[]) => void>(() => {});
  finishRef.current = (allRecords: AnswerRecord[]) => finishQuiz(allRecords);
  const recordsRef = useRef<AnswerRecord[]>(records);
  recordsRef.current = records;

  useEffect(() => {
    if (!timed || phase !== 'taking') return;
    const interval = setInterval(() => {
      setTimeLeft((t) => {
        if (t <= 1) {
          clearInterval(interval);
          finishRef.current(recordsRef.current);
          return 0;
        }
        return t - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [timed, phase]);

  const startQuiz = (timedMode: boolean) => {
    savedRef.current = false;
    setTimed(timedMode);
    setTimeLeft(TIMED_DURATION_SEC);
    setCurrent(0);
    setSelected(null);
    setSubmitted(false);
    setRecords([]);
    setResult(null);
    setReviewIndex(0);
    setPhase('taking');
  };

  const choose = (i: number) => {
    if (submitted) return;
    setSelected(i);
  };

  const submit = () => {
    if (selected === null || submitted) return;
    const record = buildRecord(q, selected);
    setRecords((prev) => [...prev, record]);
    setSubmitted(true);
  };

  const nextQuestion = () => {
    if (current + 1 >= questions.length) {
      finishQuiz(records);
      return;
    }
    setCurrent((c) => c + 1);
    setSelected(null);
    setSubmitted(false);
  };

  const prevQuestion = () => {
    if (current === 0) return;
    setCurrent((c) => c - 1);
    const prevRec = records.find((r) => r.questionId === questions[current - 1].id);
    setSelected(prevRec?.selectedIndex ?? null);
    setSubmitted(true);
  };

  const restart = () => {
    savedRef.current = false;
    setTimed(false);
    setTimeLeft(TIMED_DURATION_SEC);
    setCurrent(0);
    setSelected(null);
    setSubmitted(false);
    setRecords([]);
    setResult(null);
    setReviewIndex(0);
    setPhase('start');
  };

  const startReview = () => {
    if (!result || result.missed.length === 0) return;
    setReviewIndex(0);
    setPhase('review');
  };

  // ── Start screen ───────────────────────────────────────────────────
  if (phase === 'start') {
    return <StartScreen onStart={startQuiz} />;
  }

  // ── Results screen ─────────────────────────────────────────────────
  if (phase === 'results' && result) {
    return (
      <ResultsScreen
        result={result}
        timed={timed}
        timeExpired={timed && timeLeft === 0}
        onRestart={restart}
        onReview={startReview}
      />
    );
  }

  // ── Missed-question review ─────────────────────────────────────────
  if (phase === 'review' && result) {
    const missed = result.missed;
    if (missed.length === 0) {
      setPhase('results');
      return null;
    }
    const missedQ = questions.find((qq) => qq.id === missed[reviewIndex].questionId)!;
    return (
      <ReviewScreen
        missedQ={missedQ}
        record={missed[reviewIndex]}
        index={reviewIndex}
        total={missed.length}
        onPrev={() => setReviewIndex((i) => Math.max(0, i - 1))}
        onNext={() => {
          if (reviewIndex + 1 >= missed.length) setPhase('results');
          else setReviewIndex((i) => i + 1);
        }}
        onBackToResults={() => setPhase('results')}
      />
    );
  }

  // ── Quiz taking ────────────────────────────────────────────────────
  const isLast = current + 1 >= questions.length;
  const lowTime = timed && timeLeft <= 30;

  return (
    <>
      <PageHeader
        eyebrow={timed ? 'Timed practice' : 'Practice exam'}
        title={timed ? 'Timed AZ-900 quiz' : 'AZ-900 practice quiz'}
        subtitle={
          timed
            ? `You have ${TIMED_DURATION_SEC / 60} minutes. The quiz auto-submits when time runs out — answer as many as you can.`
            : '15 questions across all three official skill domains. Select an answer, submit, and get instant feedback before moving on.'
        }
      />

      {/* Timer + progress */}
      <div className="flex items-center justify-between mb-3">
        <span className="text-sm font-medium text-ink-500">
          Question {current + 1} of {questions.length}
        </span>
        <div className="flex items-center gap-2">
          <span className="chip bg-primary-50 text-primary-700">
            <ListChecks className="w-3.5 h-3.5" />
            {progressAnswered}/{questions.length} answered
          </span>
          {timed && (
            <span
              className={`chip ${lowTime ? 'bg-error-50 text-error-700 animate-pulse' : 'bg-ink-100 text-ink-700'}`}
            >
              <Timer className="w-3.5 h-3.5" />
              {formatTime(timeLeft)}
            </span>
          )}
        </div>
      </div>
      <div className="h-1.5 rounded-full bg-ink-100 overflow-hidden mb-6">
        <div
          className="h-full rounded-full bg-primary-600 transition-all duration-300"
          style={{ width: `${progressPct}%` }}
        />
      </div>

      {/* Low-time warning banner */}
      {timed && lowTime && (
        <div className="mb-4 p-3 rounded-xl bg-error-50 border border-error-200 flex items-center gap-2 text-sm font-semibold text-error-700">
          <AlertTriangle className="w-5 h-5 shrink-0" />
          Less than 30 seconds remaining — the quiz will auto-submit soon.
        </div>
      )}

      {/* Question card */}
      <div className="card p-6 mb-4">
        <div className="flex flex-wrap items-center gap-2 mb-4">
          <span className="chip bg-accent-50 text-accent-700">
            {getDomainName(q.domain as DomainId)}
          </span>
          <span className="chip bg-ink-100 text-ink-600">{q.topic}</span>
        </div>
        <h2 className="text-lg font-bold text-ink-900 mb-5">{q.prompt}</h2>

        <div className="space-y-2.5">
          {q.options.map((opt, i) => {
            const isCorrectOpt = i === q.answer;
            const isChosen = selected === i;
            const showResult = submitted;
            const showAsCorrect = showResult && isCorrectOpt;
            const showAsWrong = showResult && isChosen && !isCorrectOpt;

            return (
              <button
                key={opt.id}
                onClick={() => choose(i)}
                disabled={submitted}
                className={`flex items-center gap-3 w-full p-4 rounded-xl border text-left text-sm transition-colors
                  ${showAsCorrect ? 'border-primary-300 bg-primary-50 text-primary-800 font-semibold'
                    : showAsWrong ? 'border-error-500/40 bg-error-50 text-error-700'
                    : selected === i ? 'border-primary-400 bg-primary-50/60 text-primary-800'
                    : 'border-ink-200 hover:border-primary-300 hover:bg-primary-50/40'}
                  ${submitted ? 'cursor-default' : 'cursor-pointer'}`}
              >
                <span className={`flex items-center justify-center w-6 h-6 rounded-full border text-xs font-bold shrink-0
                  ${showAsCorrect ? 'bg-primary-600 text-white border-primary-600'
                    : showAsWrong ? 'bg-error-500 text-white border-error-500'
                    : selected === i ? 'border-primary-500 text-primary-700 bg-white'
                    : 'border-ink-300 text-ink-500'}`}>
                  {String.fromCharCode(65 + i)}
                </span>
                <span className="flex-1">{opt.text}</span>
                {showAsCorrect && <CheckCircle2 className="w-4 h-4 ml-auto text-primary-600 shrink-0" />}
                {showAsWrong && <XCircle className="w-4 h-4 ml-auto text-error-500 shrink-0" />}
              </button>
            );
          })}
        </div>

        {/* Per-option explanations after submit */}
        {submitted && (
          <div className="mt-5 pt-5 border-t border-ink-100 animate-fade-in">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-ink-400 mb-3">
              Explanation
            </h3>
            <div className="space-y-2.5">
              {q.options.map((opt, i) => {
                const isCorrectOpt = i === q.answer;
                const isChosen = selected === i;
                return (
                  <div
                    key={opt.id}
                    className={`flex gap-3 p-3 rounded-lg text-sm
                      ${isCorrectOpt ? 'bg-primary-50/70' : isChosen ? 'bg-error-50/60' : 'bg-ink-50'}`}
                  >
                    <span className={`font-bold shrink-0 ${isCorrectOpt ? 'text-primary-700' : isChosen ? 'text-error-600' : 'text-ink-400'}`}>
                      {String.fromCharCode(65 + i)}
                    </span>
                    <p className="text-ink-700">
                      <span className="font-semibold">{opt.text}: </span>
                      {opt.explanation}
                    </p>
                  </div>
                );
              })}
            </div>
            <div className={`mt-4 p-3 rounded-lg flex items-center gap-2 text-sm font-semibold
              ${isCorrectAnswer(q, selected!) ? 'bg-primary-100 text-primary-800' : 'bg-error-50 text-error-700'}`}>
              {isCorrectAnswer(q, selected!) ? (
                <><CheckCircle2 className="w-5 h-5" /> Correct!</>
              ) : (
                <><XCircle className="w-5 h-5" /> Not quite — the correct answer is {String.fromCharCode(65 + q.answer)}.</>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Controls */}
      <div className="flex items-center justify-between gap-2">
        <button
          onClick={prevQuestion}
          disabled={current === 0}
          className="btn-secondary"
        >
          <ArrowLeft className="w-4 h-4" /> Previous
        </button>

        {!submitted ? (
          <button
            onClick={submit}
            disabled={selected === null}
            className="btn-primary"
          >
            Submit answer
          </button>
        ) : (
          <button onClick={nextQuestion} className="btn-primary">
            {isLast ? 'See results' : 'Next question'}
            <ArrowRight className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Timed mode: early finish button */}
      {timed && (
        <div className="mt-4 text-center">
          <button
            onClick={() => finishQuiz(records)}
            className="btn-ghost text-ink-500"
          >
            Finish early &amp; see results
          </button>
        </div>
      )}

      {/* Footer tip */}
      <div className="mt-8 card p-5 flex items-center gap-4 bg-accent-50 border-accent-100">
        <Brain className="w-8 h-8 text-accent-600 shrink-0" />
        <p className="text-sm text-accent-800">
          {timed
            ? 'The quiz auto-submits when the timer reaches zero. Unanswered questions count as incorrect.'
            : "You'll see an explanation for every option after submitting. The pass threshold on the real AZ-900 is 700 (70%)."}
        </p>
      </div>
    </>
  );
}

function formatTime(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m}:${s.toString().padStart(2, '0')}`;
}

// ── Start screen ───────────────────────────────────────────────────────
function StartScreen({ onStart }: { onStart: (timed: boolean) => void }) {
  return (
    <>
      <PageHeader
        eyebrow="Practice exam"
        title="AZ-900 practice quiz"
        subtitle="15 questions across all three official skill domains. Choose your mode below."
      />

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-2xl">
        <button
          onClick={() => onStart(false)}
          className="card card-hover p-6 text-left group"
        >
          <span className="flex items-center justify-center w-12 h-12 rounded-xl bg-primary-50 text-primary-700 mb-4">
            <Clock className="w-6 h-6" />
          </span>
          <h3 className="font-bold text-ink-900">Untimed practice</h3>
          <p className="mt-1.5 text-sm text-ink-600">
            Answer 15 questions at your own pace. Get instant feedback and explanations after each submission.
          </p>
          <span className="mt-4 inline-flex items-center gap-1 text-sm font-semibold text-primary-700 group-hover:gap-2 transition-all">
            Start practice <ArrowRight className="w-4 h-4" />
          </span>
        </button>

        <button
          onClick={() => onStart(true)}
          className="card card-hover p-6 text-left group"
        >
          <span className="flex items-center justify-center w-12 h-12 rounded-xl bg-secondary-50 text-secondary-700 mb-4">
            <Zap className="w-6 h-6" />
          </span>
          <h3 className="font-bold text-ink-900">Timed challenge</h3>
          <p className="mt-1.5 text-sm text-ink-600">
            {TIMED_DURATION_SEC / 60}-minute countdown. The quiz auto-submits when time runs out. Simulates real exam pressure.
          </p>
          <span className="mt-4 inline-flex items-center gap-1 text-sm font-semibold text-secondary-700 group-hover:gap-2 transition-all">
            Start timer <ArrowRight className="w-4 h-4" />
          </span>
        </button>
      </div>

      <div className="mt-8 card p-5 flex items-center gap-4 bg-accent-50 border-accent-100 max-w-2xl">
        <Brain className="w-8 h-8 text-accent-600 shrink-0" />
        <p className="text-sm text-accent-800">
          The pass threshold on the real AZ-900 is 700 (70%). Both modes save your results to your quiz history.
        </p>
      </div>
    </>
  );
}

// ── Results screen ─────────────────────────────────────────────────────
function ResultsScreen({
  result,
  timed,
  timeExpired,
  onRestart,
  onReview,
}: {
  result: QuizResult;
  timed: boolean;
  timeExpired: boolean;
  onRestart: () => void;
  onReview: () => void;
}) {
  const pct = result.scorePercent;
  const passed = result.passed;

  return (
    <>
      <PageHeader eyebrow="Practice exam" title="Your results" subtitle="Here's how you did across all 15 questions." />
      <div className="card p-8 text-center max-w-lg mx-auto mb-6">
        <span className={`inline-flex items-center justify-center w-16 h-16 rounded-2xl ${passed ? 'bg-primary-50 text-primary-700' : 'bg-secondary-50 text-secondary-700'}`}>
          <Award className="w-8 h-8" />
        </span>
        <p className="mt-4 text-4xl font-bold text-ink-900">{pct}%</p>
        <p className="mt-1 text-ink-500">
          You answered {result.correct} of {result.total} correctly.
        </p>
        <p className={`mt-2 text-sm font-semibold ${passed ? 'text-primary-700' : 'text-secondary-700'}`}>
          {passed
            ? `Above the ${PASS_THRESHOLD_PERCENT}% passing threshold — great work!`
            : `Below the ${PASS_THRESHOLD_PERCENT}% threshold. Review the missed questions and try again.`}
        </p>

        {timeExpired && (
          <div className="mt-4 p-3 rounded-lg bg-secondary-50 border border-secondary-100 flex items-center justify-center gap-2 text-sm font-medium text-secondary-700">
            <Timer className="w-4 h-4" />
            Time expired — the quiz was auto-submitted.
          </div>
        )}

        <div className="mt-6 grid grid-cols-3 gap-3 text-center">
          <Stat label="Correct" value={result.correct} tone="primary" />
          <Stat label="Missed" value={result.missed.length} tone="error" />
          <Stat label="Total" value={result.total} tone="neutral" />
        </div>
      </div>

      <div className="flex flex-wrap items-center justify-center gap-2 mb-8">
        <button onClick={onRestart} className="btn-primary">
          <RotateCcw className="w-4 h-4" /> {timed ? 'Back to start' : 'Retake quiz'}
        </button>
        {result.missed.length > 0 && (
          <button onClick={onReview} className="btn-secondary">
            <Eye className="w-4 h-4" /> Review missed ({result.missed.length})
          </button>
        )}
        <button onClick={() => navigate('#/dashboard')} className="btn-ghost">
          Back to dashboard
        </button>
      </div>

      {result.missed.length === 0 && (
        <div className="card p-5 flex items-center gap-4 bg-primary-50 border-primary-100 max-w-2xl mx-auto">
          <CheckCircle2 className="w-7 h-7 text-primary-600 shrink-0" />
          <p className="text-sm text-primary-800 font-medium">
            Perfect score! You answered every question correctly across all three domains.
          </p>
        </div>
      )}
    </>
  );
}

function Stat({ label, value, tone }: { label: string; value: number; tone: 'primary' | 'error' | 'neutral' }) {
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

// ── Missed-question review screen ──────────────────────────────────────
function ReviewScreen({
  missedQ,
  record,
  index,
  total,
  onPrev,
  onNext,
  onBackToResults,
}: {
  missedQ: Question;
  record: AnswerRecord;
  index: number;
  total: number;
  onPrev: () => void;
  onNext: () => void;
  onBackToResults: () => void;
}) {
  return (
    <>
      <button onClick={onBackToResults} className="btn-ghost mb-2 -ml-3">
        <ArrowLeft className="w-4 h-4" /> Back to results
      </button>
      <PageHeader
        eyebrow={`Missed question ${index + 1} of ${total}`}
        title="Review"
        subtitle="Your answer is shown in red; the correct answer is highlighted in green."
      />

      <div className="card p-6 mb-4">
        <div className="flex flex-wrap items-center gap-2 mb-4">
          <span className="chip bg-accent-50 text-accent-700">
            {getDomainName(missedQ.domain as DomainId)}
          </span>
          <span className="chip bg-ink-100 text-ink-600">{missedQ.topic}</span>
          <span className="chip bg-error-50 text-error-700">
            <AlertCircle className="w-3.5 h-3.5" /> You missed this
          </span>
        </div>
        <h2 className="text-lg font-bold text-ink-900 mb-5">{missedQ.prompt}</h2>

        <div className="space-y-2.5">
          {missedQ.options.map((opt, i) => {
            const isCorrectOpt = i === missedQ.answer;
            const isChosen = i === record.selectedIndex;
            return (
              <div
                key={opt.id}
                className={`flex items-center gap-3 w-full p-4 rounded-xl border text-left text-sm
                  ${isCorrectOpt ? 'border-primary-300 bg-primary-50 text-primary-800 font-semibold'
                    : isChosen ? 'border-error-500/40 bg-error-50 text-error-700'
                    : 'border-ink-200 bg-white text-ink-700'}`}
              >
                <span className={`flex items-center justify-center w-6 h-6 rounded-full border text-xs font-bold shrink-0
                  ${isCorrectOpt ? 'bg-primary-600 text-white border-primary-600'
                    : isChosen ? 'bg-error-500 text-white border-error-500'
                    : 'border-ink-300 text-ink-500'}`}>
                  {String.fromCharCode(65 + i)}
                </span>
                <span className="flex-1">{opt.text}</span>
                {isCorrectOpt && <CheckCircle2 className="w-4 h-4 ml-auto text-primary-600 shrink-0" />}
                {isChosen && !isCorrectOpt && <XCircle className="w-4 h-4 ml-auto text-error-500 shrink-0" />}
              </div>
            );
          })}
        </div>

        <div className="mt-5 pt-5 border-t border-ink-100">
          <h3 className="text-xs font-semibold uppercase tracking-wider text-ink-400 mb-3">
            Explanations
          </h3>
          <div className="space-y-2.5">
            {missedQ.options.map((opt, i) => {
              const isCorrectOpt = i === missedQ.answer;
              const isChosen = i === record.selectedIndex;
              return (
                <div
                  key={opt.id}
                  className={`flex gap-3 p-3 rounded-lg text-sm
                    ${isCorrectOpt ? 'bg-primary-50/70' : isChosen ? 'bg-error-50/60' : 'bg-ink-50'}`}
                >
                  <span className={`font-bold shrink-0 ${isCorrectOpt ? 'text-primary-700' : isChosen ? 'text-error-600' : 'text-ink-400'}`}>
                    {String.fromCharCode(65 + i)}
                  </span>
                  <p className="text-ink-700">
                    <span className="font-semibold">{opt.text}: </span>
                    {opt.explanation}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      <div className="flex items-center justify-between">
        <button onClick={onPrev} disabled={index === 0} className="btn-secondary">
          <ArrowLeft className="w-4 h-4" /> Previous
        </button>
        <span className="text-sm text-ink-500">{index + 1} / {total}</span>
        <button onClick={onNext} className="btn-primary">
          {index + 1 >= total ? 'Back to results' : 'Next missed'}
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </>
  );
}
