import { json, type LoaderFunctionArgs, type MetaFunction, redirect } from '@remix-run/cloudflare';
import { DashboardLayout } from '~/components/layouts/DashboardLayout';
import { getUserId } from '~/lib/.server/auth/session.server';

export const meta: MetaFunction = () => {
  return [{ title: 'AI Providers - NoeffortsAI' }];
};

export async function loader({ request }: LoaderFunctionArgs) {
  const userId = await getUserId(request);

  if (!userId) {
    return redirect('/');
  }

  return json({});
}

const providers = [
  {
    id: 'openai',
    name: 'OpenAI',
    description: 'GPT-4, GPT-4 Turbo, GPT-3.5',
    icon: 'i-simple-icons:openai',
    status: 'not_configured',
  },
  {
    id: 'anthropic',
    name: 'Anthropic',
    description: 'Claude 3 Opus, Sonnet, Haiku',
    icon: 'i-simple-icons:anthropic',
    status: 'not_configured',
  },
  {
    id: 'google',
    name: 'Google',
    description: 'Gemini Pro, Gemini Ultra',
    icon: 'i-simple-icons:google',
    status: 'not_configured',
  },
  {
    id: 'ollama',
    name: 'Ollama',
    description: 'Local models - Llama, Mistral, CodeLlama',
    icon: 'i-ph:cube',
    status: 'not_configured',
  },
  {
    id: 'groq',
    name: 'Groq',
    description: 'Ultra-fast inference - Mixtral, Llama',
    icon: 'i-ph:lightning',
    status: 'not_configured',
  },
  {
    id: 'openrouter',
    name: 'OpenRouter',
    description: 'Access multiple providers with one API',
    icon: 'i-ph:plugs-connected',
    status: 'not_configured',
  },
];

export default function ProvidersPage() {
  return (
    <DashboardLayout>
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-bolt-elements-textPrimary mb-1">AI Providers</h1>
          <p className="text-bolt-elements-textSecondary">
            Configure your AI providers to use with NoeffortsAI. API keys are encrypted and stored securely.
          </p>
        </div>

        <div className="grid gap-4">
          {providers.map((provider) => (
            <div
              key={provider.id}
              className="p-5 rounded-2xl bg-white/[0.02] border border-white/[0.06] hover:border-white/[0.12] transition-colors"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-xl bg-white/[0.05] flex items-center justify-center">
                    <span className={`${provider.icon} text-2xl text-bolt-elements-textSecondary`} />
                  </div>
                  <div>
                    <h3 className="font-semibold text-bolt-elements-textPrimary">{provider.name}</h3>
                    <p className="text-sm text-bolt-elements-textSecondary">{provider.description}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  {provider.status === 'configured' ? (
                    <span className="flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium text-green-400 bg-green-500/10 rounded-full">
                      <span className="w-1.5 h-1.5 bg-green-400 rounded-full" />
                      Configured
                    </span>
                  ) : (
                    <span className="flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium text-bolt-elements-textTertiary bg-white/[0.03] rounded-full">
                      Not configured
                    </span>
                  )}
                  <button
                    type="button"
                    className="px-4 py-2 text-sm font-medium text-bolt-elements-textPrimary bg-white/[0.05] border border-white/[0.1] rounded-lg hover:bg-white/[0.08] transition-colors"
                  >
                    Configure
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-8 p-6 rounded-2xl bg-blue-500/5 border border-blue-500/20">
          <div className="flex items-start gap-4">
            <span className="i-ph:info text-xl text-blue-400 mt-0.5" />
            <div>
              <h3 className="font-semibold text-bolt-elements-textPrimary mb-1">About API Keys</h3>
              <p className="text-sm text-bolt-elements-textSecondary">
                Your API keys are encrypted before storage and are never shared. You can also use local models with
                Ollama for completely private AI generation without sending data to external servers.
              </p>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
