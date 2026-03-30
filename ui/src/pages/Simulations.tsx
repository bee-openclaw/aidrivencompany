import { useEffect, useState } from 'react';
import {
  Sparkles,
  ChevronDown,
  ChevronUp,
  Check,
  XCircle,
  FlaskConical,
} from 'lucide-react';
import type { Simulation, SimulationSeverity, NodeType } from '@aidrivencompany/shared';
import { useCompany } from '@/context/CompanyContext';
import { fetchSimulations, applySimulation, rejectSimulation } from '@/api/simulations';
import { fetchGraph, type GraphData } from '@/api/graph';
import { NodeBadge } from '@/components/NodeBadge';
import { cn } from '@/lib/utils';

const STATUS_STYLES: Record<string, { dot: string; label: string }> = {
  pending: { dot: 'bg-amber-400 shadow-amber-400/50', label: 'Pending' },
  running: { dot: 'bg-blue-400 shadow-blue-400/50 animate-pulse-soft', label: 'Running' },
  completed: { dot: 'bg-emerald-400 shadow-emerald-400/50', label: 'Completed' },
  applied: { dot: 'bg-purple-400 shadow-purple-400/50', label: 'Applied' },
  rejected: { dot: 'bg-red-400 shadow-red-400/50', label: 'Rejected' },
};

const SEVERITY_STYLES: Record<SimulationSeverity, { border: string; pill: string }> = {
  low: { border: 'border-l-emerald-500', pill: 'bg-emerald-500/20 text-emerald-400' },
  medium: { border: 'border-l-amber-500', pill: 'bg-amber-500/20 text-amber-400' },
  high: { border: 'border-l-orange-500', pill: 'bg-orange-500/20 text-orange-400' },
  critical: { border: 'border-l-red-500', pill: 'bg-red-500/20 text-red-400' },
};

function SkeletonPulse({ className }: { className?: string }) {
  return <div className={cn('animate-pulse rounded-lg bg-slate-600/40', className)} />;
}

