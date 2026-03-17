import { json, type LoaderFunctionArgs, type MetaFunction, redirect } from '@remix-run/cloudflare';
import { useLoaderData, Link } from '@remix-run/react';
import { DashboardLayout } from '~/components/layouts/DashboardLayout';
import { getUserId } from '~/lib/.server/auth/session.server';

export const meta: MetaFunction = () => {
  return [{ title: 'Projects - NoeffortsAI' }];
};

export async function loader({ request }: LoaderFunctionArgs) {
  const userId = await getUserId(request);

  if (!userId) {
    return redirect('/');
  }

  // In a full implementation, fetch projects from database
  return json({ projects: [] });
}

export default function ProjectsPage() {
  const { projects } = useLoaderData<typeof loader>();

  return (
    <DashboardLayout>
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold text-bolt-elements-textPrimary mb-1">Projects</h1>
            <p className="text-bolt-elements-textSecondary">Manage all your NoeffortsAI projects</p>
          </div>
          <Link
            to="/app"
            className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-gradient-to-r from-blue-500 to-violet-500 rounded-lg hover:opacity-90 transition-all"
          >
            <span className="i-ph:plus" />
            New Project
          </Link>
        </div>

        {projects.length === 0 ? (
          <div className="p-12 rounded-2xl bg-white/[0.02] border border-white/[0.06] border-dashed text-center">
            <span className="i-ph:folder-notch text-4xl text-bolt-elements-textTertiary mb-4 block" />
            <h3 className="text-lg font-semibold text-bolt-elements-textPrimary mb-2">No projects yet</h3>
            <p className="text-bolt-elements-textSecondary mb-6">Create your first project to get started.</p>
            <Link
              to="/app"
              className="inline-flex items-center gap-2 px-6 py-3 text-sm font-semibold text-white bg-gradient-to-r from-blue-500 to-violet-500 rounded-lg hover:opacity-90 transition-all"
            >
              <span className="i-ph:lightning" />
              Create Project
            </Link>
          </div>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">{/* Project cards would go here */}</div>
        )}
      </div>
    </DashboardLayout>
  );
}
