import { useEffect, useState } from 'react';
import {
  Settings as SettingsIcon,
  Check,
  AlertCircle,
  Eye,
  EyeOff,
  Save,
} from 'lucide-react';
import { fetchSettings, updateSetting } from '@/api/settings';
import { cn } from '@/lib/utils';

type Provider = 'anthropic' | 'openai';

const MODELS: Record<Provider, string[]> = {
  anthropic: ['claude-sonnet-4-20250514', 'claude-opus-4-20250514', 'claude-3-5-haiku-20241022'],
  openai: ['gpt-4o', 'gpt-4o-mini', 'gpt-4-turbo'],
};

function SkeletonPulse({ className }: { className?: string }) {
  return <div className={cn('animate-pulse rounded-lg bg-slate-600/40', className)} />;
}

export function Settings() {
  const [provider, setProvider] = useState<Provider>('anthropic');
  const [apiKey, setApiKey] = useState('');
  const [maskedKey, setMaskedKey] = useState('');
  const [model, setModel] = useState('');
  const [showKey, setShowKey] = useState(false);
  const [saving, setSaving] = useState(false);
  const [status, setStatus] = useState<'idle' | 'saved' | 'error'>('idle');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchSettings()
      .then((settings) => {
        if (settings.llm_provider) {
          setProvider(settings.llm_provider as Provider);
        }
        if (settings.llm_api_key_masked) {
          setMaskedKey(settings.llm_api_key_masked);
        }
        if (settings.llm_model) {
          setModel(settings.llm_model);
        }
      })
      .catch((err) => console.error('Failed to fetch settings:', err))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    if (!model || !MODELS[provider]!.includes(model)) {
      setModel(MODELS[provider]![0]!);
    }
  }, [provider]);

  async function handleSave() {
    setSaving(true);
    setStatus('idle');
    try {
      await updateSetting('llm_provider', provider);
      if (apiKey) {
        await updateSetting('llm_api_key', apiKey);
        setMaskedKey('****' + apiKey.slice(-4));
        setApiKey('');
      }
      await updateSetting('llm_model', model);
      setStatus('saved');
      setTimeout(() => setStatus('idle'), 3000);
    } catch {
      setStatus('error');
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <div className="mx-auto max-w-2xl p-8 animate-fade-in">
        <SkeletonPulse className="mb-2 h-8 w-48" />
        <SkeletonPulse className="mb-8 h-5 w-80" />
        <SkeletonPulse className="h-96" />
      </div>
    );
  }

  const isConfigured = !!maskedKey;

  return (
    <div className="mx-auto max-w-2xl p-8 animate-fade-in">
      {/* Header */}
      <div className="mb-8">
        <h1 className="flex items-center gap-3 text-2xl font-bold text-slate-100">
          <SettingsIcon className="h-7 w-7 text-amber-400" />
          Settings
        </h1>
        <p className="mt-2 text-sm text-slate-400">
          Configure your AI provider to power company generation and simulations.
        </p>
      </div>

      <div className="card p-6">
        {/* LLM Provider section header */}
        <div className="mb-6">
          <h2 className="section-title mb-4">LLM Provider</h2>

          {/* Provider radio toggle */}
          <div className="flex gap-3">
            {([
              { value: 'anthropic' as const, label: 'Anthropic', subtitle: 'Claude' },
              { value: 'openai' as const, label: 'OpenAI', subtitle: 'ChatGPT' },
            ]).map((opt) => (
              <button
                key={opt.value}
                onClick={() => setProvider(opt.value)}
                className={cn(
                  'group relative flex flex-1 items-center gap-3 rounded-xl border px-5 py-4 text-left transition-all',
                  provider === opt.value
                    ? 'border-amber-500/50 bg-amber-500/5'
                    : 'border-slate-700/40 bg-slate-800/40 hover:border-slate-600/50 hover:bg-slate-800/60',
                )}
              >
                {/* Radio indicator */}
                <div
                  className={cn(
                    'flex h-5 w-5 shrink-0 items-center justify-center rounded-full border-2 transition-all',
                    provider === opt.value
                      ? 'border-amber-500'
                      : 'border-slate-600',
                  )}
                >
                  {provider === opt.value && (
                    <div className="h-2.5 w-2.5 rounded-full bg-amber-500" />
                  )}
                </div>
                <div>
                  <p
                    className={cn(
                      'text-sm font-semibold',
                      provider === opt.value ? 'text-slate-100' : 'text-slate-300',
                    )}
                  >
                    {opt.label}
                  </p>
                  <p className="text-xs text-slate-500">{opt.subtitle}</p>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Divider */}
        <div className="mb-6 border-t border-slate-700/40" />

        {/* API Key section */}
        <div className="mb-6">
          <h2 className="section-title mb-4">API Key</h2>
          <div className="mb-2 flex items-center gap-2">
            <div
              className={cn(
                'h-2 w-2 rounded-full',
                isConfigured ? 'bg-emerald-500 shadow-lg shadow-emerald-500/50' : 'bg-slate-600',
              )}
            />
            <span className="text-xs text-slate-400">
              {isConfigured ? `Configured (${maskedKey})` : 'Not configured'}
            </span>
          </div>
          <div className="relative">
            <input
              type={showKey ? 'text' : 'password'}
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
              placeholder={maskedKey ? 'Enter new key to replace' : 'sk-...'}
              className="input pr-10"
            />
            <button
              type="button"
              onClick={() => setShowKey(!showKey)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 transition-colors hover:text-slate-300"
            >
              {showKey ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          </div>
        </div>

        {/* Divider */}
        <div className="mb-6 border-t border-slate-700/40" />

        {/* Model selection */}
        <div className="mb-8">
          <h2 className="section-title mb-4">Model</h2>
          <select
            value={model}
            onChange={(e) => setModel(e.target.value)}
            className="input"
          >
            {MODELS[provider]!.map((m) => (
              <option key={m} value={m}>
                {m}
              </option>
            ))}
          </select>
        </div>

        {/* Save button */}
        <button
          onClick={handleSave}
          disabled={saving}
          className={cn(
            'w-full transition-all',
            saving ? 'btn-secondary cursor-not-allowed opacity-50' : 'btn-primary',
            'flex items-center justify-center gap-2 py-3',
          )}
        >
          {saving ? (
            'Saving...'
          ) : status === 'saved' ? (
            <>
              <Check className="h-4 w-4" />
              Saved Successfully
            </>
          ) : status === 'error' ? (
            <>
              <AlertCircle className="h-4 w-4" />
              Failed to Save
            </>
          ) : (
            <>
              <Save className="h-4 w-4" />
              Save Settings
            </>
          )}
        </button>
      </div>
    </div>
  );
}
