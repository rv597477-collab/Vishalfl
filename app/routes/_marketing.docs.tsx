import { json, type MetaFunction } from '@remix-run/cloudflare';
import { PublicLayout } from '~/components/layouts/PublicLayout';

export const meta: MetaFunction = () => {
  return [
    { title: 'Documentation - NoeffortsAI' },
    { name: 'description', content: 'Learn how to use NoeffortsAI to build web applications with AI.' },
  ];
};

export const loader = () => json({});

const sections = [
  {
    title: 'Getting Started',
    icon: 'i-ph:rocket',
    links: [
      { title: 'Quick Start', href: '#quick-start' },
      { title: 'Your First Project', href: '#first-project' },
      { title: 'Understanding the Interface', href: '#interface' },
    ],
  },
  {
    title: 'Core Concepts',
    icon: 'i-ph:lightbulb',
    links: [
      { title: 'How AI Generation Works', href: '#ai-generation' },
      { title: 'Project Structure', href: '#project-structure' },
      { title: 'Templates', href: '#templates' },
    ],
  },
  {
    title: 'AI Providers',
    icon: 'i-ph:cpu',
    links: [
      { title: 'Configuring Providers', href: '#providers' },
      { title: 'OpenAI', href: '#openai' },
      { title: 'Anthropic (Claude)', href: '#anthropic' },
      { title: 'Google (Gemini)', href: '#google' },
      { title: 'Local Models (Ollama)', href: '#ollama' },
    ],
  },
  {
    title: 'Deployment',
    icon: 'i-ph:cloud-arrow-up',
    links: [
      { title: 'Deploy to Vercel', href: '#vercel' },
      { title: 'Deploy to Netlify', href: '#netlify' },
      { title: 'GitHub Integration', href: '#github' },
    ],
  },
];

export default function DocsPage() {
  return (
    <PublicLayout>
      <section className="pt-20 pb-32 px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h1 className="text-4xl sm:text-5xl font-bold text-bolt-elements-textPrimary mb-4">Documentation</h1>
            <p className="text-lg text-bolt-elements-textSecondary max-w-2xl mx-auto">
              Everything you need to build amazing applications with NoeffortsAI.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            {sections.map((section) => (
              <div
                key={section.title}
                className="p-6 rounded-2xl bg-white/[0.02] border border-white/[0.06] hover:border-white/[0.12] transition-colors"
              >
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-blue-500/10 to-violet-500/10 border border-blue-500/20 flex items-center justify-center">
                    <span className={`${section.icon} text-xl text-blue-400`} />
                  </div>
                  <h2 className="text-lg font-semibold text-bolt-elements-textPrimary">{section.title}</h2>
                </div>
                <ul className="space-y-2">
                  {section.links.map((link) => (
                    <li key={link.title}>
                      <a
                        href={link.href}
                        className="flex items-center gap-2 text-sm text-bolt-elements-textSecondary hover:text-bolt-elements-textPrimary transition-colors"
                      >
                        <span className="i-ph:caret-right text-xs" />
                        {link.title}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>

          <div className="mt-16 p-8 rounded-2xl bg-gradient-to-br from-blue-500/10 to-violet-500/5 border border-white/[0.08] text-center">
            <h2 className="text-2xl font-bold text-bolt-elements-textPrimary mb-3">Full Documentation on GitHub</h2>
            <p className="text-bolt-elements-textSecondary mb-6 max-w-xl mx-auto">
              For complete documentation, tutorials, and community contributions, visit our GitHub repository.
            </p>
            <a
              href="https://stackblitz-labs.github.io/NoeffortsAI/"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-6 py-3 text-sm font-semibold text-white bg-gradient-to-r from-blue-500 to-violet-500 rounded-lg hover:opacity-90 transition-all"
            >
              <span className="i-ph:book-open" />
              View Full Docs
            </a>
          </div>
        </div>
      </section>
    </PublicLayout>
  );
}
