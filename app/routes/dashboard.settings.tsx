import { json, type LoaderFunctionArgs, type MetaFunction, redirect } from '@remix-run/cloudflare';
import { DashboardLayout } from '~/components/layouts/DashboardLayout';
import { getUserId } from '~/lib/.server/auth/session.server';

export const meta: MetaFunction = () => {
  return [{ title: 'Settings - NoeffortsAI' }];
};

export async function loader({ request }: LoaderFunctionArgs) {
  const userId = await getUserId(request);

  if (!userId) {
    return redirect('/');
  }

  return json({});
}

export default function SettingsPage() {
  return (
    <DashboardLayout>
      <div className="max-w-2xl mx-auto">
        <h1 className="text-2xl font-bold text-bolt-elements-textPrimary mb-8">Settings</h1>

        <div className="space-y-6">
          {/* Appearance */}
          <div className="p-6 rounded-2xl bg-white/[0.02] border border-white/[0.06]">
            <h2 className="text-lg font-semibold text-bolt-elements-textPrimary mb-4">Appearance</h2>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium text-bolt-elements-textPrimary">Theme</p>
                  <p className="text-sm text-bolt-elements-textSecondary">Choose your preferred theme</p>
                </div>
                <select className="px-3 py-2 rounded-lg bg-white/[0.03] border border-white/[0.08] text-bolt-elements-textPrimary focus:outline-none">
                  <option value="system">System</option>
                  <option value="light">Light</option>
                  <option value="dark">Dark</option>
                </select>
              </div>
            </div>
          </div>

          {/* Editor */}
          <div className="p-6 rounded-2xl bg-white/[0.02] border border-white/[0.06]">
            <h2 className="text-lg font-semibold text-bolt-elements-textPrimary mb-4">Editor</h2>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium text-bolt-elements-textPrimary">Font Size</p>
                  <p className="text-sm text-bolt-elements-textSecondary">Editor font size in pixels</p>
                </div>
                <input
                  type="number"
                  defaultValue={14}
                  min={10}
                  max={24}
                  className="w-20 px-3 py-2 rounded-lg bg-white/[0.03] border border-white/[0.08] text-bolt-elements-textPrimary focus:outline-none text-center"
                />
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium text-bolt-elements-textPrimary">Tab Size</p>
                  <p className="text-sm text-bolt-elements-textSecondary">Number of spaces per tab</p>
                </div>
                <select className="px-3 py-2 rounded-lg bg-white/[0.03] border border-white/[0.08] text-bolt-elements-textPrimary focus:outline-none">
                  <option value="2">2 spaces</option>
                  <option value="4">4 spaces</option>
                </select>
              </div>
            </div>
          </div>

          {/* Privacy */}
          <div className="p-6 rounded-2xl bg-white/[0.02] border border-white/[0.06]">
            <h2 className="text-lg font-semibold text-bolt-elements-textPrimary mb-4">Privacy</h2>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium text-bolt-elements-textPrimary">Analytics</p>
                  <p className="text-sm text-bolt-elements-textSecondary">
                    Help improve NoeffortsAI by sending anonymous usage data
                  </p>
                </div>
                <button type="button" className="w-12 h-6 bg-blue-500 rounded-full relative transition-colors">
                  <span className="absolute right-1 top-1 w-4 h-4 bg-white rounded-full transition-transform" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
