import { json, type LoaderFunctionArgs, type MetaFunction, redirect } from '@remix-run/cloudflare';
import { useLoaderData } from '@remix-run/react';
import { DashboardLayout } from '~/components/layouts/DashboardLayout';
import { getUserId } from '~/lib/.server/auth/session.server';
import { getUserById } from '~/lib/.server/auth/user.server';

export const meta: MetaFunction = () => {
  return [{ title: 'Profile - NoeffortsAI' }];
};

export async function loader({ request }: LoaderFunctionArgs) {
  const userId = await getUserId(request);

  if (!userId) {
    return redirect('/');
  }

  const user = await getUserById(userId);

  return json({ user });
}

export default function ProfilePage() {
  const { user } = useLoaderData<typeof loader>();

  return (
    <DashboardLayout>
      <div className="max-w-2xl mx-auto">
        <h1 className="text-2xl font-bold text-bolt-elements-textPrimary mb-8">Profile</h1>

        <div className="p-6 rounded-2xl bg-white/[0.02] border border-white/[0.06] mb-6">
          <div className="flex items-center gap-6 mb-6">
            <div className="w-20 h-20 rounded-full bg-gradient-to-br from-blue-500/20 to-violet-500/20 border border-white/10 flex items-center justify-center">
              {user?.avatar_url ? (
                <img src={user.avatar_url} alt="" className="w-full h-full rounded-full object-cover" />
              ) : (
                <span className="i-ph:user text-3xl text-bolt-elements-textSecondary" />
              )}
            </div>
            <div>
              <h2 className="text-xl font-semibold text-bolt-elements-textPrimary">{user?.display_name || 'User'}</h2>
              <p className="text-bolt-elements-textSecondary">{user?.email}</p>
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-bolt-elements-textSecondary mb-1">Display Name</label>
              <input
                type="text"
                defaultValue={user?.display_name || ''}
                className="w-full px-4 py-3 rounded-xl bg-white/[0.03] border border-white/[0.08] text-bolt-elements-textPrimary focus:outline-none focus:border-blue-500/50 transition-colors"
                disabled
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-bolt-elements-textSecondary mb-1">Email</label>
              <input
                type="email"
                defaultValue={user?.email || ''}
                className="w-full px-4 py-3 rounded-xl bg-white/[0.03] border border-white/[0.08] text-bolt-elements-textPrimary focus:outline-none focus:border-blue-500/50 transition-colors"
                disabled
              />
            </div>
          </div>
        </div>

        <div className="p-6 rounded-2xl bg-red-500/5 border border-red-500/20">
          <h3 className="text-lg font-semibold text-bolt-elements-textPrimary mb-2">Danger Zone</h3>
          <p className="text-sm text-bolt-elements-textSecondary mb-4">
            Once you delete your account, there is no going back. Please be certain.
          </p>
          <button
            type="button"
            className="px-4 py-2 text-sm font-medium text-red-400 border border-red-500/30 rounded-lg hover:bg-red-500/10 transition-colors"
          >
            Delete Account
          </button>
        </div>
      </div>
    </DashboardLayout>
  );
}
