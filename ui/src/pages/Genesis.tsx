import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Sparkles,
  ArrowRight,
  GitBranch,
  LayoutDashboard,
  Lightbulb,
  Users,
  Package,
  DollarSign,
  Megaphone,
  Target,
  ShieldAlert,
  Flag,
  Settings,
  AlertTriangle,
} from 'lucide-react';
import { useCompany } from '@/context/CompanyContext';
import { runGenesis, type GenesisResult } from '@/api/genesis';
import { fetchSettings } from '@/api/settings';
import { cn } from '@/lib/utils';

type Step = 'vision' | 'generating' | 'review';

const LOADING_MESSAGES = [
  'Understanding your vision...',
  'Researching your market...',
  'Mapping your customers...',
  'Designing your product...',
  'Planning your strategy...',
  'Charting your channels...',
  'Building your blueprint...',
];

const NODE_TYPE_ICONS: Record<string, typeof Lightbulb> = {
  idea: Lightbulb,
  icp: Users,
  feature: Package,
  pricing: DollarSign,
  channel: Megaphone,
  campaign: Target,
  risk: ShieldAlert,
  goal: Flag,
};

const NODE_TYPE_COLORS: Record<string, { text: string; bg: string; border: string }> = {
  idea: { text: 'text-purple-400', bg: 'bg-purple-500/10', border: 'border-purple-500/30' },
  icp: { text: 'text-amber-400', bg: 'bg-amber-500/10', border: 'border-amber-500/30' },
  feature: { text: 'text-blue-400', bg: 'bg-blue-500/10', border: 'border-blue-500/30' },
  pricing: { text: 'text-emerald-400', bg: 'bg-emerald-500/10', border: 'border-emerald-500/30' },
  channel: { text: 'text-pink-400', bg: 'bg-pink-500/10', border: 'border-pink-500/30' },
  campaign: { text: 'text-orange-400', bg: 'bg-orange-500/10', border: 'border-orange-500/30' },
  risk: { text: 'text-red-400', bg: 'bg-red-500/10', border: 'border-red-500/30' },
  goal: { text: 'text-purple-400', bg: 'bg-purple-500/10', border: 'border-purple-500/30' },
  proof: { text: 'text-cyan-400', bg: 'bg-cyan-500/10', border: 'border-cyan-500/30' },
  metric: { text: 'text-indigo-400', bg: 'bg-indigo-500/10', border: 'border-indigo-500/30' },
  decision: { text: 'text-lime-400', bg: 'bg-lime-500/10', border: 'border-lime-500/30' },
};

