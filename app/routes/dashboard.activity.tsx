import { json, type LoaderFunctionArgs, type MetaFunction, redirect } from '@remix-run/cloudflare';
import { useLoaderData } from '@remix-run/react';
import { DashboardLayout } from '~/components/layouts/DashboardLayout';
import { getUserId } from '~/lib/.server/auth/session.server';

export const meta: MetaFunction = () => {
  return [{ title: 'Activity - NoeffortsAI' }];
};

export async function loader({ request }: LoaderFunctionArgs) {
  const userId = await getUserId(request);

  if (!userId) {
    return redirect('/');
  }

  // In a full implementation, fetch activity from database
  return json({ activities: [] });
}

export default function ActivityPage() {
  const { activities } = useLoaderData<typeof loader>();

  return (
    <DashboardLayout>
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-bolt-elements-textPrimary mb-1">Activity</h1>
          <p className="text-bolt-elements-textSecondary">View your recent activity and project history</p>
        </div>

        {activities.length === 0 ? (
          <div className="p-12 rounded-2xl bg-white/[0.02] border border-white/[0.06] border-dashed text-center">
            <span className="i-ph:activity text-4xl text-bolt-elements-textTertiary mb-4 block" />
            <h3 className="text-lg font-semibold text-bolt-elements-textPrimary mb-2">No activity yet</h3>
            <p className="text-bolt-elements-textSecondary">
              Your project activity will appear here once you start building.
            </p>
          </div>
        ) : (
          <div className="space-y-4">{/* Activity items would go here */}</div>
        )}
      </div>
    </DashboardLayout>
  );
}