export function Simulations() {
  const { company } = useCompany();
  const [simulations, setSimulations] = useState<Simulation[]>([]);
  const [graphData, setGraphData] = useState<GraphData | null>(null);
  const [loading, setLoading] = useState(true);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [applying, setApplying] = useState<string | null>(null);

  useEffect(() => {
    if (!company) return;
    setLoading(true);
    Promise.all([fetchSimulations(company.id), fetchGraph(company.id)])
      .then(([sims, graph]) => {
        setSimulations(sims);
        setGraphData(graph);
      })
      .catch((err) => console.error('Simulations fetch failed:', err))
      .finally(() => setLoading(false));
  }, [company?.id]);

  async function handleApply(simId: string) {
    if (!company) return;
    setApplying(simId);
    try {
      const updated = await applySimulation(company.id, simId);
      setSimulations((prev) => prev.map((s) => (s.id === simId ? updated : s)));
    } catch (err) {
      console.error('Failed to apply simulation:', err);
    } finally {
      setApplying(null);
    }
  }

  async function handleReject(simId: string) {
    if (!company) return;
    setApplying(simId);
    try {
      const updated = await rejectSimulation(company.id, simId);
      setSimulations((prev) => prev.map((s) => (s.id === simId ? updated : s)));
    } catch (err) {
      console.error('Failed to reject simulation:', err);
    } finally {
      setApplying(null);
    }
  }

  if (!company) {
    return (
      <div className="flex h-full flex-col items-center justify-center gap-3 text-slate-500 animate-fade-in">
        <FlaskConical className="h-10 w-10" />
        <p className="text-lg font-medium">No company selected</p>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="p-8 animate-fade-in">
        <SkeletonPulse className="mb-2 h-8 w-48" />
        <SkeletonPulse className="mb-8 h-5 w-80" />
        <SkeletonPulse className="mb-4 h-32" />
        <SkeletonPulse className="mb-4 h-24" />
        <SkeletonPulse className="h-24" />
      </div>
    );
  }

  return (
    <div className="p-8 animate-fade-in">
      {/* Header */}
      <div className="mb-8 flex items-center gap-3">
        <Sparkles className="h-7 w-7 text-amber-400" />
        <h1 className="text-2xl font-bold text-slate-100">What If...</h1>
      </div>

      {/* New Simulation CTA */}
      <div className="card mb-8 border-amber-500/20 bg-gradient-to-r from-slate-900/80 to-slate-800/40 p-6">
        <h2 className="mb-1 text-lg font-semibold text-slate-100">Explore a new possibility</h2>
        <p className="mb-4 text-sm text-slate-400">
          Ask a what-if question to simulate changes across your company graph.
        </p>
        <div className="flex gap-3">
          <input
            type="text"
            placeholder="What if we doubled the price?"
            className="input flex-1"
          />
          {graphData && graphData.nodes.length > 0 && (
            <select className="input w-48">
              <option value="">Select node...</option>
              {graphData.nodes.map((n) => (
                <option key={n.id} value={n.id}>
                  {n.title}
                </option>
              ))}
            </select>
          )}
          <button className="btn-primary shrink-0">
            <FlaskConical className="h-4 w-4" />
            Run Simulation
          </button>
        </div>
      </div>

      {/* Simulation List */}
      {simulations.length === 0 ? (
        <div className="card flex flex-col items-center justify-center py-16 text-center">
          <FlaskConical className="mb-4 h-12 w-12 text-slate-600" />
          <p className="text-lg font-medium text-slate-400">No simulations yet</p>
          <p className="mt-1 text-sm text-slate-500">
            Run your first what-if scenario to see how changes ripple through your company.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {simulations.map((sim) => {
            const isExpanded = expandedId === sim.id;
            const status = STATUS_STYLES[sim.status] ?? STATUS_STYLES.pending!;
            const isActionable = sim.status === 'completed';

            return (
              <div key={sim.id} className="card overflow-hidden">
                {/* Collapsed header */}
                <button
                  onClick={() => setExpandedId(isExpanded ? null : sim.id)}
                  className="flex w-full items-center gap-4 p-5 text-left transition-colors hover:bg-slate-800/30"
                >
                  <div className={cn('h-2.5 w-2.5 shrink-0 rounded-full shadow-lg', status.dot)} />
                  <div className="min-w-0 flex-1">
                    <h3 className="font-semibold text-slate-100">{sim.title}</h3>
                    <p className="mt-0.5 text-sm text-slate-400 line-clamp-1">{sim.description}</p>
                  </div>
                  <span className="badge bg-slate-800/60 text-slate-400">{status.label}</span>
                  {isExpanded ? (
                    <ChevronUp className="h-4 w-4 shrink-0 text-slate-500" />
                  ) : (
                    <ChevronDown className="h-4 w-4 shrink-0 text-slate-500" />
                  )}
                </button>

                {/* Expanded impact report */}
                {isExpanded && (
                  <div className="border-t border-slate-700/40 p-5 animate-fade-in">
                    <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
                      {/* Left: Trigger */}
                      <div>
                        <h4 className="section-title mb-3">Trigger Change</h4>
                        <div className="rounded-xl bg-slate-800/40 p-4">
                          <p className="text-sm text-slate-300">{sim.description}</p>
                          {Object.keys(sim.triggerChange).length > 0 && (
                            <div className="mt-3 space-y-1">
                              {Object.entries(sim.triggerChange).map(([key, value]) => (
                                <p key={key} className="text-xs text-slate-500">
                                  <span className="font-medium text-slate-400">{key}:</span>{' '}
                                  {String(value)}
                                </p>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Right: Impacts */}
                      <div>
                        <h4 className="section-title mb-3">Impact Report</h4>
                        {sim.impactReport.length === 0 ? (
                          <p className="text-sm text-slate-500">No impacts detected.</p>
                        ) : (
                          <ul className="space-y-3">
                            {sim.impactReport.map((impact, idx) => {
                              const sev = SEVERITY_STYLES[impact.severity] ?? SEVERITY_STYLES.low!;
                              return (
                                <li
                                  key={idx}
                                  className={cn(
                                    'rounded-lg border-l-4 bg-slate-800/40 p-3',
                                    sev.border,
                                  )}
                                >
                                  <div className="mb-1.5 flex items-center gap-2">
                                    <NodeBadge type={impact.nodeType as NodeType} />
                                    <span className="text-sm font-medium text-slate-200">
                                      {impact.nodeTitle}
                                    </span>
                                    <span className={cn('badge ml-auto', sev.pill)}>
                                      {impact.severity}
                                    </span>
                                  </div>
                                  <p className="text-sm text-slate-300">{impact.description}</p>
                                  {impact.recommendation && (
                                    <p className="mt-1.5 text-xs italic text-slate-500">
                                      {impact.recommendation}
                                    </p>
                                  )}
                                </li>
                              );
                            })}
                          </ul>
                        )}
                      </div>
                    </div>

                    {/* Action buttons */}
                    {isActionable && (
                      <div className="mt-6 flex items-center justify-end gap-3 border-t border-slate-700/40 pt-5">
                        <button
                          onClick={() => handleReject(sim.id)}
                          disabled={applying === sim.id}
                          className="inline-flex items-center gap-2 rounded-xl border border-red-500/30 px-4 py-2 text-sm font-medium text-red-400 transition-all hover:bg-red-500/10 disabled:opacity-50"
                        >
                          <XCircle className="h-4 w-4" />
                          Reject
                        </button>
                        <button
                          onClick={() => handleApply(sim.id)}
                          disabled={applying === sim.id}
                          className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-emerald-500 to-emerald-600 px-5 py-2 text-sm font-semibold text-slate-950 shadow-lg shadow-emerald-500/20 transition-all hover:brightness-110 disabled:opacity-50"
                        >
                          <Check className="h-4 w-4" />
                          Apply Changes
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
