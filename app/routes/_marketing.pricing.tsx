import { json, type MetaFunction } from '@remix-run/cloudflare';
import { Link } from '@remix-run/react';
import { PublicLayout } from '~/components/layouts/PublicLayout';

export const meta: MetaFunction = () => {
  return [
    { title: 'Pricing - NoeffortsAI' },
    { name: 'description', content: 'Simple, transparent pricing for AI-powered web development.' },
  ];
};

export const loader = () => json({});

const plans = [
  {
    name: 'Free',
    price: '$0',
    period: 'forever',
    description: 'Perfect for trying out NoeffortsAI and personal projects.',
    features: [
      'Unlimited projects',
      'Community models (Ollama, LMStudio)',
      'Basic templates',
      'Local file export',
      'Community support',
    ],
    cta: 'Get Started',
    ctaLink: '/app',
    highlighted: false,
  },
  {
    name: 'Pro',
    price: '$20',
    period: '/month',
    description: 'For developers who want premium AI models and features.',
    features: [
      'Everything in Free',
      'Premium AI models (GPT-4, Claude, Gemini)',
      'Priority processing',
      'GitHub integration',
      'One-click deploy to Vercel/Netlify',
      'Priority support',
    ],
    cta: 'Start Pro Trial',
    ctaLink: '/auth/google',
    highlighted: true,
  },
  {
    name: 'Team',
    price: '$50',
    period: '/user/month',
    description: 'For teams building production applications.',
    features: [
      'Everything in Pro',
      'Team workspaces',
      'Shared projects',
      'Admin controls',
      'SSO authentication',
      'Dedicated support',
    ],
    cta: 'Contact Sales',
    ctaLink: '/contact',
    highlighted: false,
  },
];

export default function PricingPage() {
  return (
    <PublicLayout>
      <section className="pt-20 pb-32 px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h1 className="text-4xl sm:text-5xl font-bold text-bolt-elements-textPrimary mb-4">
              Simple, transparent pricing
            </h1>
            <p className="text-lg text-bolt-elements-textSecondary max-w-2xl mx-auto">
              Start free and scale as you grow. No hidden fees, no surprises.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {plans.map((plan) => (
              <div
                key={plan.name}
                className={`relative p-8 rounded-2xl border transition-all ${
                  plan.highlighted
                    ? 'bg-gradient-to-b from-blue-500/10 to-violet-500/5 border-blue-500/30 shadow-xl shadow-blue-500/10'
                    : 'bg-white/[0.02] border-white/[0.08] hover:border-white/[0.15]'
                }`}
              >
                {plan.highlighted && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-1 bg-gradient-to-r from-blue-500 to-violet-500 rounded-full text-xs font-semibold text-white">
                    Most Popular
                  </div>
                )}
                <div className="mb-6">
                  <h3 className="text-xl font-semibold text-bolt-elements-textPrimary mb-2">{plan.name}</h3>
                  <div className="flex items-baseline gap-1">
                    <span className="text-4xl font-bold text-bolt-elements-textPrimary">{plan.price}</span>
                    <span className="text-bolt-elements-textTertiary">{plan.period}</span>
                  </div>
                  <p className="mt-3 text-sm text-bolt-elements-textSecondary">{plan.description}</p>
                </div>
                <ul className="space-y-3 mb-8">
                  {plan.features.map((feature) => (
                    <li key={feature} className="flex items-start gap-2 text-sm text-bolt-elements-textSecondary">
                      <span className="i-ph:check-circle text-green-400 mt-0.5 flex-shrink-0" />
                      {feature}
                    </li>
                  ))}
                </ul>
                <Link
                  to={plan.ctaLink}
                  className={`block w-full py-3 text-center text-sm font-semibold rounded-lg transition-all ${
                    plan.highlighted
                      ? 'bg-gradient-to-r from-blue-500 to-violet-500 text-white hover:opacity-90 shadow-lg shadow-blue-500/25'
                      : 'bg-white/[0.05] text-bolt-elements-textPrimary border border-white/[0.1] hover:bg-white/[0.08]'
                  }`}
                >
                  {plan.cta}
                </Link>
              </div>
            ))}
          </div>

          <div className="mt-16 text-center">
            <p className="text-bolt-elements-textTertiary">
              Need a custom plan?{' '}
              <Link to="/contact" className="text-blue-400 hover:underline">
                Contact us
              </Link>
            </p>
          </div>
        </div>
      </section>
    </PublicLayout>
  );
}