export function Genesis() {
  const navigate = useNavigate();
  const { company, createCompany } = useCompany();
  const [step, setStep] = useState<Step>('vision');
  const [vision, setVision] = useState('');
  const [loadingMessageIndex, setLoadingMessageIndex] = useState(0);
  const [result, setResult] = useState<GenesisResult | null>(null);
  const [error, setError] = useState('');
  const [hasApiKey, setHasApiKey] = useState<boolean | null>(null);

  useEffect(() => {
    fetchSettings()
      .then((settings) => {
        setHasApiKey(!!settings.llm_api_key_masked);
      })
      .catch(() => setHasApiKey(false));
  }, []);

  useEffect(() => {
    if (step !== 'generating') return;
    const interval = setInterval(() => {
      setLoadingMessageIndex((i) => (i + 1) % LOADING_MESSAGES.length);
    }, 2800);
    return () => clearInterval(interval);
  }, [step]);

  const handleGenerate = useCallback(async () => {
    if (!vision.trim()) return;
    setStep('generating');
    setError('');
    setLoadingMessageIndex(0);

    try {
      let companyId = company?.id;

      if (!companyId) {
        const newCompany = await createCompany('New Company', '', vision);
        companyId = newCompany.id;
      }

      const genesisResult = await runGenesis(companyId, vision);
      setResult(genesisResult);
      setStep('review');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong');
      setStep('vision');
    }
  }, [vision, company, createCompany]);

  if (step === 'generating') {
    return <GeneratingView message={LOADING_MESSAGES[loadingMessageIndex]!} />;
  }

  if (step === 'review' && result) {
    return <ReviewView result={result} navigate={navigate} />;
  }

  return (
    <div className="flex min-h-full items-center justify-center p-8 animate-fade-in">
      {/* Subtle background orbs */}
      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <div className="absolute -left-32 top-1/4 h-96 w-96 rounded-full bg-amber-500/5 blur-3xl animate-float" />
        <div className="absolute -right-32 bottom-1/4 h-96 w-96 rounded-full bg-orange-500/5 blur-3xl animate-float" style={{ animationDelay: '1.5s' }} />
      </div>

      <div className="relative w-full max-w-2xl">
        {/* Header */}
        <div className="mb-10 text-center">
          <div className="mb-6 inline-flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-amber-500/20 to-orange-500/20 ring-1 ring-amber-500/30">
            <Sparkles className="h-8 w-8 text-amber-400" />
          </div>
          <h1 className="bg-gradient-to-r from-amber-400 to-orange-400 bg-clip-text text-4xl font-bold tracking-tight text-transparent">
            What will you build?
          </h1>
          <p className="mx-auto mt-4 max-w-md text-lg leading-relaxed text-slate-400">
            Describe your vision. We&apos;ll build the blueprint.
          </p>
        </div>

        {/* Vision textarea */}
        <div className="mb-6">
          <textarea
            value={vision}
            onChange={(e) => setVision(e.target.value)}
            placeholder="I want to build an AI-powered platform that helps people improve their public speaking skills..."
            rows={4}
            className="input glass resize-none text-lg leading-relaxed"
          />
        </div>

        {/* Error message */}
        {error && (
          <div className="card mb-6 border-red-500/30 bg-red-500/5 px-4 py-3 text-sm text-red-400">
            {error}
          </div>
        )}

        {/* API key warning */}
        {hasApiKey === false && (
          <div className="card glass mb-6 border-amber-500/30 px-5 py-4">
            <div className="flex items-start gap-3">
              <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0 text-amber-400" />
              <div>
                <p className="text-sm font-medium text-amber-300">AI provider not configured</p>
                <p className="mt-1 text-sm text-slate-400">
                  Set up your AI provider in{' '}
                  <button
                    onClick={() => navigate('/settings')}
                    className="inline-flex items-center gap-1 font-medium text-amber-400 underline underline-offset-2 transition-colors hover:text-amber-300"
                  >
                    <Settings className="h-3.5 w-3.5" />
                    Settings
                  </button>{' '}
                  to get started.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Generate button */}
        <button
          onClick={handleGenerate}
          disabled={!vision.trim() || hasApiKey === false}
          className={cn(
            'flex w-full items-center justify-center gap-3 rounded-xl px-6 py-4 text-lg font-semibold transition-all',
            vision.trim() && hasApiKey !== false
              ? 'btn-primary py-4 text-lg'
              : 'cursor-not-allowed rounded-xl bg-slate-800 text-slate-500',
          )}
        >
          <Sparkles className="h-5 w-5" />
          Generate Blueprint
          <ArrowRight className="h-5 w-5" />
        </button>
      </div>
    </div>
  );
}

function GeneratingView({ message }: { message: string }) {
  return (
    <div className="flex min-h-full flex-col items-center justify-center p-8 animate-fade-in">
      {/* Animated concentric rings */}
      <div className="relative mb-12 h-40 w-40">
        <div className="absolute inset-0 rounded-full border-2 border-amber-500/20 animate-pulse-soft" />
        <div
          className="absolute inset-4 rounded-full border-2 border-transparent border-t-amber-400 animate-spin"
          style={{ animationDuration: '3s' }}
        />
        <div
          className="absolute inset-8 rounded-full border-2 border-transparent border-b-orange-400 animate-spin"
          style={{ animationDuration: '2s', animationDirection: 'reverse' }}
        />
        <div
          className="absolute inset-12 rounded-full border-2 border-transparent border-t-amber-300/50 animate-spin"
          style={{ animationDuration: '4s' }}
        />
        <div className="absolute inset-0 flex items-center justify-center">
          <Sparkles className="h-8 w-8 text-amber-400 animate-pulse-soft" />
        </div>
        {/* Glow */}
        <div className="absolute inset-0 rounded-full bg-amber-500/10 blur-2xl" />
      </div>

      {/* Message with fade transition */}
      <p
        key={message}
        className="animate-fade-in text-xl font-medium text-slate-200"
      >
        {message}
      </p>
      <p className="mt-4 text-sm text-slate-500">This may take a minute or two</p>
    </div>
  );
}

function ReviewView({
  result,
  navigate,
}: {
  result: GenesisResult;
  navigate: ReturnType<typeof useNavigate>;
}) {
  const grouped = result.nodes.reduce<Record<string, typeof result.nodes>>((acc, node) => {
    const key = node.type;
    if (!acc[key]) acc[key] = [];
    acc[key]!.push(node);
    return acc;
  }, {});

  const systemsConnected = new Set(result.nodes.map((n) => n.type)).size;

  return (
    <div className="mx-auto max-w-3xl p-8 animate-fade-in">
      {/* Header */}
      <div className="mb-10 text-center">
        <div className="mb-4 inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-emerald-500/20 ring-1 ring-emerald-500/30">
          <Sparkles className="h-7 w-7 text-emerald-400" />
        </div>
        <h1 className="text-3xl font-bold text-slate-100">Your company is ready</h1>
      </div>

      {/* Hero card */}
      <div className="card mb-8 p-8 text-center">
        <h2 className="text-2xl font-bold text-slate-100">{result.company.name}</h2>
        <p className="mt-3 text-lg leading-relaxed text-slate-400">{result.company.description}</p>
        {result.company.mission && (
          <p className="mt-3 text-sm italic text-slate-500">
            &ldquo;{result.company.mission}&rdquo;
          </p>
        )}
      </div>

      {/* Stats bar */}
      <div className="mb-8 grid grid-cols-3 gap-4">
        <div className="card p-5 text-center">
          <p className="text-3xl font-bold text-amber-400">{result.nodesCreated}</p>
          <p className="mt-1 text-sm text-slate-400">Nodes Created</p>
        </div>
        <div className="card p-5 text-center">
          <p className="text-3xl font-bold text-orange-400">{result.edgesCreated}</p>
          <p className="mt-1 text-sm text-slate-400">Connections Made</p>
        </div>
        <div className="card p-5 text-center">
          <p className="text-3xl font-bold text-purple-400">{systemsConnected}</p>
          <p className="mt-1 text-sm text-slate-400">Systems Connected</p>
        </div>
      </div>

      {/* Grouped nodes */}
      <div className="mb-10 space-y-4">
        {Object.entries(grouped).map(([type, nodes]) => {
          const Icon = NODE_TYPE_ICONS[type] ?? Lightbulb;
          const colors = NODE_TYPE_COLORS[type] ?? { text: 'text-slate-400', bg: 'bg-slate-500/10', border: 'border-slate-500/30' };

          return (
            <div key={type} className={cn('card overflow-hidden border', colors.border)}>
              <div className={cn('flex items-center gap-2 px-5 py-3', colors.bg)}>
                <Icon className={cn('h-4 w-4', colors.text)} />
                <h3 className={cn('text-sm font-semibold uppercase tracking-wider', colors.text)}>
                  {type}s ({nodes.length})
                </h3>
              </div>
              <ul className="divide-y divide-slate-700/30">
                {nodes.map((node, i) => (
                  <li key={i} className="px-5 py-3">
                    <p className="text-sm font-medium text-slate-200">{node.title}</p>
                    <p className="mt-0.5 text-sm leading-relaxed text-slate-500 line-clamp-1">
                      {node.description}
                    </p>
                  </li>
                ))}
              </ul>
            </div>
          );
        })}
      </div>

      {/* Actions */}
      <div className="flex gap-4">
        <button
          onClick={() => navigate('/graph')}
          className="btn-primary flex flex-1 justify-center py-4 text-base"
        >
          <GitBranch className="h-5 w-5" />
          Explore Your Graph
        </button>
        <button
          onClick={() => navigate('/')}
          className="btn-secondary flex flex-1 justify-center py-4 text-base"
        >
          <LayoutDashboard className="h-5 w-5" />
          View Dashboard
        </button>
      </div>
    </div>
  );
}
