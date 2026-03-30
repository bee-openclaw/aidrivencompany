import { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
  Activity,
  BarChart3,
  FlaskConical,
  Megaphone,
  Award,
  Scale,
  Sparkles,
  Rocket,
  ChevronRight,
  CircleDot,
} from 'lucide-react';
import type { DashboardData, ActivityEntry } from '@aidrivencompany/shared';
import { useCompany } from '@/context/CompanyContext';
import { fetchDashboard } from '@/api/dashboard';
import { cn } from '@/lib/utils';

const ACTOR_COLORS: Record<string, string> = {
  user: 'bg-emerald-400',
  agent: 'bg-purple-400',
  system: 'bg-blue-400',
};

function groupActivities(entries: ActivityEntry[]) {
  const now = new Date();
  const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
  const yesterdayStart = todayStart - 86400000;

  const groups: { label: string; entries: ActivityEntry[] }[] = [
    { label: 'Today', entries: [] },
    { label: 'Yesterday', entries: [] },
    { label: 'Earlier', entries: [] },
  ];

  for (const entry of entries) {
    const ts = new Date(entry.createdAt).getTime();
    if (ts >= todayStart) groups[0]!.entries.push(entry);
    else if (ts >= yesterdayStart) groups[1]!.entries.push(entry);
    else groups[2]!.entries.push(entry);
  }

  return groups.filter((g) => g.entries.length > 0);
}

function formatTime(dateStr: string): string {
  const d = new Date(dateStr);
  const now = new Date();
  const diffMs = now.getTime() - d.getTime();
  const diffMin = Math.floor(diffMs / 60000);
  if (diffMin < 1) return 'just now';
  if (diffMin < 60) return `${diffMin}m ago`;
  const diffHr = Math.floor(diffMin / 60);
  if (diffHr < 24) return `${diffHr}h ago`;
  return d.toLocaleDateString();
}

function SkeletonPulse({ className }: { className?: string }) {
  return <div className={cn('animate-pulse rounded-lg bg-slate-600/40', className)} />;
}

function Welcome() {
  const navigate = useNavigate();

  return (
    <div className="flex min-h-full flex-col items-center justify-center p-8 animate-fade-in">
      <div className="max-w-lg text-center">
        <div className="mb-8 inline-flex h-20 w-20 items-center justify-center rounded-3xl bg-gradient-to-br from-amber-500/20 to-orange-500/20 ring-1 ring-amber-500/30">
          <Rocket className="h-10 w-10 text-amber-400" />
        </div>
        <h1 className="text-4xl font-bold tracking-tight text-slate-100">
          Welcome to AIDrivenCompany
        </h1>
        <p className="mx-auto mt-4 max-w-md text-lg leading-relaxed text-slate-400">
          Start by describing your vision and we&apos;ll help you build your company from the ground up.
        </p>
        <button
          onClick={() => navigate('/genesis')}
          className="btn-primary mt-10 px-8 py-4 text-lg"
        >
          <Sparkles className="h-5 w-5" />
          Create Your First Company
        </button>
      </div>
    </div>
  );
}

function LoadingSkeleton() {
  return (
    <div className="p-8 animate-fade-in">
      <SkeletonPulse className="mb-2 h-8 w-64" />
      <SkeletonPulse className="mb-8 h-5 w-96" />
      <div className="mb-8 flex gap-4">
        {Array.from({ length: 5 }).map((_, i) => (
          <SkeletonPulse key={i} className="h-20 flex-1" />
        ))}
      </div>
      <div className="grid grid-cols-5 gap-6">
        <div className="col-span-3">
          <SkeletonPulse className="h-80" />
        </div>
        <div className="col-span-2">
          <SkeletonPulse className="h-80" />
        </div>
      </div>
    </div>
  );
}

