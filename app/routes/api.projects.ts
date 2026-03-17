import { json, type LoaderFunctionArgs, type ActionFunctionArgs } from '@remix-run/cloudflare';
import { getUserId } from '~/lib/.server/auth/session.server';
import {
  listProjectsByUserId,
  createProject,
  getProjectById,
  updateProject,
} from '~/lib/.server/persistence/projects-repository';
import { createActivityLog } from '~/lib/.server/persistence/activity-logs-repository';
import { randomUUID } from 'node:crypto';

function toSlug(name: string): string {
  return (
    name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, '')
      .slice(0, 40) || 'project'
  );
}

// GET /api/projects — list logged-in user's projects
export async function loader({ request }: LoaderFunctionArgs) {
  const userId = await getUserId(request);

  if (!userId) {
    return json({ projects: [] });
  }

  const url = new URL(request.url);
  const limit = Number(url.searchParams.get('limit') ?? 50);
  const offset = Number(url.searchParams.get('offset') ?? 0);

  const projects = (await listProjectsByUserId(userId, { limit, offset })).filter(
    (project) => project.status !== 'deleted',
  );

  return json({ projects });
}

// POST /api/projects — create or touch a project (upsert by name for simplicity)
export async function action({ request }: ActionFunctionArgs) {
  const userId = await getUserId(request);

  if (!userId) {
    return json({ error: 'Unauthorized' }, { status: 401 });
  }

  const body = await request.json<{
    action?: string;
    id?: string;
    name?: string;
    description?: string;
    status?: 'active' | 'archived' | 'deleted';
  }>();

  if (body.action === 'update' && body.id) {
    const previous = await getProjectById(body.id, userId);

    await updateProject(body.id, userId, {
      name: body.name,
      description: body.description,
      status: body.status,
    });

    const project = await getProjectById(body.id, userId);

    if (project) {
      const action =
        body.status === 'archived'
          ? 'archived'
          : body.status === 'deleted'
            ? 'deleted'
            : previous && body.name && body.name !== previous.name
              ? 'renamed'
              : 'updated';

      await createActivityLog({
        userId,
        projectId: project.id,
        category: 'project',
        action,
        summary:
          action === 'renamed'
            ? `Renamed project to ${project.name}`
            : action === 'archived'
              ? `Archived project ${project.name}`
              : action === 'deleted'
                ? `Deleted project ${project.name}`
                : `Updated project ${project.name}`,
        source: 'projects-api',
      });
    }

    return json({ project });
  }

  // Default: create
  const name = body.name ?? 'Untitled Project';
  const projectSlug = `${toSlug(name)}-${randomUUID().slice(0, 8)}`;
  const project = await createProject({ userId, slug: projectSlug, name, description: body.description });

  await createActivityLog({
    userId,
    projectId: project.id,
    category: 'project',
    action: 'created',
    summary: `Created project ${project.name}`,
    source: 'projects-api',
  });

  return json({ project });
}
