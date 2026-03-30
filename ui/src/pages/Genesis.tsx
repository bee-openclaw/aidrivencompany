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
} from 'lucide-react';
import { useCompany } from '@/context/CompanyContext';
import { runGenesis, type GenesisResult } from '@/api/genesis';
import { fetchSettings } from '@/api/settings';
import { cn } from '@/lib/utils';

type Step = 'vision' | 'generating' | 'review';

const LOADING_MESSAGES = [
  'Analyzing your vision...',
  'Researching the market...',
  'Identifying your ideal customer...',
  'Designing your product...',
  'Planning your go-to-market...',
  'Building your company blueprint...',
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

const NODE_TYPE_COLORS: Record<string, string> = {
  idea: 'text-yellow-400',
  icp: 'text-blue-400',
  feature: 'text-emerald-400',
  pricing: 'text-purple-400',
  channel: 'text-orange-400',
  campaign: 'text-pink-400',
  risk: 'text-red-400',
  goal: 'text-cyan-400',
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
    <div className="flex min-h-full items-center justify-center p-8">
      <div className="w-full max-w-2xl">
        {/* Header */}
        <div className="mb-10 text-center">
          <div className="mb-6 inline-flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-primary-500/20 to-purple-500/20 ring-1 ring-primary-500/30">
            <Sparkles className="h-8 w-8 text-primary-400" />
          </div>
          <h1 className="text-4xl font-bold tracking-tight text-gray-100">
            What&apos;s your vision?
          </h1>
          <p className="mx-auto mt-4 max-w-md text-lg leading-relaxed text-gray-400">
            Describe your idea in a few sentences. Don&apos;t worry about having it all figured out
            &mdash; that&apos;s what we&apos;re here for.
          </p>
        </div>

        {/* Vision textarea */}
        <div className="mb-6">
          <textarea
            value={vision}
            onChange={(e) => setVision(e.target.value)}
            placeholder="I want to build an AI-powered platform that helps people improve their public speaking skills..."
            rows={6}
            className="w-full resize-none rounded-xl border border-gray-700 bg-gray-950 px-6 py-5 text-lg leading-relaxed text-gray-100 placeholder-gray-600 transition-colors focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500"
          />
        </div>

        {/* Error message */}
        {error && (
          <div className="mb-6 rounded-lg border border-red-800/50 bg-red-900/20 px-4 py-3 text-sm text-red-400">
            {error}
          </div>
        )}

        {/* API key warning */}
        {hasApiKey === false && (
          <div className="mb-6 rounded-lg border border-amber-800/50 bg-amber-900/20 px-4 py-3 text-sm text-amber-400">
            Set up your AI provider in{' '}
            <button
              onClick={() => navigate('/settings')}
              className="inline-flex items-center gap-1 font-medium text-amber-300 underline underline-offset-2 hover:text-amber-200"
            >
              <Settings className="h-3.5 w-3.5" />
              Settings
            </button>{' '}
            to get started.
          </div>
        )}

        {/* Generate button */}
        <button
          onClick={handleGenerate}
          disabled={!vision.trim() || hasApiKey === false}
          className={cn(
            'flex w-full items-center justify-center gap-3 rounded-xl px-6 py-4 text-lg font-semibold transition-all',
            vision.trim() && hasApiKey !== false
              ? 'bg-gradient-to-r from-primary-600 to-purple-600 text-white shadow-lg shadow-primary-900/30 hover:from-primary-500 hover:to-purple-500 hover:shadow-primary-900/50'
              : 'cursor-not-allowed bg-gray-800 text-gray-500',
          )}
        >
          <Sparkles className="h-5 w-5" />
          Generate My Company
          <ArrowRight className="h-5 w-5" />
        </button>
      </div>
    </div>
  );
}

