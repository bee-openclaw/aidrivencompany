import type { NodeType } from '@aidrivencompany/shared';
import { cn } from '@/lib/utils';

const NODE_COLORS: Record<NodeType, string> = {
  idea: 'bg-purple-500/20 text-purple-400 border-purple-500/30',
  icp: 'bg-amber-500/20 text-amber-400 border-amber-500/30',
  feature: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
  pricing: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30',
  channel: 'bg-pink-500/20 text-pink-400 border-pink-500/30',
  campaign: 'bg-orange-500/20 text-orange-400 border-orange-500/30',
  proof: 'bg-cyan-500/20 text-cyan-400 border-cyan-500/30',
  metric: 'bg-indigo-500/20 text-indigo-400 border-indigo-500/30',
  risk: 'bg-red-500/20 text-red-400 border-red-500/30',
  decision: 'bg-lime-500/20 text-lime-400 border-lime-500/30',
  workflow: 'bg-slate-500/20 text-slate-400 border-slate-500/30',
  agent: 'bg-teal-500/20 text-teal-400 border-teal-500/30',
  goal: 'bg-purple-500/20 text-purple-400 border-purple-500/30',
  milestone: 'bg-sky-500/20 text-sky-400 border-sky-500/30',
};

interface NodeBadgeProps {
  type: NodeType;
  className?: string;
}

export function NodeBadge({ type, className }: NodeBadgeProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center rounded-md border px-2 py-0.5 text-xs font-medium capitalize',
        NODE_COLORS[type] ?? 'bg-gray-500/20 text-gray-400 border-gray-500/30',
        className,
      )}
    >
      {type}
    </span>
  );
}
