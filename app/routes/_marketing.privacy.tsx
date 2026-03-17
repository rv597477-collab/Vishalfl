import { json, type MetaFunction } from '@remix-run/cloudflare';
import { PublicLayout } from '~/components/layouts/PublicLayout';

export const meta: MetaFunction = () => {
  return [
    { title: 'Privacy Policy - NoeffortsAI' },
    { name: 'description', content: 'NoeffortsAI privacy policy and data handling practices.' },
  ];
};

export const loader = () => json({});

export default function PrivacyPage() {
  return (
    <PublicLayout>
      <section className="pt-20 pb-32 px-4 sm:px-6 lg:px-8">
        <div className="max-w-3xl mx-auto">
          <h1 className="text-4xl font-bold text-noeffortsai-elements-textPrimary mb-8">Privacy Policy</h1>
          <div className="prose prose-invert max-w-none">
            <p className="text-noeffortsai-elements-textSecondary mb-6">
              Last updated: {new Date().toLocaleDateString()}
            </p>

            <div className="space-y-8 text-noeffortsai-elements-textSecondary">
              <section>
                <h2 className="text-xl font-semibold text-noeffortsai-elements-textPrimary mb-4">
                  1. Information We Collect
                </h2>
                <p className="mb-4">When you use NoeffortsAI, we may collect the following types of information:</p>
                <ul className="list-disc pl-6 space-y-2">
                  <li>Account information (email, name) when you sign in with Google</li>
                  <li>Project data and code you create within the application</li>
                  <li>Usage data and analytics to improve our service</li>
                  <li>API keys you configure for AI providers (stored locally or encrypted)</li>
                </ul>
              </section>

              <section>
                <h2 className="text-xl font-semibold text-noeffortsai-elements-textPrimary mb-4">
                  2. How We Use Your Information
                </h2>
                <p className="mb-4">We use the information we collect to:</p>
                <ul className="list-disc pl-6 space-y-2">
                  <li>Provide and maintain the NoeffortsAI service</li>
                  <li>Authenticate your identity and manage your account</li>
                  <li>Save and sync your projects across devices</li>
                  <li>Improve and optimize the application</li>
                  <li>Communicate with you about updates and support</li>
                </ul>
              </section>

              <section>
                <h2 className="text-xl font-semibold text-noeffortsai-elements-textPrimary mb-4">
                  3. Data Storage and Security
                </h2>
                <p>
                  Your project data may be stored locally in your browser and/or in our secure database (Turso)
                  depending on your configuration. We implement industry-standard security measures to protect your
                  data. API keys for AI providers are encrypted before storage.
                </p>
              </section>

              <section>
                <h2 className="text-xl font-semibold text-noeffortsai-elements-textPrimary mb-4">
                  4. Third-Party Services
                </h2>
                <p className="mb-4">
                  NoeffortsAI integrates with third-party AI providers (OpenAI, Anthropic, Google, etc.). When you use
                  these services through NoeffortsAI, your prompts and generated content are subject to the respective
                  provider's privacy policy.
                </p>
              </section>

              <section>
                <h2 className="text-xl font-semibold text-noeffortsai-elements-textPrimary mb-4">5. Your Rights</h2>
                <p className="mb-4">You have the right to:</p>
                <ul className="list-disc pl-6 space-y-2">
                  <li>Access and export your data</li>
                  <li>Delete your account and associated data</li>
                  <li>Opt out of analytics collection</li>
                </ul>
              </section>

              <section>
                <h2 className="text-xl font-semibold text-noeffortsai-elements-textPrimary mb-4">6. Contact Us</h2>
                <p>
                  If you have any questions about this Privacy Policy, please contact us through our GitHub repository
                  or Discord community.
                </p>
              </section>
            </div>
          </div>
        </div>
      </section>
    </PublicLayout>
  );
}
