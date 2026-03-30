import { useEffect, useState } from 'react';
import { Scale, Check, ExternalLink, Clock } from 'lucide-react';
import type { Decision } from '@aidrivencompany/shared';
import { useCompany } from '@/context/CompanyContext';
import { fetchDecisions } from '@/api/decisions';
import { cn } from '@/lib/utils';

function SkeletonPulse({ className }: { className?: string }) {
  return <div className={cn('animate-pulse rounded-lg bg-slate-600/40', className)} />;
}

function formatDecisionDate(dateStr: string): string {
  const d = new Date(dateStr);
  return d.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

export function Decisions() {
  const { company } = useCompany();
  const [decisions, setDecisions] = useState<Decision[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!company) return;
    setLoading(true);
    fetchDecisions(company.id)
      .then(setDecisions)
      .catch((err) => console.error('Decisions fetch failed:', err))
      .finally(() => setLoading(false));
  }, [company?.id]);

  if (!company) {
    return (
      <div className="flex h-full flex-col items-center justify-center gap-3 text-slate-500 animate-fade-in">
        <Scale className="h-10 w-10" />
        <p className="text-lg font-medium">No company selected</p>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="p-8 animate-fade-in">
        <SkeletonPulse className="mb-2 h-8 w-48" />
        <SkeletonPulse className="mb-8 h-5 w-64" />
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="mb-4 flex gap-4">
            <SkeletonPulse className="h-4 w-4 shrink-0 rounded-full" />
            <SkeletonPulse className="h-32 flex-1" />
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="p-8 animate-fade-in">
      {/* Header */}
      <div className="mb-8 flex items-center gap-3">
        <Scale className="h-7 w-7 text-amber-400" />
        <h1 className="text-2xl font-bold text-slate-100">Decisions</h1>
      </div>

      {decisions.length === 0 ? (
        <div className="card flex flex-col items-center justify-center py-16 text-center">
          <Scale className="mb-4 h-12 w-12 text-slate-600" />
          <p className="text-lg font-medium text-slate-400">No decisions recorded</p>
          <p className="mt-1 text-sm text-slate-500">
            Decisions will appear here as your company evolves and choices are made.
          </p>
        </div>
      ) : (
        <div className="relative">
          {/* Timeline line */}
          <div className="absolute left-[11px] top-2 bottom-2 w-px bg-slate-700/60" />

          <ul className="space-y-6">
            {decisions.map((decision) => {
              const isDecided = !!decision.chosenOption;

              return (
                <li key={decision.id} className="relative flex gap-5 pl-0">
                  {/* Timeline dot */}
                  <div className="relative z-10 mt-5 flex shrink-0">
                    <div
                      className={cn(
                        'h-6 w-6 rounded-full border-2 flex items-center justify-center',
                        isDecided
                          ? 'border-amber-500 bg-amber-500/20'
                          : 'border-slate-600 bg-slate-800',
                      )}
                    >
                      {isDecided ? (
                        <Check className="h-3 w-3 text-amber-400" />
                      ) : (
                        <Clock className="h-3 w-3 text-slate-500" />
                      )}
                    </div>
                  </div>

                  {/* Decision card */}
                  <div className="card flex-1 p-5">
                    {/* Title and date */}
                    <div className="mb-4 flex items-start justify-between">
                      <h3 className="text-lg font-semibold text-slate-100">{decision.title}</h3>
                      <span className="ml-4 shrink-0 text-xs text-slate-500">
                        {formatDecisionDate(decision.decidedAt)}
                      </span>
                    </div>

                    {/* Options as pills */}
                    <div className="mb-4 flex flex-wrap gap-2">
                      {decision.options.map((opt) => {
                        const isChosen = opt.label === decision.chosenOption;
                        return (
                          <div
                            key={opt.label}
                            className={cn(
                              'inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm font-medium transition-all',
                              isChosen
                                ? 'bg-emerald-500/20 text-emerald-400 ring-1 ring-emerald-500/30'
                                : 'bg-slate-800/60 text-slate-400',
                            )}
                            title={opt.description}
                          >
                            {isChosen && <Check className="h-3.5 w-3.5" />}
                            {opt.label}
                          </div>
                        );
                      })}
                    </div>

                    {/* Rationale */}
                    {decision.rationale && (
                      <div className="rounded-xl bg-slate-800/40 p-4">
                        <p className="mb-1 text-[10px] font-semibold uppercase tracking-wider text-slate-500">
                          Rationale
                        </p>
                        <p className="text-sm leading-relaxed text-slate-300">
                          {decision.rationale}
                        </p>
                      </div>
                    )}

                    {/* Simulation link */}
                    {decision.simulationId && (
                      <a
                        href="/simulations"
                        className="mt-3 inline-flex items-center gap-1.5 text-xs font-medium text-amber-400 transition-colors hover:text-amber-300"
                      >
                        <ExternalLink className="h-3 w-3" />
                        View linked simulation
                      </a>
                    )}
                  </div>
                </li>
              );
            })}
          </ul>
        </div>
      )}
    </div>
  );
}