function GeneratingView({ message }: { message: string }) {
  return (
    <div className="flex min-h-full flex-col items-center justify-center p-8">
      {/* Animated orb */}
      <div className="relative mb-12">
        <div className="h-32 w-32 animate-pulse rounded-full bg-gradient-to-br from-primary-500/30 to-purple-500/30 blur-xl" />
        <div className="absolute inset-4 animate-spin rounded-full border-2 border-transparent border-t-primary-400" style={{ animationDuration: '3s' }} />
        <div className="absolute inset-8 animate-spin rounded-full border-2 border-transparent border-b-purple-400" style={{ animationDuration: '2s', animationDirection: 'reverse' }} />
        <div className="absolute inset-0 flex items-center justify-center">
          <Sparkles className="h-8 w-8 text-primary-400" />
        </div>
      </div>

      {/* Message */}
      <p
        key={message}
        className="animate-fade-in text-xl font-medium text-gray-200"
      >
        {message}
      </p>
      <p className="mt-4 text-sm text-gray-500">This may take a minute or two</p>
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
    acc[key].push(node);
    return acc;
  }, {});

  return (
    <div className="mx-auto max-w-3xl p-8">
      {/* Header */}
      <div className="mb-10 text-center">
        <div className="mb-4 inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-emerald-500/20 ring-1 ring-emerald-500/30">
          <Sparkles className="h-7 w-7 text-emerald-400" />
        </div>
        <h1 className="text-3xl font-bold text-gray-100">{result.company.name}</h1>
        <p className="mt-3 text-lg leading-relaxed text-gray-400">{result.company.description}</p>
        {result.company.mission && (
          <p className="mt-2 text-sm italic text-gray-500">&ldquo;{result.company.mission}&rdquo;</p>
        )}
      </div>

      {/* Stats summary */}
      <div className="mb-8 grid grid-cols-2 gap-4">
        <div className="rounded-xl border border-gray-800 bg-gray-900 p-5 text-center">
          <p className="text-3xl font-bold text-primary-400">{result.nodesCreated}</p>
          <p className="mt-1 text-sm text-gray-400">Nodes Created</p>
        </div>
        <div className="rounded-xl border border-gray-800 bg-gray-900 p-5 text-center">
          <p className="text-3xl font-bold text-purple-400">{result.edgesCreated}</p>
          <p className="mt-1 text-sm text-gray-400">Connections Made</p>
        </div>
      </div>

      {/* Grouped nodes */}
      <div className="mb-10 space-y-6">
        {Object.entries(grouped).map(([type, nodes]) => {
          const Icon = NODE_TYPE_ICONS[type] ?? Lightbulb;
          const color = NODE_TYPE_COLORS[type] ?? 'text-gray-400';

          return (
            <div key={type} className="rounded-xl border border-gray-800 bg-gray-900 p-6">
              <h3 className={cn('mb-4 flex items-center gap-2 text-sm font-semibold uppercase tracking-wider', color)}>
                <Icon className="h-4 w-4" />
                {type}s ({nodes.length})
              </h3>
              <ul className="space-y-3">
                {nodes.map((node, i) => (
                  <li key={i} className="border-b border-gray-800 pb-3 last:border-0 last:pb-0">
                    <p className="text-sm font-medium text-gray-200">{node.title}</p>
                    <p className="mt-1 text-sm leading-relaxed text-gray-500">{node.description}</p>
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
          className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-primary-600 to-purple-600 px-6 py-4 text-sm font-semibold text-white shadow-lg shadow-primary-900/30 hover:from-primary-500 hover:to-purple-500"
        >
          <GitBranch className="h-4 w-4" />
          View Company Graph
        </button>
        <button
          onClick={() => navigate('/')}
          className="flex flex-1 items-center justify-center gap-2 rounded-xl border border-gray-700 bg-gray-900 px-6 py-4 text-sm font-semibold text-gray-300 hover:bg-gray-800 hover:text-gray-100"
        >
          <LayoutDashboard className="h-4 w-4" />
          Go to Dashboard
        </button>
      </div>
    </div>
  );
}
