import { json, type LoaderFunctionArgs } from '@remix-run/cloudflare';
import { getUserId } from '~/lib/.server/auth/session.server';
import { ensureDefaultProject } from '~/lib/.server/persistence/default-project.server';
import { getProjectById } from '~/lib/.server/persistence/projects-repository';
import { listActivityLogsByProject } from '~/lib/.server/persistence/activity-logs-repository';

export async function loader({ request }: LoaderFunctionArgs) {
  const userId = await getUserId(request);

  if (!userId) {
    return json({ activity: [] });
  }

  const url = new URL(request.url);
  const requestedProjectId = url.searchParams.get('projectId');
  const limit = Number(url.searchParams.get('limit') ?? 100);
  const offset = Number(url.searchParams.get('offset') ?? 0);

  const project = requestedProjectId
    ? ((await getProjectById(requestedProjectId, userId)) ?? (await ensureDefaultProject(userId)))
    : await ensureDefaultProject(userId);

  const activity = await listActivityLogsByProject(project.id, { limit, offset });

  return json({ activity, projectId: project.id });
}
