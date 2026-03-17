import { json, type LoaderFunctionArgs, type MetaFunction, redirect } from '@remix-run/cloudflare';
import { Link } from '@remix-run/react';
import { DashboardLayout } from '~/components/layouts/DashboardLayout';
import { getUserId } from '~/lib/.server/auth/session.server';

export const meta: MetaFunction = () => {
  return [{ title: 'Billing - NoeffortsAI' }];
};

export async function loader({ request }: LoaderFunctionArgs) {
  const userId = await getUserId(request);

  if (!userId) {
    return redirect('/');
  }

  return json({});
}

export default function BillingPage() {
  return (
    <DashboardLayout>
      <div className="max-w-3xl mx-auto">
        <h1 className="text-2xl font-bold text-bolt-elements-textPrimary mb-8">Billing</h1>

        {/* Current Plan */}
        <div className="p-6 rounded-2xl bg-white/[0.02] border border-white/[0.06] mb-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <p className="text-sm text-bolt-elements-textSecondary mb-1">Current Plan</p>
              <h2 className="text-2xl font-bold text-bolt-elements-textPrimary">Free</h2>
            </div>
            <Link
              to="/pricing"
              className="px-4 py-2 text-sm font-medium text-white bg-gradient-to-r from-blue-500 to-violet-500 rounded-lg hover:opacity-90 transition-all"
            >
              Upgrade Plan
            </Link>
          </div>
          <div className="pt-4 border-t border-white/[0.06]">
            <p className="text-sm text-bolt-elements-textSecondary">
              You're using the free plan with community models. Upgrade to Pro for premium AI models and features.
            </p>
          </div>
        </div>

        {/* Usage */}
        <div className="p-6 rounded-2xl bg-white/[0.02] border border-white/[0.06] mb-6">
          <h3 className="text-lg font-semibold text-bolt-elements-textPrimary mb-4">Usage This Month</h3>
          <div className="space-y-4">
            <div>
              <div className="flex items-center justify-between text-sm mb-2">
                <span className="text-bolt-elements-textSecondary">AI Requests</span>
                <span className="text-bolt-elements-textPrimary">0 / Unlimited</span>
              </div>
              <div className="h-2 bg-white/[0.05] rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-blue-500 to-violet-500 rounded-full"
                  style={{ width: '0%' }}
                />
              </div>
            </div>
            <div>
              <div className="flex items-center justify-between text-sm mb-2">
                <span className="text-bolt-elements-textSecondary">Projects</span>
                <span className="text-bolt-elements-textPrimary">0 / Unlimited</span>
              </div>
              <div className="h-2 bg-white/[0.05] rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-blue-500 to-violet-500 rounded-full"
                  style={{ width: '0%' }}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Payment Methods */}
        <div className="p-6 rounded-2xl bg-white/[0.02] border border-white/[0.06]">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-bolt-elements-textPrimary">Payment Methods</h3>
            <button type="button" className="text-sm text-blue-400 hover:text-blue-300 transition-colors">
              Add Method
            </button>
          </div>
          <div className="p-8 text-center text-bolt-elements-textTertiary border border-dashed border-white/[0.08] rounded-xl">
            <span className="i-ph:credit-card text-2xl mb-2 block" />
            <p className="text-sm">No payment methods added</p>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
