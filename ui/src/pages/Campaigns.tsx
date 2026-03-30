import { useEffect, useState } from 'react';
import {
  Megaphone,
  Mail,
  Youtube,
  Instagram,
  MessageCircle,
  DollarSign,
  Linkedin,
  Twitter,
  Target,
  CircleDot,
} from 'lucide-react';
import type { Campaign, ChannelType, CampaignStatus } from '@aidrivencompany/shared';
import { useCompany } from '@/context/CompanyContext';
import { fetchCampaigns } from '@/api/campaigns';
import { cn } from '@/lib/utils';

const CHANNEL_ICONS: Record<ChannelType, typeof Mail> = {
  email: Mail,
  youtube: Youtube,
  instagram: Instagram,
  whatsapp: MessageCircle,
  paid: DollarSign,
  field: Target,
  linkedin: Linkedin,
  twitter: Twitter,
};

const CHANNEL_COLORS: Record<ChannelType, string> = {
  email: 'border-l-blue-400',
  youtube: 'border-l-red-400',
  instagram: 'border-l-pink-400',
  whatsapp: 'border-l-emerald-400',
  paid: 'border-l-amber-400',
  field: 'border-l-purple-400',
  linkedin: 'border-l-sky-400',
  twitter: 'border-l-cyan-400',
};

const STATUS_PILLS: Record<CampaignStatus, { bg: string; text: string }> = {
  draft: { bg: 'bg-slate-500/20', text: 'text-slate-400' },
  scheduled: { bg: 'bg-blue-500/20', text: 'text-blue-400' },
  active: { bg: 'bg-emerald-500/20', text: 'text-emerald-400' },
  paused: { bg: 'bg-amber-500/20', text: 'text-amber-400' },
  completed: { bg: 'bg-purple-500/20', text: 'text-purple-400' },
};

function SkeletonPulse({ className }: { className?: string }) {
  return <div className={cn('animate-pulse rounded-lg bg-slate-600/40', className)} />;
}

