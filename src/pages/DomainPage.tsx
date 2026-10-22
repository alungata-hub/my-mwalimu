import { useState } from 'react';
import { ArrowLeft, CircleCheck as CheckCircle2, ChevronDown, Circle, ListChecks } from 'lucide-react';
import { getDomain } from '@/lib/curriculum';
import { navigate } from '@/lib/router';
import { PageHeader } from '@/components/PageHeader';

interface DomainPageProps {
  domainId: string;
}

export function DomainPage({ domainId }: DomainPageProps) {
  const domain = getDomain(domainId);
  const [openTopic, setOpenTopic] = useState<string | null>(domain?.topics[0]?.id ?? null);
  const [completed, setCompleted] = useState<Set<string>>(new Set());

  if (!domain) {
    return (
      <div className="card p-10 text-center">
        <p className="text-ink-700 font-medium">Domain not found.</p>
        <button onClick={() => navigate('#/dashboard')} className="btn-secondary mt-4">
          <ArrowLeft className="w-4 h-4" /> Back to dashboard
        </button>
      </div>
    );
  }

  const Icon = domain.icon;
  const completedCount = completed.size;
  const progress = Math.round((completedCount / domain.topics.length) * 100);

  const toggleTopic = (id: string) => {
    setCompleted((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  return (
    <>
      <button
        onClick={() => navigate('#/dashboard')}
        className="btn-ghost mb-2 -ml-3"
      >
        <ArrowLeft className="w-4 h-4" /> Dashboard
      </button>

      <PageHeader
        eyebrow={`${domain.weight}% of exam`}
        title={domain.name}
        subtitle={domain.description}
        actions={
          <span className="chip bg-primary-50 text-primary-700">
            <ListChecks className="w-3.5 h-3.5" />
            {completedCount}/{domain.topics.length} done
          </span>
        }
      />

      {/* Progress bar */}
      <div className="card p-5 mb-6">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-semibold text-ink-700">Domain progress</span>
          <span className="text-sm font-bold text-primary-700">{progress}%</span>
        </div>
        <div className="h-2 rounded-full bg-ink-100 overflow-hidden">
          <div
            className="h-full rounded-full bg-primary-600 transition-all duration-300"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      {/* Topics */}
      <div className="space-y-3">
        {domain.topics.map((topic) => {
          const isOpen = openTopic === topic.id;
          const isDone = completed.has(topic.id);
          return (
            <div key={topic.id} className="card overflow-hidden">
              <button
                onClick={() => setOpenTopic(isOpen ? null : topic.id)}
                className="flex items-center gap-4 w-full p-5 text-left hover:bg-ink-50/50 transition-colors"
              >
                <span className={`flex items-center justify-center w-10 h-10 rounded-xl shrink-0 ${isDone ? 'bg-primary-100 text-primary-700' : 'bg-ink-100 text-ink-500'}`}>
                  {isDone ? <CheckCircle2 className="w-5 h-5" /> : <Icon className="w-5 h-5" />}
                </span>
                <div className="flex-1 min-w-0">
                  <h3 className={`font-semibold ${isDone ? 'text-ink-400 line-through' : 'text-ink-900'}`}>
                    {topic.title}
                  </h3>
                  <p className="text-sm text-ink-500 truncate">{topic.summary}</p>
                </div>
                <ChevronDown className={`w-5 h-5 text-ink-400 shrink-0 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
              </button>

              {isOpen && (
                <div className="px-5 pb-5 pt-1 border-t border-ink-100">
                  <div className="pl-14">
                    <p className="text-sm text-ink-600 mb-3 mt-3">{topic.summary}</p>
                    <h4 className="text-xs font-semibold uppercase tracking-wider text-ink-400 mb-2">
                      Key points
                    </h4>
                    <ul className="space-y-2">
                      {topic.keyPoints.map((point, i) => (
                        <li key={i} className="flex items-start gap-2.5 text-sm text-ink-700">
                          <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-primary-500 shrink-0" />
                          {point}
                        </li>
                      ))}
                    </ul>
                    <button
                      onClick={() => toggleTopic(topic.id)}
                      className={`mt-4 ${isDone ? 'btn-secondary' : 'btn-primary'}`}
                    >
                      {isDone ? (
                        <>
                          <Circle className="w-4 h-4" /> Mark as not done
                        </>
                      ) : (
                        <>
                          <CheckCircle2 className="w-4 h-4" /> Mark as complete
                        </>
                      )}
                    </button>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </>
  );
}
