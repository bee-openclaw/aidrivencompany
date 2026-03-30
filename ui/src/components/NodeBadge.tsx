import type { NodeType } from '@aidrivencompany/shared';
import { cn } from '@/lib/utils';

const NODE_STYLES: Record<NodeType, { dot: string; text: string; border: string; bg: string }> = {
  idea:      { dot: 'bg-violet-400',  text: 'text-violet-300',  border: 'border-l-violet-400',  bg: 'bg-violet-500/10' },
  icp:       { dot: 'bg-amber-400',   text: 'text-amber-300',   border: 'border-l-amber-400',   bg: 'bg-amber-500/10' },
  feature:   { dot: 'bg-blue-400',    text: 'text-blue-300',    border: 'border-l-blue-400',    bg: 'bg-blue-500/10' },
  pricing:   { dot: 'bg-emerald-400', text: 'text-emerald-300', border: 'border-l-emerald-400', bg: 'bg-emerald-500/10' },
  channel:   { dot: 'bg-pink-400',    text: 'text-pink-300',    border: 'border-l-pink-400',    bg: 'bg-pink-500/10' },
  campaign:  { dot: 'bg-orange-400',  text: 'text-orange-300',  border: 'border-l-orange-400',  bg: 'bg-orange-500/10' },
  proof:     { dot: 'bg-cyan-400',    text: 'text-cyan-300',    border: 'border-l-cyan-400',    bg: 'bg-cyan-500/10' },
  metric:    { dot: 'bg-indigo-400',  text: 'text-indigo-300',  border: 'border-l-indigo-400',  bg: 'bg-indigo-500/10' },
  risk:      { dot: 'bg-red-400',     text: 'text-red-300',     border: 'border-l-red-400',     bg: 'bg-red-500/10' },
  decision:  { dot: 'bg-lime-400',    text: 'text-lime-300',    border: 'border-l-lime-400',    bg: 'bg-lime-500/10' },
  goal:      { dot: 'bg-purple-400',  text: 'text-purple-300',  border: 'border-l-purple-400',  bg: 'bg-purple-500/10' },
  milestone: { dot: 'bg-sky-400',     text: 'text-sky-300',     border: 'border-l-sky-400',     bg: 'bg-sky-500/10' },
  workflow:  { dot: 'bg-slate-400',   text: 'text-slate-300',   border: 'border-l-slate-400',   bg: 'bg-slate-500/10' },
  agent:     { dot: 'bg-teal-400',    text: 'text-teal-300',    border: 'border-l-teal-400',    bg: 'bg-teal-500/10' },
};

const FALLBACK = { dot: 'bg-slate-400', text: 'text-slate-300', border: 'border-l-slate-400', bg: 'bg-slate-500/10' };

interface NodeBadgeProps {
  type: NodeType;
  className?: string;
}

export function NodeBadge({ type, className }: NodeBadgeProps) {
  const style = NODE_STYLES[type] ?? FALLBACK;

  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 rounded-lg border-l-2 px-2.5 py-0.5 text-xs font-medium capitalize',
        style.bg,
        style.text,
        style.border,
        className,
      )}
    >
      <span className={cn('h-1.5 w-1.5 rounded-full', style.dot)} />
      {type}
    </span>
  );
}