export function Campaigns() {
  const { company } = useCompany();
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeChannel, setActiveChannel] = useState<ChannelType | 'all'>('all');

  useEffect(() => {
    if (!company) return;
    setLoading(true);
    fetchCampaigns(company.id)
      .then(setCampaigns)
      .catch((err) => console.error('Campaigns fetch failed:', err))
      .finally(() => setLoading(false));
  }, [company?.id]);

  if (!company) {
    return (
      <div className="flex h-full flex-col items-center justify-center gap-3 text-slate-500 animate-fade-in">
        <Megaphone className="h-10 w-10" />
        <p className="text-lg font-medium">No company selected</p>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="p-8 animate-fade-in">
        <SkeletonPulse className="mb-2 h-8 w-48" />
        <SkeletonPulse className="mb-8 h-5 w-64" />
        <div className="mb-6 flex gap-2">
          {Array.from({ length: 5 }).map((_, i) => (
            <SkeletonPulse key={i} className="h-9 w-24" />
          ))}
        </div>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <SkeletonPulse key={i} className="h-48" />
          ))}
        </div>
      </div>
    );
  }

  const channels = Array.from(new Set(campaigns.map((c) => c.channel)));
  const filtered =
    activeChannel === 'all'
      ? campaigns
      : campaigns.filter((c) => c.channel === activeChannel);

  return (
    <div className="p-8 animate-fade-in">
      {/* Header */}
      <div className="mb-8 flex items-center gap-3">
        <Megaphone className="h-7 w-7 text-amber-400" />
        <h1 className="text-2xl font-bold text-slate-100">Go-To-Market</h1>
      </div>

      {/* Channel tabs */}
      <div className="mb-6 flex flex-wrap gap-2">
        <button
          onClick={() => setActiveChannel('all')}
          className={cn(
            'rounded-xl px-4 py-2 text-sm font-medium transition-all',
            activeChannel === 'all'
              ? 'bg-slate-800 text-slate-100 border-b-2 border-amber-500'
              : 'text-slate-400 hover:bg-slate-800/40 hover:text-slate-200',
          )}
        >
          All
        </button>
        {channels.map((ch) => {
          const Icon = CHANNEL_ICONS[ch] ?? CircleDot;
          return (
            <button
              key={ch}
              onClick={() => setActiveChannel(ch)}
              className={cn(
                'inline-flex items-center gap-2 rounded-xl px-4 py-2 text-sm font-medium transition-all',
                activeChannel === ch
                  ? 'bg-slate-800 text-slate-100 border-b-2 border-amber-500'
                  : 'text-slate-400 hover:bg-slate-800/40 hover:text-slate-200',
              )}
            >
              <Icon className="h-3.5 w-3.5" />
              <span className="capitalize">{ch}</span>
            </button>
          );
        })}
      </div>

      {/* Campaign cards */}
      {filtered.length === 0 ? (
        <div className="card flex flex-col items-center justify-center py-16 text-center">
          <Megaphone className="mb-4 h-12 w-12 text-slate-600" />
          <p className="text-lg font-medium text-slate-400">No campaigns yet</p>
          <p className="mt-1 text-sm text-slate-500">
            Campaigns will appear here once they are created from your company graph.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
          {filtered.map((campaign) => {
            const Icon = CHANNEL_ICONS[campaign.channel] ?? CircleDot;
            const statusStyle = STATUS_PILLS[campaign.status] ?? STATUS_PILLS.draft!;
            const budgetPct =
              campaign.budget > 0
                ? Math.min((campaign.spent / campaign.budget) * 100, 100)
                : 0;
            const metricEntries = Object.entries(campaign.metrics).slice(0, 4);
            const channelBorder = CHANNEL_COLORS[campaign.channel] ?? 'border-l-slate-400';

            return (
              <div
                key={campaign.id}
                className={cn('card border-l-4 p-5', channelBorder)}
              >
                {/* Top row */}
                <div className="mb-3 flex items-center justify-between">
                  <div className="flex items-center gap-2 text-slate-400">
                    <Icon className="h-4 w-4" />
                    <span className="text-xs font-medium uppercase tracking-wider capitalize">
                      {campaign.channel}
                    </span>
                  </div>
                  <span
                    className={cn('badge', statusStyle.bg, statusStyle.text)}
                  >
                    {campaign.status}
                  </span>
                </div>

                {/* Campaign name */}
                <h3 className="mb-4 text-lg font-semibold text-slate-100">{campaign.name}</h3>

                {/* Budget bar */}
                <div className="mb-4">
                  <div className="mb-1 flex items-center justify-between text-xs">
                    <span className="text-slate-500">Budget</span>
                    <span className="text-slate-400">
                      ${campaign.spent.toLocaleString()} / ${campaign.budget.toLocaleString()}
                    </span>
                  </div>
                  <div className="h-1.5 overflow-hidden rounded-full bg-slate-800">
                    <div
                      className={cn(
                        'h-full rounded-full transition-all',
                        budgetPct > 90
                          ? 'bg-red-500'
                          : budgetPct > 70
                            ? 'bg-amber-500'
                            : 'bg-emerald-500',
                      )}
                      style={{ width: `${budgetPct}%` }}
                    />
                  </div>
                </div>

                {/* Metrics grid */}
                {metricEntries.length > 0 && (
                  <div className="grid grid-cols-2 gap-3">
                    {metricEntries.map(([key, value]) => (
                      <div key={key} className="rounded-lg bg-slate-800/40 px-3 py-2">
                        <p className="text-[10px] font-medium uppercase tracking-wider text-slate-500">
                          {key}
                        </p>
                        <p className="text-lg font-bold text-slate-100">
                          {typeof value === 'number' ? value.toLocaleString() : value}
                        </p>
                      </div>
                    ))}
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
