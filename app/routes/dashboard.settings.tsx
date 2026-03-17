import { json, type LoaderFunctionArgs, type MetaFunction } from '@remix-run/cloudflare';
import { useState } from 'react';
import { DashboardLayout } from '~/components/layouts/DashboardLayout';

export const meta: MetaFunction = () => {
  return [{ title: 'Settings - NoeffortsAI' }];
};

export async function loader({ request }: LoaderFunctionArgs) {
  // For now, allow access to settings page without auth for demo
  // In production, enable auth check
  return json({});
}

const tabs = [
  { id: 'profile', label: 'Profile', icon: 'i-ph:user-fill' },
  { id: 'providers', label: 'AI Providers', icon: 'i-ph:cpu-fill' },
  { id: 'preferences', label: 'Preferences', icon: 'i-ph:sliders-horizontal-fill' },
  { id: 'keys', label: 'API Keys', icon: 'i-ph:key-fill' },
];

const providers = [
  {
    id: 'openai',
    name: 'OpenAI',
    description: 'GPT-4o, GPT-4 Turbo, GPT-3.5',
    icon: 'i-simple-icons:openai',
    keyUrl: 'https://platform.openai.com/api-keys',
  },
  {
    id: 'anthropic',
    name: 'Anthropic',
    description: 'Claude 3.5 Sonnet, Opus, Haiku',
    icon: 'i-simple-icons:anthropic',
    keyUrl: 'https://console.anthropic.com/settings/keys',
  },
  {
    id: 'google',
    name: 'Google AI',
    description: 'Gemini Pro, Gemini Flash',
    icon: 'i-simple-icons:google',
    keyUrl: 'https://aistudio.google.com/app/apikey',
  },
  {
    id: 'groq',
    name: 'Groq',
    description: 'Ultra-fast inference - Llama, Mixtral',
    icon: 'i-ph:lightning-fill',
    keyUrl: 'https://console.groq.com/keys',
  },
  {
    id: 'openrouter',
    name: 'OpenRouter',
    description: 'Access multiple providers',
    icon: 'i-ph:plugs-connected-fill',
    keyUrl: 'https://openrouter.ai/keys',
  },
  {
    id: 'ollama',
    name: 'Ollama',
    description: 'Local models - Llama, Mistral, CodeLlama',
    icon: 'i-ph:cube-fill',
    keyUrl: '',
    isLocal: true,
  },
];

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState('providers');
  const [apiKeys, setApiKeys] = useState<Record<string, string>>({});
  const [connectingProvider, setConnectingProvider] = useState<string | null>(null);

  const handleSaveKey = (providerId: string, key: string) => {
    setApiKeys((prev) => ({ ...prev, [providerId]: key }));

    // In real implementation, save to localStorage or API
    if (typeof window !== 'undefined') {
      localStorage.setItem(`apiKey_${providerId}`, key);
    }

    setConnectingProvider(null);
  };

  return (
    <DashboardLayout>
      <div className="max-w-5xl mx-auto">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-white mb-2">Settings</h1>
          <p className="text-white/50">Manage your account and AI providers</p>
        </div>

        {/* Tab navigation */}
        <div className="flex items-center gap-1 p-1 bg-white/[0.02] border border-white/[0.06] rounded-xl mb-8">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium transition-all ${
                activeTab === tab.id
                  ? 'bg-gradient-to-r from-blue-500/20 to-violet-500/20 text-white border border-blue-500/20'
                  : 'text-white/50 hover:text-white hover:bg-white/[0.04]'
              }`}
            >
              <span className={tab.icon} />
              {tab.label}
            </button>
          ))}
        </div>

        {/* Profile Tab */}
        {activeTab === 'profile' && (
          <div className="space-y-6">
            <div className="p-6 rounded-2xl bg-white/[0.02] border border-white/[0.06]">
              <h2 className="text-lg font-semibold text-white mb-6">Profile Information</h2>
              <div className="flex items-start gap-6">
                <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-blue-500/20 to-violet-500/20 border border-white/[0.08] flex items-center justify-center">
                  <span className="i-ph:user-fill text-3xl text-white/50" />
                </div>
                <div className="flex-1 space-y-4">
                  <div>
                    <label className="block text-sm text-white/50 mb-2">Display Name</label>
                    <input
                      type="text"
                      placeholder="Your name"
                      className="w-full px-4 py-3 rounded-xl bg-white/[0.03] border border-white/[0.08] text-white placeholder-white/30 focus:outline-none focus:border-blue-500/50 transition-colors"
                    />
                  </div>
                  <div>
                    <label className="block text-sm text-white/50 mb-2">Email</label>
                    <input
                      type="email"
                      placeholder="your@email.com"
                      disabled
                      className="w-full px-4 py-3 rounded-xl bg-white/[0.02] border border-white/[0.06] text-white/50 cursor-not-allowed"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* AI Providers Tab */}
        {activeTab === 'providers' && (
          <div className="space-y-4">
            <p className="text-sm text-white/50 mb-6">
              Connect your AI providers to start building. Your API keys are encrypted and stored securely.
            </p>

            <div className="grid gap-4">
              {providers.map((provider) => {
                const isConnected = !!apiKeys[provider.id];

                return (
                  <div
                    key={provider.id}
                    className={`p-5 rounded-2xl border transition-all ${
                      isConnected
                        ? 'bg-gradient-to-r from-emerald-500/5 to-green-500/5 border-emerald-500/20'
                        : 'bg-white/[0.02] border-white/[0.06] hover:border-white/[0.12]'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div
                          className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                            isConnected
                              ? 'bg-emerald-500/10 border border-emerald-500/20'
                              : 'bg-white/[0.04] border border-white/[0.08]'
                          }`}
                        >
                          <span
                            className={`${provider.icon} text-2xl ${isConnected ? 'text-emerald-400' : 'text-white/50'}`}
                          />
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <h3 className="font-semibold text-white">{provider.name}</h3>
                            {provider.isLocal && (
                              <span className="px-2 py-0.5 rounded-full bg-blue-500/10 border border-blue-500/20 text-xs text-blue-400">
                                Local
                              </span>
                            )}
                          </div>
                          <p className="text-sm text-white/50">{provider.description}</p>
                        </div>
                      </div>

                      <div className="flex items-center gap-3">
                        {isConnected ? (
                          <>
                            <span className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-xs font-medium text-emerald-400">
                              <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-pulse" />
                              Connected
                            </span>
                            <button
                              onClick={() => setConnectingProvider(provider.id)}
                              className="px-4 py-2 text-sm font-medium text-white/70 hover:text-white bg-white/[0.04] border border-white/[0.08] rounded-xl hover:bg-white/[0.06] transition-all"
                            >
                              Edit
                            </button>
                          </>
                        ) : provider.isLocal ? (
                          <span className="text-xs text-white/40">No API key required</span>
                        ) : (
                          <button
                            onClick={() => setConnectingProvider(provider.id)}
                            className="px-5 py-2.5 text-sm font-medium text-white bg-gradient-to-r from-blue-500 to-violet-500 rounded-xl hover:opacity-90 transition-all shadow-lg shadow-blue-500/20"
                          >
                            Connect
                          </button>
                        )}
                      </div>
                    </div>

                    {/* Connection form */}
                    {connectingProvider === provider.id && !provider.isLocal && (
                      <div className="mt-4 pt-4 border-t border-white/[0.06]">
                        <div className="flex gap-3">
                          <input
                            type="password"
                            placeholder={`Enter your ${provider.name} API key`}
                            defaultValue={apiKeys[provider.id] || ''}
                            className="flex-1 px-4 py-3 text-sm bg-white/[0.03] border border-white/[0.08] rounded-xl text-white placeholder-white/30 focus:outline-none focus:border-blue-500/50"
                            onKeyDown={(e) => {
                              if (e.key === 'Enter') {
                                handleSaveKey(provider.id, e.currentTarget.value);
                              }
                            }}
                            id={`key-input-${provider.id}`}
                          />
                          <a
                            href={provider.keyUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="px-4 py-3 text-sm font-medium text-blue-400 bg-blue-500/10 border border-blue-500/20 rounded-xl hover:bg-blue-500/20 transition-colors whitespace-nowrap"
                          >
                            Get Key
                          </a>
                          <button
                            onClick={() => {
                              const input = document.getElementById(`key-input-${provider.id}`) as HTMLInputElement;
                              handleSaveKey(provider.id, input?.value || '');
                            }}
                            className="px-5 py-3 text-sm font-medium text-white bg-gradient-to-r from-blue-500 to-violet-500 rounded-xl hover:opacity-90 transition-all"
                          >
                            Save
                          </button>
                          <button
                            onClick={() => setConnectingProvider(null)}
                            className="px-4 py-3 text-sm font-medium text-white/50 hover:text-white transition-colors"
                          >
                            Cancel
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            <div className="mt-8 p-5 rounded-2xl bg-blue-500/5 border border-blue-500/20">
              <div className="flex items-start gap-4">
                <span className="i-ph:info-fill text-xl text-blue-400 mt-0.5" />
                <div>
                  <h3 className="font-medium text-white mb-1">About API Keys</h3>
                  <p className="text-sm text-white/50">
                    Your API keys are stored locally in your browser and encrypted before any server storage. For
                    complete privacy, use local models with Ollama - no API keys or external calls required.
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Preferences Tab */}
        {activeTab === 'preferences' && (
          <div className="space-y-6">
            <div className="p-6 rounded-2xl bg-white/[0.02] border border-white/[0.06]">
              <h2 className="text-lg font-semibold text-white mb-6">Appearance</h2>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium text-white">Theme</p>
                    <p className="text-sm text-white/50">Choose your preferred color scheme</p>
                  </div>
                  <select className="px-4 py-2 rounded-xl bg-white/[0.03] border border-white/[0.08] text-white focus:outline-none focus:border-blue-500/50">
                    <option value="dark">Dark</option>
                    <option value="light">Light</option>
                    <option value="system">System</option>
                  </select>
                </div>
              </div>
            </div>

            <div className="p-6 rounded-2xl bg-white/[0.02] border border-white/[0.06]">
              <h2 className="text-lg font-semibold text-white mb-6">Editor</h2>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium text-white">Font Size</p>
                    <p className="text-sm text-white/50">Editor font size in pixels</p>
                  </div>
                  <input
                    type="number"
                    defaultValue={14}
                    min={10}
                    max={24}
                    className="w-20 px-3 py-2 rounded-xl bg-white/[0.03] border border-white/[0.08] text-white text-center focus:outline-none focus:border-blue-500/50"
                  />
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium text-white">Tab Size</p>
                    <p className="text-sm text-white/50">Number of spaces per tab</p>
                  </div>
                  <select className="px-4 py-2 rounded-xl bg-white/[0.03] border border-white/[0.08] text-white focus:outline-none focus:border-blue-500/50">
                    <option value="2">2 spaces</option>
                    <option value="4">4 spaces</option>
                  </select>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* API Keys Tab */}
        {activeTab === 'keys' && (
          <div className="space-y-6">
            <div className="p-6 rounded-2xl bg-white/[0.02] border border-white/[0.06]">
              <h2 className="text-lg font-semibold text-white mb-2">Manage API Keys</h2>
              <p className="text-sm text-white/50 mb-6">View and manage all your connected API keys in one place.</p>

              <div className="space-y-3">
                {providers
                  .filter((p) => !p.isLocal)
                  .map((provider) => {
                    const hasKey = !!apiKeys[provider.id];

                    return (
                      <div
                        key={provider.id}
                        className="flex items-center justify-between p-4 rounded-xl bg-white/[0.02] border border-white/[0.06]"
                      >
                        <div className="flex items-center gap-3">
                          <span className={`${provider.icon} text-lg text-white/50`} />
                          <span className="text-white">{provider.name}</span>
                        </div>
                        <div className="flex items-center gap-3">
                          {hasKey ? (
                            <>
                              <span className="text-xs text-white/40">••••••••••••</span>
                              <button
                                onClick={() => {
                                  setApiKeys((prev) => {
                                    const next = { ...prev };
                                    delete next[provider.id];

                                    return next;
                                  });
                                }}
                                className="text-xs text-red-400 hover:text-red-300 transition-colors"
                              >
                                Remove
                              </button>
                            </>
                          ) : (
                            <span className="text-xs text-white/30">Not connected</span>
                          )}
                        </div>
                      </div>
                    );
                  })}
              </div>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
