import { useEffect, useState } from 'react';
import { Settings as SettingsIcon, Check, AlertCircle, Eye, EyeOff } from 'lucide-react';
import { fetchSettings, updateSetting } from '@/api/settings';
import { cn } from '@/lib/utils';

type Provider = 'anthropic' | 'openai';

const MODELS: Record<Provider, string[]> = {
  anthropic: ['claude-sonnet-4-20250514', 'claude-opus-4-20250514', 'claude-3-5-haiku-20241022'],
  openai: ['gpt-4o', 'gpt-4o-mini', 'gpt-4-turbo'],
};

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
    if (!model || !MODELS[provider].includes(model)) {
      setModel(MODELS[provider][0]!);
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
      <div className="flex h-full items-center justify-center text-gray-500">Loading...</div>
    );
  }

  const isConfigured = !!maskedKey;

  return (
    <div className="mx-auto max-w-2xl p-8">
      <div className="mb-8">
        <h1 className="flex items-center gap-3 text-2xl font-bold text-gray-100">
          <SettingsIcon className="h-6 w-6 text-gray-400" />
          Settings
        </h1>
        <p className="mt-2 text-sm text-gray-400">
          Configure your AI provider to power company generation and simulations.
        </p>
      </div>

      <div className="rounded-xl border border-gray-800 bg-gray-900 p-6">
        {/* Status indicator */}
        <div className="mb-6 flex items-center gap-2">
          <div
            className={cn(
              'h-2.5 w-2.5 rounded-full',
              isConfigured ? 'bg-emerald-500' : 'bg-gray-600',
            )}
          />
          <span className="text-sm text-gray-400">
            {isConfigured ? 'AI provider configured' : 'Not configured'}
          </span>
        </div>

        {/* Provider selection */}
        <div className="mb-6">
          <label className="mb-3 block text-sm font-medium text-gray-200">LLM Provider</label>
          <div className="flex gap-3">
            {([
              { value: 'anthropic' as const, label: 'Anthropic (Claude)' },
              { value: 'openai' as const, label: 'OpenAI (ChatGPT)' },
            ]).map((opt) => (
              <button
                key={opt.value}
                onClick={() => setProvider(opt.value)}
                className={cn(
                  'flex-1 rounded-lg border px-4 py-3 text-sm font-medium transition-colors',
                  provider === opt.value
                    ? 'border-primary-500 bg-primary-500/10 text-primary-400'
                    : 'border-gray-700 bg-gray-950 text-gray-400 hover:border-gray-600 hover:text-gray-300',
                )}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </div>

        {/* API Key */}
        <div className="mb-6">
          <label className="mb-2 block text-sm font-medium text-gray-200">API Key</label>
          {maskedKey && !apiKey && (
            <p className="mb-2 text-xs text-gray-500">Current key: {maskedKey}</p>
          )}
          <div className="relative">
            <input
              type={showKey ? 'text' : 'password'}
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
              placeholder={maskedKey ? 'Enter new key to replace' : 'sk-...'}
              className="w-full rounded-lg border border-gray-700 bg-gray-950 px-4 py-3 pr-10 text-sm text-gray-100 placeholder-gray-600 focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500"
            />
            <button
              type="button"
              onClick={() => setShowKey(!showKey)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300"
            >
              {showKey ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          </div>
        </div>

        {/* Model selection */}
        <div className="mb-8">
          <label className="mb-2 block text-sm font-medium text-gray-200">Model</label>
          <select
            value={model}
            onChange={(e) => setModel(e.target.value)}
            className="w-full rounded-lg border border-gray-700 bg-gray-950 px-4 py-3 text-sm text-gray-100 focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500"
          >
            {MODELS[provider].map((m) => (
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
            'flex w-full items-center justify-center gap-2 rounded-lg px-4 py-3 text-sm font-medium transition-colors',
            saving
              ? 'cursor-not-allowed bg-gray-700 text-gray-400'
              : 'bg-primary-600 text-white hover:bg-primary-700',
          )}
        >
          {saving ? (
            'Saving...'
          ) : status === 'saved' ? (
            <>
              <Check className="h-4 w-4" />
              Saved
            </>
          ) : status === 'error' ? (
            <>
              <AlertCircle className="h-4 w-4" />
              Failed to save
            </>
          ) : (
            'Save Settings'
          )}
        </button>
      </div>
    </div>
  );
}
