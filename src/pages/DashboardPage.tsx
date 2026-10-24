import { useState } from 'react';
import {
  ArrowRight,
  Target,
  TrendingUp,
  ListChecks,
  Award,
  Trash2,
  CheckCircle2,
  Circle,
  Sparkles,
  BarChart3,
  History,
  Lightbulb,
  Clock,
} from 'lucide-react';
import { DOMAINS } from '@/lib/curriculum';
import { navigate } from '@/lib/router';
import { PageHeader } from '@/components/PageHeader';
import { ConfirmDialog } from '@/components/ConfirmDialog';
import { useQuizHistory } from '@/lib/useQuizHistory';
import { clearAttempts } from '@/lib/storage';
import { aggregateStats, formatRelative } from '@/lib/stats';

const colorMap = {
  primary: { bg: 'bg-primary-50', text: 'text-primary-700', ring: 'ring-primary-200', bar: 'bg-primary-600' },
  accent: { bg: 'bg-accent-50', text: 'text-accent-700', ring: 'ring-accent-200', bar: 'bg-accent-500' },
  secondary: { bg: 'bg-secondary-50', text: 'text-secondary-700', ring: 'ring-secondary-200', bar: 'bg-secondary-500' },
} as const;

export function DashboardPage() {
  const { attempts, refresh } = useQuizHistory();
  const [confirmReset, setConfirmReset] = useState(false);
  const stats = aggregateStats(attempts);
  const hasHistory = stats.attemptCount > 0;

  const handleReset = () => {
    clearAttempts().then(() => refresh());
    setConfirmReset(false);
  };

  return (
    <>
      <PageHeader
        eyebrow="Dashboard"
        title="Welcome back, ready to study?"
        subtitle="Track your progress toward the Microsoft AZ-900 Azure Fundamentals exam across all three domains."
        actions={
          <button onClick={() => navigate('#/practice')} className="btn-primary">
            <Target className="w-4 h-4" />
            Take practice quiz
          </button>
        }
      />

      {/* Stat cards — driven by real saved data */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <StatCard
          icon={<TrendingUp className="w-5 h-5" />}
          label="Overall accuracy"
          value={hasHistory ? `${stats.overallAccuracy}%` : '—'}
          hint={hasHistory ? `${stats.correctTotal}/${stats.questionsAttempted} correct` : 'No attempts yet'}
          tone="primary"
        />
        <StatCard
          icon={<ListChecks className="w-5 h-5" />}
          label="Questions attempted"
          value={hasHistory ? `${stats.questionsAttempted}` : '0'}
          hint={`${stats.attemptCount} quiz attempt${stats.attemptCount === 1 ? '' : 's'}`}
          tone="accent"
        />
        <StatCard
          icon={<Award className="w-5 h-5" />}
          label="Best score"
          value={hasHistory ? `${stats.bestScore}%` : '—'}
          hint={hasHistory ? `${stats.passCount} pass${stats.passCount === 1 ? '' : 'es'} (≥70%)` : 'Take a quiz to score'}
          tone="secondary"
        />
        <StatCard
          icon={<Clock className="w-5 h-5" />}
          label="Exam length"
          value="60 min"
          hint="40–50 questions"
          tone="neutral"
        />
      </div>

      {/* Domains with real per-domain accuracy */}
      <section className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-bold text-ink-900">AZ-900 domains</h2>
          <span className="text-xs font-medium text-ink-500">Exam weighting shown</span>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {DOMAINS.map((domain) => {
            const Icon = domain.icon;
            const c = colorMap[domain.color];
            const ds = stats.domainStats.find((d) => d.domainId === domain.id);
            const accuracy = ds?.accuracy ?? 0;
            const answered = ds?.totalAnswered ?? 0;
            return (
              <button
                key={domain.id}
                onClick={() => navigate(`#/domains/${domain.id}`)}
                className={`card card-hover p-5 text-left group ${c.bg} border-transparent`}
              >
                <div className="flex items-start justify-between mb-4">
                  <span className={`flex items-center justify-center w-11 h-11 rounded-xl bg-white ring-4 ${c.ring} ${c.text}`}>
                    <Icon className="w-5 h-5" />
                  </span>
                  <span className={`chip bg-white ${c.text}`}>
                    {domain.weight}% of exam
                  </span>
                </div>
                <h3 className="font-bold text-ink-900">{domain.name}</h3>
                <p className="mt-1.5 text-sm text-ink-600 line-clamp-2">{domain.description}</p>
                <div className="mt-4">
                  {answered > 0 ? (
                    <>
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-xs font-medium text-ink-500">Your accuracy</span>
                        <span className={`text-xs font-bold ${c.text}`}>{accuracy}%</span>
                      </div>
                      <div className="h-1.5 rounded-full bg-white/60 overflow-hidden">
                        <div className={`h-full rounded-full ${c.bar} transition-all`} style={{ width: `${accuracy}%` }} />
                      </div>
                    </>
                  ) : (
                    <span className="text-xs font-medium text-ink-500">
                      {domain.topics.length} topics · not yet attempted
                    </span>
                  )}
                </div>
              </button>
            );
          })}
        </div>
      </section>

      {/* Recommendation / first-step + recent attempts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        {/* Recommendation card */}
        <div className="lg:col-span-1">
          {stats.hasEnoughData && stats.weakestTopic ? (
            <RecommendationCard topic={stats.weakestTopic.topic} accuracy={stats.weakestTopic.accuracy} domainId={stats.weakestTopic.domainId} />
          ) : (
            <FirstStepCard hasHistory={hasHistory} />
          )}
        </div>

        {/* Recent attempts */}
        <div className="lg:col-span-2 card p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-bold text-ink-900 flex items-center gap-2">
              <History className="w-5 h-5 text-ink-400" />
              Recent attempts
            </h3>
            {hasHistory && (
              <button
                onClick={() => setConfirmReset(true)}
                className="btn-ghost text-error-600 hover:bg-error-50"
              >
                <Trash2 className="w-4 h-4" /> Reset history
              </button>
            )}
          </div>

          {hasHistory ? (
            <ul className="space-y-2">
              {stats.recentAttempts.map((att) => {
                const passed = att.passed;
                return (
                  <li key={att.id} className="flex items-center gap-3 p-3 rounded-lg hover:bg-ink-50 transition-colors">
                    <span className={`flex items-center justify-center w-9 h-9 rounded-lg shrink-0 ${passed ? 'bg-primary-50 text-primary-700' : 'bg-secondary-50 text-secondary-700'}`}>
                      {passed ? <CheckCircle2 className="w-5 h-5" /> : <Circle className="w-5 h-5" />}
                    </span>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-ink-800">
                        {att.correct}/{att.total} correct · {att.scorePercent}%
                      </p>
                      <p className="text-xs text-ink-400">{formatRelative(att.completedAt)}</p>
                    </div>
                    <span className={`chip ${passed ? 'bg-primary-50 text-primary-700' : 'bg-secondary-50 text-secondary-700'}`}>
                      {passed ? 'Passed' : 'Below 70%'}
                    </span>
                  </li>
                );
              })}
            </ul>
          ) : (
            <div className="text-center py-8">
              <span className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-ink-100 text-ink-400 mb-3">
                <BarChart3 className="w-6 h-6" />
              </span>
              <p className="text-sm font-medium text-ink-600">No attempts yet</p>
              <p className="text-xs text-ink-400 mt-1">Take your first practice quiz to see history here.</p>
              <button onClick={() => navigate('#/practice')} className="btn-primary mt-4">
                <Target className="w-4 h-4" /> Start a quiz
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Study plan + exam essentials */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 card p-6">
          <h3 className="font-bold text-ink-900 mb-4">Suggested study plan</h3>
          <ol className="space-y-3">
            {[
              { label: 'Cloud Concepts', done: false, route: '#/domains/cloud-concepts' },
              { label: 'Azure Architecture and Services', done: false, route: '#/domains/azure-fundamentals' },
              { label: 'Azure Management and Governance', done: false, route: '#/domains/azure-management' },
              { label: 'Full practice quiz', done: hasHistory, route: '#/practice' },
            ].map((step, i) => (
              <li key={step.label}>
                <button
                  onClick={() => navigate(step.route)}
                  className="flex items-center gap-3 w-full p-3 rounded-lg hover:bg-ink-50 text-left transition-colors"
                >
                  {step.done ? (
                    <CheckCircle2 className="w-5 h-5 text-primary-600 shrink-0" />
                  ) : (
                    <Circle className="w-5 h-5 text-ink-300 shrink-0" />
                  )}
                  <span className={`flex-1 text-sm ${step.done ? 'text-ink-400 line-through' : 'text-ink-700 font-medium'}`}>
                    {step.label}
                  </span>
                  <span className="text-xs text-ink-400">Step {i + 1}</span>
                </button>
              </li>
            ))}
          </ol>
        </div>

        <div className="card p-6">
          <h3 className="font-bold text-ink-900 mb-4">Exam essentials</h3>
          <dl className="space-y-3 text-sm">
            <Row label="Exam code" value="AZ-900" />
            <Row label="Format" value="Multiple choice" />
            <Row label="Passing score" value="700 / 1000" />
            <Row label="Cost" value="$99 USD" />
            <Row label="Prerequisites" value="None" />
          </dl>
          <div className="mt-5 p-4 rounded-xl bg-secondary-50 border border-secondary-100">
            <p className="text-xs font-semibold text-secondary-800">Tip</p>
            <p className="mt-1 text-xs text-secondary-700">
              Focus on the Management &amp; Governance domain — it carries the highest exam weight (40%).
            </p>
          </div>
        </div>
      </div>

      <ConfirmDialog
        open={confirmReset}
        title="Reset quiz history?"
        message="This permanently deletes all saved quiz attempts, scores, and answer history from this browser. This cannot be undone."
        confirmLabel="Yes, delete everything"
        cancelLabel="Keep my history"
        destructive
        onConfirm={handleReset}
        onCancel={() => setConfirmReset(false)}
      />
    </>
  );
}

function RecommendationCard({
  topic,
  accuracy,
  domainId,
}: {
  topic: string;
  accuracy: number;
  domainId: string;
}) {
  const domain = DOMAINS.find((d) => d.id === domainId);
  return (
    <div className="card p-6 bg-gradient-to-br from-secondary-50 to-white border-secondary-100">
      <span className="flex items-center justify-center w-11 h-11 rounded-xl bg-secondary-100 text-secondary-700 mb-3">
        <Lightbulb className="w-5 h-5" />
      </span>
      <h3 className="font-bold text-ink-900">Focus area</h3>
      <p className="mt-1.5 text-sm text-ink-600">
        Your weakest topic so far is{' '}
        <span className="font-semibold text-ink-800">{topic}</span>
        {domain ? <> in <span className="font-semibold text-ink-800">{domain.name}</span></> : null}.
        You're getting {accuracy}% of those questions right.
      </p>
      <button
        onClick={() => navigate(`#/domains/${domainId}`)}
        className="btn-primary mt-4 w-full"
      >
        Study this domain
        <ArrowRight className="w-4 h-4" />
      </button>
    </div>
  );
}

function FirstStepCard({ hasHistory }: { hasHistory: boolean }) {
  return (
    <div className="card p-6 bg-gradient-to-br from-primary-50 to-white border-primary-100">
      <span className="flex items-center justify-center w-11 h-11 rounded-xl bg-primary-100 text-primary-700 mb-3">
        <Sparkles className="w-5 h-5" />
      </span>
      <h3 className="font-bold text-ink-900">
        {hasHistory ? 'Keep going!' : 'Start your journey'}
      </h3>
      <p className="mt-1.5 text-sm text-ink-600">
        {hasHistory
          ? 'Take at least one more full quiz so we can identify your weakest topic and give you a personalized study recommendation.'
          : 'Take your first practice quiz to unlock personalized study recommendations, accuracy by domain, and attempt history — all saved on this device.'}
      </p>
      <button onClick={() => navigate('#/practice')} className="btn-primary mt-4 w-full">
        <Target className="w-4 h-4" /> Take a practice quiz
      </button>
    </div>
  );
}

function StatCard({
  icon,
  label,
  value,
  hint,
  tone,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  hint: string;
  tone: 'primary' | 'secondary' | 'accent' | 'neutral';
}) {
  const tones = {
    primary: 'bg-primary-50 text-primary-700',
    secondary: 'bg-secondary-50 text-secondary-700',
    accent: 'bg-accent-50 text-accent-700',
    neutral: 'bg-ink-100 text-ink-600',
  };
  return (
    <div className="card card-hover p-4 sm:p-5">
      <span className={`inline-flex items-center justify-center w-10 h-10 rounded-lg ${tones[tone]}`}>
        {icon}
      </span>
      <p className="mt-3 text-xl sm:text-2xl font-bold text-ink-900">{value}</p>
      <p className="text-sm font-medium text-ink-700">{label}</p>
      <p className="text-xs text-ink-400 mt-0.5">{hint}</p>
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between">
      <dt className="text-ink-500">{label}</dt>
      <dd className="font-semibold text-ink-800">{value}</dd>
    </div>
  );
}
