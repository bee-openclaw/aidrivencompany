import { useEffect, useState } from 'react';
import { FlaskConical, ChevronDown, ChevronRight, Check, XIcon } from 'lucide-react';
import type { Simulation, SimulationStatus, SimulationSeverity } from '@aidrivencompany/shared';
import { useCompany } from '@/context/CompanyContext';
import { fetchSimulations, applySimulation, rejectSimulation } from '@/api/simulations';
import { NodeBadge } from '@/components/NodeBadge';
import { cn } from '@/lib/utils';

const STATUS_STYLES: Record<SimulationStatus, string> = {
  pending: 'bg-gray-500/20 text-gray-400',
  running: 'bg-blue-500/20 text-blue-400',
  completed: 'bg-emerald-500/20 text-emerald-400',
  applied: 'bg-purple-500/20 text-purple-400',
  rejected: 'bg-red-500/20 text-red-400',
};

const SEVERITY_STYLES: Record<SimulationSeverity, string> = {
  low: 'text-gray-400',
  medium: 'text-amber-400',
  high: 'text-orange-400',
  critical: 'text-red-400',
};

export function Simulations() {
  const { company } = useCompany();
  const [simulations, setSimulations] = useState<Simulation[]>([]);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!company) return;
    setLoading(true);
    fetchSimulations(company.id)
      .then(setSimulations)
      .catch((err) => console.error('Simulations fetch failed:', err))
      .finally(() => setLoading(false));
  }, [company?.id]);

  async function handleApply(simId: string) {
    if (!company) return;
    try {
      const updated = await applySimulation(company.id, simId);
      setSimulations((prev) => prev.map((s) => (s.id === simId ? updated : s)));
    } catch (err) {
      console.error('Apply failed:', err);
    }
  }

  async function handleReject(simId: string) {
    if (!company) return;
    try {
      const updated = await rejectSimulation(company.id, simId);
      setSimulations((prev) => prev.map((s) => (s.id === simId ? updated : s)));
    } catch (err) {
      console.error('Reject failed:', err);
    }
  }

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
        <FlaskConical className="h-6 w-6 text-purple-400" />
        <h1 className="text-2xl font-bold text-gray-100">Simulations</h1>
        <span className="rounded-full bg-gray-800 px-2.5 py-0.5 text-xs font-medium text-gray-400">
          {simulations.length}
        </span>
      </div>

      {simulations.length === 0 ? (
        <div className="rounded-xl border border-gray-800 bg-gray-900 p-12 text-center text-gray-500">
          No simulations yet
        </div>
      ) : (
        <div className="space-y-3">
          {simulations.map((sim) => {
            const isExpanded = expandedId === sim.id;
            return (
              <div
                key={sim.id}
                className="rounded-xl border border-gray-800 bg-gray-900"
              >
                <button
                  onClick={() => setExpandedId(isExpanded ? null : sim.id)}
                  className="flex w-full items-center gap-4 p-5 text-left"
                >
                  {isExpanded ? (
                    <ChevronDown className="h-4 w-4 shrink-0 text-gray-400" />
                  ) : (
                    <ChevronRight className="h-4 w-4 shrink-0 text-gray-400" />
                  )}
                  <div className="min-w-0 flex-1">
                    <p className="font-medium text-gray-100">{sim.title}</p>
                    <p className="mt-0.5 text-sm text-gray-400">{sim.description}</p>
                  </div>
                  <span
                    className={cn(
                      'shrink-0 rounded-md px-2.5 py-0.5 text-xs font-medium capitalize',
                      STATUS_STYLES[sim.status],
                    )}
                  >
                    {sim.status}
                  </span>
                </button>

                {isExpanded && (
                  <div className="border-t border-gray-800 p-5">
                    {sim.impactReport.length === 0 ? (
                      <p className="text-sm text-gray-500">No impact data available</p>
                    ) : (
                      <div className="space-y-3">
                        <h3 className="text-xs font-semibold uppercase tracking-wide text-gray-500">
                          Impact Report
                        </h3>
                        {sim.impactReport.map((impact, i) => (
                          <div
                            key={i}
                            className="rounded-lg border border-gray-800 bg-gray-950 p-4"
                          >
                            <div className="mb-2 flex items-center gap-2">
                              <NodeBadge type={impact.nodeType} />
                              <span className="text-sm font-medium text-gray-200">
                                {impact.nodeTitle}
                              </span>
                              <span
                                className={cn(
                                  'ml-auto text-xs font-medium uppercase',
                                  SEVERITY_STYLES[impact.severity],
                                )}
                              >
                                {impact.severity}
                              </span>
                            </div>
                            <p className="text-sm text-gray-400">{impact.description}</p>
                            {impact.recommendation && (
                              <p className="mt-2 text-xs text-gray-500">
                                Recommendation: {impact.recommendation}
                              </p>
                            )}
                          </div>
                        ))}
                      </div>
                    )}

                    {sim.status === 'completed' && (
                      <div className="mt-4 flex gap-3">
                        <button
                          onClick={() => handleApply(sim.id)}
                          className="flex items-center gap-2 rounded-lg bg-emerald-600 px-4 py-2 text-sm font-medium text-white hover:bg-emerald-500"
                        >
                          <Check className="h-4 w-4" />
                          Apply
                        </button>
                        <button
                          onClick={() => handleReject(sim.id)}
                          className="flex items-center gap-2 rounded-lg bg-red-600/20 px-4 py-2 text-sm font-medium text-red-400 hover:bg-red-600/30"
                        >
                          <XIcon className="h-4 w-4" />
                          Reject
                        </button>
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
