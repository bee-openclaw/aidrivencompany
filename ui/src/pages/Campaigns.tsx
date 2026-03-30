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
  Globe,
} from 'lucide-react';
import type { Campaign, CampaignStatus, ChannelType } from '@aidrivencompany/shared';
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

const CHANNEL_LABELS: ChannelType[] = [
  'email', 'youtube', 'linkedin', 'twitter', 'instagram', 'whatsapp', 'paid', 'field',
];

const STATUS_STYLES: Record<CampaignStatus, string> = {
  draft: 'bg-gray-500/20 text-gray-400',
  scheduled: 'bg-blue-500/20 text-blue-400',
  active: 'bg-emerald-500/20 text-emerald-400',
  paused: 'bg-amber-500/20 text-amber-400',
  completed: 'bg-purple-500/20 text-purple-400',
};

export function Campaigns() {
  const { company } = useCompany();
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [filter, setFilter] = useState<'all' | ChannelType>('all');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!company) return;
    setLoading(true);
    fetchCampaigns(company.id)
      .then(setCampaigns)
      .catch((err) => console.error('Campaigns fetch failed:', err))
      .finally(() => setLoading(false));
  }, [company?.id]);

  const filtered =
    filter === 'all' ? campaigns : campaigns.filter((c) => c.channel === filter);

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
      <div className="mb-6 flex items-center gap-3">
        <Megaphone className="h-6 w-6 text-orange-400" />
        <h1 className="text-2xl font-bold text-gray-100">Campaigns</h1>
        <span className="rounded-full bg-gray-800 px-2.5 py-0.5 text-xs font-medium text-gray-400">
          {campaigns.length}
        </span>
      </div>

      {/* Channel Tabs */}
      <div className="mb-6 flex flex-wrap gap-2">
        <button
          onClick={() => setFilter('all')}
          className={cn(
            'rounded-lg px-3 py-1.5 text-sm font-medium transition-colors',
            filter === 'all'
              ? 'bg-primary-600 text-white'
              : 'bg-gray-800 text-gray-400 hover:text-gray-200',
          )}
        >
          <Globe className="mr-1.5 inline h-3.5 w-3.5" />
          All
        </button>
        {CHANNEL_LABELS.map((ch) => {
          const Icon = CHANNEL_ICONS[ch];
          return (
            <button
              key={ch}
              onClick={() => setFilter(ch)}
              className={cn(
                'rounded-lg px-3 py-1.5 text-sm font-medium capitalize transition-colors',
                filter === ch
                  ? 'bg-primary-600 text-white'
                  : 'bg-gray-800 text-gray-400 hover:text-gray-200',
              )}
            >
              <Icon className="mr-1.5 inline h-3.5 w-3.5" />
              {ch}
            </button>
          );
        })}
      </div>

      {filtered.length === 0 ? (
        <div className="rounded-xl border border-gray-800 bg-gray-900 p-12 text-center text-gray-500">
          No campaigns found
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
          {filtered.map((campaign) => {
            const Icon = CHANNEL_ICONS[campaign.channel] ?? Globe;
            const budgetPct =
              campaign.budget > 0
                ? Math.min((campaign.spent / campaign.budget) * 100, 100)
                : 0;

            return (
              <div
                key={campaign.id}
                className="rounded-xl border border-gray-800 bg-gray-900 p-6"
              >
                <div className="mb-3 flex items-start justify-between">
                  <div className="flex items-center gap-2">
                    <Icon className="h-5 w-5 text-gray-400" />
                    <h3 className="font-medium text-gray-100">{campaign.name}</h3>
                  </div>
                  <span
                    className={cn(
                      'rounded-md px-2 py-0.5 text-xs font-medium capitalize',
                      STATUS_STYLES[campaign.status],
                    )}
                  >
                    {campaign.status}
                  </span>
                </div>

                <div className="mb-3">
                  <div className="mb-1 flex justify-between text-xs text-gray-400">
                    <span>Budget</span>
                    <span>
                      ${campaign.spent.toLocaleString()} / ${campaign.budget.toLocaleString()}
                    </span>
                  </div>
                  <div className="h-1.5 overflow-hidden rounded-full bg-gray-800">
                    <div
                      className={cn(
                        'h-full rounded-full',
                        budgetPct > 90 ? 'bg-red-500' : budgetPct > 60 ? 'bg-amber-500' : 'bg-emerald-500',
                      )}
                      style={{ width: `${budgetPct}%` }}
                    />
                  </div>
                </div>

                {Object.keys(campaign.metrics).length > 0 && (
                  <div className="grid grid-cols-2 gap-2">
                    {Object.entries(campaign.metrics).slice(0, 4).map(([key, value]) => (
                      <div key={key} className="rounded-lg bg-gray-950 px-3 py-2">
                        <p className="text-xs text-gray-500 capitalize">{key.replace('_', ' ')}</p>
                        <p className="text-sm font-semibold text-gray-200">
                          {typeof value === 'number' ? value.toLocaleString() : String(value)}
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
