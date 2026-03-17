import { json, type LoaderFunctionArgs, type MetaFunction, redirect } from '@remix-run/cloudflare';
import { useLoaderData, Link } from '@remix-run/react';
import { DashboardLayout } from '~/components/layouts/DashboardLayout';
import { getUserId } from '~/lib/.server/auth/session.server';

export const meta: MetaFunction = () => {
  return [
    { title: 'Dashboard - NoeffortsAI' },
    { name: 'description', content: 'Manage your NoeffortsAI projects and settings.' },
  ];
};

export async function loader({ request }: LoaderFunctionArgs) {
  try {
    const userId = await getUserId(request);

    if (!userId) {
      return redirect('/');
    }

    // In a full implementation, fetch user's projects and activity from database
    return json({
      stats: {
        projects: 0,
        chats: 0,
        deploysThisMonth: 0,
      },
      recentProjects: [],
      recentActivity: [],
    });
  } catch {
    // If auth is not configured, redirect to home
    return redirect('/');
  }
}

export default function DashboardIndex() {
  const { stats } = useLoaderData<typeof loader>();

  return (
    <DashboardLayout>
      <div className="max-w-6xl mx-auto space-y-8">
        {/* Welcome Section */}
        <div>
          <h1 className="text-2xl font-bold text-bolt-elements-textPrimary mb-2">Welcome back</h1>
          <p className="text-bolt-elements-textSecondary">Here's what's happening with your projects.</p>
        </div>

        {/* Stats Grid */}
        <div className="grid sm:grid-cols-3 gap-4">
          <div className="p-6 rounded-2xl bg-white/[0.02] border border-white/[0.06]">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-lg bg-blue-500/10 flex items-center justify-center">
                <span className="i-ph:folder-notch text-xl text-blue-400" />
              </div>
              <span className="text-sm text-bolt-elements-textSecondary">Projects</span>
            </div>
            <p className="text-3xl font-bold text-bolt-elements-textPrimary">{stats.projects}</p>
          </div>
          <div className="p-6 rounded-2xl bg-white/[0.02] border border-white/[0.06]">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-lg bg-violet-500/10 flex items-center justify-center">
                <span className="i-ph:chat-circle text-xl text-violet-400" />
              </div>
              <span className="text-sm text-bolt-elements-textSecondary">Chats</span>
            </div>
            <p className="text-3xl font-bold text-bolt-elements-textPrimary">{stats.chats}</p>
          </div>
          <div className="p-6 rounded-2xl bg-white/[0.02] border border-white/[0.06]">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-lg bg-green-500/10 flex items-center justify-center">
                <span className="i-ph:rocket text-xl text-green-400" />
              </div>
              <span className="text-sm text-bolt-elements-textSecondary">Deploys</span>
            </div>
            <p className="text-3xl font-bold text-bolt-elements-textPrimary">{stats.deploysThisMonth}</p>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="grid sm:grid-cols-2 gap-4">
          <Link
            to="/app"
            className="p-6 rounded-2xl bg-gradient-to-br from-blue-500/10 to-violet-500/10 border border-blue-500/20 hover:border-blue-500/30 transition-colors group"
          >
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500 to-violet-500 flex items-center justify-center group-hover:scale-105 transition-transform">
                <span className="i-ph:plus text-2xl text-white" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-bolt-elements-textPrimary">Start New Project</h3>
                <p className="text-sm text-bolt-elements-textSecondary">Create a new application with AI</p>
              </div>
            </div>
          </Link>
          <Link
            to="/dashboard/providers"
            className="p-6 rounded-2xl bg-white/[0.02] border border-white/[0.06] hover:border-white/[0.12] transition-colors group"
          >
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-white/[0.05] flex items-center justify-center group-hover:scale-105 transition-transform">
                <span className="i-ph:cpu text-2xl text-bolt-elements-textSecondary" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-bolt-elements-textPrimary">Configure AI Providers</h3>
                <p className="text-sm text-bolt-elements-textSecondary">Set up OpenAI, Claude, Gemini, and more</p>
              </div>
            </div>
          </Link>
        </div>

        {/* Empty State */}
        <div className="p-12 rounded-2xl bg-white/[0.02] border border-white/[0.06] border-dashed text-center">
          <span className="i-ph:sparkle text-4xl text-bolt-elements-textTertiary mb-4 block" />
          <h3 className="text-lg font-semibold text-bolt-elements-textPrimary mb-2">No projects yet</h3>
          <p className="text-bolt-elements-textSecondary mb-6 max-w-md mx-auto">
            Start by creating your first project. Describe what you want to build and let AI do the heavy lifting.
          </p>
          <Link
            to="/app"
            className="inline-flex items-center gap-2 px-6 py-3 text-sm font-semibold text-white bg-gradient-to-r from-blue-500 to-violet-500 rounded-lg hover:opacity-90 transition-all"
          >
            <span className="i-ph:lightning" />
            Create First Project
          </Link>
        </div>
      </div>
    </DashboardLayout>
  );
}
