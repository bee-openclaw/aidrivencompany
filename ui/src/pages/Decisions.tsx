import { useEffect, useState } from 'react';
import { Scale, ExternalLink, CheckCircle2 } from 'lucide-react';
import type { Decision } from '@aidrivencompany/shared';
import { useCompany } from '@/context/CompanyContext';
import { fetchDecisions } from '@/api/decisions';
import { cn } from '@/lib/utils';

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
      <div className="flex h-full items-center justify-center text-gray-500">
        No company selected
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex h-full items-center justify-center text-gray-500">Loading...</div>
    );
  }

  return (
    <div className="p-8">
      <div className="mb-8 flex items-center gap-3">
        <Scale className="h-6 w-6 text-lime-400" />
        <h1 className="text-2xl font-bold text-gray-100">Decision Log</h1>
        <span className="rounded-full bg-gray-800 px-2.5 py-0.5 text-xs font-medium text-gray-400">
          {decisions.length}
        </span>
      </div>

      {decisions.length === 0 ? (
        <div className="rounded-xl border border-gray-800 bg-gray-900 p-12 text-center text-gray-500">
          No decisions recorded
        </div>
      ) : (
        <div className="space-y-4">
          {decisions.map((decision) => (
            <div
              key={decision.id}
              className="rounded-xl border border-gray-800 bg-gray-900 p-6"
            >
              <div className="mb-3 flex items-start justify-between">
                <h3 className="text-lg font-medium text-gray-100">{decision.title}</h3>
                <span className="shrink-0 text-xs text-gray-500">
                  {new Date(decision.decidedAt).toLocaleDateString()}
                </span>
              </div>

              <div className="mb-4 space-y-2">
                {decision.options.map((opt) => {
                  const isChosen = opt.label === decision.chosenOption;
                  return (
                    <div
                      key={opt.label}
                      className={cn(
                        'flex items-start gap-3 rounded-lg border px-4 py-3',
                        isChosen
                          ? 'border-emerald-500/30 bg-emerald-500/10'
                          : 'border-gray-800 bg-gray-950',
                      )}
                    >
                      {isChosen && (
                        <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-emerald-400" />
                      )}
                      <div className={cn(!isChosen && 'ml-7')}>
                        <p
                          className={cn(
                            'text-sm font-medium',
                            isChosen ? 'text-emerald-300' : 'text-gray-400',
                          )}
                        >
                          {opt.label}
                        </p>
                        {opt.description && (
                          <p className="mt-0.5 text-xs text-gray-500">{opt.description}</p>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>

              {decision.rationale && (
                <div className="rounded-lg bg-gray-950 p-4">
                  <p className="mb-1 text-xs font-semibold uppercase tracking-wide text-gray-500">
                    Rationale
                  </p>
                  <p className="text-sm text-gray-300">{decision.rationale}</p>
                </div>
              )}

              {decision.simulationId && (
                <div className="mt-3 flex items-center gap-1.5 text-xs text-primary-400">
                  <ExternalLink className="h-3 w-3" />
                  <span>Linked to simulation</span>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
