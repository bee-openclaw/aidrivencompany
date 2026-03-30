import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Activity, BarChart3, FlaskConical, Megaphone, Award, Scale, Sparkles, Rocket } from 'lucide-react';
import type { DashboardData } from '@aidrivencompany/shared';
import { useCompany } from '@/context/CompanyContext';
import { fetchDashboard } from '@/api/dashboard';
import { cn } from '@/lib/utils';

function Welcome() {
  const navigate = useNavigate();

  return (
    <div className="flex min-h-full flex-col items-center justify-center p-8">
      <div className="max-w-lg text-center">
        <div className="mb-8 inline-flex h-20 w-20 items-center justify-center rounded-3xl bg-gradient-to-br from-primary-500/20 to-purple-500/20 ring-1 ring-primary-500/30">
          <Rocket className="h-10 w-10 text-primary-400" />
        </div>
        <h1 className="text-4xl font-bold tracking-tight text-gray-100">
          Welcome to AIDrivenCompany
        </h1>
        <p className="mx-auto mt-4 max-w-md text-lg leading-relaxed text-gray-400">
          Start by describing your vision and we&apos;ll help you build your company.
        </p>
        <button
          onClick={() => navigate('/genesis')}
          className="mt-10 inline-flex items-center gap-3 rounded-xl bg-gradient-to-r from-primary-600 to-purple-600 px-8 py-4 text-lg font-semibold text-white shadow-lg shadow-primary-900/30 transition-all hover:from-primary-500 hover:to-purple-500 hover:shadow-primary-900/50"
        >
          <Sparkles className="h-5 w-5" />
          Create Your First Company
        </button>
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

  if (companiesLoading) {
    return (
      <div className="flex h-full items-center justify-center text-gray-500">Loading...</div>
    );
  }

  if (!company || companies.length === 0) {
    return <Welcome />;
  }

  if (loading) {
    return (
      <div className="flex h-full items-center justify-center text-gray-500">Loading...</div>
    );
  }

  if (!data) {
    return (
      <div className="flex h-full items-center justify-center text-gray-500">
        Failed to load dashboard
      </div>
    );
  }

  const stats = [
    {
      label: 'Total Nodes',
      value: data.stats.totalNodes,
      icon: BarChart3,
      color: 'text-blue-400',
    },
    {
      label: 'Active Simulations',
      value: data.stats.activeSimulations,
      icon: FlaskConical,
      color: 'text-purple-400',
    },
    {
      label: 'Active Campaigns',
      value: data.stats.activeCampaigns,
      icon: Megaphone,
      color: 'text-orange-400',
    },
    {
      label: 'Proof Items',
      value: data.stats.totalProof,
      icon: Award,
      color: 'text-cyan-400',
    },
  ];

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-100">{company.name}</h1>
        {company.mission && <p className="mt-1 text-sm text-gray-400">{company.mission}</p>}
      </div>

      {/* Stats Row */}
      <div className="mb-8 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => (
          <div
            key={stat.label}
            className="rounded-xl border border-gray-800 bg-gray-900 p-6"
          >
            <div className="flex items-center justify-between">
              <p className="text-sm font-medium text-gray-400">{stat.label}</p>
              <stat.icon className={cn('h-5 w-5', stat.color)} />
            </div>
            <p className="mt-2 text-3xl font-bold text-gray-100">{stat.value}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
        {/* Recent Activity */}
        <div className="rounded-xl border border-gray-800 bg-gray-900 p-6">
          <h2 className="mb-4 flex items-center gap-2 text-lg font-semibold text-gray-100">
            <Activity className="h-5 w-5 text-gray-400" />
            Recent Activity
          </h2>
          {data.recentActivity.length === 0 ? (
            <p className="text-sm text-gray-500">No recent activity</p>
          ) : (
            <ul className="space-y-3">
              {data.recentActivity.slice(0, 10).map((entry) => (
                <li
                  key={entry.id}
                  className="flex items-start gap-3 border-b border-gray-800 pb-3 last:border-0"
                >
                  <div
                    className={cn(
                      'mt-1 h-2 w-2 shrink-0 rounded-full',
                      entry.actorType === 'agent'
                        ? 'bg-purple-400'
                        : entry.actorType === 'system'
                          ? 'bg-blue-400'
                          : 'bg-green-400',
                    )}
                  />
                  <div className="min-w-0 flex-1">
                    <p className="text-sm text-gray-200">
                      <span className="font-medium capitalize">{entry.actorType}</span>{' '}
                      {entry.action}{' '}
                      <span className="text-gray-400">{entry.entityType}</span>
                    </p>
                    <p className="text-xs text-gray-500">
                      {new Date(entry.createdAt).toLocaleString()}
                    </p>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* Key Metrics */}
        <div className="rounded-xl border border-gray-800 bg-gray-900 p-6">
          <h2 className="mb-4 flex items-center gap-2 text-lg font-semibold text-gray-100">
            <BarChart3 className="h-5 w-5 text-gray-400" />
            Key Metrics
          </h2>
          {data.metrics.length === 0 ? (
            <p className="text-sm text-gray-500">No metrics recorded</p>
          ) : (
            <ul className="space-y-4">
              {data.metrics.map((m) => {
                const pct = m.target > 0 ? Math.min((m.value / m.target) * 100, 100) : 0;
                return (
                  <li key={m.id}>
                    <div className="mb-1 flex items-center justify-between text-sm">
                      <span className="font-medium text-gray-200">{m.name}</span>
                      <span className="text-gray-400">
                        {m.value} / {m.target} {m.unit}
                      </span>
                    </div>
                    <div className="h-2 overflow-hidden rounded-full bg-gray-800">
                      <div
                        className={cn(
                          'h-full rounded-full transition-all',
                          pct >= 80 ? 'bg-emerald-500' : pct >= 50 ? 'bg-amber-500' : 'bg-red-500',
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
        <div className="mt-8 rounded-xl border border-gray-800 bg-gray-900 p-6">
          <h2 className="mb-4 flex items-center gap-2 text-lg font-semibold text-gray-100">
            <Scale className="h-5 w-5 text-gray-400" />
            Pending Decisions
          </h2>
          <ul className="space-y-3">
            {data.pendingDecisions.map((d) => (
              <li
                key={d.id}
                className="flex items-center justify-between rounded-lg border border-gray-800 bg-gray-950 px-4 py-3"
              >
                <div>
                  <p className="text-sm font-medium text-gray-200">{d.title}</p>
                  <p className="text-xs text-gray-500">
                    {d.options.length} option{d.options.length !== 1 ? 's' : ''}
                  </p>
                </div>
                <span className="rounded-md bg-amber-500/20 px-2 py-0.5 text-xs font-medium text-amber-400">
                  Pending
                </span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
