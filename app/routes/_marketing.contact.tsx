import { json, type MetaFunction, type ActionFunctionArgs } from '@remix-run/cloudflare';
import { Form, useActionData } from '@remix-run/react';
import { PublicLayout } from '~/components/layouts/PublicLayout';

export const meta: MetaFunction = () => {
  return [
    { title: 'Contact - NoeffortsAI' },
    { name: 'description', content: 'Get in touch with the NoeffortsAI team.' },
  ];
};

export const loader = () => json({});

export async function action({ request }: ActionFunctionArgs) {
  const formData = await request.formData();
  const name = formData.get('name');
  const email = formData.get('email');
  const message = formData.get('message');

  // In a real app, you'd send this to your backend or email service
  console.log('Contact form submission:', { name, email, message });

  return json({ success: true });
}

export default function ContactPage() {
  const actionData = useActionData<typeof action>();

  return (
    <PublicLayout>
      <section className="pt-20 pb-32 px-4 sm:px-6 lg:px-8">
        <div className="max-w-2xl mx-auto">
          <div className="text-center mb-12">
            <h1 className="text-4xl sm:text-5xl font-bold text-bolt-elements-textPrimary mb-4">Contact Us</h1>
            <p className="text-lg text-bolt-elements-textSecondary">Have questions? We'd love to hear from you.</p>
          </div>

          {actionData?.success ? (
            <div className="p-8 rounded-2xl bg-green-500/10 border border-green-500/30 text-center">
              <span className="i-ph:check-circle text-4xl text-green-400 mb-4 block" />
              <h2 className="text-xl font-semibold text-bolt-elements-textPrimary mb-2">Message Sent!</h2>
              <p className="text-bolt-elements-textSecondary">We'll get back to you as soon as possible.</p>
            </div>
          ) : (
            <Form method="post" className="space-y-6">
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-bolt-elements-textPrimary mb-2">
                  Name
                </label>
                <input
                  type="text"
                  name="name"
                  id="name"
                  required
                  className="w-full px-4 py-3 rounded-xl bg-white/[0.03] border border-white/[0.08] text-bolt-elements-textPrimary placeholder-bolt-elements-textTertiary focus:outline-none focus:border-blue-500/50 focus:ring-1 focus:ring-blue-500/50 transition-colors"
                  placeholder="Your name"
                />
              </div>
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-bolt-elements-textPrimary mb-2">
                  Email
                </label>
                <input
                  type="email"
                  name="email"
                  id="email"
                  required
                  className="w-full px-4 py-3 rounded-xl bg-white/[0.03] border border-white/[0.08] text-bolt-elements-textPrimary placeholder-bolt-elements-textTertiary focus:outline-none focus:border-blue-500/50 focus:ring-1 focus:ring-blue-500/50 transition-colors"
                  placeholder="you@example.com"
                />
              </div>
              <div>
                <label htmlFor="message" className="block text-sm font-medium text-bolt-elements-textPrimary mb-2">
                  Message
                </label>
                <textarea
                  name="message"
                  id="message"
                  required
                  rows={5}
                  className="w-full px-4 py-3 rounded-xl bg-white/[0.03] border border-white/[0.08] text-bolt-elements-textPrimary placeholder-bolt-elements-textTertiary focus:outline-none focus:border-blue-500/50 focus:ring-1 focus:ring-blue-500/50 transition-colors resize-none"
                  placeholder="How can we help?"
                />
              </div>
              <button
                type="submit"
                className="w-full py-3 text-base font-semibold text-white bg-gradient-to-r from-blue-500 to-violet-500 rounded-xl hover:opacity-90 transition-all shadow-lg shadow-blue-500/25"
              >
                Send Message
              </button>
            </Form>
          )}

          <div className="mt-16 grid sm:grid-cols-3 gap-6">
            <a
              href="https://github.com/stackblitz-labs/NoeffortsAI"
              target="_blank"
              rel="noopener noreferrer"
              className="p-6 rounded-xl bg-white/[0.02] border border-white/[0.06] hover:border-white/[0.12] transition-colors text-center"
            >
              <span className="i-ph:github-logo text-2xl text-bolt-elements-textSecondary mb-2 block" />
              <p className="text-sm font-medium text-bolt-elements-textPrimary">GitHub</p>
              <p className="text-xs text-bolt-elements-textTertiary">Report issues</p>
            </a>
            <a
              href="https://discord.gg/NoeffortsAI"
              target="_blank"
              rel="noopener noreferrer"
              className="p-6 rounded-xl bg-white/[0.02] border border-white/[0.06] hover:border-white/[0.12] transition-colors text-center"
            >
              <span className="i-ph:discord-logo text-2xl text-bolt-elements-textSecondary mb-2 block" />
              <p className="text-sm font-medium text-bolt-elements-textPrimary">Discord</p>
              <p className="text-xs text-bolt-elements-textTertiary">Join community</p>
            </a>
            <a
              href="https://twitter.com/nicholasareed"
              target="_blank"
              rel="noopener noreferrer"
              className="p-6 rounded-xl bg-white/[0.02] border border-white/[0.06] hover:border-white/[0.12] transition-colors text-center"
            >
              <span className="i-ph:twitter-logo text-2xl text-bolt-elements-textSecondary mb-2 block" />
              <p className="text-sm font-medium text-bolt-elements-textPrimary">Twitter</p>
              <p className="text-xs text-bolt-elements-textTertiary">Follow updates</p>
            </a>
          </div>
        </div>
      </section>
    </PublicLayout>
  );
}