export function Dashboard() {
  const { company, companies, loading: companiesLoading } = useCompany();
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!company) return;
    setLoading(true);
    fetchDashboard(company.id)
      .then(setData)
      .catch((err) => console.error('Dashboard fetch failed:', err))
      .finally(() => setLoading(false));
  }, [company?.id]);

  if (companiesLoading) return <LoadingSkeleton />;
  if (!company || companies.length === 0) return <Welcome />;
  if (loading) return <LoadingSkeleton />;

  if (!data) {
    return (
      <div className="flex h-full flex-col items-center justify-center gap-4 text-slate-500 animate-fade-in">
        <CircleDot className="h-10 w-10" />
        <p className="text-lg font-medium">Failed to load dashboard</p>
        <p className="text-sm">Check your connection and try again.</p>
      </div>
    );
  }

  const healthPulse = [
    { label: 'Total Nodes', value: data.stats.totalNodes, icon: BarChart3, color: 'text-blue-400', glow: 'shadow-blue-500/20' },
    { label: 'Simulations', value: data.stats.activeSimulations, icon: FlaskConical, color: 'text-purple-400', glow: 'shadow-purple-500/20' },
    { label: 'Campaigns', value: data.stats.activeCampaigns, icon: Megaphone, color: 'text-orange-400', glow: 'shadow-orange-500/20' },
    { label: 'Proof Score', value: data.stats.totalProof, icon: Award, color: 'text-cyan-400', glow: 'shadow-cyan-500/20' },
    { label: 'Decisions', value: data.stats.totalDecisions, icon: Scale, color: 'text-amber-400', glow: 'shadow-amber-500/20' },
  ];

  const activityGroups = groupActivities(data.recentActivity.slice(0, 20));

  return (
    <div className="p-8 animate-fade-in">
      {/* Company Identity */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-slate-100">{company.name}</h1>
        {company.mission && (
          <p className="mt-2 text-lg text-slate-400">{company.mission}</p>
        )}
      </div>

      {/* Health Pulse Strip */}
      <div className="card glass mb-8 flex items-stretch gap-0 divide-x divide-slate-700/40 p-0">
        {healthPulse.map((stat) => (
          <div
            key={stat.label}
            className={cn(
              'flex flex-1 items-center gap-3 px-5 py-4 transition-all hover:bg-slate-800/40',
            )}
          >
            <div className={cn('flex h-9 w-9 items-center justify-center rounded-lg bg-slate-800/80 shadow-lg', stat.glow)}>
              <stat.icon className={cn('h-4 w-4', stat.color)} />
            </div>
            <div>
              <p className="text-2xl font-bold text-slate-100">{stat.value}</p>
              <p className="text-xs text-slate-500">{stat.label}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Two-column layout */}
      <div className="mb-8 grid grid-cols-1 gap-6 lg:grid-cols-5">
        {/* What's Happening - 60% */}
        <div className="card p-6 lg:col-span-3">
          <h2 className="section-title mb-5 flex items-center gap-2">
            <Activity className="h-4 w-4 text-slate-400" />
            What&apos;s Happening
          </h2>
          {data.recentActivity.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <Activity className="mb-3 h-8 w-8 text-slate-600" />
              <p className="text-sm text-slate-500">No activity yet. Start building your company to see updates here.</p>
            </div>
          ) : (
            <div className="space-y-5">
              {activityGroups.map((group) => (
                <div key={group.label}>
                  <p className="mb-3 text-xs font-medium text-slate-600">{group.label}</p>
                  <ul className="space-y-2">
                    {group.entries.map((entry) => (
                      <li
                        key={entry.id}
                        className="flex items-start gap-3 rounded-lg px-3 py-2 transition-colors hover:bg-slate-800/40"
                      >
                        <div
                          className={cn(
                            'mt-1.5 h-2 w-2 shrink-0 rounded-full',
                            ACTOR_COLORS[entry.actorType] ?? 'bg-slate-400',
                          )}
                        />
                        <div className="min-w-0 flex-1">
                          <p className="text-sm text-slate-200">
                            <span className="font-medium capitalize">{entry.actorType}</span>{' '}
                            {entry.action}{' '}
                            <span className="text-slate-500">{entry.entityType}</span>
                          </p>
                        </div>
                        <span className="shrink-0 text-xs text-slate-600">
                          {formatTime(entry.createdAt)}
                        </span>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Company Health - 40% */}
        <div className="card p-6 lg:col-span-2">
          <h2 className="section-title mb-5 flex items-center gap-2">
            <BarChart3 className="h-4 w-4 text-slate-400" />
            Company Health
          </h2>
          {data.metrics.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <BarChart3 className="mb-3 h-8 w-8 text-slate-600" />
              <p className="text-sm text-slate-500">No metrics recorded yet.</p>
            </div>
          ) : (
            <ul className="space-y-5">
              {data.metrics.map((m) => {
                const pct = m.target > 0 ? Math.min((m.value / m.target) * 100, 100) : 0;
                const barColor =
                  pct >= 80 ? 'bg-emerald-500' : pct >= 50 ? 'bg-amber-500' : 'bg-red-500';
                const glowColor =
                  pct >= 80
                    ? 'shadow-emerald-500/30'
                    : pct >= 50
                      ? 'shadow-amber-500/30'
                      : 'shadow-red-500/30';

                return (
                  <li key={m.id}>
                    <div className="mb-1.5 flex items-center justify-between text-sm">
                      <span className="font-medium text-slate-200">{m.name}</span>
                      <span className="text-slate-500">
                        {m.value} / {m.target} {m.unit}
                      </span>
                    </div>
                    <div className="h-2 overflow-hidden rounded-full bg-slate-800">
                      <div
                        className={cn(
                          'h-full rounded-full shadow-lg transition-all duration-500',
                          barColor,
                          pct >= 80 && glowColor,
                        )}
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                  </li>
                );
              })}
            </ul>
          )}
        </div>
      </div>

      {/* Pending Decisions */}
      {data.pendingDecisions.length > 0 && (
        <div>
          <h2 className="section-title mb-4 flex items-center gap-2">
            <Scale className="h-4 w-4 text-amber-400" />
            Pending Decisions
          </h2>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {data.pendingDecisions.map((d) => (
              <div
                key={d.id}
                className="card border-amber-500/20 p-5 shadow-lg shadow-amber-500/5 transition-all hover:border-amber-500/40 hover:shadow-amber-500/10"
                style={{ '--glow-color': 'rgba(245, 158, 11, 0.3)' } as React.CSSProperties}
              >
                <h3 className="mb-2 text-sm font-semibold text-slate-100">{d.title}</h3>
                <p className="mb-4 text-xs text-slate-500">
                  {d.options.length} option{d.options.length !== 1 ? 's' : ''} to evaluate
                </p>
                <Link
                  to="/decisions"
                  className="btn-primary inline-flex px-4 py-1.5 text-xs"
                >
                  <Scale className="h-3 w-3" />
                  Decide
                  <ChevronRight className="h-3 w-3" />
                </Link>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
